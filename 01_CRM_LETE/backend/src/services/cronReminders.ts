import { query } from '../config/db';
import { sendText as sendWhatsAppMessage } from './whatsappService';

export const checkReminders = async () => {
    console.log('⏰ [CRON] Verificando envíos programados...');

    try {
        // ==========================================
        // 1. LÓGICA CLÁSICA: RECORDATORIOS DE CITAS
        // ==========================================

        // A) Citas para MAÑANA
        const tomorrowClients = await query(`
            SELECT id, whatsapp_id, appointment_date 
            FROM conversations 
            WHERE appointment_date::date = CURRENT_DATE + INTERVAL '1 day'
            AND appointment_status = 'PENDING'
            AND intent = 'APPOINTMENT' -- Aseguramos que sea una cita firme
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
        // Solo enviamos si son después de las 8am para no despertar gente, aunque el cron controla eso.
        const todayClients = await query(`
            SELECT id, whatsapp_id, appointment_date 
            FROM conversations 
            WHERE appointment_date::date = CURRENT_DATE
            AND (appointment_status = 'PENDING' OR appointment_status = 'REMINDED_TOMORROW')
            AND intent = 'APPOINTMENT'
        `);

        for (const client of todayClients.rows) {
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

        // Buscamos tareas programadas cuya hora YA LLEGÓ (<= NOW()) y siguen PENDING
        const followUps = await query(`
            SELECT id, whatsapp_id, intent, follow_up_date
            FROM conversations 
            WHERE follow_up_status = 'PENDING'
            AND follow_up_date <= NOW() -- Ya llegó la hora
            AND intent IN ('NO_REPLY', 'SOFT_FOLLOWUP', 'FUTURE_CONTACT')
        `);

        for (const task of followUps.rows) {
            let message = '';

            // Definimos el mensaje según la intención
            if (task.intent === 'NO_REPLY') {
                // Ghosting (Cliente dejó de contestar)
                // Estrategia: "Soft Close" - Preguntar si cerramos expediente o siguen interesados.
                message = `Hola, buen día. 👋 Notamos que quedó pendiente tu reporte. ¿Aún tienes problemas con tu instalación o prefieres que cerremos tu expediente por ahora? Quedamos atentos.`;

            } else if (task.intent === 'SOFT_FOLLOWUP') {
                // 23 Horas (El cliente dijo "déjame ver")
                // Estrategia: Recordatorio suave y servicial.
                message = `Hola! Solo para dar seguimiento a lo que platicamos previamente. ¿Pudiste revisarlo o tienes alguna duda adicional en la que te pueda apoyar?`;

            } else if (task.intent === 'FUTURE_CONTACT') {
                // Enero / Futuro
                // Estrategia: Retomar contexto.
                message = `Hola! ⚡ Como acordamos, te contacto para retomar el tema de tu revisión eléctrica. ¿Te gustaría que agendemos una visita para esta semana?`;
            }

            // Enviamos
            if (message) {
                const sentId = await sendWhatsAppMessage(task.whatsapp_id, message);

                if (sentId) {
                    await query(`
                        UPDATE conversations 
                        SET follow_up_status = 'SENT',
                            intent = 'AWAITING_REPLY', -- Cambiamos intención a esperar respuesta
                            last_ai_analysis_at = NOW(), 
                            last_message_analyzed_id = $1 
                        WHERE id = $2
                    `, [sentId, task.id]);
                    console.log(` -> 🚀 Seguimiento Dinámico (${task.intent}) enviado a ${task.whatsapp_id}`);
                }
            }
        }

    } catch (error) {
        console.error('Error en checkReminders:', error);
    }
};