// backend_node/src/routes/agendaGlobal.routes.js
import { Router } from 'express';
import { obtenerTecnicos, obtenerAgendaGlobal } from '../controllers/agendaGlobal.controller.js';
import { verifyLinkToken } from '../middleware/linkAuth.middleware.js';

const router = Router();

// Aplicamos el cerrojo de seguridad a todas las rutas de este archivo
router.use(verifyLinkToken);

// Rutas finales
router.get('/tecnicos', obtenerTecnicos); // GET /api/global-agenda/tecnicos
router.get('/citas', obtenerAgendaGlobal); // GET /api/global-agenda/citas

export default router;