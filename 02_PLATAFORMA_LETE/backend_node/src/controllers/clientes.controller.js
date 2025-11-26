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