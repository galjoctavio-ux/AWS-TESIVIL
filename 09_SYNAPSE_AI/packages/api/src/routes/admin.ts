import { FastifyPluginAsync } from 'fastify';
import { syncModels } from '../jobs/sync-models';
import { syncBenchmarks } from '../jobs/sync-benchmarks';
import { aggregateNews } from '../jobs/news-aggregator';

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES - Manual triggers for sync jobs
// ═══════════════════════════════════════════════════════════════

const adminRoutes: FastifyPluginAsync = async (fastify) => {
    // ───────────────────────────────────────────────────────────────
    // POST /api/admin/sync/models - Trigger AI models sync
    // ───────────────────────────────────────────────────────────────
    fastify.post('/sync/models', async (request, reply) => {
        try {
            fastify.log.info('📊 Manual model sync triggered...');
            const count = await syncModels();
            return {
                success: true,
                message: `Synced ${count} AI models from OpenRouter`,
                count,
            };
        } catch (error: any) {
            fastify.log.error('Model sync failed:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || 'Model sync failed',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/admin/sync/benchmarks - Trigger benchmarks sync
    // ───────────────────────────────────────────────────────────────
    fastify.post('/sync/benchmarks', async (request, reply) => {
        try {
            fastify.log.info('📈 Manual benchmark sync triggered...');
            const count = await syncBenchmarks();
            return {
                success: true,
                message: `Synced ${count} benchmark entries`,
                count,
            };
        } catch (error: any) {
            fastify.log.error('Benchmark sync failed:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || 'Benchmark sync failed',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/admin/sync/news - Trigger news aggregation
    // ───────────────────────────────────────────────────────────────
    fastify.post('/sync/news', async (request, reply) => {
        try {
            fastify.log.info('📰 Manual news aggregation triggered...');
            const count = await aggregateNews();
            return {
                success: true,
                message: `Aggregated ${count} new articles`,
                count,
            };
        } catch (error: any) {
            fastify.log.error('News aggregation failed:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || 'News aggregation failed',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/admin/sync/all - Trigger all sync jobs
    // ───────────────────────────────────────────────────────────────
    fastify.post('/sync/all', async (request, reply) => {
        try {
            fastify.log.info('🔄 Running all sync jobs...');

            const results = {
                models: 0,
                benchmarks: 0,
                news: 0,
            };

            // Run models sync
            try {
                results.models = await syncModels();
                fastify.log.info(`✅ Models: ${results.models}`);
            } catch (e: any) {
                fastify.log.error('Models sync failed:', e.message);
            }

            // Run benchmarks sync
            try {
                results.benchmarks = await syncBenchmarks();
                fastify.log.info(`✅ Benchmarks: ${results.benchmarks}`);
            } catch (e: any) {
                fastify.log.error('Benchmarks sync failed:', e.message);
            }

            // Run news aggregation
            try {
                results.news = await aggregateNews();
                fastify.log.info(`✅ News: ${results.news}`);
            } catch (e: any) {
                fastify.log.error('News aggregation failed:', e.message);
            }

            return {
                success: true,
                message: 'All sync jobs completed',
                results,
            };
        } catch (error: any) {
            fastify.log.error('Sync all failed:', error);
            return reply.status(500).send({
                success: false,
                error: error.message || 'Sync failed',
            });
        }
    });
};

export default adminRoutes;
