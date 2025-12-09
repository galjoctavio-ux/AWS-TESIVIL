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
    const today = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'full', timeStyle: 'short' });

    const prompt = `
    Eres el asistente IA del CRM de "Luz en tu Espacio" (Ingenieros Electricistas).
    Hoy es: ${today}.
    
    Analiza el chat y define la PRÓXIMA ACCIÓN.
    
    REGLAS CRÍTICAS (PRIORIDAD ALTA):
    1. SI EL ÚLTIMO MENSAJE ES DEL CLIENTE y es una pregunta, saludo, o solicitud de info que NO hemos respondido -> TU RESPUESTA DEBE SER "NONE". (El humano debe contestar primero).
    2. SI SE HABLA DE PAGOS/ANTICIPOS/DINERO en los últimos mensajes -> TU RESPUESTA DEBE SER "NONE". (Delicado, lo maneja el humano).
    3. TEMAS IRRELEVANTES (SEO, Marketing, Google Links) -> "NONE".
    
    SI NO APLICA NINGUNA REGLA ANTERIOR, CLASIFICA ASÍ:

    [APPOINTMENT]
    El cliente confirmó explícitamente fecha y hora.
    - OJO CON LA HORA: "11" suele ser 11:00 AM. "3" o "5" suele ser PM (15:00, 17:00). Usa lógica de horario laboral (9am-7pm).
    - Formato Salida: ISO estricto.

    [NO_REPLY] (Ghosting)
    El ÚLTIMO mensaje es de "Soporte/Técnico" (nosotros) y el cliente NO ha respondido en absoluto.
    - Si el cliente mostró interés antes pero nos dejó en visto -> NO_REPLY.
    
    [SOFT_FOLLOWUP] (Seguimiento Suave 23h)
    El cliente respondió, pero pidió tiempo o quedó en avisar.
    - Ejemplos: "Déjame ver", "Le pregunto a mi esposo", "Yo les aviso".
    - Si el cliente dijo solo "Ok" o "Gracias" y nosotros ya dimos toda la info -> SOFT_FOLLOWUP (para reactivar venta).

    [FUTURE_CONTACT]
    El cliente pide explícitamente que lo busquemos en el futuro.
    - "Enero", "La próxima semana", "El lunes".

    Historial:
    ---
    ${historyText}
    ---
    
    Responde SOLO JSON:
    {
      "intent": "APPOINTMENT" | "FUTURE_CONTACT" | "SOFT_FOLLOWUP" | "NO_REPLY" | "NONE",
      "appointment_date_iso": "YYYY-MM-DD HH:mm:00" (o null),
      "reasoning": "Por qué elegiste esto y por qué esa hora"
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