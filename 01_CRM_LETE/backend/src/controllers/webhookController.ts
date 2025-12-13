import { Request, Response } from 'express';
// import { pool } from '../config/db'; // ELIMINADO: Ya no usamos DB local
import { supabaseAdmin } from '../services/supabaseClient';
import { geminiModel } from '../services/aiService'; // Solo importamos el modelo, no analyzeIntent aún
import { sendText } from '../services/whatsappService';
import axios from 'axios';
import {
    procesarSolicitudAgenda,
    manejarConfirmacionAgenda,
    agendaDrafts
} from '../services/smartAgendaService';

// =========================================================================
// 🚀 FUNCIÓN HELPER: Ejecuta el Agendamiento y Envía a VM2
// =========================================================================
const ejecutarAgendamiento = async (remoteJid: string, draft: any) => {
    try {
        await sendText(remoteJid, "🚀 Enviando datos a TESIVIL (VM 2)...", 0);

        // --- 1. MAPEO DE TÉCNICOS ---
        let techIds = {
            ea: 23,
            supabase: "7561b141-93b8-4c8e-b8cc-05bb7658f152"
        };
        const nombreTech = (draft.tecnico_nombre_detectado || draft.tecnico_nombre || '').toLowerCase();

        if (nombreTech.includes('leonardo') || nombreTech.includes('leo')) {
            techIds = {
                ea: 25,
                supabase: "cb9fe9cc-9787-4a77-9185-d5af44a0da4e"
            };
        }

        // --- 2. PREPARAR NOTAS ---
        const notasIA = draft.notas_adicionales || draft.notas || 'Sin notas';
        const costoTexto = draft.costo ? ` | Costo acordado: $${draft.costo}` : '';
        const notaFinal = `${notasIA}${costoTexto}`;

        // --- 3. PAYLOAD ---
        const payloadFinal = {
            cliente: {
                nombre: draft.cliente_nombre,
                telefono: draft.cliente_telefono,
                direccion: draft.direccion_final || draft.direccion_texto,
                google_maps_link: draft.link_gmaps_generado || draft.link_gmaps_final,
                latitud: draft.ubicacion_lat || null,
                longitud: draft.ubicacion_lng || null
            },
            caso: {
                tipo: draft.tipo_caso || 'alto_consumo',
                comentarios: `Creado vía WhatsApp Bot.\nDetalles: ${notaFinal}`
            },
            cita: {
                fecha: draft.fecha,
                hora: draft.hora,
                duracion: draft.duracion_horas || '1',
                tecnico_id_ea: techIds.ea,
                tecnico_id_supabase: techIds.supabase,
                notas_adicionales: notaFinal
            }
        };

        console.log("📦 PAYLOAD GPS LISTO PARA VM2:", payloadFinal);

        // --- 4. ENVÍO A API ---
        await axios.post(
            'https://www.tesivil.com/lete/api/integracion/crear-caso-bot',
            payloadFinal,
            {
                headers: {
                    'x-app-key': 'Tesivil_Secret_Bot_2025_XYZ',
                    'Content-Type': 'application/json'
                }
            }
        );

        // --- 5. CONFIRMACIÓN FINAL ---
        await sendText(remoteJid, `✅ ¡PROCESO COMPLETADO!\nDatos enviados y agendados para: ${draft.cliente_nombre || 'Cliente'}`, 0);
        agendaDrafts.delete(remoteJid);
        return true;

    } catch (error) {
        console.error("Error al enviar a VM 2:", error);
        await sendText(remoteJid, `❌ Error técnico al guardar: ${(error as any).message}`, 0);
        return false;
    }
};

// =========================================================================
// MAIN WEBHOOK CONTROLLER
// =========================================================================
export const receiveWebhook = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        let event = '';
        let messageData: any = null;

        if (body.webhook && body.webhook.events) {
            event = body.webhook.events[0];
            messageData = body.webhook.data;
        } else if (body.event) {
            event = body.event;
            messageData = body.data;
        }
        event = event ? event.toUpperCase().replace('.', '_') : '';

        // 1. FILTROS BÁSICOS
        if (event !== 'MESSAGES_UPSERT' || !messageData || !messageData.key) {
            res.status(200).json({ status: 'ignored' });
            return;
        }

        const remoteJid = messageData.key.remoteJid;

        // 🚨 Filtro Anti-Grupos y Status
        if (remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') {
            res.status(200).json({ status: 'ignored_group_or_status' });
            return;
        }

        const messageId = messageData.key.id;

        // 2. DEDUPLICACIÓN CON SUPABASE
        const { data: existingMsg } = await supabaseAdmin
            .from('mensajes_whatsapp')
            .select('id')
            .eq('whatsapp_message_id', messageId)
            .maybeSingle();

        if (existingMsg) {
            res.status(200).json({ status: 'duplicate_ignored' });
            return;
        }

        const isFromMe = messageData.key.fromMe;
        const pushName = isFromMe ? 'Agente' : (messageData.pushName || 'Cliente');
        const whatsappId = remoteJid.replace('@s.whatsapp.net', '');

        let content = '';
        if (messageData.messageType === 'conversation') {
            content = messageData.message.conversation;
        } else if (messageData.messageType === 'extendedTextMessage') {
            content = messageData.message.extendedTextMessage.text;
        } else {
            content = '[Multimedia/Otros]';
        }

        console.log(`📨 ${isFromMe ? 'YO' : 'CLIENTE'}: ${content}`);

        // 3. UPSERT CLIENTE EN SUPABASE
        let { data: cliente } = await supabaseAdmin
            .from('clientes')
            .select('*')
            .eq('whatsapp_id', whatsappId)
            .maybeSingle();

        if (cliente) {
            await supabaseAdmin
                .from('clientes')
                .update({
                    last_interaction: new Date(),
                    nombre_completo: (cliente.nombre_completo === 'Cliente Nuevo' && pushName) ? pushName : cliente.nombre_completo,
                    unread_count: isFromMe ? 0 : (cliente.unread_count || 0) + 1
                })
                .eq('id', cliente.id);
        } else {
            const { data: newClient, error: createError } = await supabaseAdmin
                .from('clientes')
                .insert({
                    whatsapp_id: whatsappId,
                    telefono: whatsappId,
                    nombre_completo: pushName || 'Cliente Nuevo',
                    crm_status: isFromMe ? 'CONTACTED' : 'LEAD',
                    crm_intent: 'NONE',
                    unread_count: isFromMe ? 0 : 1
                })
                .select()
                .single();

            if (createError) {
                console.error("Error creando cliente Supabase:", createError);
                throw createError;
            }
            cliente = newClient;
        }

        // 4. GUARDAR MENSAJE EN SUPABASE
        await supabaseAdmin.from('mensajes_whatsapp').insert({
            cliente_id: cliente.id,
            whatsapp_message_id: messageId,
            role: isFromMe ? 'assistant' : 'user',
            content: content,
            status: 'delivered'
        });

        // =========================================================================
        // 🚧 ZONA DE INTERCEPCIÓN: AGENDA INTELIGENTE (SOLO ADMIN)
        // =========================================================================
        const isAdmin = isFromMe || remoteJid.includes('+523326395038');

        if (isAdmin) {
            const respuestaConfirmacion = await manejarConfirmacionAgenda(
                content,
                messageData.messageType,
                messageData.message?.locationMessage,
                remoteJid
            );

            if (respuestaConfirmacion) {
                const draft = agendaDrafts.get(remoteJid);
                if (draft && draft.step === 'AGENDAR_AHORA') {
                    await ejecutarAgendamiento(remoteJid, draft);
                    return res.status(200).send('OK_AGENDA_AUTOMATICA');
                }
                await sendText(remoteJid, respuestaConfirmacion, 0);
                return res.status(200).send('OK_AGENDA_CONFIRMACION');
            }

            if (content.trim().toUpperCase() === 'AGENDAR' && agendaDrafts.has(remoteJid)) {
                const draft = agendaDrafts.get(remoteJid);
                if (draft.step === 'LISTO_PARA_ENVIAR' || draft.step === 'AGENDAR_AHORA') {
                    await ejecutarAgendamiento(remoteJid, draft);
                    return res.status(200).send('OK_AGENDA_MANUAL');
                }
            }

            const regexFechaChat = /\[\d{1,2}\/\d{1,2}/;
            const esReenvio = content.includes('YO:') || content.includes('Date:') || regexFechaChat.test(content) || content.startsWith('/agendar');
            const esComando = content.toLowerCase().startsWith('/agendar');

            if (esReenvio || esComando) {
                const respuestaIA = await procesarSolicitudAgenda(content, remoteJid, geminiModel);
                await sendText(remoteJid, respuestaIA, 0);
                return res.status(200).send('OK_AGENDA_INICIO');
            }
        }

        // =========================================================
        // 🛑 PUNTO FINAL DEL WEBHOOK
        // =========================================================
        console.log('🛑 DEBUG: Mensaje guardado en Supabase. Fin del proceso.');
        res.status(200).json({ status: 'saved_supabase' });

    } catch (error) {
        console.error('❌ Error crítico en webhook:', error);
        res.status(200).json({ error: 'Internal Error Handled' });
    }
};