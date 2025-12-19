import Parser from 'rss-parser';
import { supabaseAdmin } from '../lib/supabase';
import { processNewsArticle, checkDuplicate } from '../services/gemini';

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
    {
        name: 'Google AI Blog',
        url: 'https://ai.googleblog.com/feeds/posts/default?alt=rss',
        priority: 1,
    },
    {
        name: 'Anthropic',
        url: 'https://www.anthropic.com/rss.xml',
        priority: 1,
    },

    // Tech News
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
        name: 'Ars Technica AI',
        url: 'https://feeds.arstechnica.com/arstechnica/ai-ml',
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
        .eq('original_url', url)
        .limit(1);

    if (existingByUrl && existingByUrl.length > 0) {
        return true;
    }

    // Layer 2: Exact title match (case-insensitive)
    const { data: existingByTitle } = await supabaseAdmin
        .from('news_articles')
        .select('id')
        .ilike('original_title', title)
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
                        .or(`original_url.eq.${item.link},original_title.ilike.${item.title}`)
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

                    // Process with Gemini
                    const processed = await processNewsArticle(rawContent);

                    if (!processed) {
                        console.log(`    ⚠️ Failed to process: ${item.title?.slice(0, 50)}...`);
                        continue;
                    }

                    // Check Layer 3: Semantic dedup
                    if (await isDuplicate(item.link, item.title, processed.topic_id)) {
                        console.log(`    🔄 Duplicate topic: ${item.title?.slice(0, 50)}...`);
                        continue;
                    }

                    // Insert into database
                    const { error } = await supabaseAdmin
                        .from('news_articles')
                        .insert({
                            source_name: feed.name,
                            source_url: feed.url,
                            original_title: item.title,
                            original_url: item.link,
                            processed_title: processed.title,
                            bullets: processed.bullets,
                            why_it_matters: processed.why_it_matters,
                            topic_id: processed.topic_id,
                            importance: processed.importance,
                            is_breaking: processed.importance >= 9,
                            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
                            processed_at: new Date().toISOString(),
                        });

                    if (!error) {
                        newArticlesCount++;
                        console.log(`    ✓ Added: ${processed.title?.slice(0, 50)}...`);
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
