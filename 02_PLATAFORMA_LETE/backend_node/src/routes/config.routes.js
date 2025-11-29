import { Router } from 'express';
import { requireAuth, isAdmin } from '../middleware/auth.middleware.js';
import { getAllConfig, updateConfig } from '../controllers/config.controller.js';

const router = Router();

// Solo el admin puede ver y editar configuraciones financieras
router.get('/', requireAuth, isAdmin, getAllConfig);
router.put('/', requireAuth, isAdmin, updateConfig);

export default router;