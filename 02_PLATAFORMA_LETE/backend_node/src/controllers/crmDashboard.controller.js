import pool from '../services/eaDatabase.js';
import { supabaseAdmin as supabase } from '../services/supabaseClient.js';

/**
 * CONTROLADOR MAESTRO DEL DASHBOARD CRM V2
 * Objetivo: Auditoría Visual y Cruce de Verdad (Lectura Pura)
 * Lógica: Cruza Supabase (Negocio) con MariaDB (Agenda) usando JSON ID o Teléfono.
 */
export const getCrmDashboardV2 = async (req, res) => {
    try {
        console.log("🔄 Ejecutando Auditoría CRM V2...");

        // 1. OBTENER DATOS DE SUPABASE (La Verdad del Negocio)
        // Traemos clientes, casos y el perfil del técnico asignado al caso
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
            .limit(10000);

        if (errorSupa) throw new Error(`Error Supabase: ${errorSupa.message}`);

        // 2. OBTENER DATOS DE MARIADB (La Verdad de la Agenda)
        // Traemos citas desde hace 30 días y todo el futuro para asegurar el match
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

            // Preparar IDs de casos para búsqueda rápida en el JSON de la cita
            const clienteCaseIds = cliente.casos?.map(c => String(c.id)) || [];
            // Normalizar teléfono del cliente (solo dígitos, últimos 10)
            const telefonoCliente = (cliente.telefono || '').replace(/\D/g, '').slice(-10);

            // --- LÓGICA DE MATCH (PRIORIDAD JSON) ---
            const citaEncontrada = citasMaria.find(cita => {

                // A. Intentar Match por JSON (Infalible - Prioridad Alta)
                if (cita.notas_estructuradas && clienteCaseIds.length > 0) {
                    try {
                        const notas = JSON.parse(cita.notas_estructuradas);
                        // Si la cita tiene un caso_id que pertenece a este cliente -> ¡ES UN MATCH!
                        if (notas.caso_id && clienteCaseIds.includes(String(notas.caso_id))) {
                            return true;
                        }
                    } catch (e) {
                        // JSON inválido o vacío, continuamos a la siguiente estrategia
                    }
                }

                // B. Intentar Match por Teléfono (Fallback - Prioridad Media)
                // Solo si el teléfono es válido (10 dígitos)
                const telefonoCita = (cita.cliente_telefono || '').replace(/\D/g, '').slice(-10);
                if (telefonoCliente && telefonoCliente.length === 10 && telefonoCita === telefonoCliente) {
                    return true;
                }

                return false;
            });

            // --- LÓGICA DE DIAGNÓSTICO (SEMÁFORO) ---
            let integridad = 'OK';
            let mensajeIntegridad = 'Lead OK';
            let accionSugerida = 'VER_DETALLES';

            const tieneIntencionCita = cliente.crm_intent === 'APPOINTMENT' || cliente.crm_intent === 'QUOTE_FOLLOWUP';
            const tieneCitaReal = !!citaEncontrada;

            if (tieneIntencionCita && !tieneCitaReal) {
                // Caso Crítico: IA dice que debe haber cita, pero no la encontramos en Agenda
                integridad = 'ERROR_GHOST';
                mensajeIntegridad = '🚨 Cita Fantasma';
                accionSugerida = 'REVISAR_MANUAL';
            } else if (!tieneIntencionCita && tieneCitaReal) {
                // Caso Advertencia: Hay cita, pero la IA no la procesó (Agendado por humano directo)
                integridad = 'MANUAL';
                mensajeIntegridad = '⚠️ Agendado Manual';
                accionSugerida = 'VER_DETALLES';
            } else if (tieneIntencionCita && tieneCitaReal) {
                // Caso Ideal: Todo coincide
                integridad = 'OK';
                mensajeIntegridad = 'Sincronizado';
                accionSugerida = 'VER_DETALLES';
            } else if (cliente.crm_status === 'CLIENTE' && !tieneCitaReal) {
                // Cliente recurrente sin actividad actual
                mensajeIntegridad = 'Cliente Inactivo';
                accionSugerida = 'VER_DETALLES';
            }

            // --- DETERMINAR NOMBRE DEL TÉCNICO ---
            let tecnicoNombreFinal = 'Pendiente';

            if (tieneCitaReal) {
                // Si hay cita real, la verdad está en MariaDB (quien va a ir realmente)
                tecnicoNombreFinal = `${citaEncontrada.tecnico_nombre} ${citaEncontrada.tecnico_apellido}`;
            } else if (cliente.casos?.length > 0) {
                // Si no hay cita, buscamos a quién se asignó el último caso en Supabase
                const ultimoCaso = cliente.casos[0]; // Supabase devuelve ordenado si el query lo pide, aquí tomamos el primero del array
                if (ultimoCaso.profiles) {
                    // Supabase puede devolver un objeto o un array dependiendo de la relación (one-to-one vs one-to-many)
                    tecnicoNombreFinal = Array.isArray(ultimoCaso.profiles)
                        ? ultimoCaso.profiles[0]?.nombre
                        : ultimoCaso.profiles.nombre;
                }
            }

            // --- CÁLCULO DE FINANZAS (SOLO LECTURA) ---
            const saldoPendiente = parseFloat(cliente.saldo_pendiente || 0);
            // Sumamos lo cobrado históricamente de todos los casos de este cliente
            const totalCobrado = cliente.casos?.reduce((sum, caso) => sum + (parseFloat(caso.monto_cobrado) || 0), 0) || 0;

            return {
                id: cliente.id,
                nombre_completo: cliente.nombre_completo,
                telefono: cliente.telefono,
                crm_intent: cliente.crm_intent,
                ai_summary: cliente.ai_summary,
                last_interaction: cliente.last_interaction, // Necesario para ordenar por actividad reciente

                cita_real: tieneCitaReal ? {
                    fecha: citaEncontrada.start_datetime,
                    tecnico: `${citaEncontrada.tecnico_nombre} ${citaEncontrada.tecnico_apellido}`,
                    id_cita: citaEncontrada.cita_id
                } : null,

                tecnico_asignado: tecnicoNombreFinal || 'Sin Asignar',

                status_integridad: integridad,
                mensaje_integridad: mensajeIntegridad,
                accion_sugerida: accionSugerida,

                finanzas: {
                    total_cotizado: totalCobrado + saldoPendiente, // Estimado
                    total_pagado: totalCobrado,
                    saldo_pendiente: saldoPendiente,
                    status_pago: saldoPendiente > 0 ? 'DEUDA' : 'AL_CORRIENTE'
                },

                casos: cliente.casos // Se envía para debugging o detalles futuros
            };
        });

        res.json({ success: true, total: datosUnificados.length, data: datosUnificados });

    } catch (error) {
        console.error("❌ Error CRITICO en Dashboard V2:", error);
        res.status(500).json({ error: error.message });
    }
};