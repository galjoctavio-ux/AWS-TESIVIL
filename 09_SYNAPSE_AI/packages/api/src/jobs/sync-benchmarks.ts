import { supabaseAdmin } from '../lib/supabase';
import { fetchAllLeaderboards, LeaderboardEntry } from './leaderboard-sources';

// ═══════════════════════════════════════════════════════════════
// SYNC BENCHMARKS FROM MULTIPLE LEADERBOARDS
// Fetches data from LMArena, Open LLM, BigCode, and more
// ═══════════════════════════════════════════════════════════════

// Map leaderboard categories to our database categories
// Standardized: chat, code, image, audio
function mapCategory(entry: LeaderboardEntry): string {
    // All entries now have one of the 4 standard categories
    return entry.category;
}

// Get provider brand name
function normalizeBrand(provider: string): string {
    const brandMap: Record<string, string> = {
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'google': 'Google',
        'meta': 'Meta',
        'mistral': 'Mistral',
        'microsoft': 'Microsoft',
        'cohere': 'Cohere',
        'deepseek': 'DeepSeek',
        'stability': 'Stability AI',
        'midjourney': 'Midjourney',
        'blackforest': 'Black Forest Labs',
        'elevenlabs': 'ElevenLabs',
        'assemblyai': 'AssemblyAI',
        'deepgram': 'Deepgram',
        'alibaba': 'Alibaba',
        '01ai': '01.AI',
        'bigcode': 'BigCode',
        'xai': 'xAI',
        'ideogram': 'Ideogram',
        'adobe': 'Adobe',
        'leonardo': 'Leonardo.AI',
        'playground': 'Playground AI',
        'recraft': 'Recraft',
        'sber': 'Sber',
        'amazon': 'Amazon',
        'rev': 'Rev.ai',
        'speechmatics': 'Speechmatics',
    };

    return brandMap[provider.toLowerCase()] || provider;
}

export async function syncBenchmarks(): Promise<number> {
    console.log('📈 Starting benchmark sync from multiple sources...');

    try {
        // Fetch all leaderboard data
        const entries = await fetchAllLeaderboards();

        if (entries.length === 0) {
            console.log('⚠️ No entries fetched from any source');
            return 0;
        }

        let upsertedCount = 0;
        let benchmarkCount = 0;

        for (const entry of entries) {
            try {
                const brand = normalizeBrand(entry.provider);
                const category = mapCategory(entry);

                // Upsert to ai_models
                const { error: modelError } = await supabaseAdmin
                    .from('ai_models')
                    .upsert(
                        {
                            id: entry.model_id,
                            name: entry.model_name,
                            brand: brand,
                            category: category,
                            score_overall: entry.normalized_score,
                            score_reasoning: null,
                            score_coding: null,
                            score_creative: null,
                            score_speed: null,
                            trend: 'stable',
                            is_new: false,
                            is_active: true,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'id' }
                    );

                if (!modelError) {
                    upsertedCount++;

                    // Insert benchmark entries (only arena_elo is available from curated data)
                    const benchmarks = [];

                    if (entry.arena_elo) {
                        benchmarks.push({
                            model_id: entry.model_id,
                            category: 'arena_elo',
                            source: entry.source,
                            score: entry.arena_elo,
                            updated_at: new Date().toISOString(),
                        });
                    }

                    for (const benchmark of benchmarks) {
                        const { error: benchError } = await supabaseAdmin
                            .from('ai_benchmarks')
                            .upsert(benchmark, { onConflict: 'model_id,category' });

                        if (!benchError) {
                            benchmarkCount++;
                        }
                    }

                    // Update ai_stats
                    await supabaseAdmin
                        .from('ai_stats')
                        .upsert(
                            {
                                model_id: entry.model_id,
                                benchmark_score: entry.normalized_score,
                                updated_at: new Date().toISOString(),
                            },
                            { onConflict: 'model_id' }
                        );
                } else {
                    console.error(`  ✗ Failed to upsert ${entry.model_name}:`, modelError.message);
                }
            } catch (err: any) {
                console.error(`  ✗ Error processing ${entry.model_name}:`, err.message);
            }
        }

        console.log(`✅ Benchmark sync complete:`);
        console.log(`   • Models upserted: ${upsertedCount}`);
        console.log(`   • Benchmark entries: ${benchmarkCount}`);

        return upsertedCount;
    } catch (error) {
        console.error('❌ Benchmark sync failed:', error);
        throw error;
    }
}

export default syncBenchmarks;
