import { query } from '../config/db';
import { analyzeChatForAppointment } from './aiDateService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runNightlyAnalysis = async () => {
    console.log('🌙 [CRON] Iniciando Análisis Avanzado (V2 Refinado)...');

    try {
        // 1. Buscamos chats activos (excluimos bloqueados, cerrados Y GRUPOS)
        const result = await query(`
            SELECT DISTINCT c.id, c.whatsapp_id, c.last_message_analyzed_id
            FROM conversations c
            JOIN messages m ON c.id = m.conversation_id
            WHERE c.status NOT IN ('CLOSED', 'BLOCKED')
            AND c.whatsapp_id NOT LIKE '%@g.us' -- <--- FILTRO DE GRUPOS IMPORTANTE
            AND m.created_at >= NOW() - INTERVAL '2 days' 
        `);

        const candidates = result.rows;
        console.log(`🔎 Candidatos reales: ${candidates.length}`);

        for (const chat of candidates) {
            // 2. Obtener datos clave: Último mensaje general Y último mensaje del cliente
            // Usamos subconsultas para tener precisión quirúrgica
            const msgData = await query(`
                SELECT 
                    (SELECT created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1) as last_msg_at,
                    (SELECT whatsapp_message_id FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1) as last_msg_id,
                    (SELECT id FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1) as last_db_id,
                    
                    -- Capturamos la hora del último mensaje DEL CLIENTE para la regla de 23h
                    (SELECT created_at FROM messages WHERE conversation_id = $1 AND is_internal = false ORDER BY created_at DESC LIMIT 1) as last_client_at
                
            `, [chat.id]);

            if (msgData.rows.length === 0) continue;
            const meta = msgData.rows[0];

            const lastRealId = meta.last_msg_id || meta.last_db_id.toString();

            // Lógica de Marcas: Si ya analizamos este estado, saltar.
            if (chat.last_message_analyzed_id === lastRealId) continue;

            console.log(`🧠 Analizando: ${chat.whatsapp_id}...`);

            // 3. Obtener Historial
            const historyResult = await query(`
                SELECT content, is_internal, created_at
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at ASC
                LIMIT 50
            `, [chat.id]);

            const historyText = historyResult.rows.map((m: any) => {
                const role = m.is_internal ? 'Soporte/Técnico' : 'Cliente';
                const date = new Date(m.created_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
                return `[${date}] ${role}: ${m.content}`;
            }).join('\n');

            // 4. Consultar a Gemini
            const analysis = await analyzeChatForAppointment(chat.id.toString(), historyText);

            if (analysis) {
                let followUpDate: Date | null = null;

                if (analysis.intent === 'APPOINTMENT' && analysis.appointment_date_iso) {
                    followUpDate = new Date(analysis.appointment_date_iso);

                } else if (analysis.intent === 'FUTURE_CONTACT' && analysis.appointment_date_iso) {
                    followUpDate = new Date(analysis.appointment_date_iso);

                } else if (analysis.intent === 'NO_REPLY') {
                    // Ghosting: Mandar mañana a las 9 AM
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(15, 0, 0, 0);
                    followUpDate = tomorrow;

                } else if (analysis.intent === 'SOFT_FOLLOWUP') {
                    // LÓGICA CORREGIDA DE 23 HORAS
                    // Usamos la hora del CLIENTE (last_client_at) si existe, sino la general
                    const baseTimeStr = meta.last_client_at || meta.last_msg_at;
                    const baseTime = new Date(baseTimeStr);

                    // Sumamos 23h
                    const deadline = new Date(baseTime.getTime() + (23 * 60 * 60 * 1000));

                    // Ajuste a horario hábil (8am - 8pm)
                    const businessStart = new Date(deadline); businessStart.setHours(8, 0, 0, 0);
                    const businessEnd = new Date(deadline); businessEnd.setHours(20, 0, 0, 0);

                    if (deadline > businessEnd) followUpDate = businessEnd;
                    else if (deadline < businessStart) followUpDate = businessStart;
                    else followUpDate = deadline;
                }

                // 5. Guardar en Base de Datos
                if (followUpDate) {
                    await query(`
                        UPDATE conversations
                        SET intent = $1::varchar,
                            follow_up_date = $2::timestamp,
                            follow_up_status = 'PENDING',
                            
                            -- Compatibilidad con sistema de citas
                            appointment_date = CASE WHEN $1::varchar = 'APPOINTMENT' THEN $2::timestamp ELSE appointment_date END,
                            appointment_status = CASE WHEN $1::varchar = 'APPOINTMENT' THEN 'PENDING' ELSE appointment_status END,

                            last_ai_analysis_at = NOW(),
                            last_message_analyzed_id = $3
                        WHERE id = $4
                    `, [analysis.intent, followUpDate.toISOString(), lastRealId, chat.id]);

                    console.log(`✅ ${analysis.intent} detectado. Programado para: ${followUpDate.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`);
                } else {
                    await query(`
                        UPDATE conversations
                        SET last_ai_analysis_at = NOW(),
                            intent = $1::varchar,
                            last_message_analyzed_id = $2
                        WHERE id = $3
                    `, [analysis.intent, lastRealId, chat.id]);
                    console.log(`Thinking: ${analysis.intent} (Sin acción programada)`);
                }
            }

            // Delay anti-ban
            await delay(4000);
        }

        console.log('💤 Análisis Finalizado.');

    } catch (error) {
        console.error('Error en runNightlyAnalysis:', error);
    }
};