import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const CommentSchema = z.object({
    content: z.string().min(1).max(1000),
    parentId: z.string().uuid().optional().nullable(), // For replies
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
                sort?: string;
            };

            let dbQuery = supabaseAdmin
                .from('news_articles')
                .select('*');

            // Filter by category (not topic_id)
            if (query.topic && query.topic !== 'all') {
                dbQuery = dbQuery.eq('category', query.topic);
            }

            // Filter breaking news (importance >= 9)
            if (query.breaking === 'true') {
                dbQuery = dbQuery.gte('importance', 9);
            }

            // Sorting: top = most likes, recent = newest (default)
            if (query.sort === 'top') {
                dbQuery = dbQuery.order('like_count', { ascending: false, nullsFirst: false });
            } else {
                dbQuery = dbQuery.order('published_at', { ascending: false, nullsFirst: false });
            }

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

            // Flatten article data for frontend compatibility
            const flattenedArticles = (articles || []).map((article: any) => {
                const summaryData = article.summary_json || {};
                return {
                    ...article,
                    processed_title: summaryData.processed_title || article.title,
                    original_title: summaryData.original_title || article.title,
                    bullets: summaryData.bullets || [],
                    why_it_matters: summaryData.why_it_matters || null,
                    original_url: article.url_original,
                };
            });

            return {
                success: true,
                data: flattenedArticles,
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

            // Flatten article data for frontend compatibility
            // summary_json contains: { original_title, processed_title, bullets, why_it_matters }
            const summaryData = article.summary_json || {};
            const flattenedArticle = {
                ...article,
                // Map nested fields to top-level for frontend
                processed_title: summaryData.processed_title || article.title,
                original_title: summaryData.original_title || article.title,
                bullets: summaryData.bullets || [],
                why_it_matters: summaryData.why_it_matters || null,
                // Map url_original to original_url (frontend naming)
                original_url: article.url_original,
            };

            return {
                success: true,
                data: flattenedArticle,
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
    // GET /api/news/:id/comments - Get article comments (with threaded replies)
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
    // POST /api/news/:id/comments - Add a comment (supports replies)
    // ───────────────────────────────────────────────────────────────
    fastify.post('/:id/comments', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            // Get user ID from header (optional - allow anonymous comments like projects)
            const userIdHeader = request.headers['x-user-id'] as string | undefined;
            const userId = userIdHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdHeader)
                ? userIdHeader
                : null;

            const data = CommentSchema.parse(request.body);

            // TODO: Add moderation check here

            const { data: comment, error } = await supabaseAdmin
                .from('news_comments')
                .insert({
                    article_id: id,
                    user_id: userId, // Can be null for anonymous
                    parent_id: data.parentId || null, // For replies
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

    // ───────────────────────────────────────────────────────────────
    // POST /api/news/:id/like - Like an article
    // ───────────────────────────────────────────────────────────────
    fastify.post('/:id/like', async (request, reply) => {
        try {
            const { id } = request.params as { id: string };

            // Try RPC function first
            console.log(`[LIKE] Attempting RPC increment for article: ${id}`);
            const { error: rpcError } = await supabaseAdmin.rpc('increment_news_likes', {
                p_article_id: id,
            });

            if (rpcError) {
                console.error(`[LIKE] RPC Error:`, rpcError);
                fastify.log.warn(`RPC failed, using direct update: ${rpcError.message}`);

                // Fallback: direct increment
                const { data: article, error: fetchError } = await supabaseAdmin
                    .from('news_articles')
                    .select('like_count')
                    .eq('id', id)
                    .single();

                if (fetchError || !article) {
                    return reply.status(404).send({
                        success: false,
                        error: 'Article not found',
                    });
                }

                const newCount = (article.like_count || 0) + 1;

                const { error: updateError } = await supabaseAdmin
                    .from('news_articles')
                    .update({ like_count: newCount })
                    .eq('id', id);

                if (updateError) {
                    fastify.log.error(`Update failed: ${updateError.message}`);
                    return reply.status(500).send({
                        success: false,
                        error: 'Failed to like article',
                    });
                }

                return {
                    success: true,
                    message: 'Article liked',
                    newCount: newCount,
                };
            }

            // Get updated count after RPC success
            const { data: updated } = await supabaseAdmin
                .from('news_articles')
                .select('like_count')
                .eq('id', id)
                .single();

            return {
                success: true,
                message: 'Article liked',
                newCount: updated?.like_count || 0,
            };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({
                success: false,
                error: 'Failed to like article',
            });
        }
    });
};

export default newsRoutes;
