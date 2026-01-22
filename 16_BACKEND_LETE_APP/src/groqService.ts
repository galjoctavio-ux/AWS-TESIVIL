/**
 * Groq Service - Chat Analyzer
 * Servicio de IA con rotación de API keys
 * CORREGIDO: Modelo actualizado y protección de recursión
 */

import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Cargar todas las API keys disponibles
const apiKeys: string[] = [];
for (let i = 1; i <= 5; i++) {
    const key = process.env[`GROQ_API_KEY_${i}`];
    if (key && key !== `your_key_${i}`) {
        apiKeys.push(key);
    }
}

if (apiKeys.length === 0) {
    console.error('❌ Error: No se encontraron API keys de Groq válidas');
    process.exit(1);
}

console.log(`🔑 Groq: ${apiKeys.length} API keys cargadas para rotación`);

let currentKeyIndex = 0;

/**
 * Obtiene un cliente Groq con la siguiente API key (Round Robin)
 */
const getGroqClient = (): Groq => {
    const key = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return new Groq({ apiKey: key });
};

// Tipos para las intenciones definidas
export type ChatIntent =
    | 'agendado_sin_cita'        // a) agendado y sin cita
    | 'agendado_con_cita'        // b) agendado con cita
    | 'cita_hoy'                 // c) agendado y su cita es hoy
    | 'fantasma'                 // d) ghosteado
    | 'cliente_archivado'        // e) clientes archivados
    | 'felicitacion'             // f) felicitaciones
    | 'pendiente_cotizacion'     // g) pendiente cotización
    | 'pendiente_autorizacion'   // h) pendiente autorización
    | 'no_contestado'            // i) no contestado
    | 'sin_accion';              // Sin acciones pendientes

export interface AnalysisResult {
    intent: ChatIntent;
    confidence: number;
    suggestion: string;
    metadata?: {
        citaHora?: string;
        clienteNombre?: string;
        cotizacionId?: string;
    };
}

/**
 * Analiza un historial de chat y clasifica la intención
 * @param retryCount - Contador interno para evitar bucles infinitos
 */
export const analyzeChat = async (
    clienteNombre: string,
    mensajes: { role: string; content: string; created_at: string }[],
    citaHoy?: { hora: string } | null,
    retryCount = 0
): Promise<AnalysisResult> => {
    const groq = getGroqClient();

    // Formatear mensajes para el prompt
    const chatHistory = mensajes
        .map(m => `[${m.role === 'user' ? 'CLIENTE' : 'ADMIN'}]: ${m.content}`)
        .join('\n');

    const systemPrompt = `Eres un asistente que analiza conversaciones de WhatsApp de una empresa de servicios eléctricos.
Tu tarea es clasificar la conversación en UNA de las siguientes categorías:

1. "cita_hoy" - El cliente tiene una cita programada para HOY
2. "fantasma" - El cliente contactó, el admin respondió, pero el cliente no volvió a escribir
3. "no_contestado" - El cliente escribió pero el admin NO le ha respondido
4. "pendiente_cotizacion" - Se le prometió enviar una cotización pero no se ha enviado
5. "pendiente_autorizacion" - Se envió cotización y el cliente no ha confirmado
6. "agendado_sin_cita" - El cliente quiere agendar pero no hay cita en sistema
7. "cliente_archivado" - Ya pasó su cita y no hubo más interacción
8. "felicitacion" - El cliente felicitó por el servicio recibido
9. "agendado_con_cita" - Todo está en orden, tiene cita confirmada
10. "sin_accion" - No se requiere ninguna acción

Responde SOLO con un JSON válido con estos campos:
- intent: string (una de las categorías anteriores)
- confidence: number (0-1)
- suggestion: string (mensaje sugerido para enviar, si aplica)`;

    const userPrompt = `Cliente: ${clienteNombre}
${citaHoy ? `⚠️ NOTA: Este cliente tiene una cita HOY a las ${citaHoy.hora}` : ''}

Historial de chat (últimos mensajes):
${chatHistory}

Analiza y clasifica:`;

    try {
        const completion = await groq.chat.completions.create({
            // CORRECCIÓN: Modelo actualizado a versión vigente
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 500,
            response_format: { type: 'json_object' }
        });

        const response = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(response);

        return {
            intent: parsed.intent || 'sin_accion',
            confidence: parsed.confidence || 0.5,
            suggestion: parsed.suggestion || '',
            metadata: {
                clienteNombre
            }
        };
    } catch (error: any) {
        console.error(`❌ Error en Groq API:`, error.message);

        // CORRECCIÓN: Evitar reintentos si el error es de configuración (400)
        // O si ya probamos todas las llaves
        if (error.status !== 400 && retryCount < apiKeys.length - 1) {
            console.log(`🔄 Intentando con llave ${currentKeyIndex + 1}...`);
            return analyzeChat(clienteNombre, mensajes, citaHoy, retryCount + 1);
        }

        return {
            intent: 'sin_accion',
            confidence: 0,
            suggestion: 'Error en análisis de IA'
        };
    }
};