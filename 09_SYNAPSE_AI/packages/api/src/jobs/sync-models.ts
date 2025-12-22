import { supabaseAdmin } from '../lib/supabase';
import { refineModels } from '../services/groq';

// OpenRouter API endpoint
const OPENROUTER_API = 'https://openrouter.ai/api/v1/models';

interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    pricing: {
        prompt: string;
        completion: string;
    };
    context_length?: number;
    architecture?: {
        modality: string;
        tokenizer: string;
    };
    top_provider?: {
        context_length?: number;
        max_completion_tokens?: number;
    };
    per_request_limits?: any;
}

// ═══════════════════════════════════════════════════════════════
// SYNC MODELS FROM OPENROUTER
// Fetches latest AI models and enriches with Groq
// ═══════════════════════════════════════════════════════════════

export async function syncModels(): Promise<number> {
    console.log('📊 Starting model sync from OpenRouter...');

    try {
        // Fetch models from OpenRouter
        const response = await fetch(OPENROUTER_API, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const models: OpenRouterModel[] = data.data || [];

        console.log(`📥 Fetched ${models.length} models from OpenRouter`);

        // Filter relevant models (text-based, major providers)
        const relevantModels = models.filter((m) => {
            const isTextModel = m.architecture?.modality?.includes('text');
            const isRelevantProvider = [
                'openai',
                'anthropic',
                'google',
                'meta',
                'mistral',
                'cohere',
                'deepseek',
            ].some((p) => m.id.toLowerCase().includes(p));

            return isTextModel !== false && isRelevantProvider;
        });

        console.log(`🔍 Filtered to ${relevantModels.length} relevant models`);

        // Transform to our schema
        const transformedModels = relevantModels.map((m) => ({
            id: m.id,
            name: m.name,
            brand: m.id.split('/')[0] || 'unknown',
            category: categorizeModel(m),
            version: m.name.match(/[\d.]+/)?.[0] || null,
            pricing_input_1m: parseFloat(m.pricing.prompt) * 1000000 || 0,
            pricing_output_1m: parseFloat(m.pricing.completion) * 1000000 || 0,
            context_window: m.context_length || m.top_provider?.context_length || null,
        }));

        // Refine with Groq (adds scores, trends, etc.) - process up to 50 models
        const refinedModels = await refineModels(transformedModels.slice(0, 50));

        console.log(`✨ Refined ${refinedModels.length} models with Groq`);

        // Upsert to database
        let upsertedCount = 0;

        for (const model of refinedModels) {
            try {
                // Upsert model
                const { error } = await supabaseAdmin
                    .from('ai_models')
                    .upsert(
                        {
                            id: model.id,
                            name: model.name,
                            brand: model.brand,
                            version: model.version,
                            category: model.category || 'pro',
                            pricing_input_1m: model.pricing_input_1m || 0,
                            pricing_output_1m: model.pricing_output_1m || 0,
                            context_window: model.context_window,
                            score_overall: model.score_overall || 75,
                            score_reasoning: model.score_reasoning || null,
                            score_coding: model.score_coding || null,
                            score_creative: model.score_creative || null,
                            score_speed: model.score_speed || null,
                            trend: model.trend || 'stable',
                            is_new: model.is_new || false,
                            is_active: true,
                            updated_at: new Date().toISOString(),
                        },
                        { onConflict: 'id' }
                    );

                if (!error) {
                    upsertedCount++;

                    // Create/update ai_stats entry for this model
                    await supabaseAdmin
                        .from('ai_stats')
                        .upsert(
                            {
                                model_id: model.id,
                                benchmark_score: model.score_overall || 75,
                                community_score: null,
                                avg_speed: null,
                                avg_precision: null,
                                avg_hallucination: null,
                                reviews_count: 0,
                                updated_at: new Date().toISOString(),
                            },
                            { onConflict: 'model_id' }
                        );
                } else {
                    console.error(`Failed to upsert model ${model.id}:`, error);
                }
            } catch (err) {
                console.error(`Error upserting model ${model.id}:`, err);
            }
        }

        console.log(`✅ Model sync complete: ${upsertedCount} models upserted`);
        return upsertedCount;
    } catch (error) {
        console.error('❌ Model sync failed:', error);
        throw error;
    }
}

// Helper to categorize models
function categorizeModel(model: OpenRouterModel): string {
    const id = model.id.toLowerCase();
    const name = model.name.toLowerCase();

    if (id.includes('vision') || id.includes('vl')) return 'vision';
    if (id.includes('code') || name.includes('code')) return 'coding';
    if (id.includes('instruct')) return 'assistant';
    if (id.includes('chat')) return 'chat';
    if (id.includes('turbo') || id.includes('fast')) return 'fast';

    return 'general';
}

export default syncModels;
