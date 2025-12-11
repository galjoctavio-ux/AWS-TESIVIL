import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './config/db';
import webhookRoutes from './routes/webhookRoutes';
import conversationRoutes from './routes/conversationRoutes';
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
app.use('/api/webhook', webhookRoutes);
app.use('/webhook', webhookRoutes); // Alias por si acaso
app.use('/api/conversations', requireAuth, conversationRoutes);
app.use('/conversations', requireAuth, conversationRoutes); // Alias

// 3. Health Check (Verifica DB y Hora)
app.get('/health', async (req, res) => {
  try {
    // Consultamos la hora de la BD para asegurar que la conexión está viva
    const result = await pool.query("SELECT NOW()::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'America/Mexico_City' as mx_time");
    res.json({
      status: 'OK',
      server_uptime: process.uptime(),
      mx_time_db: result.rows[0].mx_time
    });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', error: error });
  }
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// --- SERVIR FRONTEND ---
// Ruta relativa desde: backend/src (o dist) -> backend -> root -> frontend -> dist
const frontendPath = path.join(__dirname, '../../frontend/dist');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


// ==========================================
// 🕛 TAREAS PROGRAMADAS (CRON JOBS)
// ==========================================
// NOTA: El servidor está en UTC. México es UTC-6.

// 1. ANÁLISIS NOCTURNO (IA + Base de Datos)
// Hora deseada: 03:30 AM Hora México (Madrugada, carga baja)
// Conversión: 03:30 MX + 6h = 09:30 UTC
cron.schedule('30 9 * * *', () => {
  console.log('🌙 [CRON] Ejecutando análisis nocturno (03:30 AM MX)...');
  runNightlyAnalysis();
});

/* PARA PROBAR AHORITA MISMO (Descomenta y ajusta los minutos a UTC actual + 2 min)
   Ej: Si son las 7:40 PM MX -> 1:40 AM UTC. Pon '42 1 * * *'
*/
// cron.schedule('42 1 * * *', () => {
//   console.log('🧪 [TEST CRON] Ejecutando prueba inmediata...');
//   runNightlyAnalysis();
// });


// 2. ENVÍO DE RECORDATORIOS Y SEGUIMIENTOS
// Frecuencia: Cada hora en punto.
// Horario deseado: 8:00 AM a 8:00 PM (Hora México)
// Conversión: 
// - 8 AM MX = 14:00 UTC
// - 8 PM MX = 02:00 UTC (del día siguiente)
// Rango UTC: 14,15,16,17,18,19,20,21,22,23,00,01,02
cron.schedule('0 14-23,0-2 * * *', () => {
  console.log('⏰ [CRON] Ejecutando verificador de envíos (Horario Hábil MX)...');
  checkReminders();
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Zona Horaria Node detectada: ${new Date().toString()}`);
  console.log(`📂 Sirviendo frontend desde: ${frontendPath}`);
});