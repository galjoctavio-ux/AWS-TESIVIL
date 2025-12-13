// aiDateService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface AIAnalysisResult {
   intent:
   | 'APPOINTMENT'       // Cita confirmada
   | 'FUTURE_CONTACT'    // "Búscame el viernes"
   | 'NO_REPLY'          // Interesado mudo
   | 'QUOTE_FOLLOWUP'    // Ya tiene precio, falta cierre
   | 'OPERATIONAL_ALERT' // Quejas o problemas
   | 'ADMIN_TASK'        // NOSOTROS debemos algo (Cotización, factura)
   | 'NONE';             // Cerrado / Nada que hacer

   appointment_date_iso: string | null; // Fecha REAL de la visita (Para guardar en BD)
   follow_up_date_iso: string | null;   // Fecha de ACCIÓN del ROBOT (Recordatorio o Mensaje)
   reasoning: string;
}

export const analyzeChatForAppointment = async (conversationId: string, historyText: string): Promise<AIAnalysisResult | null> => {
   // Fecha actual precisa en México
   const now = new Date();
   const mexicoTime = now.toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'full', timeStyle: 'short' });

   // Referencias temporales para la IA
   const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
   const inTwoDays = new Date(now); inTwoDays.setDate(inTwoDays.getDate() + 2);

   const dateRef = `
   REFERENCIAS DE TIEMPO:
   - HOY es: ${mexicoTime}
   - MAÑANA (Sugerido para acciones): ${tomorrow.toISOString().split('T')[0]}T09:00:00-06:00
   - EN 2 DÍAS (Sugerido para seguimiento): ${inTwoDays.toISOString().split('T')[0]}T09:00:00-06:00
   `;

   const prompt = `
    Eres el Auditor de Calidad IA de "Luz en tu Espacio".
    ${dateRef}
    
    Analiza el chat y determina el SIGUIENTE PASO y la FECHA DE ACCIÓN.
    
    --- 🚨 REGLAS DE PRIORIDAD 🚨 ---

    1. [ADMIN_TASK] (Prioridad: DEUDA NUESTRA)
       - Se activa si: El ÚLTIMO mensaje es del ASISTENTE prometiendo algo ("Te paso la cotización", "Lo reviso", "Dame un momento") y NO hay respuesta posterior con el documento/info.
       - Significa: Nosotros le debemos algo al cliente.
       - follow_up_date_iso: NULL (Requiere atención humana inmediata).

    2. [NONE] (Cerrar conversación)
       - Se activa si: El cliente termina con "Gracias", "Ok", "Enterado", "Está bien", emojis 👍, y NO hay ninguna pregunta nuestra pendiente.
       - EXCEPCIÓN: Si acabamos de fijar una cita y dice "Ok", es APPOINTMENT.

    3. [APPOINTMENT] (Cita Confirmada)
       - Se activa si: Hay fecha/hora CONFIRMADA para el servicio.
       - appointment_date_iso: La fecha/hora REAL de la visita (Ej. 13 Dic 11:00 AM).
       - follow_up_date_iso: La fecha del recordatorio -> Pon el MISMO DÍA de la cita pero a las 08:00 AM (Formato: YYYY-MM-DDT08:00:00-06:00).

    4. [FUTURE_CONTACT] (Petición explícita)
       - Se activa si: Cliente dice "Escríbeme el lunes", "Márcame mañana".
       - follow_up_date_iso: Calcula la fecha solicitada y pon la hora a las 10:00 AM.

    5. [QUOTE_FOLLOWUP] (Seguimiento de Ventas)
       - Se activa si: Ya enviamos precio/cotización (hace > 24h) y el cliente no ha comprado ni rechazado.
       - follow_up_date_iso: Usa la referencia "EN 2 DÍAS" a las 09:00 AM.

    6. [NO_REPLY] (Rescate)
       - Se activa si: El cliente mostró interés, nosotros preguntamos algo y él dejó de contestar.
       - follow_up_date_iso: Usa la referencia "EN 2 DÍAS" a las 09:00 AM.

    Historial del chat:
    ---
    ${historyText}
    ---
    
    Responde SOLO este JSON:
    {
      "intent": "IntentType",
      "appointment_date_iso": "YYYY-MM-DDTHH:mm:00-06:00" (Para APPOINTMENT),
      "follow_up_date_iso": "YYYY-MM-DDTHH:mm:00-06:00" (Fecha del próximo mensaje automático o recordatorio),
      "reasoning": "Explicación breve"
    }
`;

   try {
      const result = await model.generateContent(prompt);
      const cleanJson = result.response.text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);

      // FALLBACK DE SEGURIDAD:
      // Si es un seguimiento automático y la IA olvidó la fecha, la ponemos nosotros.
      if ((data.intent === 'QUOTE_FOLLOWUP' || data.intent === 'NO_REPLY') && !data.follow_up_date_iso) {
         const manualDate = new Date();
         manualDate.setDate(manualDate.getDate() + 2);
         manualDate.setHours(9, 0, 0, 0); // 9:00 AM por defecto
         data.follow_up_date_iso = manualDate.toISOString().replace('Z', '-06:00');
      }

      return data;
   } catch (error) {
      console.error(`[AI Error] ${conversationId}:`, error);
      return null;
   }
};