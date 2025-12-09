import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from '../config/db';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Tipos de respuesta que esperamos de la IA
interface AIAnalysisResult {
    intent: 'APPOINTMENT' | 'FUTURE_CONTACT' | 'SOFT_FOLLOWUP' | 'NO_REPLY' | 'NONE';
    appointment_date_iso: string | null; // Para APPOINTMENT y FUTURE_CONTACT
    reasoning: string;
}

export const analyzeChatForAppointment = async (conversationId: string, historyText: string): Promise<AIAnalysisResult | null> => {
    // Usamos hora de México para que la IA entienda "mañana", "hoy", "enero"
    const today = new Date().toLocaleString('es-MX', {
        timeZone: 'America/Mexico_City',
        dateStyle: 'full',
        timeStyle: 'short'
    });

    const prompt = `
    Actúa como un Asistente Comercial experto en cierre de ventas. Hoy es: ${today}.
    Tu misión es analizar el chat y determinar CUÁL es el siguiente paso lógico con este cliente.

    CLASIFICACIÓN DE INTENCIONES (Elige UNA):
    
    1. "APPOINTMENT": El cliente YA confirmó explícitamente una fecha y hora para la visita.
       - Ejemplo: "Sí, ven el martes a las 4", "Quedamos para el 10 de diciembre", "Quedo correctamente agendado".
       - Acción: Extrae la fecha exacta en formato ISO.

    2. "FUTURE_CONTACT": El cliente pide que lo busquemos en una fecha futura específica o vaga.
       - Ejemplo: "Búscame en Enero", "Háblame el próximo mes", "Regreso de vacaciones el lunes".
       - Acción: Calcula la fecha aproximada. 
         * Si dice "Enero", pon el primer día hábil de Enero a las 10:00 AM.
         * Si dice "Lunes", pon ese lunes a las 10:00 AM.
         * Si dice una fecha exacta, úsala.

    3. "SOFT_FOLLOWUP": El cliente está indeciso, pide tiempo o permiso, pero hay interés. (Ventana de 24h).
       - Ejemplo: "Déjame preguntar a mi esposo", "Yo te aviso mañana", "Estoy revisando horarios", "Ok", "Gracias".
       - Nota: Si el cliente solo dice "Gracias" o "Ok" después de recibir info, entra aquí para seguimiento rápido.
       - Acción: No necesitas calcular fecha, pon null en date (el sistema lo hará).

    4. "NO_REPLY": El cliente NO contestó al último mensaje que envió el TÉCNICO o SOPORTE. 
       - Condición: El último mensaje del chat es de "Soporte/Técnico" y ya pasó tiempo. El cliente nos dejó en "Visto" o ignoró nuestra info.
       - Acción: Pon null en date (el sistema agendará para mañana a las 9 AM).

    5. "NONE": El cliente ya no está interesado, ya se realizó el servicio, o la conversación no requiere acción.
       - Ejemplo: "Ya vinieron, gracias", "No me interesa", "Equivocado".

    Historial del chat:
    ---
    ${historyText}
    ---
    
    Responde SOLO con este JSON:
    {
      "intent": "APPOINTMENT" | "FUTURE_CONTACT" | "SOFT_FOLLOWUP" | "NO_REPLY" | "NONE",
      "appointment_date_iso": "YYYY-MM-DD HH:mm:00" (Solo para APPOINTMENT o FUTURE_CONTACT, si no null),
      "reasoning": "Breve explicación"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const analysis: AIAnalysisResult = JSON.parse(cleanJson);

        return analysis;
    } catch (error) {
        console.error(`[AI Service Error] Falló análisis para chat ${conversationId}:`, error);
        return null;
    }
};