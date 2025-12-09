// backend_node/src/controllers/agendaGlobal.controller.js
import pool from '../services/eaDatabase.js';
import dayjs from 'dayjs';

// Obtener lista de Técnicos (Rol 2 = Provider)
export const obtenerTecnicos = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const sql = `
      SELECT id, first_name, last_name, email, mobile_number
      FROM ea_users 
      WHERE id_roles = 2 
      ORDER BY first_name ASC
    `;
        const [rows] = await connection.execute(sql);
        connection.release();
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener técnicos' });
    }
};

// Obtener Citas para la vista de columnas
export const obtenerAgendaGlobal = async (req, res) => {
    const { fecha } = req.query; // Formato esperado: YYYY-MM-DD

    if (!fecha) return res.status(400).json({ error: 'Fecha requerida' });

    try {
        const connection = await pool.getConnection();
        const startOfDay = `${fecha} 00:00:00`;
        const endOfDay = `${fecha} 23:59:59`;

        // Traemos citas del rango + nombre del técnico en una sola query
        const sql = `
      SELECT 
        a.id, a.start_datetime, a.end_datetime, a.id_users_provider, a.is_unavailable,
        u.first_name
      FROM ea_appointments a
      JOIN ea_users u ON a.id_users_provider = u.id
      WHERE a.start_datetime >= ? AND a.start_datetime <= ?
        AND u.id_roles = 2
      ORDER BY a.start_datetime ASC
    `;

        const [rows] = await connection.execute(sql, [startOfDay, endOfDay]);
        connection.release();

        // Formateo simple para el frontend
        const agenda = rows.map(cita => ({
            id: cita.id,
            resourceId: cita.id_users_provider,
            title: cita.is_unavailable ? 'NO DISPONIBLE' : 'OCUPADO',
            start: dayjs(cita.start_datetime).format('YYYY-MM-DD HH:mm:ss'),
            end: dayjs(cita.end_datetime).format('YYYY-MM-DD HH:mm:ss'),
            type: cita.is_unavailable ? 'blocked' : 'appointment',
            tecnico: cita.first_name
        }));

        res.json(agenda);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno' });
    }
};