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
    repoUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    toolsUsed: z.array(z.string()).max(10).default([]),
    images: z.array(z.string().url()).max(3).default([]),
});

const CommentSchema = z.object({
    content: z.string().min(1).max(1000),
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
                .eq('is_hidden', false)
                .eq('moderation_status', 'approved');

            // Filter by tool
            if (query.tool) {
                dbQuery = dbQuery.contains('tools_used', [query.tool]);
            }

            // Filter featured
            if (query.featured === 'true') {
                dbQuery = dbQuery.eq('is_featured', true);
            }

            // Sorting
            const sortMap: Record<string, string> = {
                recent: 'created_at',
                popular: 'upvote_count',
                views: 'view_count',
            };
            const sortField = sortMap[query.sort || 'recent'] || 'created_at';
            dbQuery = dbQuery.order(sortField, { ascending: false });

            // Featured projects first
            dbQuery = dbQuery.order('is_featured', { ascending: false });

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
            const userId = (request.headers['x-user-id'] as string) || null;

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const data = CreateProjectSchema.parse(request.body);

            const { data: project, error } = await supabaseAdmin
                .from('projects')
                .insert({
                    user_id: userId,
                    title: data.title,
                    description: data.description,
                    repo_url: data.repoUrl,
                    demo_url: data.demoUrl,
                    tools_used: data.toolsUsed,
                    images: data.images,
                    moderation_status: 'pending', // Will need approval
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

            const { error } = await supabaseAdmin.rpc('increment_project_views', {
                project_id: id,
            });

            if (error) {
                fastify.log.error(error);
            }

            return { success: true };
        } catch (error: any) {
            fastify.log.error(error);
            return { success: true }; // Don't fail on view tracking errors
        }
    });

    // ───────────────────────────────────────────────────────────────
    // POST /api/projects/:id/vote - Upvote/downvote project
    // ───────────────────────────────────────────────────────────────
    fastify.post('/:id/vote', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const userId = (request.headers['x-user-id'] as string) || null;

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required',
                });
            }

            // Check if user already voted
            const { data: existingVote, error: checkError } = await supabaseAdmin
                .from('project_votes')
                .select('id')
                .eq('project_id', id)
                .eq('user_id', userId)
                .single();

            if (existingVote) {
                // Remove vote (toggle)
                await supabaseAdmin
                    .from('project_votes')
                    .delete()
                    .eq('id', existingVote.id);

                await supabaseAdmin.rpc('decrement_project_upvotes', { project_id: id });

                return {
                    success: true,
                    data: { voted: false },
                };
            }

            // Add vote
            const { error } = await supabaseAdmin
                .from('project_votes')
                .insert({
                    project_id: id,
                    user_id: userId,
                });

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to vote',
                });
            }

            await supabaseAdmin.rpc('increment_project_upvotes', { project_id: id });

            return {
                success: true,
                data: { voted: true },
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
                .eq('is_approved', true)
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to fetch comments',
                });
            }

            return {
                success: true,
                data: comments,
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
            const userId = (request.headers['x-user-id'] as string) || null;

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const data = CommentSchema.parse(request.body);

            // Moderate comment with Groq
            const moderation = await moderateComment(data.content);

            if (!moderation.approved) {
                return reply.status(400).send({
                    success: false,
                    error: 'Comment was not approved',
                    reason: moderation.reason,
                    type: moderation.type,
                });
            }

            const { data: comment, error } = await supabaseAdmin
                .from('project_comments')
                .insert({
                    project_id: id,
                    user_id: userId,
                    content: data.content,
                    comment_type: moderation.type,
                    is_approved: true,
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

            // Update comment count
            await supabaseAdmin.rpc('increment_project_comments', { project_id: id });

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
    // POST /api/projects/:id/report - Report a project
    // ───────────────────────────────────────────────────────────────
    fastify.post('/:id/report', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };
            const userId = (request.headers['x-user-id'] as string) || null;

            if (!userId) {
                return reply.status(401).send({
                    success: false,
                    error: 'Authentication required',
                });
            }

            const { reason } = request.body as { reason?: string };

            // Check if user already reported
            const { data: existingReport } = await supabaseAdmin
                .from('project_reports')
                .select('id')
                .eq('project_id', id)
                .eq('user_id', userId)
                .single();

            if (existingReport) {
                return reply.status(409).send({
                    success: false,
                    error: 'You have already reported this project',
                });
            }

            // Add report
            const { error } = await supabaseAdmin
                .from('project_reports')
                .insert({
                    project_id: id,
                    user_id: userId,
                    reason: reason || 'No reason provided',
                });

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to submit report',
                });
            }

            // Increment report count and auto-hide if >= 3
            const { data: project } = await supabaseAdmin
                .from('projects')
                .select('report_count')
                .eq('id', id)
                .single();

            const newCount = (project?.report_count || 0) + 1;

            await supabaseAdmin
                .from('projects')
                .update({
                    report_count: newCount,
                    is_hidden: newCount >= 3,
                })
                .eq('id', id);

            return {
                success: true,
                message: 'Report submitted successfully',
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
