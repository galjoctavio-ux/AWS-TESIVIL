import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { moderateComment } from '../services/groq';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const CreateProjectSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().max(2000).optional(),
    repoUrl: z.string().optional().nullable(),
    demoUrl: z.string().optional().nullable(),
    toolsUsed: z.array(z.string()).max(10).default([]),
    images: z.array(z.string()).max(3).default([]),
});

const CommentSchema = z.object({
    content: z.string().min(1).max(1000),
    parentId: z.string().uuid().optional().nullable(), // For replies
    authorAlias: z.string().max(50).optional(), // User's display alias
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

const projectsRoutes: FastifyPluginAsync = async (fastify) => {
    // ───────────────────────────────────────────────────────────────
    // GET /api/projects - Get paginated projects
    // ───────────────────────────────────────────────────────────────
    fastify.get('/', async (request, reply) => {
        try {
            const query = request.query as {
                limit?: string;
                offset?: string;
                sort?: string;
                tool?: string;
                featured?: string;
            };

            let dbQuery = supabaseAdmin
                .from('projects')
                .select(`
                    *,
                    profiles (alias, photo_url)
                `)
                .eq('is_hidden', false);

            // Filter by tool (column is tools_array in DB)
            if (query.tool) {
                dbQuery = dbQuery.contains('tools_array', [query.tool]);
            }

            // Filter featured (column is is_featured_until in DB)
            if (query.featured === 'true') {
                dbQuery = dbQuery.not('is_featured_until', 'is', null);
            }

            // Sorting (use correct column names: upvotes_count, views_count, hot_score)
            // hot = time-decay algorithm (new + popular rise faster)
            // top = most upvotes of all time
            // recent = newest first
            const sortMap: Record<string, string> = {
                recent: 'created_at',
                top: 'upvotes_count',
                hot: 'hot_score', // Time-decay algorithm: new posts with upvotes rise faster
                popular: 'upvotes_count',
                views: 'views_count',
            };
            const sortField = sortMap[query.sort || 'recent'] || 'created_at';
            dbQuery = dbQuery.order(sortField, { ascending: false });

            // Pagination
            const limit = Math.min(parseInt(query.limit || '20'), 50);
            const offset = parseInt(query.offset || '0');
            dbQuery = dbQuery.range(offset, offset + limit - 1);

            const { data: projects, error, count } = await dbQuery;

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to fetch projects',
                });
            }

            return {
                success: true,
                data: projects,
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
                error: 'Failed to fetch projects',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/projects - Create new project
    // ───────────────────────────────────────────────────────────────
    fastify.post('/', async (request, reply) => {
        try {
            // Get user ID from header (optional for now - allow anonymous posts)
            const userIdHeader = request.headers['x-user-id'] as string | undefined;
            // Only use if it looks like a valid UUID
            const userId = userIdHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdHeader)
                ? userIdHeader
                : null;

            const data = CreateProjectSchema.parse(request.body);

            // Filter out empty URLs
            const repoUrl = data.repoUrl && data.repoUrl.trim() !== '' ? data.repoUrl : null;
            const demoUrl = data.demoUrl && data.demoUrl.trim() !== '' ? data.demoUrl : null;

            // Filter out local file URIs from images (only keep http/https URLs)
            const filteredImages = data.images.filter(img => img.startsWith('http://') || img.startsWith('https://'));

            const { data: project, error } = await supabaseAdmin
                .from('projects')
                .insert({
                    user_id: userId, // Can be null for anonymous
                    title: data.title,
                    description: data.description,
                    project_url: repoUrl || demoUrl,
                    action_type: repoUrl ? 'download' : (demoUrl ? 'visit' : 'inspiration'),
                    tools_array: data.toolsUsed,
                    image_urls: filteredImages,
                    moderation_status: 'approved', // Auto-approve for now
                    is_hidden: false,
                })
                .select()
                .single();

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to create project',
                });
            }

            return {
                success: true,
                data: project,
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
                error: 'Failed to create project',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/projects/:id - Get single project
    // ───────────────────────────────────────────────────────────────
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const { data: project, error } = await supabaseAdmin
                .from('projects')
                .select(`
                    *,
                    profiles (alias, photo_url)
                `)
                .eq('id', id)
                .single();

            if (error || !project) {
                return reply.status(404).send({
                    success: false,
                    error: 'Project not found',
                });
            }

            // Block hidden/rejected projects unless user is owner
            const userId = request.headers['x-user-id'] as string;
            if (project.is_hidden && project.user_id !== userId) {
                return reply.status(404).send({
                    success: false,
                    error: 'Project not found',
                });
            }

            return {
                success: true,
                data: project,
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch project',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/projects/:id/view - Register a view
    // ───────────────────────────────────────────────────────────────
    fastify.post('/:id/view', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            fastify.log.info(`Registering view for project: ${id}`);

            const { error } = await supabaseAdmin.rpc('increment_project_views', {
                p_project_id: id,
            });

            if (error) {
                fastify.log.error(`Failed to increment views for ${id}: ${error.message}`);
                fastify.log.error(JSON.stringify(error));
            } else {
                fastify.log.info(`View registered successfully for project: ${id}`);
            }

            return { success: true };
        } catch (error: any) {
            fastify.log.error(`Exception in view endpoint: ${error?.message || error}`);
            return { success: true }; // Don't fail on view tracking errors
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/projects/:id/vote - Upvote project (simplified - just increment)
    // ───────────────────────────────────────────────────────────────
    fastify.post('/:id/vote', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            // Simply increment the upvote count (no auth/tracking for now)
            const { data: project, error: fetchError } = await supabaseAdmin
                .from('projects')
                .select('upvotes_count')
                .eq('id', id)
                .single();

            if (fetchError || !project) {
                return reply.status(404).send({
                    success: false,
                    error: 'Project not found',
                });
            }

            const newCount = (project.upvotes_count || 0) + 1;

            const { error } = await supabaseAdmin
                .from('projects')
                .update({ upvotes_count: newCount })
                .eq('id', id);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to vote',
                });
            }

            return {
                success: true,
                data: { voted: true, newCount },
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to vote',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/projects/:id/comments - Get project comments
    // ───────────────────────────────────────────────────────────────
    fastify.get('/:id/comments', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const { data: comments, error } = await supabaseAdmin
                .from('project_comments')
                .select(`
                    *,
                    profiles (alias, photo_url)
                `)
                .eq('project_id', id)
                .eq('is_moderated', true)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to fetch comments',
                });
            }

            // Organize comments into threads (parent comments with nested replies)
            const parentComments = (comments || []).filter((c: any) => !c.parent_id);
            const replies = (comments || []).filter((c: any) => c.parent_id);

            const threaded = parentComments.map((parent: any) => ({
                ...parent,
                replies: replies.filter((r: any) => r.parent_id === parent.id)
                    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
            }));

            return {
                success: true,
                data: threaded,
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch comments',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/projects/:id/comments - Add comment with Groq moderation
    // ───────────────────────────────────────────────────────────────
    fastify.post('/:id/comments', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            // Get user ID from header (optional - allow anonymous comments)
            const userIdHeader = request.headers['x-user-id'] as string | undefined;
            const userId = userIdHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdHeader)
                ? userIdHeader
                : null;

            const data = CommentSchema.parse(request.body);

            // Try to moderate comment with Groq, but don't fail if moderation fails
            let commentType = 'general';
            try {
                const moderation = await moderateComment(data.content);
                if (!moderation.approved) {
                    return reply.status(400).send({
                        success: false,
                        error: 'Comentario no aprobado',
                        reason: moderation.reason,
                        type: moderation.type,
                    });
                }
                commentType = moderation.type || 'general';
            } catch (moderationError) {
                fastify.log.warn('Moderation failed, allowing comment');
                // Continue without moderation
            }

            const { data: comment, error } = await supabaseAdmin
                .from('project_comments')
                .insert({
                    project_id: id,
                    user_id: userId, // Can be null for anonymous
                    parent_id: data.parentId || null, // For replies
                    content: data.content,
                    comment_type: commentType,
                    is_moderated: true,
                    author_alias: data.authorAlias || null, // Store the alias
                })
                .select(`
                    *,
                    profiles (alias, photo_url)
                `)
                .single();

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to save comment',
                });
            }

            // Update comment count (ignore errors)
            try {
                await supabaseAdmin.rpc('increment_project_comments', { p_project_id: id });
            } catch (e: any) {
                fastify.log.warn(`Failed to increment comment count: ${e?.message || e}`);
            }

            return {
                success: true,
                data: comment,
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
                error: 'Failed to save comment',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/projects/:id/report - Report a project (anonymous allowed)
    // ───────────────────────────────────────────────────────────────
    fastify.post('/:id/report', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            // Get user ID if available (optional)
            const userIdHeader = request.headers['x-user-id'] as string | undefined;
            const userId = userIdHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdHeader)
                ? userIdHeader
                : null;

            const { reason } = request.body as { reason?: string };

            // Increment report count and auto-hide if >= 3
            const { data: project } = await supabaseAdmin
                .from('projects')
                .select('report_count')
                .eq('id', id)
                .single();

            if (!project) {
                return reply.status(404).send({
                    success: false,
                    error: 'Project not found',
                });
            }

            const newCount = (project.report_count || 0) + 1;

            await supabaseAdmin
                .from('projects')
                .update({
                    report_count: newCount,
                    is_hidden: newCount >= 3,
                })
                .eq('id', id);

            // Try to save the report detail (may fail if no user_id)
            if (userId) {
                try {
                    await supabaseAdmin
                        .from('project_reports')
                        .insert({
                            project_id: id,
                            user_id: userId,
                            reason: reason || 'No reason provided',
                        });
                } catch (e) {
                    // Ignore - just increment count
                }
            }

            return {
                success: true,
                message: 'Reporte enviado correctamente',
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to submit report',
            });
        }
    });
};

export default projectsRoutes;
