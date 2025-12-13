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
    Eres el Auditor de Calidad y Asistente IA de "Luz en tu Espacio". Hoy es: ${today}.
    Analiza el historial y clasifica el estado actual del cliente.

    --- 🚨 CATEGORÍA 1: ALERTAS INTERNAS (PRIORIDAD MÁXIMA) 🚨 ---
    Usa estas categorías si detectas que NOSOTROS tenemos una tarea pendiente o fallamos.
    
    1. [OPERATIONAL_ALERT] (Fallo Operativo / Queja)
       - Detectas que el equipo de Soporte prometió una visita o llamada y NO hay evidencia posterior de que ocurrió.
       - Ejemplo: Soporte dice "El técnico va en camino", "Te aviso en 1 hora", "Pasamos el lunes"... y luego SILENCIO total.
       - Ejemplo: Cliente reclama: "¿Van a venir?", "Sigo esperando", "No quedó bien".
    
    2. [ADMIN_TASK] (Temas Administrativos)
       - El cliente está pidiendo explícitamente: Factura, Datos Bancarios, Recibo de pago, Dudas sobre el contrato.
       - Y NO se le ha dado respuesta final a eso.
       - (Aquí NO se debe enviar mensaje automático de venta, requiere humano).

    --- 🤖 CATEGORÍA 2: AUTOMATIZACIÓN DE VENTAS ---
    Usa esto solo si NO hay alertas internas pendientes.

    3. [APPOINTMENT]
       - El cliente confirmó fecha y hora explícitamente para una visita FUTURA.
       - Devuelve fecha ISO correcta.

    4. [QUOTE_FOLLOWUP]
       - Se envió cotización/precio hace menos de 10 días.
       - Cliente dijo "lo reviso" o no contestó.
       - NO usar si el cliente ya rechazó o si pasaron >15 días.

    5. [NO_REPLY] (Ghosting reciente)
       - Cliente pidió info, se la dimos, y se calló (hace 1-7 días).
       - NO usar si el último mensaje ya es nuestro seguimiento ("¿Sigues ahí?").

    6. [FUTURE_CONTACT]
       - Cliente pide que lo busquen en fecha específica o "la próxima semana".

    --- 🗑️ CATEGORÍA 3: DESCARTAR ---
    
    7. [NONE]
       - Citas que YA ocurrieron en el pasado (sin quejas posteriores).
       - Conversaciones cerradas exitosamente ("Gracias, quedó bien").
       - Conversaciones muy antiguas (>20 días sin actividad).
       - Cliente dice "No me interesa", "Ya contraté a otro".

    Historial del chat:
    ---
    ${historyText}
    ---
    
    Responde SOLO JSON:
    {
      "intent": "APPOINTMENT" | "FUTURE_CONTACT" | "NO_REPLY" | "QUOTE_FOLLOWUP" | "OPERATIONAL_ALERT" | "ADMIN_TASK" | "NONE",
      "appointment_date_iso": "YYYY-MM-DDTHH:mm:00-06:00" (Solo si aplica),
      "reasoning": "Breve explicación para el humano de por qué se eligió este estado"
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