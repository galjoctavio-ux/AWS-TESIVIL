import { query } from '../config/db'; // Importación corregida
import { analyzeChatForAppointment } from './aiDateService';

// Función auxiliar para pausar la ejecución (Delay)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runNightlyAnalysis = async () => {
    console.log('🌙 [CRON] Iniciando Análisis Nocturno de Citas...');

    try {
        // 1. Seleccionar conversaciones activas recientemente
        const result = await query(`
            SELECT id, whatsapp_id, last_message_analyzed_id
            FROM conversations 
            WHERE status NOT IN ('CLOSED', 'BLOCKED')
        `);

        const candidates = result.rows;
        console.log(`🔎 Candidatos encontrados para revisión: ${candidates.length}`);

        let processedCount = 0;

        for (const chat of candidates) {
            // 2. Obtener el último mensaje REAL
            const lastMsgResult = await query(`
                SELECT id, whatsapp_message_id, content, created_at
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at DESC
                LIMIT 1
            `, [chat.id]);

            if (lastMsgResult.rows.length === 0) continue; 

            const lastRealMsg = lastMsgResult.rows[0];
            const lastRealId = lastRealMsg.whatsapp_message_id || lastRealMsg.id.toString();

            // 3. LÓGICA DE MARCAS
            if (chat.last_message_analyzed_id === lastRealId) {
                continue; 
            }

            console.log(`🧠 Analizando chat nuevo/actualizado: ${chat.whatsapp_id}...`);

            // 4. Obtener historial (Últimos 50 mensajes)
            const historyResult = await query(`
                SELECT content, is_internal, created_at
                FROM messages
                WHERE conversation_id = $1
                ORDER BY created_at ASC
                LIMIT 50
            `, [chat.id]);

            // Formatear conversación (Aquí corregimos el error de tipado 'm: any')
            const historyText = historyResult.rows.map((m: any) => {
                const role = m.is_internal ? 'Soporte/Técnico' : 'Cliente';
                const date = new Date(m.created_at).toLocaleString('es-MX');
                return `[${date}] ${role}: ${m.content}`;
            }).join('\n');

            // 5. Llamar al servicio de IA
            const analysis = await analyzeChatForAppointment(chat.id.toString(), historyText);

            if (analysis) {
                if (analysis.has_appointment && analysis.appointment_date_iso) {
                    await query(`
                        UPDATE conversations
                        SET appointment_date = $1,
                            appointment_status = 'PENDING',
                            last_ai_analysis_at = NOW(),
                            last_message_analyzed_id = $2
                        WHERE id = $3
                    `, [analysis.appointment_date_iso, lastRealId, chat.id]);
                    
                    console.log(`✅ CITA DETECTADA para ${chat.whatsapp_id}: ${analysis.appointment_date_iso}`);
                } else {
                    await query(`
                        UPDATE conversations
                        SET last_ai_analysis_at = NOW(),
                            last_message_analyzed_id = $1
                        WHERE id = $2
                    `, [lastRealId, chat.id]);
                    
                    console.log(`❌ Sin cita detectada para ${chat.whatsapp_id}. Marca actualizada.`);
                }
            }

            processedCount++;

            // 6. DELAY DE SEGURIDAD
            console.log('⏳ Esperando 30s para el siguiente análisis...');
            await delay(30000); 
        }

        console.log(`💤 Análisis Nocturno Finalizado. Chats procesados con IA: ${processedCount}`);

    } catch (error) {
        console.error('Error crítico en runNightlyAnalysis:', error);
    }
};
