import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { pool } from '../config/db';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Prompt exclusivo para el resumen técnico
const TECH_SUMMARY_PROMPT = `
Instrucciones del sistema:
Genera un contexto breve, claro y seguro basado exclusivamente en los últimos 30 mensajes del chat.

Objetivo:
Crear un resumen operativo para el técnico SIN mostrar información sensible (Teléfono) y SIN copiar conversaciones de precios o ventas.

Formato del resumen:
Domicilio: (calle, número, colonia, referencias exactas).
Problema reportado: (explica la falla eléctrica técnica).
Detalles importantes: (puntos clave, horarios, advertencias).
Archivos/Fotos relevantes: (describe brevemente si se mencionan fotos).

Si no hay información suficiente, muestra la información que hayas encontrado y además escribe: "Información insuficiente para generar un resumen completo. Consultar detalles con administración."

SIEMPRE termina con:
"Puedes contactar directamente al cliente desde este chat. Los mensajes que escribas empezarán con "Ing. (tu nombre) escribió este mensaje:". Los mensajes pueden tardar unos segundos en aparecer en el chat. Sé amable."
`;

const getChatHistoryForSummary = async (conversationId: number) => {
    try {
        // Traemos un poco más de contexto (40 msgs) para que el resumen sea bueno
        const res = await pool.query(
            `SELECT sender_type, content FROM messages 
             WHERE conversation_id = $1 
             ORDER BY id ASC LIMIT 40`,
            [conversationId]
        );
        return res.rows.map(msg => ({
            role: msg.sender_type === 'CLIENT' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));
    } catch (error) {
        console.error('Error obteniendo historial para resumen:', error);
        return [];
    }
};

// --- FUNCIÓN PRINCIPAL ---
export const generateTechSummary = async (conversationId: number): Promise<void> => {
    console.log(`👷 Generando resumen técnico interno para chat ${conversationId}...`);
    try {
        const history = await getChatHistoryForSummary(conversationId);

        // Si hay muy pocos mensajes, no gastamos tokens ni generamos ruido
        if (history.length < 2) {
            console.log("⚠️ Historial muy corto, se omite resumen.");
            return;
        }

        // Usamos un modelo 'flash' simple
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Aplanamos el chat a texto para que la IA lo lea como un documento
        const conversationText = history.map(h => `${h.role}: ${h.parts[0].text}`).join('\n');

        const finalPrompt = `${TECH_SUMMARY_PROMPT}\n\n--- CONVERSACIÓN A ANALIZAR ---\n${conversationText}`;

        const result = await model.generateContent(finalPrompt);
        const summary = result.response.text();

        // Guardamos silenciosamente en la BD
        await pool.query(
            `UPDATE conversations SET tech_summary = $1 WHERE id = $2`,
            [summary, conversationId]
        );
        console.log(`✅ Resumen guardado exitosamente para ID: ${conversationId}`);

    } catch (error) {
        console.error('❌ Error en aiInternalService:', error);
        // No lanzamos error para no romper el flujo del admin
    }
};
