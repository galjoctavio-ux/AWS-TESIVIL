import { Router } from 'express';
import { receiveWebhook } from '../controllers/webhookController';

const router = Router();

// Definimos que cuando llegue una petición POST a la raíz de esta ruta, ejecute el controlador
router.post('/', receiveWebhook);

export default router;
