import cron from 'node-cron';
import { syncModels } from './sync-models';
import { syncBenchmarks } from './sync-benchmarks';
import { aggregateNews } from './news-aggregator';

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
    // SYNC BENCHMARKS - Monthly (1st of month, 3:00 AM)
    // Updates benchmark scores from LMSYS/HuggingFace
    // ═══════════════════════════════════════════════════════════════
    cron.schedule('0 3 1 * *', async () => {
        console.log('📈 [CRON] Starting monthly benchmark sync...');
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

    console.log('✅ Cron jobs initialized:');
    console.log('   • Model sync: Sundays 2:00 AM');
    console.log('   • Benchmark sync: 1st of month 3:00 AM');
    console.log('   • News aggregator: Hourly 7am-11pm');
}
