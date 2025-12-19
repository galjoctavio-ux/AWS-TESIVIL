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
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
        },
    });

    const prompt = `${systemPrompt}\n\n---\n\nNOTICIA A PROCESAR:\n${rawContent}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in Gemini response');
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            title: parsed.title || '',
            bullets: parsed.bullets || [],
            why_it_matters: parsed.why_it_matters || '',
            topic_id: parsed.topic_id || '',
            importance: parsed.importance || 5,
        };
    } catch (error) {
        console.error('Failed to process news with Gemini:', error);
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
