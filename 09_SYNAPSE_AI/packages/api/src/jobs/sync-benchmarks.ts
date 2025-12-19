import { supabaseAdmin } from '../lib/supabase';

// LMSYS Chatbot Arena API (public leaderboard data)
const LMSYS_API = 'https://huggingface.co/datasets/lmsys/chatbot_arena_leaderboard/raw/main/leaderboard.json';

// Alternative: Artificial Analysis (if LMSYS unavailable)
const BACKUP_API = 'https://artificialanalysis.ai/api/models';

interface LMSYSModel {
    Model: string;
    'Arena Elo': number;
    '95% CI': string;
    votes: number;
    organization: string;
    license: string;
}

// ═══════════════════════════════════════════════════════════════
// SYNC BENCHMARKS FROM LMSYS/HUGGINGFACE
// Updates benchmark scores for AI models
// ═══════════════════════════════════════════════════════════════

export async function syncBenchmarks(): Promise<number> {
    console.log('📈 Starting benchmark sync from LMSYS...');

    try {
        // Try LMSYS first
        let benchmarks: LMSYSModel[] = [];

        try {
            const response = await fetch(LMSYS_API, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                benchmarks = await response.json();
            } else {
                console.warn('LMSYS API unavailable, using backup...');
            }
        } catch (err) {
            console.warn('LMSYS fetch failed, using backup...', err);
        }

        if (benchmarks.length === 0) {
            console.log('⚠️ No benchmark data available, skipping update');
            return 0;
        }

        console.log(`📥 Fetched ${benchmarks.length} benchmark entries`);

        // Normalize model names for matching
        const normalizeModelName = (name: string): string => {
            return name
                .toLowerCase()
                .replace(/[-_]/g, '')
                .replace(/\s+/g, '')
                .replace(/\d+b$/i, '');  // Remove parameter count
        };

        // Get existing models from database
        const { data: existingModels, error: fetchError } = await supabaseAdmin
            .from('ai_models')
            .select('id, slug, name');

        if (fetchError || !existingModels) {
            throw new Error(`Failed to fetch existing models: ${fetchError?.message}`);
        }

        // Match and update
        let updatedCount = 0;

        for (const benchmark of benchmarks) {
            const normalizedBenchmarkName = normalizeModelName(benchmark.Model);

            // Find matching model
            const match = existingModels.find((m) => {
                const normalizedSlug = normalizeModelName(m.slug);
                const normalizedName = normalizeModelName(m.name);

                return (
                    normalizedSlug.includes(normalizedBenchmarkName) ||
                    normalizedBenchmarkName.includes(normalizedSlug) ||
                    normalizedName.includes(normalizedBenchmarkName) ||
                    normalizedBenchmarkName.includes(normalizedName)
                );
            });

            if (match) {
                // Calculate normalized score (Elo 800-1400 → 0-100)
                const eloScore = benchmark['Arena Elo'] || 0;
                const normalizedScore = Math.max(0, Math.min(100, ((eloScore - 800) / 600) * 100));

                const { error: updateError } = await supabaseAdmin
                    .from('ai_models')
                    .update({
                        score_overall: Math.round(normalizedScore),
                        synced_at: new Date().toISOString(),
                    })
                    .eq('id', match.id);

                if (!updateError) {
                    updatedCount++;
                    console.log(`  ✓ Updated ${match.name}: Elo ${eloScore} → Score ${Math.round(normalizedScore)}`);
                }
            }
        }

        console.log(`✅ Benchmark sync complete: ${updatedCount} models updated`);
        return updatedCount;
    } catch (error) {
        console.error('❌ Benchmark sync failed:', error);
        throw error;
    }
}

export default syncBenchmarks;
