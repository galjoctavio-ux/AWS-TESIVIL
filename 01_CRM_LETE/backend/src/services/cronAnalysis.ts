import { query } from '../config/db';
import { analyzeChatForAppointment } from './aiDateService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runNightlyAnalysis = async () => {
    console.log('🌙 [CRON] Iniciando Análisis Avanzado de Seguimiento...');

    try {
        // 1. Buscamos chats activos (excluimos bloqueados o cerrados)
        const result = await query(`
            SELECT id, whatsapp_id, last_message_analyzed_id
            FROM conversations 
            WHERE status NOT IN ('CLOSED', 'BLOCKED')
        `);

        const candidates = result.rows;
        console.log(`🔎 Candidatos: ${candidates.length}`);

        for (const chat of candidates) {
            // 2. Obtener último mensaje para comparar marcas Y para calcular tiempos
            const lastMsgResult = await query(`
                SELECT id, whatsapp_message_id, content, created_at, is_internal
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at DESC
                LIMIT 1
            `, [chat.id]);

            if (lastMsgResult.rows.length === 0) continue;

            const lastMsg = lastMsgResult.rows[0];
            const lastRealId = lastMsg.whatsapp_message_id || lastMsg.id.toString();

            // Lógica de Marcas: Si ya analizamos este estado, saltar.
            // EXCEPCIÓN: Si es un 'NO_REPLY' pendiente, quizás queramos reevaluar, 
            // pero por eficiencia, asumimos que si no hay mensajes nuevos, la estrategia anterior sigue vigente.
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
                let status = 'PENDING';

                // --- LÓGICA DE PROGRAMACIÓN DE FECHAS ---

                if (analysis.intent === 'APPOINTMENT' && analysis.appointment_date_iso) {
                    // Caso 1: Cita Firme
                    followUpDate = new Date(analysis.appointment_date_iso);

                } else if (analysis.intent === 'FUTURE_CONTACT' && analysis.appointment_date_iso) {
                    // Caso 2: "Háblame en Enero"
                    followUpDate = new Date(analysis.appointment_date_iso);

                } else if (analysis.intent === 'NO_REPLY') {
                    // Caso 3: Ghosting (Cliente no contestó)
                    // Regla: Mandar mensaje Mañana a las 9:00 AM
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
                    followUpDate = tomorrow;

                } else if (analysis.intent === 'SOFT_FOLLOWUP') {
                    // Caso 4: "Déjame ver..." (Regla de las 23 horas)
                    // Base: Hora del último mensaje DEL CLIENTE (o del chat si fue mixto, pero idealmente del cliente)
                    // Si el último mensaje fue nuestro, la ventana de 24h cuenta desde NUESTRO mensaje? 
                    // NO. La ventana de WhatsApp se abre cuando el CLIENTE escribe.
                    // Por seguridad, usaremos la fecha del último mensaje registrado en la BD (created_at).

                    const lastMsgTime = new Date(lastMsg.created_at);

                    // Calculamos: Hora mensaje + 23 horas
                    const deadline = new Date(lastMsgTime.getTime() + (23 * 60 * 60 * 1000));

                    // Definimos límites hábiles para ESE día del deadline
                    const businessStart = new Date(deadline);
                    businessStart.setHours(8, 0, 0, 0); // 8 AM

                    const businessEnd = new Date(deadline);
                    businessEnd.setHours(20, 0, 0, 0); // 8 PM (20:00)

                    if (deadline > businessEnd) {
                        // Si las 23h caen a las 10 PM, lo bajamos a las 8 PM para alcanzar a enviar.
                        followUpDate = businessEnd;
                    } else if (deadline < businessStart) {
                        // Si las 23h caen a las 4 AM (raro), lo movemos a las 8 AM.
                        followUpDate = businessStart;
                    } else {
                        // Si cae dentro (ej. 4 PM), usamos esa hora exacta.
                        followUpDate = deadline;
                    }
                }

                // 5. Guardar en Base de Datos
                if (followUpDate) {
                    await query(`
                        UPDATE conversations
                        SET intent = $1,
                            follow_up_date = $2,
                            follow_up_status = 'PENDING',
                            
                            -- Mantenemos compatibilidad con el sistema anterior de citas
                            appointment_date = CASE WHEN $1 = 'APPOINTMENT' THEN $2 ELSE appointment_date END,
                            appointment_status = CASE WHEN $1 = 'APPOINTMENT' THEN 'PENDING' ELSE appointment_status END,

                            last_ai_analysis_at = NOW(),
                            last_message_analyzed_id = $3
                        WHERE id = $4
                    `, [analysis.intent, followUpDate.toISOString(), lastRealId, chat.id]);

                    console.log(`✅ ${analysis.intent} detectado. Programado para: ${followUpDate.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`);
                } else {
                    // Si es NONE o no hay fecha, solo actualizamos la marca
                    await query(`
                        UPDATE conversations
                        SET last_ai_analysis_at = NOW(),
                            intent = $1,
                            last_message_analyzed_id = $2
                        WHERE id = $3
                    `, [analysis.intent, lastRealId, chat.id]);
                    console.log(`Thinking: ${analysis.intent} (Sin acción programada)`);
                }
            }

            // Delay anti-ban
            await delay(5000);
        }

        console.log('💤 Análisis Finalizado.');

    } catch (error) {
        console.error('Error en runNightlyAnalysis:', error);
    }
};