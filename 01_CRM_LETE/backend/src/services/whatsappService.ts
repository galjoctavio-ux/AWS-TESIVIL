import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.EVOLUTION_URL || 'http://172.17.0.1:8080';
const API_KEY = process.env.EVOLUTION_APIKEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE || 'LuzEnTuEspacio';

// Función auxiliar para simular escritura
// Se agrega el parámetro 'duration' para enviarlo a la API
const sendPresence = async (number: string, state: 'composing' | 'available', duration: number = 1200) => {
    try {
        await axios.post(`${BASE_URL}/chat/sendPresence/${INSTANCE}`, {
            number: number,
            presence: state,
            delay: duration // Le decimos a Evolution cuánto planeamos tardar
        }, {
            headers: { 'apikey': API_KEY }
        });
    } catch (e) {
        // Si falla el "escribiendo", no pasa nada, seguimos silenciosamente.
        // console.error('Error presence:', e);
    }
};

export const sendText = async (remoteJid: string, text: string) => {
  try {
    const number = remoteJid.replace('@s.whatsapp.net', '');
    
    // --- LÓGICA HUMAN-LIKE (AJUSTADA) ---
    
    // 1. Calcular Delay (Más lento: 0.5s por palabra + 2s base)
    // Ejemplo: "Hola, claro que sí" (4 palabras) = 2000 + 2000 = 4 segundos de espera.
    const words = text.split(" ").length;
    const typingDelay = (words * 500) + 2000; 

    // 2. Activar "Escribiendo..."
    // Le pasamos el delay calculado a la API para que intente mantener el estado activo ese tiempo
    await sendPresence(number, 'composing', typingDelay);

    // 3. Esperar el tiempo calculado (Node.js se pausa aquí realmente)
    console.log(`⏳ Simulando humano: Escribiendo por ${typingDelay}ms...`);
    await new Promise(resolve => setTimeout(resolve, typingDelay));

    // 4. Enviar Mensaje Real
    const url = `${BASE_URL}/message/sendText/${INSTANCE}`;
    const payload = {
      number: number,
      text: text,
      linkPreview: false
    };

    const headers = {
      'apikey': API_KEY,
      'Content-Type': 'application/json'
    };

    const response = await axios.post(url, payload, { headers });
    
    // 5. Desactivar "Escribiendo" (Volver a disponible inmediatamente)
    await sendPresence(number, 'available', 0);
    
    console.log(`📤 Mensaje enviado a ${number}: ${text.substring(0, 20)}...`);
    return response.data;

  } catch (error: any) {
    console.error('❌ Error enviando WhatsApp:', error.response?.data || error.message);
    return null;
  }
};
