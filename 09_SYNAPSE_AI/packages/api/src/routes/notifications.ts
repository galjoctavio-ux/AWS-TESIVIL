import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const RegisterTokenSchema = z.object({
    pushToken: z.string().min(1),
});

const UpdatePreferencesSchema = z.object({
    newsLevel: z.enum(['all', 'breaking', 'none']).optional(),
    commentsEnabled: z.boolean().optional(),
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

const notificationsRoutes: FastifyPluginAsync = async (fastify) => {
    // ───────────────────────────────────────────────────────────────
    // POST /api/notifications/register - Register push token
    // ───────────────────────────────────────────────────────────────
    fastify.post('/register', async (request, reply) => {
        try {
            const userIdHeader = request.headers['x-user-id'] as string | undefined;
            const userId = userIdHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdHeader)
                ? userIdHeader
                : null;

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'User ID required',
                });
            }

            const data = RegisterTokenSchema.parse(request.body);

            const { error } = await supabaseAdmin
                .from('profiles')
                .update({ expo_push_token: data.pushToken })
                .eq('id', userId);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to register push token',
                });
            }

            fastify.log.info(`Push token registered for user ${userId}`);

            return {
                success: true,
                message: 'Push token registered',
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
                error: 'Failed to register push token',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/notifications/preferences - Get notification preferences
    // ───────────────────────────────────────────────────────────────
    fastify.get('/preferences', async (request, reply) => {
        try {
            const userIdHeader = request.headers['x-user-id'] as string | undefined;
            const userId = userIdHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdHeader)
                ? userIdHeader
                : null;

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'User ID required',
                });
            }

            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .select('notifications_news_level, notifications_comments_enabled')
                .eq('id', userId)
                .single();

            if (error || !profile) {
                return reply.status(404).send({
                    success: false,
                    error: 'Profile not found',
                });
            }

            return {
                success: true,
                data: {
                    newsLevel: profile.notifications_news_level || 'breaking',
                    commentsEnabled: profile.notifications_comments_enabled ?? true,
                },
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch preferences',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // PATCH /api/notifications/preferences - Update notification preferences
    // ───────────────────────────────────────────────────────────────
    fastify.patch('/preferences', async (request, reply) => {
        try {
            const userIdHeader = request.headers['x-user-id'] as string | undefined;
            const userId = userIdHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdHeader)
                ? userIdHeader
                : null;

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'User ID required',
                });
            }

            const data = UpdatePreferencesSchema.parse(request.body);

            // Build update object
            const updates: Record<string, any> = {};
            if (data.newsLevel !== undefined) {
                updates.notifications_news_level = data.newsLevel;
            }
            if (data.commentsEnabled !== undefined) {
                updates.notifications_comments_enabled = data.commentsEnabled;
            }

            if (Object.keys(updates).length === 0) {
                return reply.status(400).send({
                    success: false,
                    error: 'No preferences to update',
                });
            }

            const { error } = await supabaseAdmin
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to update preferences',
                });
            }

            fastify.log.info(`Notification preferences updated for user ${userId}`);

            return {
                success: true,
                message: 'Preferences updated',
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
                error: 'Failed to update preferences',
            });
        }
    });
};

export default notificationsRoutes;
