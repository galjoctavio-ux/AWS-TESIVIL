// aiDateService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Usamos flash para rapidez y bajo costo, es suficiente para lógica de fechas
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface AIAnalysisResult {
   intent:
   | 'APPOINTMENT'       // Agendó cita (Fecha va en appointment_date_iso)
   | 'FUTURE_CONTACT'    // "Búscame el lunes" (Fecha va en follow_up_date_iso)
   | 'NO_REPLY'          // Interesado mudo (Fecha sugerida +2 días en follow_up_date_iso)
   | 'QUOTE_FOLLOWUP'    // Ya tiene precio (Fecha sugerida +2 días en follow_up_date_iso)
   | 'OPERATIONAL_ALERT' // 🚨 PELIGRO
   | 'ADMIN_TASK'        // 📄 TRAMITE
   | 'NONE';             // Todo cerrado

   appointment_date_iso: string | null; // Para CITAS firmes
   follow_up_date_iso: string | null;   // Para RECORDATORIOS (Cron)
   reasoning: string;
}

export const analyzeChatForAppointment = async (conversationId: string, historyText: string): Promise<AIAnalysisResult | null> => {
   // Fecha actual precisa para que la IA calcule "el próximo lunes" correctamente
   const today = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'full', timeStyle: 'short' });

   const prompt = `
    Eres el Auditor de Calidad y Asistente IA de "Luz en tu Espacio". 
    Hoy es: ${today}.
    
    Tu objetivo es clasificar el chat y EXTRACTAR FECHAS para el calendario o para el sistema de recordatorios (Cron).
    
    --- 🛑 REGLAS DE ORO: CUÁNDO RESPONDER "NONE" 🛑 ---
    Prioridad 1: Si se cumple esto, ignora lo demás y responde "NONE".
    
    1. SILENCIO POSITIVO (Post-Cita): Si el último mensaje es sobre una cita YA PASADA ("Ahí nos vemos", "Ubicación enviada") y no hay quejas posteriores -> ÉXITO -> NONE.
    2. CONFLICTO ENFRIADO: Si hubo queja/problema pero el último mensaje tiene > 24 HORAS -> NONE.
    3. DUDA RESUELTA: Confusión interna resuelta hace > 24 HORAS -> NONE.
    4. CADUCIDAD: Último mensaje del cliente tiene > 15 DÍAS y no hay fecha futura -> NONE.

    --- 🚨 CLASIFICACIÓN Y EXTRACCIÓN DE FECHAS ---
    Si no es NONE, clasifica así:

    [OPERATIONAL_ALERT] (Prioridad Máxima 🔥)
    - Problema reciente (< 24h) SIN resolver: "¿Vienen?", "Sigo esperando".
    
    [ADMIN_TASK]
    - Pide factura/datos bancarios reciente (< 3 días) y nadie contestó.
    
    [APPOINTMENT]
    - Cliente confirma fecha/hora FUTURA para el servicio.
    - ACCIÓN: Pon la fecha exacta en "appointment_date_iso".
    
    [FUTURE_CONTACT]
    - Cliente dice: "Búscame el lunes", "Escríbeme en la quincena", "Mañana te digo".
    - ACCIÓN: Calcula la fecha futura mencionada y ponla en "follow_up_date_iso".
    
    [NO_REPLY] o [QUOTE_FOLLOWUP]
    - Cliente pidió info o recibió precio y dejó de contestar (hace 1-7 días).
    - ACCIÓN: Sugiere una fecha de seguimiento (Hoy + 2 días) en "follow_up_date_iso".

    Historial del chat:
    ---
    ${historyText}
    ---
    
    Responde SOLO este JSON:
    {
      "intent": "IntentType",
      "appointment_date_iso": "YYYY-MM-DDTHH:mm:00-06:00" (Solo si es APPOINTMENT),
      "follow_up_date_iso": "YYYY-MM-DDTHH:mm:00-06:00" (Si es FUTURE_CONTACT, NO_REPLY o QUOTE_FOLLOWUP),
      "reasoning": "Breve explicación"
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