import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const CommentSchema = z.object({
    content: z.string().min(1).max(1000),
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

const newsRoutes: FastifyPluginAsync = async (fastify) => {
    // ───────────────────────────────────────────────────────────────
    // GET /api/news - Get paginated news feed
    // ───────────────────────────────────────────────────────────────
    fastify.get('/', async (request, reply) => {
        try {
            const query = request.query as {
                limit?: string;
                offset?: string;
                topic?: string;
                breaking?: string;
            };

            let dbQuery = supabaseAdmin
                .from('news_articles')
                .select('*')
                .not('processed_title', 'is', null);

            // Filter by topic
            if (query.topic && query.topic !== 'all') {
                dbQuery = dbQuery.eq('topic_id', query.topic);
            }

            // Filter breaking news
            if (query.breaking === 'true') {
                dbQuery = dbQuery.eq('is_breaking', true);
            }

            // Order by published date
            dbQuery = dbQuery.order('published_at', { ascending: false });

            // Pagination
            const limit = Math.min(parseInt(query.limit || '20'), 50);
            const offset = parseInt(query.offset || '0');
            dbQuery = dbQuery.range(offset, offset + limit - 1);

            const { data: articles, error, count } = await dbQuery;

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to fetch news',
                });
            }

            return {
                success: true,
                data: articles,
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
                error: 'Failed to fetch news',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/news/:id - Get single article
    // ───────────────────────────────────────────────────────────────
    fastify.get('/:id', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            // Get article and increment read count
            const { data: article, error } = await supabaseAdmin
                .from('news_articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !article) {
                return reply.status(404).send({
                    success: false,
                    error: 'Article not found',
                });
            }

            // Increment read count in background
            supabaseAdmin
                .from('news_articles')
                .update({ read_count: (article.read_count || 0) + 1 })
                .eq('id', id)
                .then(() => { })
                .catch((err) => fastify.log.error('Failed to update read count:', err));

            return {
                success: true,
                data: article,
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch article',
            });
        }
    });

    // ───────────────────────────────────────────────────────────────
    // GET /api/news/:id/comments - Get article comments
    // ───────────────────────────────────────────────────────────────
    fastify.get('/:id/comments', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            const { data: comments, error } = await supabaseAdmin
                .from('news_comments')
                .select(`
                    *,
                    profiles (alias, photo_url)
                `)
                .eq('article_id', id)
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
    // POST /api/news/:id/comments - Add a comment
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

            // TODO: Add moderation check here

            const { data: comment, error } = await supabaseAdmin
                .from('news_comments')
                .insert({
                    article_id: id,
                    user_id: userId,
                    content: data.content,
                    is_approved: true, // Auto-approve for MVP, add moderation later
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
            supabaseAdmin.rpc('increment_news_comment_count', { article_id: id })
                .then(() => { })
                .catch((err) => fastify.log.error('Failed to update comment count:', err));

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
    // GET /api/news/topics - Get available topics
    // ───────────────────────────────────────────────────────────────
    fastify.get('/topics', async (request, reply) => {
        try {
            const { data: topics, error } = await supabaseAdmin
                .from('news_articles')
                .select('topic_id')
                .not('topic_id', 'is', null);

            if (error) {
                fastify.log.error(error);
                return reply.status(500).send({
                    success: false,
                    error: 'Failed to fetch topics',
                });
            }

            // Get unique topics with counts
            const topicCounts: Record<string, number> = {};
            topics?.forEach((t) => {
                if (t.topic_id) {
                    topicCounts[t.topic_id] = (topicCounts[t.topic_id] || 0) + 1;
                }
            });

            return {
                success: true,
                data: Object.entries(topicCounts).map(([id, count]) => ({ id, count })),
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to fetch topics',
            });
        }
    });
};

export default newsRoutes;
