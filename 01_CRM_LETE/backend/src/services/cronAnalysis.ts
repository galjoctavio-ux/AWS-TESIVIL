import { query } from '../config/db';
import { analyzeChatForAppointment } from './aiDateService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 👇 ¡AQUÍ ESTÁ LA CLAVE! Asegúrate de que diga 'export const'
export const runNightlyAnalysis = async () => {
    console.log('🌙 [CRON] Iniciando Análisis Nocturno (V4 - Full Logic)...');

    try {
        // 1. Buscamos chats activos
        // FILTROS:
        // - No Bloqueados/Cerrados.
        // - No Grupos (@g.us).
        // - Mensajes recientes (2 días).
        // - ANTI-SPAM: Si el estado es 'AWAITING_REPLY' (ya le escribimos), 
        //   SOLO analizamos si hay un mensaje nuevo posterior a nuestro último análisis.
        const result = await query(`
            SELECT DISTINCT c.id, c.whatsapp_id, c.last_message_analyzed_id, c.last_ai_analysis_at
            FROM conversations c
            JOIN messages m ON c.id = m.conversation_id
            WHERE c.status NOT IN ('CLOSED', 'BLOCKED')
            AND c.whatsapp_id NOT LIKE '%@g.us'
            AND (
                c.intent != 'AWAITING_REPLY' 
                OR 
                m.created_at > c.last_ai_analysis_at
            )
            AND m.created_at >= NOW() - INTERVAL '2 days' 
        `);

        const candidates = result.rows;
        console.log(`🔎 Candidatos reales: ${candidates.length}`);

        for (const chat of candidates) {
            // 2. Obtener datos clave: Último mensaje general
            const msgData = await query(`
                SELECT 
                    (SELECT created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1) as last_msg_at,
                    (SELECT whatsapp_message_id FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1) as last_msg_id,
                    (SELECT id FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1) as last_db_id
            `, [chat.id]);

            if (msgData.rows.length === 0) continue;
            const meta = msgData.rows[0];
            const lastRealId = meta.last_msg_id || meta.last_db_id.toString();

            // Lógica de Marcas: Si ya analizamos este ID exacto, saltar.
            if (chat.last_message_analyzed_id === lastRealId) {
                console.log(`⏩ Saltando ${chat.whatsapp_id} (Sin cambios desde ayer)`);
                continue;
            }
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
                const now = new Date(); // Hora Servidor (UTC)

                // CASO A: CITA AGENDADA O CONTACTO FUTURO (Incluye el "Déjame ver" fusionado)
                if ((analysis.intent === 'APPOINTMENT' || analysis.intent === 'FUTURE_CONTACT') && analysis.appointment_date_iso) {

                    followUpDate = new Date(analysis.appointment_date_iso);

                    // Validación de seguridad: Si la IA alucinó una fecha en el pasado, la movemos a mañana
                    if (followUpDate <= now) {
                        followUpDate = new Date();
                        followUpDate.setDate(followUpDate.getDate() + 1);
                        followUpDate.setUTCHours(17, 0, 0, 0);
                    }

                    // CASO B: GHOSTING (No Reply)
                } else if (analysis.intent === 'NO_REPLY') {
                    // Mandar MAÑANA a las 9 AM Hora México (15:00 UTC)
                    const target = new Date();
                    target.setUTCHours(15, 0, 0, 0);
                    target.setDate(target.getDate() + 1); // +1 día por seguridad
                    followUpDate = target;

                    // CASO C: SEGUIMIENTO DE COTIZACIÓN (+3 Días)
                } else if (analysis.intent === 'QUOTE_FOLLOWUP') {
                    const target = new Date();
                    target.setDate(target.getDate() + 3);
                    target.setUTCHours(17, 0, 0, 0); // 11 AM MX

                    if (target.getDay() === 0) {
                        target.setDate(target.getDate() + 1);
                    }
                    followUpDate = target;
                }

                // 5. Guardar en Base de Datos
                if (followUpDate) {
                    await query(`
                        UPDATE conversations
                        SET intent = $1::varchar,
                            follow_up_date = $2::timestamp,
                            follow_up_status = 'PENDING',
                            appointment_date = CASE WHEN $1::varchar = 'APPOINTMENT' THEN $2::timestamp ELSE appointment_date END,
                            appointment_status = CASE WHEN $1::varchar = 'APPOINTMENT' THEN 'PENDING' ELSE appointment_status END,
                            last_ai_analysis_at = NOW(),
                            last_message_analyzed_id = $3
                        WHERE id = $4
                    `, [analysis.intent, followUpDate.toISOString(), lastRealId, chat.id]);

                    console.log(`✅ ${analysis.intent} detectado. Programado para: ${followUpDate.toISOString()} (UTC)`);
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