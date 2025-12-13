import { supabaseAdmin } from '../services/supabaseClient';
import { analyzeChatForAppointment } from '../services/aiDateService';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno para que funcione manual
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const runManualAnalysis = async () => {
    console.log('🧪 [TEST MANUAL] Iniciando Análisis (Ventana: 7 Días)...');

    try {
        // 1. OBTENER CANDIDATOS (Últimos 7 días)
        const { data: candidates, error } = await supabaseAdmin
            .from('clientes')
            .select('id, whatsapp_id, nombre_completo, last_message_analyzed_id, last_interaction, crm_status')
            .not('crm_status', 'in', '("CLOSED","BLOCKED")')
            // AQUÍ ESTÁ LA CLAVE: 7 días atrás
            .gt('last_interaction', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('last_interaction', { ascending: false });

        if (error) throw error;

        if (!candidates || candidates.length === 0) {
            console.log('🧪 Nadie para analizar en la última semana.');
            return;
        }

        console.log(`🔎 Candidatos encontrados (7 días): ${candidates.length}`);

        for (const cliente of candidates) {
            // 2. VERIFICAR ÚLTIMO MENSAJE
            const { data: lastMsgData } = await supabaseAdmin
                .from('mensajes_whatsapp')
                .select('whatsapp_message_id, created_at, content')
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            // Si ya se analizó el último mensaje, lo saltamos para no gastar IA
            // (Si quieres forzar el análisis aunque no haya mensajes nuevos, comenta la siguiente línea)
            if (!lastMsgData || cliente.last_message_analyzed_id === lastMsgData.whatsapp_message_id) {
                // process.stdout.write('.'); // Feedback visual de salto
                continue;
            }

            console.log(`\n🧠 Analizando a: ${cliente.nombre_completo || cliente.whatsapp_id}...`);

            // 3. OBTENER HISTORIAL
            const { data: historyData } = await supabaseAdmin
                .from('mensajes_whatsapp')
                .select('role, content, created_at')
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: true })
                .limit(30);

            if (!historyData) continue;

            const historyText = historyData.map(m => `[${new Date(m.created_at).toLocaleString('es-MX')}] ${m.role}: ${m.content}`).join('\n');

            // 4. CONSULTAR A GEMINI
            const analysis = await analyzeChatForAppointment(cliente.id, historyText);

            if (analysis) {
                let followUpDate: Date | null = null;
                const updates: any = {
                    last_ai_analysis_at: new Date(),
                    last_message_analyzed_id: lastMsgData.whatsapp_message_id,
                    crm_intent: analysis.intent,
                    ai_summary: analysis.reasoning,
                };

                // Lógica de Fechas (Cita vs Recordatorio)
                if (analysis.intent === 'APPOINTMENT') {
                    if (analysis.appointment_date_iso) {
                        updates.appointment_date = analysis.appointment_date_iso;
                        updates.appointment_status = 'PENDIENTE';
                    }
                    if (analysis.follow_up_date_iso) {
                        followUpDate = new Date(analysis.follow_up_date_iso);
                    }
                }
                else if (['FUTURE_CONTACT', 'NO_REPLY', 'QUOTE_FOLLOWUP'].includes(analysis.intent)) {
                    if (analysis.follow_up_date_iso) {
                        followUpDate = new Date(analysis.follow_up_date_iso);
                    }
                }

                updates.next_follow_up_date = followUpDate ? followUpDate.toISOString() : null;

                // 5. GUARDAR
                await supabaseAdmin.from('clientes').update(updates).eq('id', cliente.id);

                console.log(`✅ Resultado: ${analysis.intent}`);
                if (followUpDate) console.log(`   ⏰ Acción programada: ${followUpDate.toLocaleString('es-MX')}`);
            }

            // Pausa para evitar rate limit de Gemini
            await delay(4500);
        }
        console.log('\n🧪 Análisis Manual Finalizado.');

    } catch (error) {
        console.error('❌ Error en testCronAnalysis:', error);
    }
};

runManualAnalysis();