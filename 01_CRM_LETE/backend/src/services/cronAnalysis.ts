import { supabaseAdmin } from '../services/supabaseClient';
import { analyzeChatForAppointment } from './aiDateService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runNightlyAnalysis = async () => {
    console.log('🌙 [CRON] Iniciando Análisis Nocturno (V5.1 - Debug Mode)...');

    try {
        // 1. OBTENER CANDIDATOS
        const { data: candidates, error } = await supabaseAdmin
            .from('clientes')
            .select('id, whatsapp_id, nombre_completo, last_message_analyzed_id, last_interaction, crm_status')
            .not('crm_status', 'in', '("CLOSED","BLOCKED")')
            .gt('last_interaction', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
            .order('last_interaction', { ascending: false });

        if (error) throw error;
        if (!candidates || candidates.length === 0) {
            console.log('🌙 Nadie para analizar hoy.');
            return;
        }

        console.log(`🔎 Candidatos activos recientes: ${candidates.length}`);

        for (const cliente of candidates) {
            // 2. OBTENER EL ÚLTIMO MENSAJE
            const { data: lastMsgData } = await supabaseAdmin
                .from('mensajes_whatsapp')
                .select('whatsapp_message_id, created_at, content')
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!lastMsgData) {
                // console.log(`⏩ Saltando ${cliente.whatsapp_id} (Sin mensajes)`);
                continue;
            }

            // 🛑 DEBUG: VERIFICAR POR QUÉ NO SALTA
            // Si el nombre es Octavio o Vio, imprimimos detalles
            if (cliente.nombre_completo?.includes('Vio') || cliente.nombre_completo?.includes('Octavio')) {
                console.log(`🔍 DEBUG [${cliente.nombre_completo}]: DB='${cliente.last_message_analyzed_id}' vs MSG='${lastMsgData.whatsapp_message_id}'`);
            }

            // Lógica de eficiencia
            if (cliente.last_message_analyzed_id === lastMsgData.whatsapp_message_id) {
                // Descomentamos para ver a los que sí salta
                // console.log(`⏩ Saltando ${cliente.nombre_completo} (Sin cambios)`); 
                continue;
            }

            console.log(`🧠 Analizando a: ${cliente.nombre_completo || cliente.whatsapp_id}...`);

            // 3. OBTENER HISTORIAL
            const { data: historyData } = await supabaseAdmin
                .from('mensajes_whatsapp')
                .select('role, content, created_at')
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: true })
                .limit(30);

            if (!historyData) continue;

            const historyText = historyData.map(m => {
                const role = m.role === 'assistant' ? 'Soporte/Técnico' : 'Cliente';
                const date = new Date(m.created_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
                return `[${date}] ${role}: ${m.content}`;
            }).join('\n');

            // 4. CONSULTAR A GEMINI
            const analysis = await analyzeChatForAppointment(cliente.id, historyText);

            if (analysis) {
                let followUpDate: Date | null = null;
                const now = new Date();

                if ((analysis.intent === 'APPOINTMENT' || analysis.intent === 'FUTURE_CONTACT') && analysis.appointment_date_iso) {
                    followUpDate = new Date(analysis.appointment_date_iso);
                    if (followUpDate <= now) {
                        followUpDate = new Date();
                        followUpDate.setDate(followUpDate.getDate() + 1);
                        followUpDate.setUTCHours(23, 0, 0, 0);
                    }
                } else if (analysis.intent === 'NO_REPLY') {
                    const target = new Date();
                    target.setDate(target.getDate() + 1);
                    target.setUTCHours(15, 0, 0, 0);
                    followUpDate = target;
                } else if (analysis.intent === 'QUOTE_FOLLOWUP') {
                    const target = new Date();
                    target.setDate(target.getDate() + 3);
                    target.setUTCHours(17, 0, 0, 0);
                    if (target.getDay() === 0) target.setDate(target.getDate() + 1);
                    followUpDate = target;
                }

                // 5. GUARDAR RESULTADO EN SUPABASE
                const updates: any = {
                    last_ai_analysis_at: new Date(),
                    last_message_analyzed_id: lastMsgData.whatsapp_message_id, // <--- ESTO ES LO QUE DEBE GUARDARSE
                    crm_intent: analysis.intent,
                    ai_summary: analysis.reasoning
                };

                if (followUpDate) {
                    updates.next_follow_up_date = followUpDate.toISOString();
                }

                if (analysis.intent === 'APPOINTMENT' && followUpDate) {
                    updates.appointment_date = followUpDate.toISOString();
                    updates.appointment_status = 'PENDIENTE';
                }

                // 🚨 CAPTURAMOS ERROR DEL UPDATE AQUÍ
                const { error: updateError } = await supabaseAdmin
                    .from('clientes')
                    .update(updates)
                    .eq('id', cliente.id);

                if (updateError) {
                    console.error(`❌ ERROR GUARDANDO ANÁLISIS para ${cliente.nombre_completo}:`, updateError);
                } else {
                    console.log(`✅ Guardado OK: ${analysis.intent}`);
                }
            }

            await delay(2000);
        }

        console.log('💤 Análisis Nocturno Finalizado.');

    } catch (error) {
        console.error('❌ Error en runNightlyAnalysis:', error);
    }
};