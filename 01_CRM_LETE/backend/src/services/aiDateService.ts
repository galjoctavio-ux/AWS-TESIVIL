import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from '../config/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

interface AIAnalysisResult {
    intent: 'APPOINTMENT' | 'FUTURE_CONTACT' | 'SOFT_FOLLOWUP' | 'NO_REPLY' | 'NONE';
    appointment_date_iso: string | null;
    reasoning: string;
}

export const analyzeChatForAppointment = async (conversationId: string, historyText: string): Promise<AIAnalysisResult | null> => {
    // Fecha actual formateada
    const today = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'full', timeStyle: 'short' });

    const prompt = `
    Eres el asistente IA de ventas de "Luz en tu Espacio". Hoy es: ${today}.
    Tu objetivo es definir la PRÓXIMA ACCIÓN.

    --- REGLAS DE ORO (PRIORIDAD MÁXIMA) ---
    1. CLIENTE "GUARDARROPA": Si dice "Solo para tener el dato", "Los contacto cuando se ofrezca", "Tenerlos presente" -> INTENT: "NONE". (No molestar).
    2. INTERRUPCIÓN: Si el cliente hizo una pregunta y NOSOTROS NO HEMOS RESPONDIDO -> INTENT: "NONE". (El humano debe responder primero).
    3. TEMAS AJENOS: Si el chat es sobre SEO, Marketing, o temas no eléctricos -> INTENT: "NONE".
    
    --- CLASIFICACIÓN DE INTENCIONES ---

    [APPOINTMENT]
    El cliente confirmó fecha y hora.
    - IMPORTANTE: Debes devolver la fecha en formato ISO con OFFSET DE +6 horas (+06:00).
    - Ejemplo: Si es a las 11am, devuelve "...T17:00:00".
    - Si el cliente dice solo "a las 5", asume 17:00 (5 PM) a menos que especifique "mañana".

    [NO_REPLY] (Recuperación de Venta)
    El ÚLTIMO mensaje es de "Soporte/Técnico" (nosotros) y el cliente NO respondió.
    - CASO CLAVE: Si nosotros dimos PRECIO o INFO COMPLETA y el cliente ya no dijo nada -> ES NO_REPLY (Debemos preguntar si le interesa).
    - Si el cliente mostró interés inicial y luego silencio -> ES NO_REPLY.
    - Normalmente Soporte/Técnico siempre envía el mensaje "Buen día Mi nombre es Monica Hernández de la empresa Ingenieros Electricistas Luz en tu Espacio Qué servicio te podemos ofrecer?" , Si el cliente no responde este mensaje es -> NO_REPLY.

    [SOFT_FOLLOWUP] 
    El cliente respondió pero pidió tiempo ("Déjame ver", "Le pregunto a mi esposo").
    - OJO: Si el cliente dice "Primero me programo y les digo" -> SOFT_FOLLOWUP.

    [FUTURE_CONTACT]
    El cliente da una fecha futura vaga o específica ("En enero", "La próxima semana").
    - Calcula la fecha estimada (ej. Primer lunes de Enero a las 10:00 AM).
    - Formato ISO con offset +06:00.

    Historial del chat:
    ---
    ${historyText}
    ---
    
    Responde SOLO JSON:
    {
      "intent": "APPOINTMENT" | "FUTURE_CONTACT" | "SOFT_FOLLOWUP" | "NO_REPLY" | "NONE",
      "appointment_date_iso": "YYYY-MM-DDTHH:mm:00-06:00" (Asegúrate de poner -06:00 al final),
      "reasoning": "Breve explicación"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error(`[AI Error] ${conversationId}:`, error);
        return null;
    }
};