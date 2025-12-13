import { supabaseAdmin } from '../services/supabaseClient';
import { sendText } from './whatsappService';

// Helper para calcular rangos de fecha en Zona Horaria México
const getMexicoDateRange = (offsetDays: number) => {
    const now = new Date();
    // Ajustamos a hora México (UTC-6 aprox, pero mejor usar la librería o cálculo manual simple)
    // Para simplificar: Creamos una fecha en UTC y le restamos 6 horas visualmente para "pensar" en MX
    const mxDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));

    mxDate.setDate(mxDate.getDate() + offsetDays);
    mxDate.setHours(0, 0, 0, 0); // Inicio del día MX

    const start = new Date(mxDate);

    const end = new Date(mxDate);
    end.setHours(23, 59, 59, 999); // Fin del día MX

    return { start, end };
};

export const checkReminders = async () => {
    console.log('⏰ [CRON] Verificando envíos programados (Supabase Edition)...');

    try {
        // =====================================================================
        // 1. RECORDATORIOS DE CITAS (MAÑANA)
        // =====================================================================
        const tomorrow = getMexicoDateRange(1);

        const { data: tomorrowClients } = await supabaseAdmin
            .from('clientes')
            .select('id, whatsapp_id, appointment_date, nombre_completo')
            .eq('appointment_status', 'PENDIENTE')
            .gte('appointment_date', tomorrow.start.toISOString())
            .lte('appointment_date', tomorrow.end.toISOString());

        if (tomorrowClients && tomorrowClients.length > 0) {
            console.log(`📅 Recordatorios Mañana: ${tomorrowClients.length}`);
            for (const client of tomorrowClients) {
                const message = `Hola ${client.nombre_completo || ''}! 👋 Te recordamos que el día de *mañana* tenemos agendada tu revisión técnica.`;
                const sentId = await sendText(client.whatsapp_id + '@s.whatsapp.net', message);

                if (sentId) {
                    await supabaseAdmin
                        .from('clientes')
                        .update({ appointment_status: 'REMINDED_TOMORROW' })
                        .eq('id', client.id);
                }
            }
        }

        // =====================================================================
        // 2. RECORDATORIOS DE CITAS (HOY)
        // =====================================================================
        const today = getMexicoDateRange(0);

        const { data: todayClients } = await supabaseAdmin
            .from('clientes')
            .select('id, whatsapp_id, appointment_date, nombre_completo')
            .in('appointment_status', ['PENDIENTE', 'REMINDED_TOMORROW']) // Si se agendó hoy mismo o ya se avisó ayer
            .gte('appointment_date', today.start.toISOString())
            .lte('appointment_date', today.end.toISOString());

        if (todayClients && todayClients.length > 0) {
            console.log(`📅 Recordatorios HOY: ${todayClients.length}`);
            for (const client of todayClients) {
                const dateObj = new Date(client.appointment_date);
                const timeString = dateObj.toLocaleTimeString('es-MX', {
                    timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: true
                });

                const message = `Buen día! ☀️ Te recordamos que tu visita es el día de *hoy a las ${timeString}*.`;
                const sentId = await sendText(client.whatsapp_id + '@s.whatsapp.net', message);

                if (sentId) {
                    await supabaseAdmin
                        .from('clientes')
                        .update({ appointment_status: 'REMINDED_TODAY' })
                        .eq('id', client.id);
                }
            }
        }

        // =====================================================================
        // 3. SEGUIMIENTOS DINÁMICOS (GHOSTING, PROPUESTAS, ETC)
        // =====================================================================

        // Buscamos clientes que tengan una fecha de seguimiento vencida (o sea, ya toca enviar)
        const nowISO = new Date().toISOString();

        const { data: followUps } = await supabaseAdmin
            .from('clientes')
            .select('id, whatsapp_id, crm_intent, next_follow_up_date, last_interaction, nombre_completo')
            .not('crm_intent', 'in', '("NONE","AWAITING_REPLY")') // Solo intenciones activas
            .lte('next_follow_up_date', nowISO) // Que ya haya pasado la hora de envío
            .order('next_follow_up_date', { ascending: true }); // Los más atrasados primero

        if (followUps && followUps.length > 0) {
            console.log(`🚀 Seguimientos pendientes: ${followUps.length}`);

            for (const task of followUps) {

                // --- 🛑 FRENO DE MANO (JUST-IN-TIME CHECK) 🛑 ---
                // Verificamos si hubo interacción REAL después de que la IA programó esto.
                // Si el cliente habló hace menos de 12 horas, abortamos para no ser molestos.
                const lastMsgTime = new Date(task.last_interaction).getTime();
                const scheduledTime = new Date(task.next_follow_up_date).getTime();
                const diffHours = (new Date().getTime() - lastMsgTime) / (1000 * 60 * 60);

                // Si el cliente habló DESPUÉS de lo programado o hace menos de 2 horas
                if (lastMsgTime > scheduledTime || diffHours < 2) {
                    console.log(`✋ Cancelando envío a ${task.nombre_completo}: Interacción reciente detectada.`);
                    // Limpiamos la tarea para que no se quede atorada
                    await supabaseAdmin
                        .from('clientes')
                        .update({
                            crm_intent: 'NONE',
                            next_follow_up_date: null
                        })
                        .eq('id', task.id);
                    continue;
                }

                let message = '';

                if (task.crm_intent === 'NO_REPLY') {
                    message = `Hola ${task.nombre_completo || ''}, buen día. 👋 Notamos que quedó pendiente tu reporte. ¿Aún tienes problemas con tu instalación o prefieres que cerremos tu expediente por ahora? Quedamos atentos.`;
                } else if (task.crm_intent === 'QUOTE_FOLLOWUP') {
                    message = `Hola ${task.nombre_completo || ''}, buen día. 👋\nSolo para confirmar si pudiste revisar la propuesta que te enviamos.\n¿Te gustaría que procedamos para congelar el precio o tienes alguna duda técnica?`;
                } else if (task.crm_intent === 'FUTURE_CONTACT') {
                    message = `Hola! ⚡ Como acordamos, te contacto para retomar el tema de tu revisión eléctrica. ¿Te gustaría que agendemos una visita para esta semana?`;
                }

                if (message) {
                    const sentId = await sendText(task.whatsapp_id + '@s.whatsapp.net', message);

                    if (sentId) {
                        // Marcamos como enviado y esperamos respuesta
                        await supabaseAdmin
                            .from('clientes')
                            .update({
                                crm_intent: 'AWAITING_REPLY',
                                next_follow_up_date: null, // Limpiamos fecha para no repetir
                                last_ai_analysis_at: new Date() // Actualizamos para que no se analice inmediatamente
                            })
                            .eq('id', task.id);

                        console.log(`✅ Mensaje enviado a ${task.whatsapp_id} (${task.crm_intent})`);
                    }
                }
            }
        } else {
            console.log('✅ No hay seguimientos pendientes por ahora.');
        }

    } catch (error) {
        console.error('❌ Error en checkReminders:', error);
    }
};