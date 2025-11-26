import { Router } from 'express';
import { requireAuth, isAdmin } from '../middleware/auth.middleware.js';
import { getResumenFinumen, reportarPagoSemanal, aprobarTransaccion } from '../controllers/finanzas.controller.js';

const router = Router();

// Ver estado de cuenta (Tecnico ve el suyo, Admin puede ver cualquiera si implementas logica extra)
router.get('/resumen/:tecnicoId', requireAuth, getResumenFinanciero);

// Tecnico reporta pago
router.post('/reportar-pago', requireAuth, reportarPagoSemanal);

// Admin aprueba
router.put('/aprobar/:id', requireAuth, isAdmin, aprobarTransaccion);

export default router;