import express from 'express';

// 1. Funciones viejas que viven en agenda.controller.js
import { checkAvailability, getAgendaPorDia } from '../controllers/agenda.controller.js';

// 2. Función NUEVA que vive en availability.controller.js (Asegúrate de importar desde el archivo correcto)
import { createRecurringUnavailable } from '../controllers/availability.controller.js';

import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas existentes
router.post('/check-availability', checkAvailability);
router.get('/por-dia', requireAuth, getAgendaPorDia);

// Ruta nueva (Ahora sí encontrará la función)
router.post('/bloquear-recurrente', requireAuth, createRecurringUnavailable);

export default router;