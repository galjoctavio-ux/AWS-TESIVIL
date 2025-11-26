import { supabaseAdmin } from '../services/supabaseClient.js';

// GET /api/finanzas/resumen/:tecnicoId
export const getResumenFinanciero = async (req, res) => {
    const { tecnicoId } = req.params;

    try {
        // Obtenemos transacciones APROBADAS o PENDIENTES
        const { data, error } = await supabaseAdmin
            .from('billetera_transacciones')
            .select('*')
            .eq('tecnico_id', tecnicoId)
            .neq('estado', 'RECHAZADO')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calcular saldo en Javascript
        const saldoTotal = data.reduce((acc, curr) => acc + Number(curr.monto), 0);

        res.json({
            saldo_actual: saldoTotal,
            historial: data
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /api/finanzas/reportar-pago
// El técnico sube foto de su depósito
export const reportarPagoSemanal = async (req, res) => {
    const { tecnicoId, monto, comprobanteUrl } = req.body;

    try {
        const { data, error } = await supabaseAdmin
            .from('billetera_transacciones')
            .insert({
                tecnico_id: tecnicoId,
                tipo: 'PAGO_SEMANAL',
                monto: Number(monto), // Positivo porque está "pagando" su deuda
                descripcion: 'Depósito semanal reportado',
                comprobante_url: comprobanteUrl,
                estado: 'EN_REVISION' // Importante: Requiere aprobación Admin
            });

        if (error) throw error;
        res.json({ success: true, message: 'Pago reportado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/finanzas/aprobar-transaccion/:id (ADMIN ONLY)
export const aprobarTransaccion = async (req, res) => {
    const { id } = req.params;
    const { accion } = req.body; // 'APROBAR' o 'RECHAZAR'

    try {
        const nuevoEstado = accion === 'APROBAR' ? 'APROBADO' : 'RECHAZADO';

        const { error } = await supabaseAdmin
            .from('billetera_transacciones')
            .update({
                estado: nuevoEstado,
                fecha_aprobacion: new Date()
            })
            .eq('id', id);

        if (error) throw error;
        res.json({ success: true, estado: nuevoEstado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};