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

// =========================================================================
// 🚀 FUNCIÓN HELPER: Ejecuta el Agendamiento y Envía a VM2
// Esta función encapsula la lógica que estaba duplicada en el bloque 'AGENDAR'
// =========================================================================
const ejecutarAgendamiento = async (remoteJid: string, draft: any) => {
    try {
        await sendText(remoteJid, "🚀 Enviando datos a TESIVIL (VM 2)...", 0);

        // --- 1. MAPEO DE TÉCNICOS REAL (Lógica original preservada) ---

        // Opción Default: Ing. Gallardo (ID 23)
        let techIds = {
            ea: 23,
            supabase: "7561b141-93b8-4c8e-b8cc-05bb7658f152"
        };

        const nombreTech = (draft.tecnico_nombre_detectado || draft.tecnico_nombre || '').toLowerCase();

        // Override: Si la IA detectó a Leonardo
        if (nombreTech.includes('leonardo') || nombreTech.includes('leo')) {
            techIds = {
                ea: 25,
                supabase: "cb9fe9cc-9787-4a77-9185-d5af44a0da4e"
            };
        }

        // --- 2. PREPARAR NOTAS CON COSTO (Lógica original preservada) ---

        // Unimos las notas de la IA con el costo detectado
        const notasIA = draft.notas_adicionales || draft.notas || 'Sin notas';
        const costoTexto = draft.costo ? ` | Costo acordado: $${draft.costo}` : '';
        const notaFinal = `${notasIA}${costoTexto}`;

        // --- 3. CONSTRUCCIÓN DEL PAYLOAD (¡GPS AGREGADO!) ---
        const payloadFinal = {
            cliente: {
                nombre: draft.cliente_nombre,
                telefono: draft.cliente_telefono,
                // Usamos la dirección final confirmada/geocodificada
                direccion: draft.direccion_final || draft.direccion_texto,
                // Usamos el link directo a coordenadas (si disponible) o el de búsqueda
                google_maps_link: draft.link_gmaps_generado || draft.link_gmaps_final,
                // CAMPOS DE COORDENADAS PRECISO PARA SUPABASE
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
                    'x-app-key': 'Tesivil_Secret_Bot_2025_XYZ', // <--- ¡PON TU CLAVE AQUÍ!
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
        // Si hay error, no borramos el draft para que se pueda intentar de nuevo manualmente
        return false;
    }
};
// =========================================================================

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
        const isAdmin = isFromMe || remoteJid.includes('+523326395038');

        if (isAdmin) {

            // A. FLUJO DE CONFIRMACIÓN (Responder SI, Mandar Ubicación, o Corregir)
            const respuestaConfirmacion = await manejarConfirmacionAgenda(
                content,
                messageData.messageType,
                messageData.message?.locationMessage,
                remoteJid
            );

            // Verificamos si hubo interacción de confirmación
            if (respuestaConfirmacion) {
                const draft = agendaDrafts.get(remoteJid);

                // 🛑 PUNTO 5: ELIMINAR PASO REDUNDANTE
                // Si la respuesta fue un "SI" y el smartAgendaService lo marcó como listo para agendar
                if (draft && draft.step === 'AGENDAR_AHORA') {
                    // Si ya está listo, ¡lo agendamos automáticamente!
                    await ejecutarAgendamiento(remoteJid, draft);
                    return res.status(200).send('OK_AGENDA_AUTOMATICA');
                }

                // Si no es el paso final, enviamos la respuesta de interacción normal
                await sendText(remoteJid, respuestaConfirmacion, 0);
                return res.status(200).send('OK_AGENDA_CONFIRMACION');
            }

            // B. COMANDO FINAL: "AGENDAR" (Como fallback manual)
            // Se mantiene el comando 'AGENDAR' por si acaso, usando la nueva función helper.
            if (content.trim().toUpperCase() === 'AGENDAR' && agendaDrafts.has(remoteJid)) {
                const draft = agendaDrafts.get(remoteJid);

                // El nuevo estado de éxito es AGENDAR_AHORA, el viejo era LISTO_PARA_ENVIAR
                if (draft.step === 'LISTO_PARA_ENVIAR' || draft.step === 'AGENDAR_AHORA') {
                    await ejecutarAgendamiento(remoteJid, draft);
                    return res.status(200).send('OK_AGENDA_MANUAL');
                }
            }

            // C. DETECTAR INTENCIÓN DE INICIO
            const regexFechaChat = /\[\d{1,2}\/\d{1,2}/;
            const esReenvio =
                content.includes('YO:') ||
                content.includes('Date:') ||
                regexFechaChat.test(content) ||
                content.startsWith('/agendar');
            const esComando = content.toLowerCase().startsWith('/agendar');

            if (esReenvio || esComando) {
                const respuestaIA = await procesarSolicitudAgenda(content, remoteJid, geminiModel);
                await sendText(remoteJid, respuestaIA, 0);
                return res.status(200).send('OK_AGENDA_INICIO');
            }
        }

        // =========================================================
        // 🛑 MODO DEBUG ACTIVADO: DETENER AQUÍ (PRESERVADO)
        // =========================================================
        console.log('🛑 DEBUG: Mensaje guardado. Respuesta automática bloqueada.');
        res.status(200).json({ status: 'saved_debug_mode' });
        return;
        // =========================================================


        // --- 4. DECISIÓN DEL CEREBRO (IA) --- (PRESERVADO)

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
        const analysis = await analyzeIntent(conversation.id, content);

        console.log(`🧠 Decisión IA: ${analysis.decision} | Razón: ${analysis.reason || 'N/A'}`);

        // --- 5. EJECUCIÓN DE LA DECISIÓN --- (PRESERVADO)

        if (analysis.decision === 'REPLY' && analysis.message) {
            // A) RESPONDER

            // Avisamos a WhatsApp API que todo está bien antes de empezar el delay
            res.status(200).json({ status: 'processing_reply' });

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