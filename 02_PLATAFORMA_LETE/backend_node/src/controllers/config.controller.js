import { supabaseAdmin } from '../services/supabaseClient.js';

// Helper interno para usar en otros controladores (NO es un endpoint)
export const getFinancialConfigInternal = async () => {
    const { data, error } = await supabaseAdmin
        .from('configuracion_financiera')
        .select('clave, valor');

    if (error || !data) return {};
    // Convierte array [{clave:'A', valor:10}] a objeto { A: 10 }
    return data.reduce((acc, item) => ({ ...acc, [item.clave]: Number(item.valor) }), {});
};

// GET /api/config (Para el Panel Admin)
export const getAllConfig = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('configuracion_financiera')
            .select('*')
            .order('clave');

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/config (Para editar precios desde Admin)
export const updateConfig = async (req, res) => {
    const { clave, valor } = req.body; // Espera { clave: 'PAGO_VISITA_BASE', valor: 250 }

    try {
        const { data, error } = await supabaseAdmin
            .from('configuracion_financiera')
            .update({
                valor: valor,
                updated_at: new Date()
            })
            .eq('clave', clave)
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};