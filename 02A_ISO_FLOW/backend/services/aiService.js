/**
 * IA-Flow - AI Service
 * Handles communication with Groq and Gemini APIs
 */

import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ==========================================
// Logging Utilities
// ==========================================

/**
 * Format timestamp for logs
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Truncate text for logging (prevent huge logs)
 */
function truncate(text, maxLength = 200) {
    if (!text) return '[empty]';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + `... [+${text.length - maxLength} chars]`;
}

/**
 * Log with prefix
 */
function log(level, component, message, data = null) {
    const prefix = `[${getTimestamp()}] [${level}] [${component}]`;
    if (data) {
        console.log(`${prefix} ${message}`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
    } else {
        console.log(`${prefix} ${message}`);
    }
}

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
    log('INFO', 'AI-SERVICE', '═══════════════════════════════════════════════════════');
    log('INFO', 'AI-SERVICE', '🚀 NEW AI REQUEST');
    log('INFO', 'AI-SERVICE', `📝 User Message: ${truncate(userMessage, 300)}`);
    log('DEBUG', 'AI-SERVICE', `📋 System Prompt Preview: ${truncate(systemPrompt, 150)}`);
    log('DEBUG', 'AI-SERVICE', `📊 Context History Length: ${context.history?.length || 0} messages`);

    // Try Groq first
    log('INFO', 'AI-SERVICE', '🔄 Attempting Groq API...');
    const groqResponse = await tryGroq(systemPrompt, userMessage, context);
    if (groqResponse.success) {
        log('INFO', 'AI-SERVICE', '✅ GROQ SUCCESS');
        log('INFO', 'AI-SERVICE', `📤 Response Preview: ${truncate(groqResponse.response, 300)}`);
        if (groqResponse.usage) {
            log('INFO', 'AI-SERVICE', `📊 Token Usage: prompt=${groqResponse.usage.prompt_tokens}, completion=${groqResponse.usage.completion_tokens}, total=${groqResponse.usage.total_tokens}`);
        }
        log('INFO', 'AI-SERVICE', '═══════════════════════════════════════════════════════');
        return groqResponse;
    }

    // Fallback to Gemini
    log('WARN', 'AI-SERVICE', '⚠️ All Groq keys failed, falling back to Gemini');
    const geminiResult = await tryGemini(systemPrompt, userMessage, context);
    if (geminiResult.success) {
        log('INFO', 'AI-SERVICE', '✅ GEMINI SUCCESS');
        log('INFO', 'AI-SERVICE', `📤 Response Preview: ${truncate(geminiResult.response, 300)}`);
    } else {
        log('ERROR', 'AI-SERVICE', '❌ ALL AI PROVIDERS FAILED', { error: geminiResult.error });
    }
    log('INFO', 'AI-SERVICE', '═══════════════════════════════════════════════════════');
    return geminiResult;
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
            log('WARN', 'GROQ', 'No Groq API keys configured');
            return { success: false, error: 'No Groq API keys configured' };
        }

        try {
            log('DEBUG', 'GROQ', `🔑 Trying key index ${currentGroqKeyIndex}/${groqKeys.length}`);

            const messages = [
                { role: 'system', content: systemPrompt }
            ];

            // Add context messages if available
            if (context.history && Array.isArray(context.history)) {
                messages.push(...context.history);
            }

            messages.push({ role: 'user', content: userMessage });

            log('DEBUG', 'GROQ', `📨 Sending ${messages.length} messages to Groq (model: llama-3.3-70b-versatile)`);
            const startTime = Date.now();

            const response = await client.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages,
                temperature: 0.7,
                max_tokens: 4096
            });

            const duration = Date.now() - startTime;
            log('INFO', 'GROQ', `⏱️ Response received in ${duration}ms`);

            const content = response.choices[0]?.message?.content || '';
            log('DEBUG', 'GROQ', `📝 Response length: ${content.length} chars`);

            return {
                success: true,
                provider: 'groq',
                response: content,
                usage: response.usage
            };
        } catch (error) {
            log('WARN', 'GROQ', `❌ Key ${currentGroqKeyIndex} failed: ${error.message}`);

            // If rate limited, try next key
            if (error.status === 429) {
                log('WARN', 'GROQ', '⏳ Rate limited, trying next key...');
                continue;
            }

            // For other errors, still try next key
            continue;
        }
    }

    log('ERROR', 'GROQ', '❌ All Groq keys exhausted');
    return { success: false, error: 'All Groq keys exhausted' };
}

/**
 * Try to get response from Gemini
 */
async function tryGemini(systemPrompt, userMessage, context) {
    initializeClients();

    if (!geminiClient) {
        log('ERROR', 'GEMINI', 'No Gemini API key configured');
        return {
            success: false,
            error: 'No Gemini API key configured and all Groq keys failed'
        };
    }

    try {
        log('DEBUG', 'GEMINI', 'Attempting Gemini API (model: gemini-1.5-flash)');
        const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build the prompt
        const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;
        log('DEBUG', 'GEMINI', `📨 Sending prompt (${fullPrompt.length} chars)`);

        const startTime = Date.now();
        const result = await model.generateContent(fullPrompt);
        const duration = Date.now() - startTime;

        const response = result.response;
        const content = response.text();

        log('INFO', 'GEMINI', `⏱️ Response received in ${duration}ms`);
        log('DEBUG', 'GEMINI', `📝 Response length: ${content.length} chars`);

        return {
            success: true,
            provider: 'gemini',
            response: content
        };
    } catch (error) {
        log('ERROR', 'GEMINI', `❌ Gemini failed: ${error.message}`);
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
