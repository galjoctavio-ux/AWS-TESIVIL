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
            slug: m.id,
            name: m.name,
            provider_id: m.id.split('/')[0] || 'unknown',
            category: categorizeModel(m),
            description: m.description || null,
            pricing_input: parseFloat(m.pricing.prompt) || 0,
            pricing_output: parseFloat(m.pricing.completion) || 0,
            context_length: m.context_length || m.top_provider?.context_length || null,
        }));

        // Refine with Groq (adds scores, trends, etc.)
        const refinedModels = await refineModels(transformedModels.slice(0, 20));

        console.log(`✨ Refined ${refinedModels.length} models with Groq`);

        // Upsert to database
        let upsertedCount = 0;

        for (const model of refinedModels) {
            try {
                const { error } = await supabaseAdmin
                    .from('ai_models')
                    .upsert(
                        {
                            slug: model.slug,
                            name: model.name,
                            provider_id: model.provider_id,
                            category: model.category || 'general',
                            description: model.description,
                            pricing_input: model.pricing_input || 0,
                            pricing_output: model.pricing_output || 0,
                            context_length: model.context_length,
                            score_overall: model.score_overall || 0,
                            score_reasoning: model.score_reasoning || null,
                            score_coding: model.score_coding || null,
                            score_creative: model.score_creative || null,
                            score_speed: model.score_speed || null,
                            trend: model.trend || 'stable',
                            is_new: model.is_new || false,
                            synced_at: new Date().toISOString(),
                        },
                        { onConflict: 'slug' }
                    );

                if (!error) {
                    upsertedCount++;
                } else {
                    console.error(`Failed to upsert model ${model.slug}:`, error);
                }
            } catch (err) {
                console.error(`Error upserting model ${model.slug}:`, err);
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
