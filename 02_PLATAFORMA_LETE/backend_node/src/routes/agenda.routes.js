import express from 'express';

// 1. Controladores de Agenda (Lógica de horarios)
import { checkAvailability, getAgendaPorDia } from '../controllers/agenda.controller.js';

// 2. Controlador de Disponibilidad (Lógica de bloqueos recurrentes)
import { createRecurringUnavailable } from '../controllers/availability.controller.js';

// 3. Controlador de Notificaciones (Suscripciones y Envíos)
import { subscribeUser, sendTestNotification, sendAdminNotification } from '../controllers/notifications.controller.js';

// Middleware de Autenticación
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- RUTAS DE CONSULTA ---
router.post('/check-availability', checkAvailability);
router.get('/por-dia', requireAuth, getAgendaPorDia);

// --- RUTAS DE BLOQUEO DE TIEMPO ---
router.post('/bloquear-recurrente', requireAuth, createRecurringUnavailable);

// --- RUTAS DE NOTIFICACIONES PUSH ---
router.post('/subscribe', requireAuth, subscribeUser); // Registrar dispositivo
router.post('/test-notification', requireAuth, sendTestNotification); // Auto-prueba (Técnico se prueba a sí mismo)
router.post('/admin-test-notification', requireAuth, sendAdminNotification); // Admin prueba a un Técnico específico

export default router;