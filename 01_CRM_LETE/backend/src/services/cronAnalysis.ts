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

                // Lógica de fechas para VENTAS (Igual que antes)
                if ((analysis.intent === 'APPOINTMENT' || analysis.intent === 'FUTURE_CONTACT') && analysis.appointment_date_iso) {
                    followUpDate = new Date(analysis.appointment_date_iso);
                    // ... validaciones de fecha ...
                } else if (analysis.intent === 'NO_REPLY') {
                    // ... logica NO_REPLY ...
                } else if (analysis.intent === 'QUOTE_FOLLOWUP') {
                    // ... logica QUOTE ...
                }

                // 🆕 LÓGICA PARA ALERTAS INTERNAS
                // Si es Alerta u Admin, NO programamos next_follow_up_date automático para el bot.
                // Simplemente guardamos el estado para que aparezca en rojo/amarillo en tu CRM.
                if (analysis.intent === 'OPERATIONAL_ALERT' || analysis.intent === 'ADMIN_TASK') {
                    console.log(`🚨 ALERTA DETECTADA (${analysis.intent}) para ${cliente.nombre_completo}: ${analysis.reasoning}`);
                    followUpDate = null; // Que no lo toque el bot, lo toca un humano
                }

                // 5. GUARDAR RESULTADO
                const updates: any = {
                    last_ai_analysis_at: new Date(),
                    last_message_analyzed_id: lastMsgData.whatsapp_message_id,
                    crm_intent: analysis.intent,
                    ai_summary: analysis.reasoning,
                    // Importante: Si es alerta, podríamos querer un flag extra si tu DB lo soporta
                    // requires_human_intervention: ['OPERATIONAL_ALERT', 'ADMIN_TASK'].includes(analysis.intent) 
                };

                if (followUpDate) {
                    updates.next_follow_up_date = followUpDate.toISOString();
                } else {
                    // Si es alerta o NONE, limpiamos la fecha para que el Cron de envíos no dispare nada
                    updates.next_follow_up_date = null;
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