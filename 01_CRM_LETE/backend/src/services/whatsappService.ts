import axios from 'axios';
import dotenv from 'dotenv';
import { supabaseAdmin } from './supabaseClient'; // 👈 Importamos Supabase

dotenv.config();

const BASE_URL = process.env.EVOLUTION_URL || 'http://172.17.0.1:8080';
const API_KEY = process.env.EVOLUTION_APIKEY;
const INSTANCE = process.env.EVOLUTION_INSTANCE || 'LuzEnTuEspacio';

// --- HELPER: Guardar mensaje saliente en Supabase ---
const logOutgoingMessageToSupabase = async (remoteJid: string, content: string, messageId: string) => {
  try {
    const whatsappId = remoteJid.replace('@s.whatsapp.net', '');

    // 1. Buscamos al cliente para obtener su UUID
    let { data: cliente } = await supabaseAdmin
      .from('clientes')
      .select('id')
      .eq('whatsapp_id', whatsappId)
      .single();

    // Si no existe (le escribimos a un desconocido), lo creamos como LEAD
    if (!cliente) {
      const { data: newClient } = await supabaseAdmin
        .from('clientes')
        .insert({
          whatsapp_id: whatsappId,
          telefono: whatsappId,
          nombre_completo: 'Desconocido (Saliente)',
          crm_status: 'LEAD'
        })
        .select('id')
        .single();
      cliente = newClient;
    }

    if (cliente) {
      await supabaseAdmin.from('mensajes_whatsapp').insert({
        cliente_id: cliente.id,
        whatsapp_message_id: messageId,
        content: content,
        role: 'assistant', // 👈 Nosotros somos el asistente
        status: 'sent'
      });
    }
  } catch (error) {
    console.error('⚠️ Error guardando mensaje saliente en Supabase:', error);
  }
};

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
export const sendText = async (remoteJid: string, text: string, forceDelay?: number) => {
  try {
    const number = remoteJid.replace('@s.whatsapp.net', '');

    // 1. Calcular Delay
    // Si forceDelay viene definido (ej: 0), lo usamos. Si no, calculamos el humano.
    const typingDelay = forceDelay !== undefined
      ? forceDelay
      : (text.split(" ").length * 500) + 2000;

    // 2. Activar "Escribiendo..." (Solo si el delay es mayor a 0 para no ensuciar logs)
    if (typingDelay > 0) {
      await sendPresence(number, 'composing', typingDelay);
      console.log(`⏳ Simulando humano: Escribiendo por ${typingDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, typingDelay));
    }

    // 3. Enviar Mensaje Real
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

    // ✅ CORRECCIÓN: Extraemos el ID correctamente de la respuesta de Axios
    const messageId = response.data?.key?.id;

    await sendPresence(number, 'available', 0);

    console.log(`📤 Mensaje enviado a ${number}. ID: ${messageId}`);

    // --- GUARDAR EN SUPABASE ---
    if (messageId) {
      // Ejecutamos sin await para no bloquear la respuesta
      logOutgoingMessageToSupabase(remoteJid, text, messageId);
    }
    // --- ÚNICO CAMBIO: RETORNAR EL ID ---
    return messageId || null;

  } catch (error: any) {
    console.error('❌ Error enviando WhatsApp:', error.response?.data || error.message);
    return null;
  }
};
