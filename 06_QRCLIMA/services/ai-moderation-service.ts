/**
 * AI Moderation Service - Groq API
 * Modera comentarios de training en tiempo real
 */

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ModerationResult {
    approved: boolean;
    reason: string;
    expertBadge: boolean;
    toxicityScore: number;
}

/**
 * Modera un comentario usando Groq AI
 * Retorna si debe aprobarse, rechazarse o si merece badge de experto
 */
export const moderateComment = async (content: string): Promise<ModerationResult> => {
    // Si no hay API key, aprobar por defecto (modo desarrollo)
    if (!GROQ_API_KEY) {
        console.warn('GROQ_API_KEY not set, approving comment by default');
        return {
            approved: true,
            reason: 'Auto-approved (development mode)',
            expertBadge: false,
            toxicityScore: 0
        };
    }

    try {
        const systemPrompt = `Eres un moderador técnico de la app Mr. Frío, una comunidad de técnicos de aire acondicionado. 

Tu objetivo es evaluar comentarios y determinar:
1. Si el comentario es útil para técnicos (experiencia técnica, dudas reales, tips prácticos)
2. Si debe rechazarse (insultos, lenguaje vulgar, consejos peligrosos, spam)
3. Si aporta un tip de experto valioso que merece reconocimiento

Responde ÚNICAMENTE en formato JSON:
{
    "approved": true/false,
    "reason": "explicación breve",
    "expert_badge": true/false,
    "toxicity_score": 0-10
}

Criterios:
- approved: true si aporta experiencia, dudas técnicas o tips útiles
- approved: false si contiene insultos, vulgaridades, spam, o consejos peligrosos
- expert_badge: true SOLO si aporta conocimiento técnico excepcional
- toxicity_score: 0-3 normal, 4-6 cuestionable, 7-10 ofensivo`;

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Evalúa este comentario de un técnico:\n\n"${content}"` }
                ],
                temperature: 0.1,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            console.error('Groq API error:', response.status);
            // Fallback: aprobar con advertencia
            return {
                approved: true,
                reason: 'Auto-approved (API error)',
                expertBadge: false,
                toxicityScore: 0
            };
        }

        const data = await response.json();
        const messageContent = data.choices[0]?.message?.content || '';

        // Parsear respuesta JSON
        try {
            const parsed = JSON.parse(messageContent);
            return {
                approved: parsed.approved ?? true,
                reason: parsed.reason || 'Evaluado por IA',
                expertBadge: parsed.expert_badge ?? false,
                toxicityScore: parsed.toxicity_score ?? 0
            };
        } catch {
            // Si no se puede parsear, aprobar por defecto
            return {
                approved: true,
                reason: 'Auto-approved (parse error)',
                expertBadge: false,
                toxicityScore: 0
            };
        }
    } catch (error) {
        console.error('Moderation error:', error);
        return {
            approved: true,
            reason: 'Auto-approved (network error)',
            expertBadge: false,
            toxicityScore: 0
        };
    }
};

/**
 * Modera contenido de forma local (sin API) usando reglas básicas
 * Útil para desarrollo o como fallback
 */
export const moderateContentLocal = (content: string): ModerationResult => {
    const lowerContent = content.toLowerCase();

    // Lista de palabras prohibidas básicas
    const bannedWords = ['idiota', 'estúpido', 'pendejo', 'imbécil', 'mierda', 'chingar'];
    const dangerousTerms = ['sin desconectar', 'con corriente', 'sin apagar', 'energizado'];

    // Verificar palabras prohibidas
    for (const word of bannedWords) {
        if (lowerContent.includes(word)) {
            return {
                approved: false,
                reason: 'Contenido ofensivo detectado',
                expertBadge: false,
                toxicityScore: 8
            };
        }
    }

    // Verificar consejos peligrosos
    for (const term of dangerousTerms) {
        if (lowerContent.includes(term)) {
            return {
                approved: false,
                reason: 'Consejo potencialmente peligroso',
                expertBadge: false,
                toxicityScore: 6
            };
        }
    }

    // Detectar posible tip de experto (menciona medidas específicas)
    const expertPatterns = [
        /\d+\s*(ohm|µf|psi|volt|amp|micr)/i,
        /según\s*(norma|manual|fabricante)/i,
        /en\s*mi\s*experiencia/i,
        /el\s*truco\s*es/i
    ];

    const isExpertTip = expertPatterns.some(pattern => pattern.test(content));

    return {
        approved: true,
        reason: isExpertTip ? 'Tip técnico detectado' : 'Contenido aprobado',
        expertBadge: isExpertTip && content.length > 100,
        toxicityScore: 0
    };
};
