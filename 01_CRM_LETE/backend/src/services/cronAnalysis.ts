import { supabaseAdmin } from '../services/supabaseClient';
import { analyzeChatForAppointment } from './aiDateService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const runNightlyAnalysis = async () => {
    console.log('🌙 [CRON] Iniciando Análisis Nocturno (V5 - Supabase Edition)...');

    try {
        // 1. OBTENER CANDIDATOS
        // Buscamos clientes activos (No bloqueados, No cerrados)
        // Y que hayan tenido interacción reciente (últimos 3 días) para ahorrar tokens
        const { data: candidates, error } = await supabaseAdmin
            .from('clientes')
            .select('id, whatsapp_id, nombre_completo, last_message_analyzed_id, last_interaction, crm_status')
            .not('crm_status', 'in', '("CLOSED","BLOCKED")') // Excluir cerrados
            .gt('last_interaction', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 3 días
            .order('last_interaction', { ascending: false });

        if (error) throw error;
        if (!candidates || candidates.length === 0) {
            console.log('🌙 Nadie para analizar hoy.');
            return;
        }

        console.log(`🔎 Candidatos activos recientes: ${candidates.length}`);

        for (const cliente of candidates) {
            // 2. OBTENER EL ÚLTIMO MENSAJE REAL DEL CHAT
            const { data: lastMsgData } = await supabaseAdmin
                .from('mensajes_whatsapp')
                .select('whatsapp_message_id, created_at, content')
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!lastMsgData) continue; // Cliente sin mensajes

            // 🛑 FILTRO DE EFICIENCIA:
            // Si el ID del último mensaje es IGUAL al que ya analizamos la vez pasada, NO GASTES DINERO EN IA.
            if (cliente.last_message_analyzed_id === lastMsgData.whatsapp_message_id) {
                // console.log(`⏩ Saltando ${cliente.whatsapp_id} (Sin mensajes nuevos)`);
                continue;
            }

            console.log(`🧠 Analizando a: ${cliente.nombre_completo || cliente.whatsapp_id}...`);

            // 3. OBTENER HISTORIAL (Últimos 30 mensajes para contexto)
            const { data: historyData } = await supabaseAdmin
                .from('mensajes_whatsapp')
                .select('role, content, created_at')
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: true }) // Importante: Cronológico para la IA
                .limit(30);

            if (!historyData) continue;

            // Formatear para Gemini
            const historyText = historyData.map(m => {
                const role = m.role === 'assistant' ? 'Soporte/Técnico' : 'Cliente';
                const date = new Date(m.created_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
                return `[${date}] ${role}: ${m.content}`;
            }).join('\n');

            // 4. CONSULTAR A GEMINI (Usamos tu servicio existente aiDateService)
            // Nota: analyzeChatForAppointment no necesita cambios, solo recibe texto.
            const analysis = await analyzeChatForAppointment(cliente.id, historyText);

            if (analysis) {
                let followUpDate: Date | null = null;
                const now = new Date();

                // LÓGICA DE FECHAS (Idéntica a tu V4 original)
                if ((analysis.intent === 'APPOINTMENT' || analysis.intent === 'FUTURE_CONTACT') && analysis.appointment_date_iso) {
                    followUpDate = new Date(analysis.appointment_date_iso);
                    // Seguridad: Si es pasado, mover a mañana 5 PM
                    if (followUpDate <= now) {
                        followUpDate = new Date();
                        followUpDate.setDate(followUpDate.getDate() + 1);
                        followUpDate.setUTCHours(23, 0, 0, 0); // ~5-6 PM MX
                    }
                } else if (analysis.intent === 'NO_REPLY') {
                    // Mañana a las 9 AM MX (~15:00 UTC)
                    const target = new Date();
                    target.setDate(target.getDate() + 1);
                    target.setUTCHours(15, 0, 0, 0);
                    followUpDate = target;
                } else if (analysis.intent === 'QUOTE_FOLLOWUP') {
                    // +3 Días
                    const target = new Date();
                    target.setDate(target.getDate() + 3);
                    target.setUTCHours(17, 0, 0, 0);
                    if (target.getDay() === 0) target.setDate(target.getDate() + 1); // No domingo
                    followUpDate = target;
                }

                // 5. GUARDAR RESULTADO EN SUPABASE (CLIENTES)
                const updates: any = {
                    last_ai_analysis_at: new Date(),
                    last_message_analyzed_id: lastMsgData.whatsapp_message_id,
                    crm_intent: analysis.intent,
                    ai_summary: analysis.reasoning // Guardamos el razonamiento para verlo en el Admin
                };

                if (followUpDate) {
                    updates.next_follow_up_date = followUpDate.toISOString();
                }

                // Si detectó cita, actualizamos campos de cita
                if (analysis.intent === 'APPOINTMENT' && followUpDate) {
                    updates.appointment_date = followUpDate.toISOString();
                    updates.appointment_status = 'PENDIENTE';
                }

                await supabaseAdmin
                    .from('clientes')
                    .update(updates)
                    .eq('id', cliente.id);

                console.log(`✅ Resultado: ${analysis.intent} -> Seguimiento: ${followUpDate ? followUpDate.toISOString() : 'N/A'}`);
            }

            // Delay anti-ban / rate limit
            await delay(2000);
        }

        console.log('💤 Análisis Nocturno Finalizado.');

    } catch (error) {
        console.error('❌ Error en runNightlyAnalysis:', error);
    }
};