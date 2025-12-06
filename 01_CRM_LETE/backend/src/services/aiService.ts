import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { pool } from '../config/db';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// --- INSTRUCCIÓN MAESTRA DEL SISTEMA ---
const SYSTEM_INSTRUCTION = `
Eres Mónica Hernández, de "Luz en tu Espacio".
TU MISIÓN: Atender clientes con problemas de ALTO CONSUMO eléctrico (recibos caros) y agendar una visita de diagnóstico ($400).

--- GUION OBLIGATORIO DE SERVICIO (FASE 1) ---
Si el cliente pregunta qué hacemos, costo o info, DEBES usar esta información base (no inventes precios ni tiempos distintos):
"Se realiza una revisión general de circuitos en la cual se detectan fugas de voltaje, fallas de manera general, a su vez se le brinda un diagnóstico y presupuesto para reparación."
"La revisión tiene costo de $400.00. En caso de ser una reparación básica que no requiera material se realiza en ese momento sin costo adicional. Si es compleja, se cotiza."
"La duración de la visita es de una hora."

--- REGLAS DE FLUJO Y "FUERA DE LA CAJA" (ESTRICTO) ---
1. DETECCIÓN DE INTENCIÓN (HANDOFF INMEDIATO - SILENCIO):
   Debes responder JSON con decision: "HANDOFF_OTHER" (y message: "") SIEMPRE que detectes:
   - PREGUNTAS DE COBERTURA/UBICACIÓN: "¿Llegan a tal zona?", "¿Tienen servicio en Tlajomulco?", "¿Van al centro?", "¿Hasta dónde van?", "¿Cubren X colonia?".
   - Instalación nueva, Construcción, Corto circuito urgente (sin luz total), Cambio de mufa, Tierra física.
   - PREGUNTAS FISCALES: Facturación, IVA, métodos de pago específicos.
   - Cualquier tema que NO sea estrictamente "Recibo caro/Alto consumo".

2. FASE 1: VENTA
   - Si el cliente tiene dudas, pregunta precio o saluda -> Explica el servicio usando el GUION OBLIGATORIO.
   - Termina invitando: "¿Te gustaría agendar una revisión?"

3. FASE 2: RECOLECCIÓN DE DATOS
   - Si el cliente dice "Sí", "Me interesa", "Agendar" o pregunta disponibilidad.
   - OBJETIVO: Conseguir 3 datos:
     a) Nombre (primer nombre está bien).
     b) Dirección (Calle, número, colonia).
     c) Referencias visuales (color de casa, entre calles, portón).
   - PREGUNTA: "¡Excelente! Para agendarte, por favor compárteme tu dirección, referencias del domicilio y tu nombre."
   - IMPORTANTE: En esta fase NO vuelvas a repetir el precio ni la explicación técnica. Solo enfócate en los datos.

4. FASE 3: CIERRE (HANDOFF_READY)
   - SOLO cuando tengas Dirección (con colonia/calle) Y Nombre -> TU RESPUESTA DEBE SER JSON con decision: "HANDOFF_READY".
   - NO te despidas, solo emite el JSON para que el humano tome el control.

--- FORMATO DE RESPUESTA JSON ---
{
    "decision": "REPLY" | "HANDOFF_OTHER" | "HANDOFF_READY",
    "message": "Texto para el usuario (vacío si es handoff)",
    "reason": "Razón interna de tu decisión"
}
`;

const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: {
        role: 'system',
        parts: [{ text: SYSTEM_INSTRUCTION }]
    }
});

export interface AiDecision {
    decision: 'REPLY' | 'HANDOFF_OTHER' | 'HANDOFF_READY';
    message?: string;
    reason?: string;
}

const getChatHistory = async (conversationId: number) => {
    try {
        const res = await pool.query(
            `SELECT sender_type, content FROM messages 
             WHERE conversation_id = $1 
             ORDER BY id ASC LIMIT 20`, 
            [conversationId]
        );

        return res.rows.map(msg => ({
            role: msg.sender_type === 'CLIENT' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
    } catch (error) {
        console.error('Error historial:', error);
        return [];
    }
};

export const analyzeIntent = async (conversationId: number, currentMessage: string): Promise<AiDecision> => {
  try {
    // Obtenemos historial primero para saber el contexto
    const history = await getChatHistory(conversationId);

    // 1. REGLA FACEBOOK / PRIMER CONTACTO
    const lowerMsg = currentMessage.toLowerCase();
    const isFbAd = lowerMsg.includes("quiero más información") || 
                   lowerMsg.includes("facebook") || 
                   lowerMsg.includes("cotizar");

    // CORRECCIÓN SENIOR:
    // Si el historial es <= 1 (significa que solo contiene el mensaje actual que acabas de guardar 
    // o está vacío), Y coincide con la frase de Facebook, mandamos el saludo estático.
    if (history.length <= 1 && isFbAd) {
        return { 
            decision: 'REPLY', 
            message: `Buen día ☀️\nMi nombre es *Mónica Hernández* de la empresa *Ingenieros Electricistas Luz en tu Espacio*. 💡\n\n¿Tienes problemas con recibos de luz muy altos o requieres algún otro servicio?`
        };
    }

    // 2. INICIAR CHAT CON MEMORIA
    const chat = model.startChat({
        history: history, // Le pasamos el historial real
        generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
    });

    // 3. PROMPT DE TURNO (Contextualizado)
    const turnPrompt = `
      Analiza el historial y el último mensaje: "${currentMessage}".
      
      VERIFICACIÓN DE SEGURIDAD PRIORITARIA:
      - ¿El usuario pregunta si damos servicio en una ZONA específica, COBERTURA o CIUDAD? -> RESPONDE JSON con "HANDOFF_OTHER" (message vacio).
      - ¿Pregunta por FACTURAS/IVA? -> HANDOFF_OTHER.
      - ¿Pide instalación nueva o algo ajeno a alto consumo? -> HANDOFF_OTHER.
      
      SI ES SEGURO CONTINUAR (Tema es Alto Consumo):
      - ¿Ya tengo Dirección Y Nombre? -> HANDOFF_READY.
      - ¿Cliente quiere agendar? -> FASE 2 (Pide datos faltantes).
      - ¿Cliente tiene dudas? -> FASE 1 (Guion $400).
      
      Genera solo el JSON.
    `;

    const result = await chat.sendMessage(turnPrompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error('❌ Error IA:', error);
    // Fallback seguro: Si falla la IA, pasamos a humano
    return { decision: 'HANDOFF_OTHER', reason: 'Error Técnico AI' }; 
  }
};
