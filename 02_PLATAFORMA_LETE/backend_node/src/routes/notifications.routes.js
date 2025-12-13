// Archivo: routes/notifications.routes.js
import { Router } from 'express';
// Asegúrate que la ruta al controlador sea correcta según tu estructura
import { sendNotificationToEmail, subscribeUser } from '../notifications.controller.js';

const router = Router();

// 1. Endpoint para que el Frontend (PWA) active las notificaciones
router.post('/subscribe', subscribeUser);

// 2. Endpoint "Puente" para que PHP le avise a Node (Internal API)
router.post('/send-by-email', async (req, res) => {
    const { email, payload } = req.body;

    if (!email || !payload) {
        return res.status(400).json({ message: 'Faltan datos (email o payload)' });
    }

    try {
        await sendNotificationToEmail(email, payload);
        res.status(200).json({ success: true, message: 'Notificación procesada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno enviando push' });
    }
});

export default router;