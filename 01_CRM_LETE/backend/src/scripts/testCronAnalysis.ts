import { supabaseAdmin } from '../services/supabaseClient';
import { analyzeChatForAppointment } from '../services/aiDateService';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const runManualAnalysis = async () => {
    console.log('🧪 [TEST MANUAL] Iniciando (Filtrando por FECHA REAL DEL MENSAJE)...');

    // Calculamos la fecha límite (Hace 7 días exactos)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 60);
    console.log(`📅 Ignorando mensajes anteriores al: ${sevenDaysAgo.toLocaleString('es-MX')}`);

    try {
        // 1. OBTENER CANDIDATOS
        // Quitamos el filtro de 'last_interaction' del Query porque está "sucio" por la importación reciente
        // Traemos a los que no estén cerrados ni bloqueados.
        const { data: candidates, error } = await supabaseAdmin
            .from('clientes')
            .select('id, whatsapp_id, nombre_completo, last_message_analyzed_id, crm_status')
            .not('crm_status', 'in', '("CLOSED","BLOCKED")');

        if (error) throw error;
        if (!candidates || candidates.length === 0) {
            console.log('🧪 Nadie para analizar.');
            return;
        }

        console.log(`🔎 Revisando ${candidates.length} candidatos...`);
        let procesados = 0;
        let ignorados = 0;

        for (const cliente of candidates) {
            // 2. OBTENER EL ÚLTIMO MENSAJE REAL
            const { data: lastMsgData } = await supabaseAdmin
                .from('mensajes_whatsapp')
                .select('whatsapp_message_id, created_at, content')
                .eq('cliente_id', cliente.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!lastMsgData) {
                // process.stdout.write('x'); // Sin mensajes
                continue;
            }

            // =================================================================
            // 👮‍♂️ EL PORTERO: FILTRO DURO POR FECHA DE MENSAJE
            // =================================================================
            const msgDate = new Date(lastMsgData.created_at);

            if (msgDate < sevenDaysAgo) {
                // Si el mensaje es viejo, LO SALTAMOS y no gastamos IA
                // process.stdout.write('.'); 
                ignorados++;
                continue;
            }

            // Si ya lo analizamos, también saltar
            if (cliente.last_message_analyzed_id === lastMsgData.whatsapp_message_id) {
                continue;
            }

            console.log(`\n🧠 [${msgDate.toLocaleDateString()}] Analizando a: ${cliente.nombre_completo || cliente.whatsapp_id}...`);

            // 3. OBTENER HISTORIAL (Solo si pasó el filtro)
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

                // Lógica de Fechas
                if (analysis.intent === 'APPOINTMENT') {
                    if (analysis.appointment_date_iso) {
                        updates.appointment_date = analysis.appointment_date_iso;
                        updates.appointment_status = 'PENDIENTE';
                    }
                    if (analysis.follow_up_date_iso) followUpDate = new Date(analysis.follow_up_date_iso);
                }
                else if (['FUTURE_CONTACT', 'NO_REPLY', 'QUOTE_FOLLOWUP'].includes(analysis.intent)) {
                    if (analysis.follow_up_date_iso) followUpDate = new Date(analysis.follow_up_date_iso);
                }

                updates.next_follow_up_date = followUpDate ? followUpDate.toISOString() : null;

                await supabaseAdmin.from('clientes').update(updates).eq('id', cliente.id);
                console.log(`✅ ${analysis.intent} | Acción: ${followUpDate ? followUpDate.toLocaleString('es-MX') : 'Manual'}`);
                procesados++;
            }

            await delay(15000);
        }

        console.log(`\n🧪 FINALIZADO:`);
        console.log(`   ✅ Procesados (recientes): ${procesados}`);
        console.log(`   ⏭️ Ignorados (viejos): ${ignorados}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

runManualAnalysis();