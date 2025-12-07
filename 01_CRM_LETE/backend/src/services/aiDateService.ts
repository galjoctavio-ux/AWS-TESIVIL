import { GoogleGenerativeAI } from "@google/generative-ai";
import { query } from '../config/db'; // Importación corregida

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

interface AIAnalysisResult {
    has_appointment: boolean;
    appointment_date_iso: string | null;
    reasoning: string;
}

export const analyzeChatForAppointment = async (conversationId: string, historyText: string): Promise<AIAnalysisResult | null> => {
  const today = new Date().toLocaleString('es-MX', { 
        timeZone: 'America/Mexico_City',
        dateStyle: 'full', 
        timeStyle: 'short' 
    });
    
    const prompt = `
    Hoy es: ${today}.
    Tu tarea es identificar si en la siguiente conversación se ha ACORDADO FINALMENTE una fecha y hora para una visita técnica.
    
    Reglas:
    1. Solo considera citas futuras o del día de hoy.
    2. Si solo están discutiendo fechas pero no hay confirmación ("podría ser el lunes"), NO es cita.
    3. Si hay confirmación ("correctamente agendado"), SÍ es cita.
    
    Historial del chat (últimos mensajes):
    ---
    ${historyText}
    ---
    
    Responde ÚNICAMENTE con un objeto JSON válido con esta estructura:
    {
      "has_appointment": true/false,
      "appointment_date_iso": "YYYY-MM-DD HH:mm:00" (o null si false),
      "reasoning": "Breve explicación de por qué detectaste o no la fecha"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const analysis: AIAnalysisResult = JSON.parse(cleanJson);

        if (analysis.has_appointment && analysis.appointment_date_iso) {
            // Guardamos directamente usando query()
            await query(
                `UPDATE conversations 
                 SET appointment_date = $1, appointment_status = 'PENDING' 
                 WHERE id = $2`,
                [analysis.appointment_date_iso, conversationId]
            );
        }

        return analysis;

    } catch (error) {
        console.error(`[AI Service Error] Falló análisis para chat ${conversationId}:`, error);
        return null;
    }
};
