import { Request, Response } from 'express';
import { supabaseAdmin } from './supabaseClient';

export const receiveWebhook = async (req: Request, res: Response) => {
    try {
        const body = req.body;

        // 1. EXTRAER DATOS (Compatible con Evolution v1 y v2)
        let event = '';
        let messageData: any = null;

        if (body.webhook && body.webhook.events) {
            // Estructura v2
            event = body.webhook.events[0];
            messageData = body.webhook.data;
        } else if (body.event) {
            // Estructura v1
            event = body.event;
            messageData = body.data;
        } else if (body.type === 'message') {
            // Estructura a veces usada en Global
            event = 'MESSAGES_UPSERT';
            messageData = body.data;
        }

        // Normalizar evento
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

        const remoteJid = messageData.key.remoteJid;

        // 3. FILTRO: Ignorar Grupos y Status (Historias)
        if (remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') {
            res.status(200).json({ status: 'ignored_group_or_status' });
            return;
        }

        const messageId = messageData.key.id;

        // 4. DEDUPLICACIÓN: ¿Ya tenemos este mensaje?
        const { data: existingMsg } = await supabaseAdmin
            .from('mensajes_whatsapp')
            .select('id')
            .eq('whatsapp_message_id', messageId)
            .maybeSingle();

        if (existingMsg) {
            res.status(200).json({ status: 'duplicate_ignored' });
            return;
        }

        // 5. NORMALIZACIÓN DE ID Y NOMBRE
        const isFromMe = messageData.key.fromMe;
        const pushName = isFromMe ? 'Agente' : (messageData.pushName || 'Cliente');

        let whatsappId = remoteJid.split('@')[0];
        // Fix México (521 -> 52)
        if (whatsappId.startsWith('521') && whatsappId.length === 13) {
            whatsappId = whatsappId.substring(3);
        }

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
                // Vincular cuenta existente
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
                        nombre: pushName || 'Cliente Nuevo', // Usamos 'nombre' según tu esquema actual
                        crm_status: isFromMe ? 'CONTACTED' : 'LEAD',
                        crm_intent: 'NONE'
                    })
                    .select('id')
                    .single();
                clienteId = newClient?.id;
            }
        }

        if (!clienteId) {
            console.error('❌ Error crítico: No se pudo asignar ID de cliente');
            res.status(500).send('Error assigning client');
            return;
        }

        // 7. EXTRAER CONTENIDO DEL MENSAJE
        let content = '';
        const type = messageData.messageType;

        if (type === 'conversation') content = messageData.message?.conversation;
        else if (type === 'extendedTextMessage') content = messageData.message?.extendedTextMessage?.text;
        else if (messageData.message?.imageMessage) content = '📸 [Imagen]';
        else if (messageData.message?.audioMessage) content = '🎤 [Audio]';
        else if (messageData.message?.videoMessage) content = '🎥 [Video]';
        else content = `[${type}]`;

        if (!content) {
            res.status(200).send('Empty content');
            return;
        }

        // Timestamp correcto (ms)
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

        console.log(`📥 Webhook: Mensaje guardado de ${pushName} (${whatsappId})`);
        res.status(200).json({ status: 'saved' });

    } catch (error: any) {
        console.error('❌ Error en webhook:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};