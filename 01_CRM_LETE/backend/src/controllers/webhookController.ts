import { Request, Response } from 'express';
import { pool } from '../config/db';
import { analyzeIntent, geminiModel } from '../services/aiService'; // ⚠️ ASEGÚRATE DE EXPORTAR geminiModel en aiService
import { sendText } from '../services/whatsappService';
import axios from 'axios';
import {
    procesarSolicitudAgenda,
    manejarConfirmacionAgenda,
    agendaDrafts
} from '../services/smartAgendaService';

export const receiveWebhook = async (req: Request, res: Response) => {
    try {
        const body = req.body;

        // --- 1. EXTRACCIÓN Y LIMPIEZA DE DATOS ---
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

        // Validar que sea mensaje nuevo y tenga datos
        if (event !== 'MESSAGES_UPSERT' || !messageData || !messageData.key) {
            res.status(200).json({ status: 'ignored' });
            return;
        }

        // --- 2. DEDUPLICACIÓN ---
        const messageId = messageData.key.id;
        const existingCheck = await pool.query('SELECT id FROM messages WHERE whatsapp_message_id = $1', [messageId]);

        if (existingCheck.rows.length > 0) {
            res.status(200).json({ status: 'duplicate_ignored' });
            return;
        }

        // Datos del remitente
        const isFromMe = messageData.key.fromMe;
        let remoteJid = messageData.key.remoteJid;
        if (remoteJid.includes('@lid') && messageData.key.remoteJidAlt) {
            remoteJid = messageData.key.remoteJidAlt;
        }

        const pushName = isFromMe ? 'Agente' : (messageData.pushName || 'Cliente');

        // Extraer contenido de texto
        let content = '';
        if (messageData.messageType === 'conversation') {
            content = messageData.message.conversation;
        } else if (messageData.messageType === 'extendedTextMessage') {
            content = messageData.message.extendedTextMessage.text;
        } else {
            content = '[Multimedia/Otros]';
        }

        console.log(`📨 ${isFromMe ? 'YO' : 'CLIENTE'}: ${content}`);

        // --- 3. GESTIÓN DE CONVERSACIÓN (UPSERT) ---
        let userQuery = '';
        let params: any[] = [];

        if (isFromMe) {
            // Si escribo yo, asumo que atiendo el caso (OPEN/ADMIN)
            userQuery = `
          INSERT INTO conversations (whatsapp_id, client_name, last_interaction, status, assigned_to_role)
          VALUES ($1, $2, NOW(), 'OPEN', 'ADMIN')
          ON CONFLICT (whatsapp_id) DO UPDATE SET last_interaction = NOW()
          RETURNING id, status, assigned_to_role;
        `;
            params = [remoteJid, 'Cliente Nuevo'];
        } else {
            // Si escribe cliente
            userQuery = `
          INSERT INTO conversations (whatsapp_id, client_name, last_interaction, status, assigned_to_role)
          VALUES ($1, $2, NOW(), 'NEW', 'BOT')
          ON CONFLICT (whatsapp_id) DO UPDATE SET 
            last_interaction = NOW(), 
            client_name = EXCLUDED.client_name,
            unread_count = conversations.unread_count + 1
          RETURNING id, status, assigned_to_role;
        `;
            params = [remoteJid, pushName];
        }

        const userResult = await pool.query(userQuery, params);
        const conversation = userResult.rows[0];

        // Guardar el mensaje entrante en BD
        await pool.query(
            `INSERT INTO messages (conversation_id, sender_type, message_type, content, whatsapp_message_id) 
       VALUES ($1, $2, 'TEXT', $3, $4)`,
            [conversation.id, isFromMe ? 'AGENT' : 'CLIENT', content, messageId]
        );

        // =========================================================================
        // 🚧 ZONA DE INTERCEPCIÓN: AGENDA INTELIGENTE (SOLO ADMIN)
        // =========================================================================

        // Identificar si eres TÚ (mensaje enviado desde el cel de la empresa o tu número personal)
        // Ajusta tu número aquí si envías desde tu personal
        const isAdmin = isFromMe || remoteJid.includes('+523326395038');

        if (isAdmin) {

            // A. FLUJO DE CONFIRMACIÓN (Responder SI, Mandar Ubicación, o Corregir)
            const respuestaConfirmacion = await manejarConfirmacionAgenda(
                content,
                messageData.messageType,
                messageData.message?.locationMessage,
                remoteJid
            );

            if (respuestaConfirmacion) {
                await sendText(remoteJid, respuestaConfirmacion);
                return res.status(200).send('OK_AGENDA_CONFIRMACION');
            }

            // B. COMANDO FINAL: "AGENDAR" (Envío a VM 2)
            if (content.trim().toUpperCase() === 'AGENDAR' && agendaDrafts.has(remoteJid)) {
                const draft = agendaDrafts.get(remoteJid);

                if (draft.step === 'LISTO_PARA_ENVIAR') {
                    try {
                        await sendText(remoteJid, "🚀 Enviando datos a TESIVIL (VM 2)...");

                        // 1. MAPEO DE TÉCNICOS (IDs reales)
                        let techIds = { ea: 23, supabase: "7561b141-93b8-4c8e-b8cc-05bb7658f152" }; // Default: Leonardo

                        const nombreTech = (draft.tecnico_nombre || '').toLowerCase();
                        if (nombreTech.includes('pedro')) techIds = { ea: 99, supabase: "uuid-de-pedro" };
                        // ... agrega más técnicos ...

                        // 2. CONSTRUCCIÓN DEL PAYLOAD
                        const payloadFinal = {
                            cliente: {
                                nombre: draft.cliente_nombre,
                                telefono: draft.cliente_telefono,
                                direccion: draft.direccion_final,
                                google_maps_link: draft.link_gmaps_final
                            },
                            caso: {
                                tipo: draft.tipo_caso || 'alto_consumo',
                                comentarios: `Creado vía WhatsApp Bot.\nNotas: ${draft.notas_adicionales}`
                            },
                            cita: {
                                fecha: draft.fecha,
                                hora: draft.hora,
                                duracion: draft.duracion_horas || '1',
                                tecnico_id_ea: techIds.ea,
                                tecnico_id_supabase: techIds.supabase
                            }
                        };

                        console.log("📦 PAYLOAD LISTO PARA VM2:", payloadFinal);

                        // TODO: Descomentar cuando la VM 2 esté lista
                        // const response = await axios.post('https://api.tesivil.com/api/integracion/agendar-bot', payloadFinal);

                        await sendText(remoteJid, `✅ ¡PROCESO COMPLETADO!\nDatos preparados para: ${draft.cliente_nombre}`);
                        agendaDrafts.delete(remoteJid);

                    } catch (error) {
                        console.error(error);
                        await sendText(remoteJid, `❌ Error al enviar a VM 2: ${(error as any).message}`);
                    }
                    return res.status(200).send('OK_AGENDA_ENVIADA');
                }
            }

            // C. DETECTAR INTENCIÓN DE INICIO
            // Detectamos el patrón de fecha típico "[3/12" o "[12/03"
            const regexFechaChat = /\[\d{1,2}\/\d{1,2}/;

            const esReenvio =
                content.includes('YO:') ||
                content.includes('Date:') ||
                regexFechaChat.test(content) || // <--- ESTO ES LO NUEVO
                content.startsWith('/agendar'); // Agregamos flexibilidad
            const esComando = content.toLowerCase().startsWith('/agendar');

            if (esReenvio || esComando) {
                // Asegúrate de importar geminiModel de tu servicio AI
                const respuestaIA = await procesarSolicitudAgenda(content, remoteJid, geminiModel);
                await sendText(remoteJid, respuestaIA);
                return res.status(200).send('OK_AGENDA_INICIO');
            }
        }

        // =========================================================
        // 🛑 MODO DEBUG ACTIVADO: DETENER AQUÍ
        // =========================================================
        console.log('🛑 DEBUG: Mensaje guardado. Respuesta automática bloqueada.');
        res.status(200).json({ status: 'saved_debug_mode' });
        return; // <--- EL BOT MUERE AQUÍ POR AHORA (CORRECTO PARA TU PRUEBA)
        // =========================================================


        // --- 4. DECISIÓN DEL CEREBRO (IA) ---

        // Regla 1: Si el mensaje es mío, no hago nada más.
        if (isFromMe) {
            res.status(200).json({ status: 'saved_own' });
            return;
        }

        // Regla 2: Si el chat ya no es del BOT, no intervengo.
        if (conversation.assigned_to_role !== 'BOT') {
            console.log('🤫 Chat humano activo. IA en silencio.');
            res.status(200).json({ status: 'saved_silent' });
            return;
        }

        // Regla 3: Invocar a la IA con MEMORIA (pasando conversation.id)
        // El servicio aiService se encargará de leer el historial previo.
        const analysis = await analyzeIntent(conversation.id, content);

        console.log(`🧠 Decisión IA: ${analysis.decision} | Razón: ${analysis.reason || 'N/A'}`);

        // --- 5. EJECUCIÓN DE LA DECISIÓN ---

        if (analysis.decision === 'REPLY' && analysis.message) {
            // A) RESPONDER

            // Avisamos a WhatsApp API que todo está bien antes de empezar el delay
            res.status(200).json({ status: 'processing_reply' });

            // La función sendText ya incluye:
            // 1. "Escribiendo..."
            // 2. Cálculo de delay humano
            // 3. Envío final
            await sendText(remoteJid, analysis.message || '');

            // Guardar la respuesta de la IA en BD
            await pool.query(
                `INSERT INTO messages (conversation_id, sender_type, message_type, content) VALUES ($1, 'BOT', 'TEXT', $2)`,
                [conversation.id, analysis.message]
            );

            // Actualizamos estado a CONTACTED (Ya hubo interacción)
            await pool.query(
                `UPDATE conversations SET status = 'CONTACTED', unread_count = 0 WHERE id = $1`,
                [conversation.id]
            );

        } else {
            // B) HANDOFF (HANDOFF_OTHER o HANDOFF_READY)
            // Silencio estratégico + Transferencia a Mónica

            console.log('🤐 IA transfiere el caso (Silencio).');

            await pool.query(
                `UPDATE conversations SET status = 'OPEN', assigned_to_role = 'ADMIN', unread_count = unread_count + 1 WHERE id = $1`,
                [conversation.id]
            );

            res.status(200).json({ status: 'handed_off', reason: analysis.decision });
        }

    } catch (error) {
        console.error('❌ Error crítico en webhook:', error);
        // Siempre devolver 200 para evitar bucles de reintento de WhatsApp
        res.status(200).json({ error: 'Internal Error Handled' });
    }
};
