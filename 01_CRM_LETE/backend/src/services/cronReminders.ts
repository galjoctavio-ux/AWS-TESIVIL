import { query } from '../config/db';
import { sendText as sendWhatsAppMessage } from './whatsappService';

export const checkReminders = async () => {
    console.log('⏰ [CRON] Verificando envíos programados (Lógica Timezone Robusta)...');

    try {
        // =====================================================================
        // 1. RECORDATORIOS DE CITAS (Usando PostgreSQL Timezone Logic)
        // =====================================================================

        // A) Citas para MAÑANA
        const tomorrowClients = await query(`
            SELECT id, whatsapp_id, appointment_date 
            FROM conversations 
            WHERE 
                (appointment_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')::date 
                = 
                (NOW() AT TIME ZONE 'America/Mexico_City' + INTERVAL '1 day')::date
            AND appointment_status = 'PENDING'
            AND intent = 'APPOINTMENT'
            AND whatsapp_id NOT LIKE '%@g.us'
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
        const todayClients = await query(`
            SELECT id, whatsapp_id, appointment_date 
            FROM conversations 
            WHERE 
                (appointment_date AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City')::date 
                = 
                (NOW() AT TIME ZONE 'America/Mexico_City')::date
            AND (appointment_status = 'PENDING' OR appointment_status = 'REMINDED_TOMORROW')
            AND intent = 'APPOINTMENT'
            AND whatsapp_id NOT LIKE '%@g.us'
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

        // =====================================================================
        // 2. SEGUIMIENTOS DINÁMICOS (Ghosting, Future Contact, Cotizaciones)
        // =====================================================================

        const followUps = await query(`
            SELECT id, whatsapp_id, intent, follow_up_date
            FROM conversations 
            WHERE follow_up_status = 'PENDING'
            AND follow_up_date <= NOW() 
            AND intent IN ('NO_REPLY', 'FUTURE_CONTACT', 'QUOTE_FOLLOWUP')
            AND whatsapp_id NOT LIKE '%@g.us'
        `);

        for (const task of followUps.rows) {

            // --- 🛑 FRENO DE MANO (JUST-IN-TIME CHECK) 🛑 ---
            const lastMsgCheck = await query(`
                SELECT is_internal, created_at, content 
                FROM messages 
                WHERE conversation_id = $1 
                ORDER BY created_at DESC 
                LIMIT 1
            `, [task.id]);

            if (lastMsgCheck.rows.length > 0) {
                const lastMsg = lastMsgCheck.rows[0];
                if (lastMsg.is_internal) {
                    console.log(`✋ Cancelando envío auto a ${task.whatsapp_id}: Humano ya intervino.`);
                    await query(`UPDATE conversations SET follow_up_status = 'CANCELLED_BY_USER' WHERE id = $1`, [task.id]);
                    continue;
                }
            }

            let message = '';

            // 1. GHOSTING CLÁSICO
            if (task.intent === 'NO_REPLY') {
                message = `Hola, buen día. 👋 Notamos que quedó pendiente tu reporte. ¿Aún tienes problemas con tu instalación o prefieres que cerremos tu expediente por ahora? Quedamos atentos.`;

                // 2. SEGUIMIENTO DE COTIZACIÓN (Precios subiendo)
            } else if (task.intent === 'QUOTE_FOLLOWUP') {
                message = `Hola, buen día. 👋\n\nSolo para confirmar si pudiste revisar la propuesta que te enviamos anteriormente.\n\nTe comento que nuestros presupuestos tienen una vigencia corta debido a la variación constante en los precios del material eléctrico (cobre y componentes). 📉\n\n¿Te gustaría que procedamos para congelar el precio o tienes alguna duda técnica que podamos resolver?`;

                // 3. CONTACTO FUTURO (Incluye Soft Followup fusionado)
            } else if (task.intent === 'FUTURE_CONTACT') {
                message = `Hola! ⚡ Como acordamos, te contacto para retomar el tema de tu revisión eléctrica. ¿Te gustaría que agendemos una visita para esta semana?`;
            }

            // Enviamos el mensaje
            if (message) {
                const sentId = await sendWhatsAppMessage(task.whatsapp_id, message);

                if (sentId) {
                    await query(`
                        UPDATE conversations 
                        SET follow_up_status = 'SENT',
                            intent = 'AWAITING_REPLY', 
                            last_ai_analysis_at = NOW(), 
                            last_message_analyzed_id = $1 
                        WHERE id = $2
                    `, [sentId, task.id]);
                    console.log(` -> 🚀 Seguimiento Dinámico (${task.intent}) enviado a ${task.whatsapp_id}`);
                }
            }
        } // Fin del for (followUps)

    } catch (error) {
        console.error('Error en checkReminders:', error);
    } // Fin del catch
}; // Fin de la función checkReminders