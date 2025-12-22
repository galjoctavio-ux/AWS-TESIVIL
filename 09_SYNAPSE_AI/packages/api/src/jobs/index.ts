import cron from 'node-cron';
import { syncModels } from './sync-models';
import { syncBenchmarks } from './sync-benchmarks';
import { aggregateNews } from './news-aggregator';
import { updateHotScores } from './update-hot-scores';

export function initCronJobs() {
    console.log('🕐 Initializing cron jobs...');

    // ═══════════════════════════════════════════════════════════════
    // SYNC MODELS - Weekly (Sundays 2:00 AM)
    // Updates AI models catalog from OpenRouter
    // ═══════════════════════════════════════════════════════════════
    cron.schedule('0 2 * * 0', async () => {
        console.log('📊 [CRON] Starting weekly model sync...');
        try {
            await syncModels();
            console.log('✅ [CRON] Model sync completed');
        } catch (error) {
            console.error('❌ [CRON] Model sync failed:', error);
            // TODO: Send webhook/email alert
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // SYNC BENCHMARKS - Weekly (Sundays 3:00 AM)
    // Updates benchmark scores from LMArena, Open LLM, BigCode, etc.
    // ═══════════════════════════════════════════════════════════════
    cron.schedule('0 3 * * 0', async () => {
        console.log('📈 [CRON] Starting weekly benchmark sync...');
        try {
            await syncBenchmarks();
            console.log('✅ [CRON] Benchmark sync completed');
        } catch (error) {
            console.error('❌ [CRON] Benchmark sync failed:', error);
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // NEWS AGGREGATOR - Hourly (7am-11pm)
    // Fetches, processes and deduplicates news from RSS feeds
    // ═══════════════════════════════════════════════════════════════
    cron.schedule('0 7-23 * * *', async () => {
        console.log('📰 [CRON] Starting hourly news aggregation...');
        try {
            const newArticles = await aggregateNews();
            console.log(`✅ [CRON] News aggregation completed: ${newArticles} new articles`);
        } catch (error) {
            console.error('❌ [CRON] News aggregation failed:', error);
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // UPDATE HOT SCORES - Every hour
    // Recalculates time-decay scores for Showcase projects
    // Ensures rankings stay fresh even without new votes
    // ═══════════════════════════════════════════════════════════════
    cron.schedule('30 * * * *', async () => {
        console.log('🔥 [CRON] Starting hot score update...');
        try {
            const updated = await updateHotScores();
            console.log(`✅ [CRON] Hot score update completed: ${updated} projects`);
        } catch (error) {
            console.error('❌ [CRON] Hot score update failed:', error);
        }
    });

    console.log('✅ Cron jobs initialized:');
    console.log('   • Model sync: Sundays 2:00 AM');
    console.log('   • Benchmark sync: Sundays 3:00 AM');
    console.log('   • News aggregator: Hourly 7am-11pm');
    console.log('   • Hot score update: Every hour at :30');
}

