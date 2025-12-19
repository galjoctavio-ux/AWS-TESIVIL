import { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.get('/', async () => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '0.1.0',
            service: 'synapse-api',
        };
    });

    fastify.get('/ready', async () => {
        // Check if all dependencies are ready
        const checks = {
            database: true, // TODO: Check Supabase connection
            groq: !!process.env.GROQ_API_KEY,
            gemini: !!process.env.GEMINI_API_KEY,
        };

        const allReady = Object.values(checks).every(Boolean);

        return {
            ready: allReady,
            checks,
            timestamp: new Date().toISOString(),
        };
    });
};

export default healthRoutes;
