// backend_node/src/controllers/agendaGlobal.controller.js
import pool from '../services/eaDatabase.js';
import dayjs from 'dayjs';
import { supabaseAdmin } from '../services/supabaseClient.js';

// ... (la función obtenerTecnicos la dejas igual) ...
export const obtenerTecnicos = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const sql = `SELECT id, first_name, last_name FROM ea_users WHERE id_roles = 2 ORDER BY first_name ASC`;
        const [rows] = await connection.execute(sql);
        connection.release();
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener técnicos' });
    }
};

export const obtenerAgendaGlobal = async (req, res) => {
    const { fecha } = req.query;

    if (!fecha) return res.status(400).json({ error: 'Fecha requerida' });

    try {
        const connection = await pool.getConnection();
        const startOfDay = `${fecha} 00:00:00`;
        const endOfDay = `${fecha} 23:59:59`;

        // 1. MariaDB
        const sql = `
      SELECT 
        a.id, a.start_datetime, a.end_datetime, a.id_users_provider, a.is_unavailable, 
        a.notas_estructuradas, a.notes,
        prov.first_name as tecnico_nombre,
        cust.first_name as ea_cliente_nombre,
        cust.last_name as ea_cliente_apellido,
        cust.mobile_number as ea_cliente_celular,
        cust.phone_number as ea_cliente_telefono,
        cust.address as ea_cliente_direccion
      FROM ea_appointments a
      JOIN ea_users prov ON a.id_users_provider = prov.id
      LEFT JOIN ea_users cust ON a.id_users_customer = cust.id
      WHERE a.start_datetime >= ? AND a.start_datetime <= ?
        AND prov.id_roles = 2
      ORDER BY a.start_datetime ASC
    `;

        const [rows] = await connection.execute(sql, [startOfDay, endOfDay]);
        connection.release();

        // 2. Extraer IDs
        const citas = rows.map(cita => {
            let casoId = null;
            if (cita.notas_estructuradas) {
                try {
                    const structured = JSON.parse(cita.notas_estructuradas);
                    if (structured.caso_id) casoId = structured.caso_id;
                } catch (e) { }
            }
            return { ...cita, caso_id: casoId };
        });

        const casoIds = citas.map(c => c.caso_id).filter(id => id !== null);
        let casosMap = new Map();

        // 3. Supabase (CORREGIDO: Pedimos 'telefono')
        if (casoIds.length > 0) {
            const { data: casosData, error } = await supabaseAdmin
                .from('casos')
                .select(`
          id, tipo_servicio,
          cliente:clientes (nombre_completo, telefono, direccion_principal, google_maps_link)
        `)
                .in('id', casoIds);

            if (!error && casosData) {
                casosMap = new Map(casosData.map(c => [c.id, c]));
            } else if (error) {
                console.error('Error Supabase:', error);
            }
        }

        // 4. Fusionar
        const agenda = citas.map(cita => {
            const caso = casosMap.get(cita.caso_id);

            let titulo = cita.is_unavailable ? 'BLOQUEO / SIN DATOS' : 'OCUPADO';
            let nombreCliente = '';
            let celular = '';
            let direccion = '';
            let mapsLink = '';
            let tipoServicio = '';

            // Prioridad 2: EasyAppointments
            if (cita.ea_cliente_nombre) {
                nombreCliente = `${cita.ea_cliente_nombre} ${cita.ea_cliente_apellido || ''}`.trim();
                celular = cita.ea_cliente_celular || cita.ea_cliente_telefono || '';
                direccion = cita.ea_cliente_direccion || '';
                titulo = nombreCliente;
            }

            // Prioridad 1: Supabase
            if (caso && caso.cliente) {
                nombreCliente = caso.cliente.nombre_completo || nombreCliente;
                // CORRECCIÓN: Asignamos 'telefono' de Supabase a nuestra variable 'celular'
                celular = caso.cliente.telefono || celular;
                direccion = caso.cliente.direccion_principal || direccion;
                mapsLink = caso.cliente.google_maps_link || '';
                titulo = nombreCliente;
                tipoServicio = caso.tipo_servicio;
            }

            if (cita.is_unavailable && !nombreCliente) {
                titulo = 'BLOQUEO / DESCANSO';
            }

            return {
                id: cita.id,
                resourceId: cita.id_users_provider,
                title: titulo,
                start: dayjs(cita.start_datetime).format('YYYY-MM-DD HH:mm:ss'),
                end: dayjs(cita.end_datetime).format('YYYY-MM-DD HH:mm:ss'),
                type: cita.is_unavailable ? 'blocked' : 'appointment',
                tecnico: cita.tecnico_nombre,
                details: {
                    cliente: nombreCliente,
                    celular: celular, // Aquí va el dato corregido
                    direccion: direccion,
                    mapsLink: mapsLink,
                    tipoServicio: tipoServicio,
                    notas: cita.notes || ''
                }
            };
        });

        res.json(agenda);
    } catch (error) {
        console.error('Error agenda:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};