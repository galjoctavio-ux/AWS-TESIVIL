import { supabaseAdmin } from '../services/supabaseClient.js';

// GET /api/clientes/buscar?telefono=33123...
export const buscarCliente = async (req, res) => {
    const { telefono } = req.query;

    if (!telefono || telefono.length < 4) {
        return res.status(400).json({ error: 'Proporciona al menos 4 dígitos' });
    }

    const cleanPhone = telefono.replace(/\D/g, '');

    try {
        // Búsqueda parcial (LIKE)
        const { data, error } = await supabaseAdmin
            .from('clientes')
            .select('*')
            .ilike('telefono', `%${cleanPhone}%`)
            .limit(5);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/clientes/:id/historial
export const getHistorialCliente = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabaseAdmin
            .from('casos')
            .select(`
        id, fecha_creacion, status, tipo_servicio, monto_cobrado,
        tecnico:profiles(nombre)
      `)
            .eq('cliente_id', id)
            .order('fecha_creacion', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// GET /api/clientes/admin-dashboard
export const getAdminDashboard = async (req, res) => {
    try {
        // Consultamos la vista maestra que creamos en Supabase
        const { data, error } = await supabaseAdmin
            .from('admin_crm_dashboard') // <--- La vista SQL del Paso 5
            .select('*');

        if (error) throw error;

        // Devolvemos los datos tal cual
        res.json(data);
    } catch (error) {
        console.error('Error fetching admin dashboard:', error);
        res.status(500).json({ error: error.message });
    }
};

// PATCH /api/clientes/:id/force-analyze
// Para el botón "Analizar Ahora" que pondremos en el frontend
import { runNightlyAnalysis } from '../services/cronAnalysis.js'; // Asegúrate de importar esto

export const forceAnalyzeClient = async (req, res) => {
    const { id } = req.params;
    try {
        // En un futuro podríamos hacer que runNightlyAnalysis acepte un ID específico
        // Por ahora, forzamos un análisis general que incluirá a este cliente si tiene msjs nuevos
        // Ojo: Esto es síncrono y puede tardar. Idealmente debería ser un job.

        // Versión simple: Solo marcamos last_interaction para que el cron lo detecte
        await supabaseAdmin
            .from('clientes')
            .update({ last_interaction: new Date() }) // "Despertamos" al cliente
            .eq('id', id);

        res.json({ message: 'Cliente marcado para análisis inmediato.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};