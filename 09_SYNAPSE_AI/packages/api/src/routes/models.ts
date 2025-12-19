import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin, AIModel } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const ReviewSchema = z.object({
    modelId: z.string().uuid(),
    creativity: z.number().min(1).max(5),
    speed: z.number().min(1).max(5),
    accuracy: z.number().min(1).max(5),
    tag: z.enum(['trabajo', 'hobby', 'estudio']).optional(),
    comment: z.string().max(500).optional(),
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

const modelsRoutes: FastifyPluginAsync = async (fastify) => {
    // ───────────────────────────────────────────────────────────────
    // GET /api/models - List models with filters
    // ───────────────────────────────────────────────────────────────
    fastify.get('/', async (request, reply) => {
        try {
            const query = request.query as {
                category?: string;
                limit?: string;
                offset?: string;
                sort?: string;
            };

            let dbQuery = supabaseAdmin
                .from('ai_models')
                .select('*');

            // Apply category filter
            if (query.category && query.category !== 'all') {
                dbQuery = dbQuery.eq('category', query.category);
            }

            // Apply sorting
            const sortField = query.sort || 'score_overall';
            dbQuery = dbQuery.order(sortField, { ascending: false });

            // Apply pagination
            const limit = Math.min(parseInt(query.limit || '20'), 100);
            const offset = parseInt(query.offset || '0');
            dbQuery = dbQuery.range(offset, offset + limit - 1);

            const { data: models, error, count } = await dbQuery;

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to fetch models',
                });
            }

            return {
                success: true,
                data: models,
                pagination: {
                    limit,
                    offset,
                    total: count,
                },
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch models',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/models/top - Get top 3 models (podium)
    // ───────────────────────────────────────────────────────────────
    fastify.get('/top', async (request, reply) => {
        try {
            const { data: topModels, error } = await supabaseAdmin
                .from('ai_models')
                .select('*')
                .order('score_overall', { ascending: false })
                .limit(3);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to fetch top models',
                });
            }

            return {
                success: true,
                data: topModels,
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch top models',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/models/:id - Get single model details
    // ───────────────────────────────────────────────────────────────
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const { data: model, error } = await supabaseAdmin
                .from('ai_models')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !model) {
                return reply.status(404).send({
                    success: false,
                    error: 'Model not found',
                });
            }

            return {
                success: true,
                data: model,
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch model',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/models/:id/stats - Get model statistics
    // ───────────────────────────────────────────────────────────────
    fastify.get('/:id/stats', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            // Get model
            const { data: model, error: modelError } = await supabaseAdmin
                .from('ai_models')
                .select('*')
                .eq('id', id)
                .single();

            if (modelError || !model) {
                return reply.status(404).send({
                    success: false,
                    error: 'Model not found',
                });
            }

            // Get review stats
            const { data: reviews, error: reviewsError } = await supabaseAdmin
                .from('model_reviews')
                .select('*')
                .eq('model_id', id);

            const stats = {
                reviewCount: reviews?.length || 0,
                avgCreativity: 0,
                avgSpeed: 0,
                avgAccuracy: 0,
                tagDistribution: {} as Record<string, number>,
            };

            if (reviews && reviews.length > 0) {
                stats.avgCreativity = reviews.reduce((sum, r) => sum + r.creativity, 0) / reviews.length;
                stats.avgSpeed = reviews.reduce((sum, r) => sum + r.speed, 0) / reviews.length;
                stats.avgAccuracy = reviews.reduce((sum, r) => sum + r.accuracy, 0) / reviews.length;

                reviews.forEach((r) => {
                    if (r.tag) {
                        stats.tagDistribution[r.tag] = (stats.tagDistribution[r.tag] || 0) + 1;
                    }
                });
            }

            return {
                success: true,
                data: stats,
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch model stats',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/models/:id/reviews - Get model reviews
    // ───────────────────────────────────────────────────────────────
    fastify.get('/:id/reviews', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const { data: reviews, error } = await supabaseAdmin
                .from('model_reviews')
                .select(`
                    *,
                    profiles (alias, photo_url)
                `)
                .eq('model_id', id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to fetch reviews',
                });
            }

            return {
                success: true,
                data: reviews,
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch reviews',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/models/:id/reviews - Add a review
    // ───────────────────────────────────────────────────────────────
    fastify.post('/:id/reviews', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const userId = (request.headers['x-user-id'] as string) || null;

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const data = ReviewSchema.parse({ ...request.body as object, modelId: id });

            // Check if user already reviewed this model
            const { data: existing, error: checkError } = await supabaseAdmin
                .from('model_reviews')
                .select('id')
                .eq('model_id', id)
                .eq('user_id', userId)
                .single();

            if (existing) {
                return reply.status(409).send({
                    success: false,
                    error: 'You have already reviewed this model',
                });
            }

            const { data: review, error } = await supabaseAdmin
                .from('model_reviews')
                .insert({
                    model_id: id,
                    user_id: userId,
                    creativity: data.creativity,
                    speed: data.speed,
                    accuracy: data.accuracy,
                    tag: data.tag,
                    comment: data.comment,
                })
                .select()
                .single();

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to save review',
                });
            }

            return {
                success: true,
                data: review,
            };
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return reply.status(400).send({
                    success: false,
                    error: 'Validation error',
                    details: error.errors,
                });
            }

            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to save review',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/models/compare - Compare two models
    // ───────────────────────────────────────────────────────────────
    fastify.get('/compare', async (request, reply) => {
        try {
            const { a, b } = request.query as { a: string; b: string };

            if (!a || !b) {
                return reply.status(400).send({
                    success: false,
                    error: 'Both model IDs (a, b) are required',
                });
            }

            const { data: models, error } = await supabaseAdmin
                .from('ai_models')
                .select('*')
                .in('id', [a, b]);

            if (error || !models || models.length !== 2) {
                return reply.status(404).send({
                    success: false,
                    error: 'One or both models not found',
                });
            }

            const modelA = models.find((m) => m.id === a);
            const modelB = models.find((m) => m.id === b);

            return {
                success: true,
                data: {
                    modelA,
                    modelB,
                    comparison: {
                        overall: (modelA?.score_overall || 0) - (modelB?.score_overall || 0),
                        reasoning: (modelA?.score_reasoning || 0) - (modelB?.score_reasoning || 0),
                        coding: (modelA?.score_coding || 0) - (modelB?.score_coding || 0),
                        creative: (modelA?.score_creative || 0) - (modelB?.score_creative || 0),
                        speed: (modelA?.score_speed || 0) - (modelB?.score_speed || 0),
                    },
                },
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to compare models',
            });
        }
    });
};

export default modelsRoutes;
