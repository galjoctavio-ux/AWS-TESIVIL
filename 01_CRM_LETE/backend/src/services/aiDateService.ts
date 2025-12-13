// aiDateService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 🆕 NUEVOS ESTADOS DE AUDITORÍA
export interface AIAnalysisResult {
   intent:
   | 'APPOINTMENT'       // Agendó cita
   | 'FUTURE_CONTACT'    // Pide que le hablemos luego
   | 'NO_REPLY'          // Interesado que dejó de contestar
   | 'QUOTE_FOLLOWUP'    // Ya tiene precio, falta cierre
   | 'OPERATIONAL_ALERT' // 🚨 PELIGRO: Prometimos algo y fallamos (Técnico no llegó, sin respuesta nuestra)
   | 'ADMIN_TASK'        // 📄 TRAMITE: Pide factura, cuenta bancaria, dudas de pago
   | 'NONE';             // Todo en orden / No molestar
   appointment_date_iso: string | null;
   reasoning: string;
}

export const analyzeChatForAppointment = async (conversationId: string, historyText: string): Promise<AIAnalysisResult | null> => {
   const today = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'full', timeStyle: 'short' });

   const prompt = `
    Eres el Auditor de Calidad y Asistente IA de "Luz en tu Espacio". 
    Hoy es: ${today}.
    
    Tu objetivo es filtrar qué chats requieren atención INMEDIATA y cuáles ya caducaron.
    
    --- 🛑 REGLAS DE ORO: CUÁNDO RESPONDER "NONE" 🛑 ---
    Si se cumple CUALQUIERA de estas condiciones, tu respuesta debe ser "NONE".
    
    1. LEY DEL SILENCIO POSITIVO (Post-Cita):
       - Si el último mensaje es sobre una cita/visita que YA PASÓ (según la fecha y hora).
       - Ejemplos: "Ahí nos vemos", "Estoy esperando", "Técnico en camino", "Ubicación enviada".
       - Y NO hay mensajes posteriores de reclamo ("Oye no llegaron").
       - ENTONCES: Asume que el servicio se realizó con éxito. El silencio es éxito. -> NONE.

    2. LEY DEL CONFLICTO ENFRIADO (Quejas Viejas):
       - Si hubo una discusión, queja, "mal servicio", o problema técnico.
       - PERO la última interacción tiene MÁS DE 24 HORAS de antigüedad.
       - ENTONCES: El conflicto ya se cerró operativa o administrativamente. No reabrir heridas. -> NONE.
       
    3. LEY DE LA DUDA RESUELTA:
       - Si hubo confusión interna ("no aparece en calendario", "ubicación mal").
       - Y han pasado más de 24 horas sin nuevos mensajes.
       - ENTONCES: Se resolvió por otro medio. -> NONE.

    4. CADUCIDAD GENERAL:
       - Si el último mensaje del cliente tiene más de 15 DÍAS y no dejó una fecha futura explícita. -> NONE.

    --- 🚨 SOLO SI NO APLICA LO ANTERIOR: CLASIFICACIÓN ---

    [OPERATIONAL_ALERT] (Fuego Activo 🔥)
    - Úsalo SOLO si el problema es RECIENTE (Menos de 24 horas) y SIN RESOLVER.
    - El cliente está preguntando AHORA MISMO: "¿Van a venir?", "Sigo esperando", "No ha llegado nadie".
    - Soporte prometió algo HOY y no cumplió.

    [ADMIN_TASK]
    - Cliente pide factura/datos bancarios y NADIE le ha contestado (y el mensaje es reciente, < 3 días).
    
    [APPOINTMENT]
    - Cliente confirma fecha/hora FUTURA (después de ${today}).
    
    [QUOTE_FOLLOWUP]
    - Se envió cotización hace < 10 días y cliente no ha dicho "no".
    
    [NO_REPLY]
    - Cliente pidió info, se la dimos, silencio de 1 a 7 días.
    
    [FUTURE_CONTACT]
    - "Búscame el lunes", "La próxima semana".

    Historial del chat:
    ---
    ${historyText}
    ---
    
    Responde SOLO JSON:
    {
      "intent": "APPOINTMENT" | "FUTURE_CONTACT" | "NO_REPLY" | "QUOTE_FOLLOWUP" | "OPERATIONAL_ALERT" | "ADMIN_TASK" | "NONE",
      "appointment_date_iso": "YYYY-MM-DDTHH:mm:00-06:00" (Solo si aplica),
      "reasoning": "Explica brevemente por qué aplicaste la regla (ej: 'Cita pasada sin reclamos -> Silencio Positivo')"
    }
`;

   try {
      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(cleanJson);
   } catch (error) {
      console.error(`[AI Error] ${conversationId}:`, error);
      return null;
   }
};