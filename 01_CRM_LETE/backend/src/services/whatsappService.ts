import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.EVOLUTION_URL || 'http://172.17.0.1:8080';
const API_KEY = process.env.EVOLUTION_APIKEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE || 'LuzEnTuEspacio';

// Función auxiliar para simular escritura
const sendPresence = async (number: string, state: 'composing' | 'available', duration: number = 1200) => {
    try {
        await axios.post(`${BASE_URL}/chat/sendPresence/${INSTANCE}`, {
            number: number,
            presence: state,
            delay: duration 
        }, {
            headers: { 'apikey': API_KEY }
        });
    } catch (e) {
        // Ignoramos errores de presencia
    }
};

// MANTENEMOS EL NOMBRE "sendText" PARA NO ROMPER NADA
export const sendText = async (remoteJid: string, text: string) => {
  try {
    const number = remoteJid.replace('@s.whatsapp.net', '');
    
    // --- LÓGICA HUMAN-LIKE ---
    const words = text.split(" ").length;
    const typingDelay = (words * 500) + 2000; 

    await sendPresence(number, 'composing', typingDelay);

    console.log(`⏳ Simulando humano: Escribiendo por ${typingDelay}ms...`);
    await new Promise(resolve => setTimeout(resolve, typingDelay));

    // Enviar Mensaje Real
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
    
    await sendPresence(number, 'available', 0);
    
    console.log(`📤 Mensaje enviado a ${number}. ID: ${response.data?.key?.id}`);
    
    // --- ÚNICO CAMBIO: RETORNAR EL ID ---
    return response.data?.key?.id || null;

  } catch (error: any) {
    console.error('❌ Error enviando WhatsApp:', error.response?.data || error.message);
    return null;
  }
};
