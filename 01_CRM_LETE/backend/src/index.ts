import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './config/db';
import webhookRoutes from './routes/webhookRoutes';
import conversationRoutes from './routes/conversationRoutes';
// import { initCronJobs } from './services/cronService'; // Ya no se usa la antigua
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
app.use('/webhook', webhookRoutes);
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

app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// --- CORRECCIÓN DEL FRONTEND ---
// Tu carpeta en el árbol se llama 'frontend', no 'crm-luz-frontend'
const frontendPath = path.join(__dirname, '../../frontend/dist');

app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});


// --- TAREAS PROGRAMADAS (CRON JOBS) ---

// MODO PRUEBA: Ejecutar cada minuto para verificar que funciona
// Una vez que veas el log "🌙 [CRON]...", cambia esto de nuevo a '22 9 * * *'
cron.schedule('34 9 * * *', () => {
  console.log('🌙 [CRON TEST] Ejecutando análisis nocturno (PRUEBA)...');
  runNightlyAnalysis();
});

// 2. Ejecutor de Envíos (Cada hora, de 8 AM a 8 PM Hora CDMX)
// 14 UTC = 8 AM MX.  02 UTC = 8 PM MX.
cron.schedule('0 14-23,0-2 * * *', () => {
  console.log('⏰ [CRON] Ejecutando verificador de envíos (Horario Hábil MX)...');
  checkReminders();
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📂 Sirviendo frontend desde: ${frontendPath}`);
});