import Parser from 'rss-parser';
import { supabaseAdmin } from '../lib/supabase';
import { processNewsArticle, checkDuplicate } from '../services/gemini';
import { notifyNewsSubscribers } from '../services/pushNotifications';

const parser = new Parser({
    timeout: 10000,
    headers: {
        'User-Agent': 'SYNAPSE_AI/1.0 (+https://synapse-ai.app)',
    },
});

// ═══════════════════════════════════════════════════════════════
// RSS FEED SOURCES
// Curated list of AI-related news sources
// ═══════════════════════════════════════════════════════════════

const RSS_FEEDS = [
    // AI Research & Labs
    {
        name: 'OpenAI Blog',
        url: 'https://openai.com/blog/rss.xml',
        priority: 1,
    },

    // Tech News (verified working)
    {
        name: 'TechCrunch AI',
        url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
        priority: 2,
    },
    {
        name: 'The Verge AI',
        url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
        priority: 2,
    },
    {
        name: 'Wired AI',
        url: 'https://www.wired.com/feed/tag/ai/latest/rss',
        priority: 2,
    },

    // AI-Specific
    {
        name: 'MIT Technology Review AI',
        url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
        priority: 1,
    },
    {
        name: 'VentureBeat AI',
        url: 'https://venturebeat.com/category/ai/feed/',
        priority: 2,
    },
];

// ═══════════════════════════════════════════════════════════════
// ANTI-DUPLICATE SYSTEM (3 Layers)
// ═══════════════════════════════════════════════════════════════

async function isDuplicate(
    url: string,
    title: string,
    topicId: string | null
): Promise<boolean> {
    // Layer 1: Exact URL match
    const { data: existingByUrl } = await supabaseAdmin
        .from('news_articles')
        .select('id')
        .eq('url_original', url)
        .limit(1);

    if (existingByUrl && existingByUrl.length > 0) {
        return true;
    }

    // Layer 2: Exact title match (case-insensitive)
    const { data: existingByTitle } = await supabaseAdmin
        .from('news_articles')
        .select('id')
        .ilike('title', title)
        .limit(1);

    if (existingByTitle && existingByTitle.length > 0) {
        return true;
    }

    // Layer 3: Semantic dedup via topic_id (last 24h)
    if (topicId) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const { data: existingByTopic } = await supabaseAdmin
            .from('news_articles')
            .select('topic_id')
            .gte('created_at', yesterday.toISOString());

        const recentTopics = existingByTopic?.map((a) => a.topic_id).filter(Boolean) || [];
        return checkDuplicate(topicId, recentTopics as string[]);
    }

    return false;
}

// ═══════════════════════════════════════════════════════════════
// NEWS AGGREGATION PIPELINE
// ═══════════════════════════════════════════════════════════════

export async function aggregateNews(): Promise<number> {
    console.log('📰 Starting news aggregation...');

    let newArticlesCount = 0;
    let processedCount = 0;
    let errorCount = 0;

    for (const feed of RSS_FEEDS) {
        try {
            console.log(`  📥 Fetching: ${feed.name}`);

            const feedData = await parser.parseURL(feed.url);
            const items = feedData.items.slice(0, 5); // Latest 5 per feed

            for (const item of items) {
                try {
                    if (!item.link || !item.title) continue;

                    // Check for duplicates (Layer 1 & 2)
                    const { data: existing } = await supabaseAdmin
                        .from('news_articles')
                        .select('id')
                        .or(`url_original.eq.${item.link},title.ilike.${item.title}`)
                        .limit(1);

                    if (existing && existing.length > 0) {
                        continue; // Skip duplicate
                    }

                    // Prepare raw content for processing
                    const rawContent = `
                        Title: ${item.title}
                        Source: ${feed.name}
                        Date: ${item.pubDate || 'Unknown'}
                        Summary: ${item.contentSnippet || item.content || 'No content available'}
                    `;

                    // Add delay to prevent Gemini rate limiting (1.5 seconds)
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Process with Gemini
                    const processed = await processNewsArticle(rawContent);

                    if (!processed) {
                        console.log(`    ⚠️ Failed to process: ${item.title?.slice(0, 50)}...`);
                        errorCount++;
                        continue;
                    }

                    // Check Layer 3: Semantic dedup
                    if (await isDuplicate(item.link, item.title, processed.topic_id)) {
                        console.log(`    🔄 Duplicate topic: ${item.title?.slice(0, 50)}...`);
                        continue;
                    }

                    // Insert into database
                    // Derive simple category from topic_id for filtering
                    const topicLower = (processed.topic_id || '').toLowerCase();
                    let category = 'general';
                    if (topicLower.includes('model') || topicLower.includes('gpt') || topicLower.includes('llm') || topicLower.includes('claude') || topicLower.includes('gemini')) {
                        category = 'models';
                    } else if (topicLower.includes('research') || topicLower.includes('paper') || topicLower.includes('study')) {
                        category = 'research';
                    } else if (topicLower.includes('tool') || topicLower.includes('api') || topicLower.includes('sdk') || topicLower.includes('library')) {
                        category = 'tools';
                    } else if (topicLower.includes('business') || topicLower.includes('funding') || topicLower.includes('acquisition') || topicLower.includes('startup')) {
                        category = 'business';
                    }

                    const { error } = await supabaseAdmin
                        .from('news_articles')
                        .insert({
                            title: processed.title || item.title,
                            source_name: feed.name,
                            url_original: item.link,
                            topic_id: processed.topic_id || 'general',
                            category: category,
                            importance: processed.importance || 5,
                            summary_json: {
                                original_title: item.title,
                                processed_title: processed.title,
                                bullets: processed.bullets,
                                why_it_matters: processed.why_it_matters,
                            },
                            image_url: null,
                            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
                        });

                    if (!error) {
                        newArticlesCount++;
                        console.log(`    ✓ Added: ${processed.title?.slice(0, 50)}...`);

                        // Send push notification to subscribers
                        try {
                            await notifyNewsSubscribers(
                                processed.title || item.title,
                                processed.importance || 5,
                                'new-article'
                            );
                        } catch (notifError) {
                            console.warn(`    ⚠️ Failed to send news notification:`, notifError);
                        }
                    } else {
                        console.error(`    ✗ Insert error: ${error.message}`);
                    }

                    processedCount++;
                } catch (itemError) {
                    console.error(`    ✗ Error processing item:`, itemError);
                    errorCount++;
                }
            }
        } catch (feedError) {
            console.error(`  ✗ Error fetching feed ${feed.name}:`, feedError);
            errorCount++;
        }
    }

    console.log(`✅ News aggregation complete:`);
    console.log(`   • New articles: ${newArticlesCount}`);
    console.log(`   • Processed: ${processedCount}`);
    console.log(`   • Errors: ${errorCount}`);

    return newArticlesCount;
}

export default aggregateNews;
