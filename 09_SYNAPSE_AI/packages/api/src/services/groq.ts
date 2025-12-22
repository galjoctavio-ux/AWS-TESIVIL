import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';

// Lazy initialization to allow dotenv to load first
let groqInstance: Groq | null = null;

function getGroq(): Groq {
    if (!groqInstance) {
        if (!process.env.GROQ_API_KEY) {
            console.warn('⚠️ GROQ_API_KEY not set - Groq features will not work');
        } else {
            console.log('✅ GROQ_API_KEY loaded successfully');
        }
        groqInstance = new Groq({
            apiKey: process.env.GROQ_API_KEY || 'dummy-key',
        });
    }
    return groqInstance;
}

// Load prompts from files - use process.cwd() for reliable path resolution
const PROMPTS_DIR = path.join(process.cwd(), '../../packages/prompts');

function loadPrompt(modulePath: string): string {
    const fullPath = path.join(PROMPTS_DIR, modulePath);
    console.log(`📂 Loading prompt from: ${fullPath}`);
    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        console.log(`✅ Prompt loaded successfully (${content.length} chars)`);
        return content;
    } catch (error) {
        console.error(`❌ Failed to load prompt: ${fullPath}`, error);
        return '';
    }
}

// ═══════════════════════════════════════════════════════════════
// ENGINE MODULE - Prompt Generator
// ═══════════════════════════════════════════════════════════════

export async function enrichPrompt(rawInput: string): Promise<string> {
    console.log(`🔧 enrichPrompt called with: "${rawInput}"`);
    const systemPrompt = loadPrompt('engine/layer_a_enrichment.txt');

    if (!systemPrompt) {
        throw new Error('Failed to load system prompt');
    }

    try {
        const response = await getGroq().chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 100,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: rawInput },
            ],
        });

        console.log('✅ Groq response received');
        return response.choices[0]?.message?.content || rawInput;
    } catch (error: any) {
        console.error('❌ Groq API error:', error.message);
        throw error;
    }
}

export async function assemblePrompt(
    description: string,
    config: {
        style: string;
        lighting: string;
        lensOrTechnique: string;
        aspectRatio: string;
        targetEngine: string;
    }
): Promise<{ prompt: string; negativePrompt: string }> {
    let systemPrompt = loadPrompt('engine/layer_b_assembler.txt');

    // Replace variables
    systemPrompt = systemPrompt
        .replace('{MOTOR_SELECCIONADO}', config.targetEngine)
        .replace('{RATIO}', config.aspectRatio);

    const userMessage = `
    Descripción: ${description}
    Estilo: ${config.style}
    Iluminación: ${config.lighting}
    ${config.lensOrTechnique ? `Lente/Técnica: ${config.lensOrTechnique}` : ''}
    Formato: ${config.aspectRatio}
  `;

    const response = await getGroq().chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 200,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
        ],
    });

    const prompt = response.choices[0]?.message?.content || '';

    // Get negative prompt from config (defined in assembler file)
    const negativePrompts: Record<string, string> = {
        fotorealismo: '--no cartoon, drawing, anime, text, watermark',
        arquitectura: '--no cartoon, illustration, people, text',
        minimalismo: '--no busy, cluttered, detailed, noise',
        anime: '--no realistic, photo, 3d, western',
        '3d_pixar': '--no 2d, flat, sketch, realistic',
        cyberpunk: '--no daylight, natural, vintage, old',
        oleo: '--no photo, digital, sharp, modern',
        arte_digital: '--no photo, traditional, noise, blur',
    };

    return {
        prompt,
        negativePrompt: negativePrompts[config.style] || '',
    };
}

// ═══════════════════════════════════════════════════════════════
// PULSE MODULE - Model Sync
// ═══════════════════════════════════════════════════════════════

export async function refineModels(rawModels: any[]): Promise<any[]> {
    const systemPrompt = loadPrompt('pulse/model_refiner.txt');

    try {
        const response = await getGroq().chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
            max_tokens: 4000,
            messages: [
                { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Respond ONLY with a valid JSON array, no extra text.' },
                { role: 'user', content: JSON.stringify(rawModels) },
            ],
        });

        const content = response.choices[0]?.message?.content || '[]';

        // Try to extract JSON array from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        // If no JSON array found, return raw models with default scores
        console.warn('No JSON array in Groq response, using raw models with defaults');
        return rawModels.map(m => ({
            ...m,
            score_overall: 70,
            score_reasoning: null,
            score_coding: null,
            score_creative: null,
            score_speed: null,
            trend: 'stable',
            is_new: false,
        }));
    } catch (error) {
        console.error('Failed to refine models with Groq:', error);
        // Return raw models with defaults as fallback
        return rawModels.map(m => ({
            ...m,
            score_overall: 70,
            trend: 'stable',
            is_new: false,
        }));
    }
}

// ═══════════════════════════════════════════════════════════════
// SHOWCASE MODULE - Comment Moderation
// ═══════════════════════════════════════════════════════════════

export interface ModerationResult {
    approved: boolean;
    type: 'pregunta_tecnica' | 'felicitacion' | 'feedback' | 'neutral' | 'spam' | 'toxico';
    reason: string;
}

export async function moderateComment(content: string): Promise<ModerationResult> {
    const systemPrompt = loadPrompt('showcase/comment_moderator.txt');

    const response = await getGroq().chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 200,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content },
        ],
    });

    try {
        const result = JSON.parse(response.choices[0]?.message?.content || '{}');
        return {
            approved: result.approved ?? false,
            type: result.type ?? 'neutral',
            reason: result.reason ?? 'Error de moderación',
        };
    } catch (error) {
        console.error('Failed to parse moderation result:', error);
        return {
            approved: false,
            type: 'neutral',
            reason: 'Error al procesar moderación',
        };
    }
}

export default getGroq;
