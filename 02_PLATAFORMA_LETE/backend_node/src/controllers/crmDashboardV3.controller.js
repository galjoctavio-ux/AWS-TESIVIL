import pool from '../services/eaDatabase.js';
import { supabaseAdmin as supabase } from '../services/supabaseClient.js';

/**
 * CONTROLADOR DASHBOARD CRM V3 (Lista + Predicción)
 * * Objetivo: Auditoría rápida en formato lista.
 * Novedad: Predice qué hará el Cron de Whatsapp con cada cliente.
 */

// Helper: Replica la lógica exacta de tus Crons para "predecir" el futuro
const getCronStatus = (cliente) => {
    // Si no hay fechas clave, no hay automatización
    if (!cliente.appointment_date && !cliente.next_follow_up_date) {
        return { tipo: 'NADA', mensaje: '-', color: 'gray' };
    }

    const now = new Date();
    // Ajuste visual a Zona Horaria México (UTC-6 aprox) para cálculo de días
    const mxNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
    
    // --- 1. PREDICCIÓN DE RECORDATORIOS DE CITA (Prioridad Alta) ---
    if (cliente.appointment_date && cliente.appointment_status !== 'COMPLETADO' && cliente.appointment_status !== 'CANCELADO') {
        const citaDate = new Date(cliente.appointment_date);
        
        // Calcular diferencia en días naturales (ignorando horas)
        const diffTime = citaDate.setHours(0,0,0,0) - mxNow.setHours(0,0,0,0);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        // Lógica espejo de cronReminders.ts
        if (diffDays === 1 && cliente.appointment_status === 'PENDIENTE') {
            return { tipo: 'AUTO_REMINDER', mensaje: '📅 Mañana: Recordatorio Cita', color: 'orange', fecha: cliente.appointment_date };
        }
        if (diffDays === 0 && ['PENDIENTE', 'REMINDED_TOMORROW'].includes(cliente.appointment_status)) {
            return { tipo: 'AUTO_REMINDER', mensaje: '🚨 HOY: Recordatorio Visita', color: 'red', fecha: cliente.appointment_date };
        }
    }

    // --- 2. PREDICCIÓN DE SEGUIMIENTOS (Follow Ups) ---
    if (cliente.next_follow_up_date && cliente.crm_intent && !['NONE', 'AWAITING_REPLY', 'COMPLETED'].includes(cliente.crm_intent)) {
        const followUpDate = new Date(cliente.next_follow_up_date);
        const isOverdue = followUpDate <= new Date(); // Ya pasó la hora programada

        // Etiquetas amigables
        let intentLabel = cliente.crm_intent;
        if (intentLabel === 'NO_REPLY') intentLabel = 'Recuperación (No contestó)';
        if (intentLabel === 'QUOTE_FOLLOWUP') intentLabel = 'Seguimiento Cotización';
        if (intentLabel === 'FUTURE_CONTACT') intentLabel = 'Contacto Futuro Programado';

        if (isOverdue) {
            // El cron lo enviará en su próxima ejecución (cada hora)
            return { tipo: 'AUTO_MSG', mensaje: `⚡ En cola de envío: ${intentLabel}`, color: 'blue', fecha: cliente.next_follow_up_date };
        } else {
            // Está programado para el futuro
            return { tipo: 'AUTO_MSG_FUTURE', mensaje: `⏳ Programado: ${intentLabel}`, color: 'green', fecha: cliente.next_follow_up_date };
        }
    }

    return { tipo: 'NADA', mensaje: '-', color: 'gray' };
};

export const getCrmDashboardV3 = async (req, res) => {
    try {
        console.log("🔄 [V3] Ejecutando Auditoría + Predicción Cron...");

        // 1. OBTENER SUPABASE (La Verdad del Negocio)
        // Traemos solo columnas necesarias para la Lista V3
        const { data: clientesSupa, error: errorSupa } = await supabase
            .from('clientes')
            .select(`
                id, nombre_completo, telefono, crm_intent, crm_status, 
                saldo_pendiente, last_interaction, ai_summary,
                appointment_date, appointment_status, next_follow_up_date,
                casos (
                    id, status, monto_cobrado, created_at, tecnico_id,
                    profiles!casos_tecnico_id_fkey ( nombre )
                )
            `)
            .not('crm_status', 'in', '("CLOSED","BLOCKED")') 
            .order('last_interaction', { ascending: false })
            .limit(300); // Límite inicial aumentado para ver panorama completo

        if (errorSupa) throw new Error(`Supabase Error: ${errorSupa.message}`);

        // 2. OBTENER MARIADB (La Verdad de la Agenda)
        // Consultamos citas recientes para cruzar información
        const queryMaria = `
            SELECT 
                a.id AS cita_id, a.start_datetime, a.notas_estructuradas, 
                c.mobile_number AS cliente_telefono,
                p.first_name AS tecnico_nombre
            FROM ea_appointments a
            LEFT JOIN ea_users c ON a.id_users_customer = c.id
            LEFT JOIN ea_users p ON a.id_users_provider = p.id
            WHERE a.start_datetime >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
        `;
        const [citasMaria] = await pool.execute(queryMaria);

        // 3. EL GRAN CRUCE + PREDICCIÓN
        const dataV3 = clientesSupa.map(cliente => {
            const telefonoCliente = (cliente.telefono || '').replace(/\D/g, '').slice(-10);
            
            // --- Match Simplificado V3 (Prioridad JSON) ---
            let citaReal = null;
            const clienteCaseIds = cliente.casos?.map(c => String(c.id)) || [];

            // A. Buscar Match Estricto (JSON Link)
            citaReal = citasMaria.find(cita => {
                if (!cita.notas_estructuradas) return false;
                try {
                    const notas = JSON.parse(cita.notas_estructuradas);
                    return notas.caso_id && clienteCaseIds.includes(String(notas.caso_id));
                } catch { return false; }
            });

            // B. Buscar Match Flexible (Teléfono) si falló el estricto
            if (!citaReal) {
                citaReal = citasMaria.find(cita => {
                    const tCita = (cita.cliente_telefono || '').replace(/\D/g, '').slice(-10);
                    return tCita === telefonoCliente;
                });
            }

            // --- Semáforo de Integridad ---
            // GHOST: IA dice cita, Agenda dice nada.
            // MANUAL: Agenda dice cita, IA no está enterada (crm_intent != APPOINTMENT).
            let integridad = 'OK';
            const tieneIntencionCita = cliente.crm_intent === 'APPOINTMENT';
            
            if (tieneIntencionCita && !citaReal) integridad = 'GHOST';
            if (!tieneIntencionCita && citaReal) integridad = 'MANUAL';

            // --- PREDICCIÓN DE CRON (LO NUEVO) ---
            const nextAction = getCronStatus(cliente);

            return {
                id: cliente.id,
                nombre: cliente.nombre_completo,
                telefono: cliente.telefono,
                
                // Semáforos e Indicadores
                status_integridad: integridad, 
                crm_status: cliente.crm_status,
                
                // La "Bola de Cristal" del Cron
                next_action: nextAction,
                
                // Finanzas
                saldo_pendiente: parseFloat(cliente.saldo_pendiente || 0),
                
                // Contexto (Se usará en el Panel Lateral)
                ai_summary: cliente.ai_summary,
                last_interaction: cliente.last_interaction,
                
                // Info Técnica Cruzada
                tecnico: citaReal ? citaReal.tecnico_nombre : (cliente.casos?.[0]?.profiles?.nombre || 'Sin Asignar'),
                fecha_cita_real: citaReal ? citaReal.start_datetime : null
            };
        });

        res.json({ success: true, count: dataV3.length, data: dataV3 });

    } catch (error) {
        console.error("❌ Error CRITICO en V3:", error);
        res.status(500).json({ error: error.message });
    }
};