import { Request, Response } from 'express';
import { supabaseAdmin } from './supabaseClient';

export const receiveWebhook = async (req: Request, res: Response) => {
    try {
        const body = req.body;

        // 1. EXTRAER DATOS (Compatible con Evolution v1 y v2)
        let event = '';
        let messageData: any = null;

        if (body.webhook && body.webhook.events) {
            event = body.webhook.events[0];
            messageData = body.webhook.data;
        } else if (body.event) {
            event = body.event;
            messageData = body.data;
        } else if (body.type === 'message') {
            event = 'MESSAGES_UPSERT';
            messageData = body.data;
        }

        event = event ? event.toUpperCase().replace('.', '_') : '';

        // 2. FILTRO: Solo nos interesan mensajes nuevos (UPSERT)
        if (event !== 'MESSAGES_UPSERT' && event !== 'MESSAGES_UPDATE') {
            res.status(200).send('Event ignored');
            return;
        }

        if (!messageData || !messageData.key) {
            res.status(200).send('No data');
            return;
        }

        // 3. FILTRO: Ignorar Grupos y Status
        const initialJid = messageData.key.remoteJid || '';
        if (initialJid.includes('@g.us') || initialJid === 'status@broadcast') {
            res.status(200).json({ status: 'ignored_group_or_status' });
            return;
        }

        const messageId = messageData.key.id;

        // 4. DEDUPLICACIÓN
        const { data: existingMsg } = await supabaseAdmin
            .from('mensajes_whatsapp')
            .select('id')
            .eq('whatsapp_message_id', messageId)
            .maybeSingle();

        if (existingMsg) {
            res.status(200).json({ status: 'duplicate_ignored' });
            return;
        }

        // =====================================================================
        // 5. NORMALIZACIÓN DE ID (CORRECCIÓN IMPORTANTE 🚨)
        // =====================================================================
        const isFromMe = messageData.key.fromMe;
        const pushName = isFromMe ? 'Agente' : (messageData.pushName || 'Cliente');

        // Estrategia para encontrar el número real:
        let rawId = messageData.key.remoteJid;

        // A) Si remoteJid es un LID (ej: 1823...@lid), buscar el número real en 'participant'
        if (rawId.includes('@lid')) {
            if (messageData.key.participant && messageData.key.participant.includes('@s.whatsapp.net')) {
                rawId = messageData.key.participant;
            } else if (messageData.participant && messageData.participant.includes('@s.whatsapp.net')) {
                rawId = messageData.participant;
            }
        }

        // B) Soporte para tu código legacy (remoteJidAlt)
        if (messageData.key.remoteJidAlt && messageData.key.remoteJidAlt.includes('@s.whatsapp.net')) {
            rawId = messageData.key.remoteJidAlt;
        }

        // Limpieza final del ID
        let whatsappId = rawId.split('@')[0];

        // FIX MÉXICO: 521 -> 52 (o quitar prefijo si usas 10 dígitos)
        // Si tu DB usa 10 dígitos (ej: 3310043159), usamos esta lógica:
        if (whatsappId.startsWith('521') && whatsappId.length === 13) {
            whatsappId = whatsappId.substring(3); // 5213310... -> 3310...
        } else if (whatsappId.startsWith('52') && whatsappId.length === 12) {
            // Opcional: Si quieres forzar siempre 10 dígitos para México
            // whatsappId = whatsappId.substring(2); 
        }

        // DEBUG: Imprimir si detectamos algo raro para rastrearlo
        if (whatsappId.length > 14 || !/^\d+$/.test(whatsappId)) {
            console.warn(`⚠️ ID extraño detectado (${whatsappId}). Raw: ${rawId}. Payload parcial:`, JSON.stringify(messageData.key));
        }

        // =====================================================================

        // 6. GESTIÓN DE CLIENTE (Buscar -> Vincular -> Crear)
        let clienteId = null;

        // A. Buscar por whatsapp_id
        const { data: byWaId } = await supabaseAdmin
            .from('clientes')
            .select('id, nombre_completo')
            .eq('whatsapp_id', whatsappId)
            .maybeSingle();

        if (byWaId) {
            clienteId = byWaId.id;
        } else {
            // B. Buscar por teléfono (Fallback)
            const { data: byPhone } = await supabaseAdmin
                .from('clientes')
                .select('id')
                .eq('telefono', whatsappId)
                .maybeSingle();

            if (byPhone) {
                await supabaseAdmin
                    .from('clientes')
                    .update({ whatsapp_id: whatsappId })
                    .eq('id', byPhone.id);
                clienteId = byPhone.id;
            } else {
                // C. Crear nuevo cliente
                const { data: newClient } = await supabaseAdmin
                    .from('clientes')
                    .insert({
                        whatsapp_id: whatsappId,
                        telefono: whatsappId,
                        nombre: pushName || 'Cliente Nuevo',
                        crm_status: isFromMe ? 'CONTACTED' : 'LEAD',
                        crm_intent: 'NONE'
                    })
                    .select('id')
                    .single();
                clienteId = newClient?.id;
            }
        }

        if (!clienteId) {
            res.status(500).send('Error assigning client');
            return;
        }

        // 7. EXTRAER CONTENIDO
        let content = '';
        const type = messageData.messageType;

        if (type === 'conversation') content = messageData.message?.conversation;
        else if (type === 'extendedTextMessage') content = messageData.message?.extendedTextMessage?.text;
        else if (messageData.message?.imageMessage) content = '📸 [Imagen]';
        else if (messageData.message?.audioMessage) content = '🎤 [Audio]';
        else if (messageData.message?.videoMessage) content = '🎥 [Video]';
        else if (messageData.message?.documentMessage) content = '📄 [Documento]';
        else content = `[${type}]`;

        if (!content) {
            res.status(200).send('Empty content');
            return;
        }

        let timestamp = messageData.messageTimestamp;
        if (typeof timestamp === 'number' && timestamp < 10000000000) timestamp *= 1000;

        // 8. INSERTAR EN SUPABASE
        await supabaseAdmin.from('mensajes_whatsapp').insert({
            cliente_id: clienteId,
            whatsapp_message_id: messageId,
            role: isFromMe ? 'assistant' : 'user',
            content: content,
            created_at: new Date(timestamp).toISOString(),
            status: 'delivered'
        });

        console.log(`📥 Webhook: Mensaje de ${pushName} (${whatsappId})`);
        res.status(200).json({ status: 'saved' });

    } catch (error: any) {
        console.error('❌ Error en webhook:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};