import pool from '../services/eaDatabase.js';
import { supabaseAdmin as supabase } from '../services/supabaseClient.js';

/**
 * CONTROLADOR MAESTRO DEL DASHBOARD CRM V2
 * Implementa Búsqueda Híbrida (JSON ID + Teléfono)
 */
export const getCrmDashboardV2 = async (req, res) => {
    try {
        console.log("🔄 Iniciando sincronización de Dashboard CRM V2...");

        // 1. OBTENER DATOS DE SUPABASE
        const { data: clientesSupa, error: errorSupa } = await supabase
            .from('clientes')
            .select(`
                *,
                casos (
                    id, 
                    status, 
                    descripcion_problema, 
                    monto_cobrado, 
                    created_at,
                    tecnico_id,
                    profiles!casos_tecnico_id_fkey (
                        nombre,
                        rol
                    )
                )
            `)
            .order('last_interaction', { ascending: false })
            .limit(100);

        if (errorSupa) throw new Error(`Error Supabase: ${errorSupa.message}`);

        // 2. OBTENER DATOS DE MARIADB (Agenda)
        const queryMaria = `
            SELECT 
                a.id AS cita_id,
                a.start_datetime,
                a.end_datetime,
                a.is_unavailable,
                a.notas_estructuradas, 
                c.mobile_number AS cliente_telefono,
                c.first_name AS cliente_nombre,
                c.last_name AS cliente_apellido,
                p.first_name AS tecnico_nombre,
                p.last_name AS tecnico_apellido,
                p.id AS tecnico_id_ea
            FROM ea_appointments a
            LEFT JOIN ea_users c ON a.id_users_customer = c.id
            LEFT JOIN ea_users p ON a.id_users_provider = p.id
            WHERE a.start_datetime >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `;

        const [citasMaria] = await pool.execute(queryMaria);

        // 3. EL GRAN CRUCE (THE MERGE)
        const datosUnificados = clientesSupa.map(cliente => {

            // A. Normalización de teléfono para el fallback
            const telefonoCliente = (cliente.telefono || '').replace(/\D/g, '').slice(-10);

            // B. BÚSQUEDA HÍBRIDA EN AGENDA
            const citaEncontrada = citasMaria.find(cita => {
                let match = false;

                // --- ESTRATEGIA 1: MATCH EXACTO POR ID (JSON) ---
                if (cita.notas_estructuradas) {
                    try {
                        const notas = JSON.parse(cita.notas_estructuradas);

                        // 1.1 Match por Caso ID
                        if (notas.caso_id) {
                            // Verificamos si alguno de los casos del cliente coincide con el ID en MariaDB
                            const tieneCaso = cliente.casos?.some(c => String(c.id) === String(notas.caso_id));
                            if (tieneCaso) return true;
                        }

                        // 1.2 Match por Cliente ID (si existiera)
                        if (notas.cliente_id && String(notas.cliente_id) === String(cliente.id)) {
                            return true;
                        }
                    } catch (e) {
                        // Si el JSON falla, ignoramos silenciosamente y pasamos al teléfono
                    }
                }

                // --- ESTRATEGIA 2: MATCH POR TELÉFONO (FALLBACK) ---
                if (!match) {
                    const telefonoCita = (cita.cliente_telefono || '').replace(/\D/g, '').slice(-10);
                    if (telefonoCliente && telefonoCliente.length === 10 && telefonoCita === telefonoCliente) {
                        return true;
                    }
                }

                return false;
            });

            // C. Obtener nombre del técnico desde Supabase
            let tecnicoNombreSupa = null;
            if (cliente.casos && cliente.casos.length > 0) {
                const ultimoCaso = cliente.casos[cliente.casos.length - 1];
                if (ultimoCaso.profiles) {
                    tecnicoNombreSupa = Array.isArray(ultimoCaso.profiles)
                        ? ultimoCaso.profiles[0]?.nombre
                        : ultimoCaso.profiles.nombre;
                }
            }

            // D. Calcular Integridad
            let integridad = 'OK';
            let mensajeIntegridad = 'Lead OK';
            let accionSugerida = 'VER_DETALLES';

            const tieneIntencionCita = cliente.crm_intent === 'APPOINTMENT' || cliente.crm_intent === 'QUOTE_FOLLOWUP';
            const tieneCitaReal = !!citaEncontrada;

            if (tieneIntencionCita && !tieneCitaReal) {
                integridad = 'ERROR_GHOST';
                mensajeIntegridad = '🚨 Cita Fantasma';
                accionSugerida = 'AGENDAR_AHORA';
            } else if (!tieneIntencionCita && tieneCitaReal) {
                integridad = 'MANUAL';
                mensajeIntegridad = '⚠️ Agendado Manual';
            } else if (tieneIntencionCita && tieneCitaReal) {
                integridad = 'OK';
                mensajeIntegridad = 'Sincronizado';
            } else if (!tieneIntencionCita && tieneCitaReal) {
                // Caso extra: Sin intención clara pero con cita (agendado por humano)
                integridad = 'MANUAL';
                mensajeIntegridad = 'Agendado (Manual)';
            }

            // Si tiene cita real, el estado siempre es bueno visualmente
            if (tieneCitaReal) {
                // Forzamos OK visual si hay cita, aunque sea manual, para no alarmar innecesariamente
                // a menos que haya una discrepancia grave de fechas (que podríamos medir después)
            }

            // E. Calcular Finanzas
            const saldoPendiente = parseFloat(cliente.saldo_pendiente || 0);
            const totalCobrado = cliente.casos?.reduce((sum, caso) => sum + (parseFloat(caso.monto_cobrado) || 0), 0) || 0;
            const totalCotizadoEstimado = totalCobrado + saldoPendiente;

            return {
                id: cliente.id,
                nombre_completo: cliente.nombre_completo || 'Sin Nombre',
                telefono: cliente.telefono,
                crm_intent: cliente.crm_intent,
                ai_summary: cliente.ai_summary,

                cita_real: tieneCitaReal ? {
                    fecha: citaEncontrada.start_datetime,
                    tecnico: `${citaEncontrada.tecnico_nombre} ${citaEncontrada.tecnico_apellido}`,
                    id_cita: citaEncontrada.cita_id
                } : null,

                tecnico_caso_supa: tecnicoNombreSupa,

                status_integridad: integridad,
                mensaje_integridad: mensajeIntegridad,
                accion_sugerida: accionSugerida,

                finanzas: {
                    total_cotizado: totalCotizadoEstimado,
                    total_pagado: totalCobrado,
                    saldo_pendiente: saldoPendiente,
                    status_pago: saldoPendiente > 0 ? 'DEUDA' : 'AL_CORRIENTE'
                },

                casos: cliente.casos
            };
        });

        res.json({ success: true, total: datosUnificados.length, data: datosUnificados });

    } catch (error) {
        console.error("❌ Error CRITICO en CrmDashboardV2:", error);
        res.status(500).json({ error: error.message });
    }
};