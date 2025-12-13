import axios from 'axios';
import { supabaseAdmin } from '../services/supabaseClient';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// CONFIGURACIÓN (Usa las claves que me diste)
const EVO_URL = 'http://172.17.0.1:8080'; // Tu URL local
const EVO_APIKEY = 'B6D711FCDE4D4FD5936544120E713976';
const EVO_INSTANCE = 'LuzEnTuEspacio';

// Configuración de Axios
const api = axios.create({
    baseURL: EVO_URL,
    headers: {
        'apikey': EVO_APIKEY
    }
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const importHistoryViaApi = async () => {
    console.log("📡 Iniciando Importación Histórica vía API...");

    try {
        // 1. OBTENER LISTA DE CHATS
        // Pedimos los chats que tienen actividad
        console.log("🔍 Buscando chats activos...");
        const { data: chats } = await api.get(`/chat/findChats/${EVO_INSTANCE}`);

        if (!chats || !Array.isArray(chats)) {
            console.error("❌ Error: La API no devolvió una lista de chats válida.", chats);
            return;
        }

        console.log(`📥 Se encontraron ${chats.length} chats.`);

        for (const chat of chats) {
            const remoteJid = chat.id || chat.remoteJid;

            // Ignorar grupos (@g.us) y broadcasts (@broadcast)
            if (!remoteJid || remoteJid.includes('@g.us') || remoteJid.includes('@broadcast')) {
                continue;
            }

            console.log(`🔹 Procesando chat: ${remoteJid}...`);

            // 2. BUSCAR/CREAR CLIENTE EN SUPABASE
            // Limpieza de ID
            let whatsappId = remoteJid.split('@')[0];
            // Normalización México (521 -> 52)
            if (whatsappId.startsWith('521') && whatsappId.length === 13) {
                whatsappId = whatsappId.substring(3);
            }

            let clienteId = null;

            // Buscar si existe
            const { data: existingClient } = await supabaseAdmin
                .from('clientes')
                .select('id')
                .or(`whatsapp_id.eq.${whatsappId},telefono.eq.${whatsappId}`)
                .maybeSingle();

            if (existingClient) {
                clienteId = existingClient.id;
            } else {
                // Crear si no existe (Usamos el pushName del chat o el número)
                const nombre = chat.pushName || chat.name || whatsappId;
                const { data: newClient } = await supabaseAdmin
                    .from('clientes')
                    .insert({
                        whatsapp_id: whatsappId,
                        telefono: whatsappId,
                        nombre_completo: nombre,
                        crm_status: 'IMPORTED_API',
                        crm_intent: 'NONE'
                    })
                    .select('id')
                    .single();

                if (newClient) clienteId = newClient.id;
            }

            if (!clienteId) {
                console.log(`⚠️ No se pudo vincular cliente para ${whatsappId}`);
                continue;
            }

            // 3. OBTENER MENSAJES DEL CHAT
            // Pedimos los últimos 15 mensajes de este chat específico
            try {
                const { data: messages } = await api.post(`/chat/findMessages/${EVO_INSTANCE}`, {
                    where: {
                        key: { remoteJid: remoteJid }
                    },
                    options: {
                        limit: 15,
                        sort: { order: 'DESC' } // Traer los más recientes
                    }
                });

                if (messages && Array.isArray(messages)) {
                    const mensajesParaGuardar = [];

                    for (const msg of messages) {
                        // Extraer contenido seguro
                        let content = '';
                        const msgType = msg.messageType;

                        if (msgType === 'conversation') {
                            content = msg.message?.conversation;
                        } else if (msgType === 'extendedTextMessage') {
                            content = msg.message?.extendedTextMessage?.text;
                        } else {
                            content = `[${msgType}]`; // Marcador para audios/fotos
                        }

                        if (!content) continue;

                        const isFromMe = msg.key?.fromMe || false;
                        const msgDate = new Date(msg.messageTimestamp * 1000); // Evolution suele dar timestamp en segundos

                        mensajesParaGuardar.push({
                            cliente_id: clienteId,
                            whatsapp_message_id: msg.key?.id || `imp_${Date.now()}_${Math.random()}`,
                            role: isFromMe ? 'assistant' : 'user',
                            content: content,
                            created_at: msgDate.toISOString(),
                            status: 'read'
                        });
                    }

                    if (mensajesParaGuardar.length > 0) {
                        // Insertamos en lote, ignorando duplicados si el ID ya existe
                        const { error } = await supabaseAdmin
                            .from('mensajes_whatsapp')
                            .upsert(mensajesParaGuardar, { onConflict: 'whatsapp_message_id', ignoreDuplicates: true });

                        if (error) console.error("Error guardando msjs:", error.message);
                        else console.log(`   ✅ Guardados ${mensajesParaGuardar.length} mensajes.`);
                    }
                }

            } catch (err) {
                console.error(`   ❌ Error obteniendo mensajes de ${remoteJid}:`, err.message);
            }

            // Pequeña pausa para no saturar la API
            await delay(500);
        }

        console.log("✅ Importación finalizada con éxito.");

    } catch (error) {
        console.error("❌ Error fatal en el script:", error);
    }
};

importHistoryViaApi();