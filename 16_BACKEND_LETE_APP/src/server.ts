import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';

// Importamos tus módulos existentes
import { receiveWebhook } from './webhookController';
import { analyzeAllChats } from './analyze_chats';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// --- RUTAS ---

// 1. Ruta Webhook (Donde Evolution enviará los datos)
app.post('/webhook', receiveWebhook);

// 2. Health Check (Para ver si el server vive)
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// --- CRON JOBS ---

// Ejecutar análisis todos los días a las 3:30 AM hora de México
// Nota: El servidor suele estar en UTC. 
// 3:30 AM MX = 9:30 AM UTC
cron.schedule('30 9 * * *', async () => {
    console.log('🌙 [CRON] Ejecutando análisis nocturno...');
    await analyzeAllChats();
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`🚀 SERVIDOR LISTO EN PUERTO: ${PORT}`);
    console.log(`📡 URL Webhook: http://TU_IP:${PORT}/webhook`);
    console.log(`📅 Cron Job de Análisis programado (09:30 UTC)`);
    console.log('='.repeat(50));
});