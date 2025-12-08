import { query } from '../config/db'; // Importación corregida
import { sendText as sendWhatsAppMessage } from './whatsappService'; // Alias para usar la función existente

export const checkReminders = async () => {
    console.log('☀️ [CRON 8:00 AM] Iniciando envío de recordatorios...');
    
    try {
        // --- GRUPO 1: Recordatorio de MAÑANA ---
        const tomorrowClients = await query(`
            SELECT id, whatsapp_id, appointment_date 
            FROM conversations 
            WHERE appointment_date::date = CURRENT_DATE + INTERVAL '1 day'
            AND appointment_status = 'PENDING'
        `);

        for (const client of tomorrowClients.rows) {
            const message = `Hola! 👋 Te recordamos que el día de *mañana* tenemos agendada tu revisión técnica.`;
            
            // Usamos la función sendText (renombrada como sendWhatsAppMessage)
            const sentMessageId = await sendWhatsAppMessage(client.whatsapp_id, message);
            
            if (sentMessageId) {
                await query(`
                    UPDATE conversations 
                    SET appointment_status = 'REMINDED_TOMORROW',
                        last_ai_analysis_at = NOW(),
                        last_message_analyzed_id = $1 
                    WHERE id = $2
                `, [sentMessageId, client.id]);
                
                console.log(` -> Recordatorio (Mañana) enviado a ${client.whatsapp_id}. ID: ${sentMessageId}`);
            }
        }

        // --- GRUPO 2: Recordatorio de HOY ---
        const todayClients = await query(`
            SELECT id, whatsapp_id, appointment_date 
            FROM conversations 
            WHERE appointment_date::date = CURRENT_DATE
            AND (appointment_status = 'PENDING' OR appointment_status = 'REMINDED_TOMORROW')
        `);

        for (const client of todayClients.rows) {
            const dateObj = new Date(client.appointment_date);
            const timeString = dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            const message = `Buen día! ☀️ Te recordamos que tu visita es el día de *hoy a las ${timeString}*. ¿Nos confirmas que todo sigue en pie?`;
            
            const sentMessageId = await sendWhatsAppMessage(client.whatsapp_id, message);

            if (sentMessageId) {
                await query(`
                    UPDATE conversations 
                    SET appointment_status = 'REMINDED_TODAY', 
                        assigned_to_role = 'TECH',
                        last_ai_analysis_at = NOW(),
                        last_message_analyzed_id = $1
                    WHERE id = $2
                `, [sentMessageId, client.id]);

                console.log(` -> Recordatorio (HOY) enviado a ${client.whatsapp_id}. Pasado a Humano.`);
            }
        }

    } catch (error) {
        console.error('Error en checkReminders:', error);
    }
};
