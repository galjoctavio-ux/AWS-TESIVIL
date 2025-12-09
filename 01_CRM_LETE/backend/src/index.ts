import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './config/db';
import webhookRoutes from './routes/webhookRoutes';
import conversationRoutes from './routes/conversationRoutes';
import { initCronJobs } from './services/cronService';
import { requireAuth } from './middleware/security';
import cron from 'node-cron';
import { runNightlyAnalysis } from './services/cronAnalysis';
import { checkReminders } from './services/cronReminders';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-app-key']
}));

app.use(express.json());

// --- RUTAS DE API ---
// 1. Webhook (sin autenticación)
app.use('/api/webhook', webhookRoutes);
app.use('/webhook', webhookRoutes);

// 2. Conversaciones (CON autenticación)
app.use('/api/conversations', requireAuth, conversationRoutes);
app.use('/conversations', requireAuth, conversationRoutes);

// 3. Health Check
app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'OK', server_time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error });
  }
});

// --- 404 PARA API (DEBE IR DESPUÉS DE LAS RUTAS API, ANTES DEL FRONTEND) ---
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// --- FRONTEND (DEBE IR AL FINAL) ---
app.use(express.static(path.join(__dirname, '../../crm-luz-frontend/dist')));

// Frontend catch-all (SIEMPRE AL FINAL)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../crm-luz-frontend/dist/index.html'));
});

// Iniciar cron
//initCronJobs();

// --- TAREAS PROGRAMADAS (CRON JOBS) ---

// 1. Análisis Nocturno de Chats (2:00 AM Hora CDMX)
// Busca citas en chats recientes y guarda la fecha si la encuentra.
cron.schedule('0 2 * * *', () => {
  console.log('🌙 [CRON] Ejecutando análisis nocturno de citas...');
  runNightlyAnalysis();
}, {
  timezone: "America/Mexico_City"
});

// 2. Ejecutor de Envíos (Cada hora, de 8 AM a 8 PM Hora CDMX)
// Verifica citas, recordatorios y seguimientos programados.
cron.schedule('0 8-20 * * *', () => {
  console.log('⏰ [CRON] Ejecutando verificador de envíos (Horario Hábil)...');
  checkReminders();
}, {
  timezone: "America/Mexico_City"
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
