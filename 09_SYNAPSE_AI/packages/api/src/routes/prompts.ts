import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { enrichPrompt, assemblePrompt } from '../services/groq';
import { supabaseAdmin, PromptHistory } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const RefineSchema = z.object({
    rawInput: z.string().min(3).max(500),
});

const GenerateSchema = z.object({
    description: z.string().min(3).max(500),
    style: z.enum([
        'fotorealismo',
        'anime',
        '3d_pixar',
        'cyberpunk',
        'oleo',
        'arte_digital',
        'minimalista',
        'acuarela',
    ]),
    lighting: z.string().optional().default('natural'),
    lensOrTechnique: z.string().optional(),
    aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:2']).default('1:1'),
    targetEngine: z.enum(['midjourney', 'dalle', 'stable_diffusion', 'flux']).default('midjourney'),
});

const SaveSchema = z.object({
    rawInput: z.string(),
    enrichedInput: z.string().optional(),
    style: z.string(),
    params: z.record(z.any()),
    outputPrompt: z.string(),
    outputNegativePrompt: z.string().optional(),
    targetEngine: z.string(),
    executionTimeMs: z.number().optional(),
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

const promptsRoutes: FastifyPluginAsync = async (fastify) => {
    // ───────────────────────────────────────────────────────────────
    // POST /api/prompts/refine - Layer A: Enrich raw input
    // ───────────────────────────────────────────────────────────────
    fastify.post('/refine', async (request, reply) => {
        try {
            const { rawInput } = RefineSchema.parse(request.body);
            const startTime = Date.now();

            const enrichedPrompt = await enrichPrompt(rawInput);

            return {
                success: true,
                data: {
                    original: rawInput,
                    enriched: enrichedPrompt,
                    executionTimeMs: Date.now() - startTime,
                },
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
                error: 'Failed to refine prompt',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/prompts/generate - Layer B: Assemble final prompt
    // ───────────────────────────────────────────────────────────────
    fastify.post('/generate', async (request, reply) => {
        try {
            const config = GenerateSchema.parse(request.body);
            const startTime = Date.now();

            const result = await assemblePrompt(config.description, {
                style: config.style,
                lighting: config.lighting || 'natural',
                lensOrTechnique: config.lensOrTechnique || '',
                aspectRatio: config.aspectRatio,
                targetEngine: config.targetEngine,
            });

            return {
                success: true,
                data: {
                    prompt: result.prompt,
                    negativePrompt: result.negativePrompt,
                    config,
                    executionTimeMs: Date.now() - startTime,
                },
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
                error: 'Failed to generate prompt',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/prompts/save - Save prompt to history
    // ───────────────────────────────────────────────────────────────
    fastify.post('/save', async (request, reply) => {
        try {
            // TODO: Get user_id from auth token
            const userId = (request.headers['x-user-id'] as string) || null;
            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const data = SaveSchema.parse(request.body);

            const { data: saved, error } = await supabaseAdmin
                .from('prompt_history')
                .insert({
                    user_id: userId,
                    raw_input: data.rawInput,
                    enriched_input: data.enrichedInput,
                    style: data.style,
                    params: data.params,
                    output_prompt: data.outputPrompt,
                    output_negative_prompt: data.outputNegativePrompt,
                    target_engine: data.targetEngine,
                    execution_time_ms: data.executionTimeMs,
                })
                .select()
                .single();

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to save prompt',
                });
            }

            return {
                success: true,
                data: saved,
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
                error: 'Failed to save prompt',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/prompts/history - Get user's prompt history
    // ───────────────────────────────────────────────────────────────
    fastify.get('/history', async (request, reply) => {
        try {
            // TODO: Get user_id from auth token
            const userId = (request.headers['x-user-id'] as string) || null;
            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const query = request.query as { limit?: string };
            const limit = Math.min(parseInt(query.limit || '5'), 100);

            const { data: history, error } = await supabaseAdmin
                .from('prompt_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to fetch history',
                });
            }

            return {
                success: true,
                data: history,
                count: history?.length || 0,
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch history',
            });
        }
    });
};

export default promptsRoutes;
