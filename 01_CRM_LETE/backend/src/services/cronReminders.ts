import { query } from '../config/db';
import { sendText as sendWhatsAppMessage } from './whatsappService';

export const checkReminders = async () => {
    console.log('⏰ [CRON] Verificando envíos programados (Lógica Timezone Robusta)...');

    try {
        // =====================================================================
        // 1. RECORDATORIOS DE CITAS (Usando PostgreSQL Timezone Logic)
        // =====================================================================

        // A) Citas para MAÑANA
        // "Mañana" se define como: La fecha en MX de (NOW) + 1 día.
        const tomorrowClients = await query(`
            SELECT id, whatsapp_id, appointment_date 
            FROM conversations 
            WHERE 
                -- Convertimos la fecha guardada a Fecha MX y comparamos
                (appointment_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')::date 
                = 
                (NOW() AT TIME ZONE 'America/Mexico_City' + INTERVAL '1 day')::date
            AND appointment_status = 'PENDING'
            AND intent = 'APPOINTMENT'
        `);

        for (const client of tomorrowClients.rows) {
            const message = `Hola! 👋 Te recordamos que el día de *mañana* tenemos agendada tu revisión técnica.`;
            const sentId = await sendWhatsAppMessage(client.whatsapp_id, message);

            if (sentId) {
                await query(`
                    UPDATE conversations 
                    SET appointment_status = 'REMINDED_TOMORROW',
                        last_ai_analysis_at = NOW(), last_message_analyzed_id = $1 
                    WHERE id = $2
                `, [sentId, client.id]);
                console.log(` -> 📅 Recordatorio Mañana enviado a ${client.whatsapp_id}`);
            }
        }

        // B) Citas para HOY (Confirmación)
        // "Hoy" se define como: La fecha en MX de (NOW).
        const todayClients = await query(`
            SELECT id, whatsapp_id, appointment_date 
            FROM conversations 
            WHERE 
                (appointment_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')::date 
                = 
                (NOW() AT TIME ZONE 'America/Mexico_City')::date
            AND (appointment_status = 'PENDING' OR appointment_status = 'REMINDED_TOMORROW')
            AND intent = 'APPOINTMENT'
        `);

        for (const client of todayClients.rows) {
            // Formateamos la hora para que se vea bien en el mensaje (ej. 04:00 PM)
            const dateObj = new Date(client.appointment_date);
            const timeString = dateObj.toLocaleTimeString('es-MX', {
                timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: true
            });

            const message = `Buen día! ☀️ Te recordamos que tu visita es el día de *hoy a las ${timeString}*.`;
            const sentId = await sendWhatsAppMessage(client.whatsapp_id, message);

            if (sentId) {
                await query(`
                    UPDATE conversations 
                    SET appointment_status = 'REMINDED_TODAY', assigned_to_role = 'TECH',
                        last_ai_analysis_at = NOW(), last_message_analyzed_id = $1
                    WHERE id = $2
                `, [sentId, client.id]);
                console.log(` -> 📅 Recordatorio HOY enviado a ${client.whatsapp_id}`);
            }
        }

        // ==========================================
        // 2. NUEVA LÓGICA: SEGUIMIENTOS DINÁMICOS
        // (Ghosting, Soft Followup, Future Contact)
        // ==========================================

        const followUps = await query(`
            SELECT id, whatsapp_id, intent, follow_up_date, last_message_analyzed_id
            FROM conversations 
            WHERE follow_up_status = 'PENDING'
            AND follow_up_date <= NOW() 
            AND intent IN ('NO_REPLY', 'SOFT_FOLLOWUP', 'FUTURE_CONTACT')
        `);

        for (const task of followUps.rows) {

            // --- 🛑 FRENO DE MANO (JUST-IN-TIME CHECK) 🛑 ---
            // Antes de abrir la boca, verificamos si la situación cambió desde el análisis de anoche.
            const lastMsgCheck = await query(`
                SELECT is_internal, created_at, content 
                FROM messages 
                WHERE conversation_id = $1 
                ORDER BY created_at DESC 
                LIMIT 1
            `, [task.id]);

            if (lastMsgCheck.rows.length > 0) {
                const lastMsg = lastMsgCheck.rows[0];

                // REGLA 1: Si el último mensaje es NUESTRO (Internal = true), 
                // significa que un humano (o el bot en otro proceso) ya contestó.
                // ¡ABORTAR MISIÓN!
                if (lastMsg.is_internal) {
                    console.log(`✋ Cancelando envío a ${task.whatsapp_id}: Humano ya intervino ("${lastMsg.content.substring(0, 20)}...").`);

                    // Marcamos como cancelado para que no lo intente de nuevo en 1 hora
                    await query(`UPDATE conversations SET follow_up_status = 'CANCELLED_BY_USER' WHERE id = $1`, [task.id]);
                    continue;
                }
            }
            // ---------------------------------------------------

            let message = '';

            // Definimos el mensaje según la intención (Esto sigue igual)
            if (task.intent === 'NO_REPLY') {
                message = `Hola, buen día. 👋 Notamos que quedó pendiente tu reporte. ¿Aún tienes problemas con tu instalación o prefieres que cerremos tu expediente por ahora? Quedamos atentos.`;

            } else if (task.intent === 'SOFT_FOLLOWUP') {
                message = `Hola! Solo para dar seguimiento a lo que platicamos previamente. ¿Pudiste revisarlo o tienes alguna duda adicional en la que te pueda apoyar?`;

            } else if (task.intent === 'FUTURE_CONTACT') {
                message = `Hola! ⚡ Como acordamos, te contacto para retomar el tema de tu revisión eléctrica. ¿Te gustaría que agendemos una visita para esta semana?`;
            }

            // Enviamos
            if (message) {
                const sentId = await sendWhatsAppMessage(task.whatsapp_id, message);

                if (sentId) {
                    await query(`
                        UPDATE conversations 
                        SET follow_up_status = 'SENT',
                            intent = 'AWAITING_REPLY', -- IMPORTANTE: Cambiamos estado para no re-analizar mañana
                            last_ai_analysis_at = NOW(), 
                            last_message_analyzed_id = $1 
                        WHERE id = $2
                    `, [sentId, task.id]);
                    console.log(` -> 🚀 Seguimiento enviado a ${task.whatsapp_id}`);
                }
            }
        }