// Load environment variables FIRST (before any other imports)
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import * as Sentry from '@sentry/node';

// Initialize Sentry for API
// TODO: Replace with your actual Sentry DSN
Sentry.init({
    dsn: "https://93e60bfec53b9c08f44f0eecc3d9a20d@o4510577429250048.ingest.us.sentry.io/4510577468506112",
    tracesSampleRate: 1.0,
});

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

// Routes
import healthRoutes from './routes/health';
import promptsRoutes from './routes/prompts';
import modelsRoutes from './routes/models';
import newsRoutes from './routes/news';
import projectsRoutes from './routes/projects';
import adminRoutes from './routes/admin';
import academyRoutes from './routes/academy';


// Cron Jobs
import { initCronJobs } from './jobs';

const fastify = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || 'info',
    },
});

// Plugins
fastify.register(cors, {
    origin: true,
});

fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
});

// Sentry Error Handler
fastify.setErrorHandler((error, request, reply) => {
    Sentry.captureException(error);
    fastify.log.error(error);
    reply.status(500).send({ ok: false, message: 'Internal Server Error' });
});

// Routes
fastify.register(promptsRoutes, { prefix: '/api/prompts' });
fastify.register(modelsRoutes, { prefix: '/api/models' });
fastify.register(newsRoutes, { prefix: '/api/news' });
fastify.register(projectsRoutes, { prefix: '/api/projects' });
fastify.register(adminRoutes, { prefix: '/api/admin' });
fastify.register(academyRoutes, { prefix: '/api/academy' });

// Health check
fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
    try {
        const port = parseInt(process.env.API_PORT || '3000');
        await fastify.listen({ port, host: '0.0.0.0' });

        // Initialize cron jobs
        initCronJobs();

        console.log(`🚀 SYNAPSE_AI API running on port ${port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();

export default fastify;
