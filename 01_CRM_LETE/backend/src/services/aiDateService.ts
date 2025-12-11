import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

interface AIAnalysisResult {
    intent: 'APPOINTMENT' | 'FUTURE_CONTACT' | 'SOFT_FOLLOWUP' | 'NO_REPLY' | 'QUOTE_FOLLOWUP' | 'NONE';
    appointment_date_iso: string | null;
    reasoning: string;
}

export const analyzeChatForAppointment = async (conversationId: string, historyText: string): Promise<AIAnalysisResult | null> => {
    // Fecha actual formateada para México (La IA necesita contexto temporal)
    const today = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'full', timeStyle: 'short' });

    const prompt = `
    Eres el asistente IA de ventas de "Luz en tu Espacio". Hoy es: ${today}.
    Tu objetivo es definir la PRÓXIMA ACCIÓN basándote en el historial.

    --- 🛡️ REGLAS DE SEGURIDAD ANTI-SPAM (PRIORIDAD ABSOLUTA) 🛡️ ---
    
    1. LEY DEL "YA INTENTÉ" (Evitar Bucle Infinito): 
       - Mira el ÚLTIMO mensaje del historial.
       - Si es de "Soporte/Técnico" (nosotros) y es un mensaje de SEGUIMIENTO (ej: "¿Aún tienes problemas?", "¿Cerramos tu expediente?", "¿Sigues interesado?", "¿Pudiste revisar?", "Quedo atento").
       - Y el cliente NO ha respondido a ese mensaje específico...
       - ENTONCES LA INTENCIÓN ES: "NONE".
       - (Razón: Ya le mandamos el seguimiento ayer. No le mandes otro hoy. Esperamos su respuesta).

    2. LEY DE LAS "LLAVES / TRÁMITE":
       - Si el cliente dice: "Me entregan las llaves tal día", "Estoy esperando terminar trámite", "Apenas voy a recibir la casa", "Me avisan cuando escriture"...
       - ENTONCES LA INTENCIÓN ES: "FUTURE_CONTACT".
       - Calcula una fecha prudente (ej. 15 días después) para preguntar: "¿Cómo te fue con la entrega?".
       - NO uses "SOFT_FOLLOWUP" ni "NO_REPLY" aquí. Déjalos respirar.

    3. CLIENTE "GUARDARROPA" O INTERRUPCIÓN:
       - Si dice "Solo para tener el dato" -> INTENT: "NONE".
       - Si el cliente hizo una pregunta y NOSOTROS NO HEMOS RESPONDIDO -> INTENT: "NONE" (Toca responder manual).
       - Temas ajenos (Marketing, SEO) -> INTENT: "NONE".

    --- CLASIFICACIÓN DE INTENCIONES (Si pasa las reglas anteriores) ---

    [QUOTE_FOLLOWUP] (Seguimiento de Cotización)
    Los últimos mensajes hablan explícitamente de haber enviado:
    - "Cotización", "Presupuesto", "Propuesta", "Costo final", "Archivo adjunto" o "PDF".
    - Y el cliente NO respondió o dijo "lo reviso", "dejame consultarlo".
    - PRIORIDAD ALTA: Úsalo sobre [NO_REPLY] si hay una propuesta económica sobre la mesa.

    [APPOINTMENT]
    El cliente confirmó fecha y hora explícitamente para la visita.
    - IMPORTANTE: Debes devolver la fecha en formato ISO con OFFSET DE +6 horas (+06:00) o en UTC correcto.
    - Ejemplo: Si es a las 11am, devuelve "...T17:00:00".

    [NO_REPLY] (Recuperación de Venta / Ghosting)
    El cliente mostró interés, nosotros dimos información general o precio base ($400), y luego hubo SILENCIO.
    - Condición: El último mensaje NO debe ser un intento de recuperación nuestro (ver Regla 1).
    - Úsalo cuando el cliente se quedó callado justo después de darle info inicial.
    - Si Soporte envió el saludo estándar ("Buen día... Qué servicio te podemos ofrecer?") y nadie contestó -> ES NO_REPLY.

    [SOFT_FOLLOWUP] 
    El cliente respondió pero pidió tiempo corto ("Déjame ver", "Le pregunto a mi esposo", "Yo les aviso en la semana").
    - Aquí el cliente SÍ contestó el último mensaje, pero postergó la decisión.

    [FUTURE_CONTACT] (FUSIÓN: Fechas Específicas + Esperas Vagas)
    Úsalo en DOS casos:
    1. FECHA CLARA: El cliente dice "búscame en enero", "el lunes", "la próxima semana".
       -> Calcula la fecha exacta solicitada.
    2. ESPERA VAGA ("SOFT"): El cliente pide tiempo sin fecha ("Déjame ver", "Lo checo con mi esposo", "Yo les aviso", "Estoy revisando números").
       -> REGLA DE ESTIMACIÓN: En estos casos vagos, programa para dentro de **2 a 3 DÍAS** a las 11:00 AM o 5:00 PM.
       -> NO uses fecha de mañana (muy pronto), dales espacio.

    Historial del chat:
    ---
    ${historyText}
    ---
    
    Responde SOLO JSON:
    {
      "intent": "APPOINTMENT" | "FUTURE_CONTACT" | "NO_REPLY" | "QUOTE_FOLLOWUP" | "NONE",
      "appointment_date_iso": "YYYY-MM-DDTHH:mm:00-06:00" (Asegúrate de poner el offset correcto o UTC),
      "reasoning": "Breve explicación de por qué aplicaste la regla"
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