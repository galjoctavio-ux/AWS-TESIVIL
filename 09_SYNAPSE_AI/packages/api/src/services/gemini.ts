import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Lazy initialization
let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (!genAIInstance) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('⚠️ GEMINI_API_KEY not set - Gemini features will not work');
        }
        genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');
    }
    return genAIInstance;
}

// Load prompts from files
const PROMPTS_DIR = path.join(__dirname, '../../../prompts');

function loadPrompt(modulePath: string): string {
    const fullPath = path.join(PROMPTS_DIR, modulePath);
    try {
        return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
        console.error(`Failed to load prompt: ${fullPath}`);
        return '';
    }
}

// ═══════════════════════════════════════════════════════════════
// FEED MODULE - News Processing
// ═══════════════════════════════════════════════════════════════

export interface ProcessedNews {
    title: string;
    bullets: string[];
    why_it_matters: string;
    topic_id: string;
    importance: number;
}

export async function processNewsArticle(rawContent: string): Promise<ProcessedNews | null> {
    const systemPrompt = loadPrompt('feed/news_processor.txt');

    const model = getGenAI().getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 5000,
        },
    });

    // Add explicit JSON instruction
    const prompt = `${systemPrompt}

CRITICAL: Respond with ONLY a valid JSON object. No markdown, no extra text.
Format: {"title": "...", "bullets": ["...", "...", "..."], "why_it_matters": "...", "topic_id": "CATEGORY_BRAND_ACTION", "importance": 5}

---

NOTICIA A PROCESAR:
${rawContent}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();

        console.log(`    📝 Gemini (${text.length} chars): ${text.slice(0, 100)}...`);

        // Extract JSON from response (handles ```json ... ``` wrapping)
        let jsonStr = text;

        // Remove markdown code block wrapper if present
        if (text.includes('```json')) {
            const startIdx = text.indexOf('```json') + 7;
            const endIdx = text.lastIndexOf('```');
            if (endIdx > startIdx) {
                jsonStr = text.slice(startIdx, endIdx).trim();
            } else {
                // No closing ```, take everything after ```json
                jsonStr = text.slice(startIdx).trim();
            }
        } else if (text.startsWith('```')) {
            const startIdx = text.indexOf('\n') + 1;
            const endIdx = text.lastIndexOf('```');
            if (endIdx > startIdx) {
                jsonStr = text.slice(startIdx, endIdx).trim();
            } else {
                jsonStr = text.slice(startIdx).trim();
            }
        }

        // Find JSON object in the extracted content
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('    ❌ No JSON object found in:', jsonStr.slice(0, 100));
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            title: parsed.title || '',
            bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
            why_it_matters: parsed.why_it_matters || '',
            topic_id: parsed.topic_id || 'GENERAL_NEWS',
            importance: typeof parsed.importance === 'number' ? parsed.importance : 5,
        };
    } catch (error: any) {
        console.error('    ❌ Gemini error:', error.message);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════
// Check for Duplicates (Semantic Layer)
// ═══════════════════════════════════════════════════════════════

export async function checkDuplicate(
    topicId: string,
    existingTopicIds: string[]
): Promise<boolean> {
    // Layer 2: Check if topic_id exists in recent articles
    if (existingTopicIds.includes(topicId)) {
        return true;
    }

    // For more sophisticated semantic dedup, could use embeddings here
    // For MVP, exact match is sufficient
    return false;
}

export default getGenAI;
