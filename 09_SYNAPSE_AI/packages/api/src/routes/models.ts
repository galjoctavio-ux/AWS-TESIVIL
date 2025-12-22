import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin, AIModel } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const ReviewSchema = z.object({
    modelId: z.string().uuid(),
    starsSpeed: z.number().min(1).max(5),
    starsPrecision: z.number().min(1).max(5),
    starsHallucination: z.number().min(1).max(5),
    useCaseTag: z.enum(['#Código', '#Resumen', '#Análisis', '#Creatividad']).optional(),
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
                // Map frontend categories to database categories
                // Supports both old (coding, vision) and new (code, image) names
                const categoryMap: Record<string, string> = {
                    'chat': 'chat',
                    'code': 'code',
                    'codigo': 'code',
                    'coding': 'code', // legacy
                    'image': 'image',
                    'imagen': 'image',
                    'vision': 'image', // legacy
                    'audio': 'audio',
                };
                const dbCategory = categoryMap[query.category.toLowerCase()] || query.category;
                dbQuery = dbQuery.eq('category', dbCategory);
            }

            // Apply sorting - map common aliases to actual column names
            const sortFieldMap: Record<string, string> = {
                'score': 'score_overall',
                'score_overall': 'score_overall',
                'name': 'name',
                'created_at': 'created_at',
            };
            const requestedSort = query.sort || 'score_overall';
            const sortField = sortFieldMap[requestedSort] || 'score_overall';
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
    // Supports category filter: chat, coding, vision, audio, all
    // ───────────────────────────────────────────────────────────────
    fastify.get('/top', async (request, reply) => {
        try {
            const query = request.query as { category?: string };

            let dbQuery = supabaseAdmin
                .from('ai_models')
                .select('*')
                .order('score_overall', { ascending: false })
                .limit(3);

            // Apply category filter
            if (query.category && query.category !== 'all') {
                // Map frontend categories to database categories
                // Supports both old (coding, vision) and new (code, image) names
                const categoryMap: Record<string, string> = {
                    'chat': 'chat',
                    'code': 'code',
                    'codigo': 'code',
                    'coding': 'code', // legacy
                    'image': 'image',
                    'imagen': 'image',
                    'vision': 'image', // legacy
                    'audio': 'audio',
                };
                const dbCategory = categoryMap[query.category.toLowerCase()] || query.category;
                dbQuery = dbQuery.eq('category', dbCategory);
            }

            const { data: topModels, error } = await dbQuery;

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
                category: query.category || 'all',
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
                .from('ai_reviews')
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
                stats.avgCreativity = reviews.reduce((sum, r) => sum + r.stars_hallucination, 0) / reviews.length;
                stats.avgSpeed = reviews.reduce((sum, r) => sum + r.stars_speed, 0) / reviews.length;
                stats.avgAccuracy = reviews.reduce((sum, r) => sum + r.stars_precision, 0) / reviews.length;

                reviews.forEach((r) => {
                    if (r.use_case_tag) {
                        stats.tagDistribution[r.use_case_tag] = (stats.tagDistribution[r.use_case_tag] || 0) + 1;
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
                .from('ai_reviews')
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
                .from('ai_reviews')
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
                .from('ai_reviews')
                .insert({
                    model_id: id,
                    user_id: userId,
                    stars_speed: data.starsSpeed,
                    stars_precision: data.starsPrecision,
                    stars_hallucination: data.starsHallucination,
                    use_case_tag: data.useCaseTag,
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

    // ───────────────────────────────────────────────────────────────
    // POST /api/reviews/:reviewId/vote - Vote on a review
    // ───────────────────────────────────────────────────────────────
    fastify.post('/reviews/:reviewId/vote', async (request, reply) => {
        try {
            const { reviewId } = request.params as { reviewId: string };
            const userId = (request.headers['x-user-id'] as string) || null;
            const body = request.body as { voteType: 'upvote' | 'downvote' };

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required',
                });
            }

            if (!body.voteType || !['upvote', 'downvote'].includes(body.voteType)) {
                return reply.status(400).send({
                    success: false,
                    error: 'voteType must be "upvote" or "downvote"',
                });
            }

            // Check if review exists
            const { data: review, error: reviewError } = await supabaseAdmin
                .from('ai_reviews')
                .select('id')
                .eq('id', reviewId)
                .single();

            if (reviewError || !review) {
                return reply.status(404).send({
                    success: false,
                    error: 'Review not found',
                });
            }

            // Upsert vote (update if exists, insert if not)
            const { data: vote, error: voteError } = await supabaseAdmin
                .from('ai_votes')
                .upsert(
                    {
                        review_id: reviewId,
                        user_id: userId,
                        vote_type: body.voteType,
                    },
                    { onConflict: 'review_id,user_id' }
                )
                .select()
                .single();

            if (voteError) {
                fastify.log.error(voteError);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to save vote',
                });
            }

            // Get updated vote count
            const { data: counts } = await supabaseAdmin
                .from('ai_votes')
                .select('vote_type')
                .eq('review_id', reviewId);

            const upvotes = counts?.filter(v => v.vote_type === 'upvote').length || 0;
            const downvotes = counts?.filter(v => v.vote_type === 'downvote').length || 0;

            return {
                success: true,
                data: {
                    vote,
                    helpfulCount: upvotes - downvotes,
                },
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to process vote',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // DELETE /api/reviews/:reviewId/vote - Remove vote from review
    // ───────────────────────────────────────────────────────────────
    fastify.delete('/reviews/:reviewId/vote', async (request, reply) => {
        try {
            const { reviewId } = request.params as { reviewId: string };
            const userId = (request.headers['x-user-id'] as string) || null;

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const { error } = await supabaseAdmin
                .from('ai_votes')
                .delete()
                .eq('review_id', reviewId)
                .eq('user_id', userId);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to remove vote',
                });
            }

            return {
                success: true,
                message: 'Vote removed',
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to remove vote',
            });
        }
    });
};

export default modelsRoutes;
