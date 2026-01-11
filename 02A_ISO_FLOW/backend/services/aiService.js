/**
 * IA-Flow - AI Service
 * Handles communication with Groq and Gemini APIs
 */

import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy loaded API keys
let groqKeys = null;
let currentGroqKeyIndex = 0;
let geminiClient = null;
let initialized = false;

/**
 * Initialize API clients (lazy loading)
 */
function initializeClients() {
    if (initialized) return;

    // Load Groq keys
    groqKeys = [
        process.env.GROQ_API_KEY_1,
        process.env.GROQ_API_KEY_2,
        process.env.GROQ_API_KEY_3,
        process.env.GROQ_API_KEY_4,
        process.env.GROQ_API_KEY_5,
        process.env.GROQ_API_KEY_6
    ].filter(Boolean);

    console.log(`📊 Loaded ${groqKeys.length} Groq API keys`);

    // Load Gemini client
    if (process.env.GEMINI_API_KEY) {
        geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('✅ Gemini API configured');
    } else {
        console.warn('⚠️ No Gemini API key found');
    }

    initialized = true;
}

/**
 * Get the next Groq client (round-robin rotation)
 */
function getNextGroqClient() {
    initializeClients();

    if (!groqKeys || groqKeys.length === 0) {
        return null;
    }

    const key = groqKeys[currentGroqKeyIndex];
    currentGroqKeyIndex = (currentGroqKeyIndex + 1) % groqKeys.length;

    return new Groq({ apiKey: key });
}

/**
 * Send a message to AI and get a response
 * @param {string} systemPrompt - The system prompt for the AI
 * @param {string} userMessage - The user's message
 * @param {Object} context - Additional context
 * @returns {Promise<Object>} - AI response with metadata
 */
export async function sendMessage(systemPrompt, userMessage, context = {}) {
    // Try Groq first
    const groqResponse = await tryGroq(systemPrompt, userMessage, context);
    if (groqResponse.success) {
        return groqResponse;
    }

    // Fallback to Gemini
    console.log('⚠️ All Groq keys failed, falling back to Gemini');
    return await tryGemini(systemPrompt, userMessage, context);
}

/**
 * Try to get response from Groq
 */
async function tryGroq(systemPrompt, userMessage, context) {
    initializeClients();
    const maxRetries = groqKeys ? groqKeys.length : 0;

    for (let i = 0; i < maxRetries; i++) {
        const client = getNextGroqClient();
        if (!client) {
            return { success: false, error: 'No Groq API keys configured' };
        }

        try {
            const messages = [
                { role: 'system', content: systemPrompt }
            ];

            // Add context messages if available
            if (context.history && Array.isArray(context.history)) {
                messages.push(...context.history);
            }

            messages.push({ role: 'user', content: userMessage });

            const response = await client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.7,
                max_tokens: 4096
            });

            const content = response.choices[0]?.message?.content || '';

            return {
                success: true,
                provider: 'groq',
                response: content,
                usage: response.usage
            };
        } catch (error) {
            console.error(`Groq key ${currentGroqKeyIndex} failed:`, error.message);

            // If rate limited, try next key
            if (error.status === 429) {
                continue;
            }

            // For other errors, still try next key
            continue;
        }
    }

    return { success: false, error: 'All Groq keys exhausted' };
}

/**
 * Try to get response from Gemini
 */
async function tryGemini(systemPrompt, userMessage, context) {
    initializeClients();

    if (!geminiClient) {
        return {
            success: false,
            error: 'No Gemini API key configured and all Groq keys failed'
        };
    }

    try {
        const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build the prompt
        const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const content = response.text();

        return {
            success: true,
            provider: 'gemini',
            response: content
        };
    } catch (error) {
        console.error('Gemini failed:', error.message);
        return {
            success: false,
            error: 'AI service temporarily unavailable'
        };
    }
}

/**
 * Extract data from AI response using pattern matching
 */
export function extractDataFromResponse(response) {
    const data = {};

    // Extract TOTAL_FUNCIONES
    const funcionesMatch = response.match(/TOTAL_FUNCIONES[:\s]+(\d+)/i);
    if (funcionesMatch) {
        data.totalFunciones = parseInt(funcionesMatch[1]);
    }

    // Extract [CONTEXTO V{N}] block
    const contextoMatch = response.match(/\[CONTEXTO V\d+\]([\s\S]*?)(?=\[|$)/);
    if (contextoMatch) {
        data.contexto = contextoMatch[1].trim();

        // Parse context details
        const ideasMatch = data.contexto.match(/Ideas Centrales Confirmadas[:\s]*([\s\S]*?)(?=\n-|\n\n|$)/i);
        if (ideasMatch) {
            data.ideasCentrales = ideasMatch[1].trim();
        }
    }

    // Extract software type
    const softwareMatch = response.match(/(?:Tipo de software|software type)[:\s]*(\w+)/i);
    if (softwareMatch) {
        data.softwareType = softwareMatch[1].toLowerCase();
    }

    // Extract [ESTADO_SINC_ANTIGRAVITY] requirements
    const antigravityMatch = response.match(/\[ESTADO_SINC_ANTIGRAVITY\]/);
    if (antigravityMatch) {
        data.requiresAntigravity = true;
    }

    return data;
}

/**
 * Get API status
 */
export function getApiStatus() {
    return {
        groqKeysAvailable: groqKeys.length,
        geminiAvailable: !!geminiClient,
        currentGroqKeyIndex
    };
}

export default {
    sendMessage,
    extractDataFromResponse,
    getApiStatus
};
