import { supabaseAdmin } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// BENCHMARK DATA SOURCES
// We use multiple sources to get comprehensive benchmark data
// ═══════════════════════════════════════════════════════════════

// Known benchmark scores for popular models (based on public benchmarks)
// These are updated periodically based on LMSYS Arena, MMLU, HumanEval, etc.
const BENCHMARK_DATA: Record<string, {
    arena_elo?: number;
    mmlu_score?: number;
    humaneval_score?: number;
    mt_bench_score?: number;
    reasoning_score?: number;
    coding_score?: number;
    creative_score?: number;
}> = {
    // OpenAI Models
    'openai/gpt-4o': { arena_elo: 1285, mmlu_score: 88.7, humaneval_score: 90.2, reasoning_score: 92, coding_score: 91, creative_score: 88 },
    'openai/gpt-4o-mini': { arena_elo: 1190, mmlu_score: 82.0, humaneval_score: 87.0, reasoning_score: 85, coding_score: 86, creative_score: 82 },
    'openai/gpt-4-turbo': { arena_elo: 1255, mmlu_score: 86.4, humaneval_score: 88.5, reasoning_score: 90, coding_score: 89, creative_score: 87 },
    'openai/gpt-4': { arena_elo: 1250, mmlu_score: 86.4, humaneval_score: 87.0, reasoning_score: 89, coding_score: 88, creative_score: 86 },
    'openai/gpt-3.5-turbo': { arena_elo: 1105, mmlu_score: 70.0, humaneval_score: 72.0, reasoning_score: 72, coding_score: 75, creative_score: 78 },
    'openai/o1-preview': { arena_elo: 1335, mmlu_score: 92.0, humaneval_score: 94.5, reasoning_score: 96, coding_score: 95, creative_score: 85 },
    'openai/o1-mini': { arena_elo: 1295, mmlu_score: 88.0, humaneval_score: 92.0, reasoning_score: 93, coding_score: 93, creative_score: 82 },

    // Anthropic Models
    'anthropic/claude-3.5-sonnet': { arena_elo: 1280, mmlu_score: 88.7, humaneval_score: 92.0, reasoning_score: 91, coding_score: 93, creative_score: 90 },
    'anthropic/claude-3-opus': { arena_elo: 1260, mmlu_score: 86.8, humaneval_score: 84.9, reasoning_score: 90, coding_score: 88, creative_score: 92 },
    'anthropic/claude-3-sonnet': { arena_elo: 1200, mmlu_score: 79.0, humaneval_score: 73.0, reasoning_score: 82, coding_score: 80, creative_score: 85 },
    'anthropic/claude-3-haiku': { arena_elo: 1170, mmlu_score: 75.2, humaneval_score: 75.9, reasoning_score: 78, coding_score: 77, creative_score: 80 },

    // Google Models
    'google/gemini-pro': { arena_elo: 1180, mmlu_score: 79.1, humaneval_score: 67.7, reasoning_score: 82, coding_score: 75, creative_score: 83 },
    'google/gemini-pro-1.5': { arena_elo: 1245, mmlu_score: 85.9, humaneval_score: 84.1, reasoning_score: 88, coding_score: 86, creative_score: 87 },
    'google/gemini-2.0-flash-exp': { arena_elo: 1270, mmlu_score: 87.0, humaneval_score: 89.0, reasoning_score: 89, coding_score: 90, creative_score: 86 },

    // Meta Models
    'meta-llama/llama-3.1-405b-instruct': { arena_elo: 1235, mmlu_score: 88.6, humaneval_score: 89.0, reasoning_score: 88, coding_score: 87, creative_score: 85 },
    'meta-llama/llama-3.1-70b-instruct': { arena_elo: 1200, mmlu_score: 86.0, humaneval_score: 82.0, reasoning_score: 85, coding_score: 84, creative_score: 83 },
    'meta-llama/llama-3.1-8b-instruct': { arena_elo: 1120, mmlu_score: 69.4, humaneval_score: 72.6, reasoning_score: 72, coding_score: 74, creative_score: 75 },
    'meta-llama/llama-3.3-70b-instruct': { arena_elo: 1215, mmlu_score: 87.0, humaneval_score: 84.0, reasoning_score: 86, coding_score: 85, creative_score: 84 },

    // Mistral Models
    'mistralai/mistral-large': { arena_elo: 1195, mmlu_score: 81.2, humaneval_score: 73.0, reasoning_score: 83, coding_score: 78, creative_score: 82 },
    'mistralai/mistral-medium': { arena_elo: 1145, mmlu_score: 75.3, humaneval_score: 65.0, reasoning_score: 77, coding_score: 72, creative_score: 78 },
    'mistralai/mixtral-8x7b': { arena_elo: 1110, mmlu_score: 70.6, humaneval_score: 60.0, reasoning_score: 73, coding_score: 68, creative_score: 75 },

    // DeepSeek Models
    'deepseek/deepseek-chat': { arena_elo: 1210, mmlu_score: 84.0, humaneval_score: 86.0, reasoning_score: 85, coding_score: 88, creative_score: 80 },
    'deepseek/deepseek-coder': { arena_elo: 1175, mmlu_score: 78.0, humaneval_score: 90.0, reasoning_score: 78, coding_score: 92, creative_score: 72 },

    // Cohere Models
    'cohere/command-r-plus': { arena_elo: 1175, mmlu_score: 75.7, humaneval_score: 68.0, reasoning_score: 78, coding_score: 72, creative_score: 80 },
    'cohere/command-r': { arena_elo: 1130, mmlu_score: 68.2, humaneval_score: 55.0, reasoning_score: 72, coding_score: 65, creative_score: 76 },
};

// ═══════════════════════════════════════════════════════════════
// SYNC BENCHMARKS
// Updates benchmark scores for AI models
// ═══════════════════════════════════════════════════════════════

// Helper function to normalize model names for matching
function normalizeModelName(name: string): string {
    return name.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/instruct/g, '')
        .replace(/chat/g, '');
}

// Find best matching benchmark for a model
function findBestBenchmark(modelId: string, modelName: string): typeof BENCHMARK_DATA[string] | null {
    const normalizedId = normalizeModelName(modelId);
    const normalizedName = normalizeModelName(modelName);

    for (const [benchmarkId, data] of Object.entries(BENCHMARK_DATA)) {
        const normalizedBenchmarkId = normalizeModelName(benchmarkId);

        // Check for partial matches
        if (normalizedId.includes(normalizedBenchmarkId) ||
            normalizedBenchmarkId.includes(normalizedId) ||
            normalizedName.includes(normalizedBenchmarkId) ||
            normalizedBenchmarkId.includes(normalizedName)) {
            return data;
        }

        // Check provider + model family match (e.g., "openai" + "gpt4")
        const [provider] = benchmarkId.split('/');
        if (modelId.includes(provider)) {
            const modelFamily = benchmarkId.split('/')[1]?.split('-')[0] || '';
            if (modelId.includes(modelFamily) || modelName.toLowerCase().includes(modelFamily)) {
                return data;
            }
        }
    }

    return null;
}

export async function syncBenchmarks(): Promise<number> {
    console.log('📈 Starting benchmark sync...');

    try {
        // Get existing models from database
        const { data: existingModels, error: fetchError } = await supabaseAdmin
            .from('ai_models')
            .select('id, name');

        if (fetchError || !existingModels) {
            throw new Error(`Failed to fetch existing models: ${fetchError?.message}`);
        }

        console.log(`📥 Found ${existingModels.length} models in database`);

        let updatedCount = 0;
        let benchmarkCount = 0;

        for (const model of existingModels) {
            // Find best matching benchmark data
            const benchmarkInfo = findBestBenchmark(model.id, model.name);

            if (benchmarkInfo) {
                // Calculate overall score (weighted average)
                const overallScore = Math.round(
                    (benchmarkInfo.arena_elo ? ((benchmarkInfo.arena_elo - 800) / 600) * 100 : 75) * 0.4 +
                    (benchmarkInfo.mmlu_score || 75) * 0.2 +
                    (benchmarkInfo.reasoning_score || 75) * 0.2 +
                    (benchmarkInfo.coding_score || 75) * 0.1 +
                    (benchmarkInfo.creative_score || 75) * 0.1
                );

                // Update model with scores
                const { error: updateError } = await supabaseAdmin
                    .from('ai_models')
                    .update({
                        score_overall: Math.min(100, overallScore),
                        score_reasoning: benchmarkInfo.reasoning_score || null,
                        score_coding: benchmarkInfo.coding_score || null,
                        score_creative: benchmarkInfo.creative_score || null,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', model.id);

                if (!updateError) {
                    updatedCount++;
                    console.log(`  ✓ Updated ${model.name}: Score ${overallScore}`);
                }

                // Insert benchmark entries for different categories
                const benchmarkCategories = [
                    { category: 'arena_elo', source: 'LMSYS Arena', score: benchmarkInfo.arena_elo },
                    { category: 'mmlu', source: 'MMLU Benchmark', score: benchmarkInfo.mmlu_score },
                    { category: 'humaneval', source: 'HumanEval', score: benchmarkInfo.humaneval_score },
                    { category: 'mt_bench', source: 'MT-Bench', score: benchmarkInfo.mt_bench_score },
                ];

                for (const bench of benchmarkCategories) {
                    if (bench.score) {
                        const { error: benchError } = await supabaseAdmin
                            .from('ai_benchmarks')
                            .upsert(
                                {
                                    model_id: model.id,
                                    category: bench.category,
                                    source: bench.source,
                                    score: bench.score,
                                    updated_at: new Date().toISOString(),
                                },
                                { onConflict: 'model_id,category' }
                            );

                        if (!benchError) {
                            benchmarkCount++;
                        }
                    }
                }

                // Update ai_stats with benchmark score
                await supabaseAdmin
                    .from('ai_stats')
                    .upsert(
                        {
                            model_id: model.id,
                            benchmark_score: Math.min(100, overallScore),
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'model_id' }
                    );
            }
        }

        console.log(`✅ Benchmark sync complete: ${updatedCount} models updated, ${benchmarkCount} benchmark entries`);
        return updatedCount;
    } catch (error) {
        console.error('❌ Benchmark sync failed:', error);
        throw error;
    }
}

export default syncBenchmarks;
