import { Router } from 'express';
// Agregamos updateConversationStatus a la importación
import { getConversations, getChatHistory, sendManualMessage, updateConversationStatus } from '../controllers/conversationController';


import { getOrCreateByPhone } from '../controllers/conversationController';
const router = Router();

router.get('/', getConversations);
router.get('/:id/messages', getChatHistory);
router.post('/:id/send', sendManualMessage);
router.post('/init', getOrCreateByPhone); // <--- NUEVA RUTA
// NUEVA RUTA: PATCH para actualizar estados parciales
router.patch('/:id/status', updateConversationStatus);

export default router;
