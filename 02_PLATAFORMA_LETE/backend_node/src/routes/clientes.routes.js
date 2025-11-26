import { Router } from 'express';
import { requireAuth, isAdmin } from '../middleware/auth.middleware.js';
import { buscarCliente, getHistorialCliente } from '../controllers/clientes.controller.js';

const router = Router();

router.get('/buscar', requireAuth, isAdmin, buscarCliente);
router.get('/:id/historial', requireAuth, isAdmin, getHistorialCliente);

export default router;