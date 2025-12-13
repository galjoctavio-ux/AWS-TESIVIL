import axios from 'axios';
import { supabaseAdmin } from '../services/supabaseClient';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// TUS CREDENCIALES
const EVO_URL = 'http://172.17.0.1:8080';
const EVO_APIKEY = 'B6D711FCDE4D4FD5936544120E713976';
const EVO_INSTANCE = 'LuzEnTuEspacio';

// Configuración Base
const api = axios.create({
    baseURL: EVO_URL,
    headers: { 'apikey': EVO_APIKEY }
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const importHistoryViaApi = async () => {
    console.log("📡 Iniciando Importación Histórica (Versión V2 Corregida)...");

    try {
        // ---------------------------------------------------------
        // 1. OBTENER LISTA DE CHATS (INTENTO ROBUSTO)
        // ---------------------------------------------------------
        let chats = [];
        console.log("🔍 Intentando obtener chats...");

        try {
            // INTENTO A: Método V2 (POST) - El más probable
            const res = await api.post(`/chat/findChats/${EVO_INSTANCE}`, {
                where: {} // Filtro vacío para traer todo
            });
            chats = res.data;
            console.log("✅ Método POST funcionó.");
        } catch (postError) {
            console.warn("⚠️ Método POST falló, intentando GET...");
            try {
                // INTENTO B: Método Legacy (GET)
                const res = await api.get(`/chat/findChats/${EVO_INSTANCE}`);
                chats = res.data;
                console.log("✅ Método GET funcionó.");
            } catch (getError) {
                console.error("❌ Ambos métodos fallaron. Verifica que la base de datos de Evolution esté habilitada.");
                // Si falla aquí, es posible que Evolution no tenga DB habilitada en su .env (DATABASE_ENABLED=true)
                return;
            }
        }

        // Validación extra de datos
        if (!chats || !Array.isArray(chats)) {
            // A veces la API devuelve { type: 'success', data: [...] }
            if ((chats as any).data && Array.isArray((chats as any).data)) {
                chats = (chats as any).data;
            } else {
                console.log("ℹ️ No se encontraron chats o el formato es desconocido.", chats);
                return;
            }
        }

        console.log(`📥 Procesando ${chats.length} chats encontrados...`);

        // ---------------------------------------------------------
        // 2. PROCESAR CADA CHAT
        // ---------------------------------------------------------
        for (const chat of chats) {
            const remoteJid = chat.id || chat.remoteJid;

            // Ignorar grupos y broadcasts
            if (!remoteJid || remoteJid.includes('@g.us') || remoteJid.includes('@broadcast')) {
                continue;
            }

            console.log(`🔹 Analizando: ${remoteJid}`);

            // Normalización del ID
            let whatsappId = remoteJid.split('@')[0];
            if (whatsappId.startsWith('521') && whatsappId.length === 13) {
                whatsappId = whatsappId.substring(3);
            }

            // Buscar o Crear Cliente en Supabase
            let clienteId = null;
            const { data: existingClient } = await supabaseAdmin
                .from('clientes')
                .select('id')
                .or(`whatsapp_id.eq.${whatsappId},telefono.eq.${whatsappId}`)
                .maybeSingle();

            if (existingClient) {
                clienteId = existingClient.id;
            } else {
                const nombre = chat.pushName || chat.name || whatsappId;
                const { data: newClient } = await supabaseAdmin
                    .from('clientes')
                    .insert({
                        whatsapp_id: whatsappId,
                        telefono: whatsappId,
                        nombre_completo: nombre,
                        crm_status: 'IMPORTED_API',
                        crm_intent: 'NONE',
                        unread_count: chat.unreadCount || 0
                    })
                    .select('id')
                    .single();

                if (newClient) clienteId = newClient.id;
            }

            if (!clienteId) continue;

            // ---------------------------------------------------------
            // 3. OBTENER MENSAJES (POST)
            // ---------------------------------------------------------
            try {
                // Evolution V2 requiere POST para findMessages también
                const { data: messages } = await api.post(`/chat/findMessages/${EVO_INSTANCE}`, {
                    where: {
                        key: { remoteJid: remoteJid }
                    },
                    options: {
                        limit: 20, // Traemos los últimos 20
                        sort: { order: 'DESC' }
                    }
                });

                if (messages && Array.isArray(messages)) {
                    const mensajesParaGuardar = [];

                    for (const msg of messages) {
                        let content = '';
                        const msgType = msg.messageType;

                        // Extracción segura de contenido
                        if (msgType === 'conversation') {
                            content = msg.message?.conversation;
                        } else if (msgType === 'extendedTextMessage') {
                            content = msg.message?.extendedTextMessage?.text;
                        } else if (msg.message?.imageMessage) {
                            content = '📸 [Imagen]';
                        } else if (msg.message?.audioMessage) {
                            content = '🎤 [Audio]';
                        } else {
                            content = `[${msgType}]`;
                        }

                        if (!content) continue;

                        const isFromMe = msg.key?.fromMe || false;
                        // Corrección de fecha (si viene en segundos o milisegundos)
                        let timestamp = msg.messageTimestamp;
                        if (timestamp < 10000000000) timestamp *= 1000; // Si es segundos, pasar a ms
                        const msgDate = new Date(timestamp);

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
                        const { error } = await supabaseAdmin
                            .from('mensajes_whatsapp')
                            .upsert(mensajesParaGuardar, { onConflict: 'whatsapp_message_id', ignoreDuplicates: true });

                        if (error) console.error("   ⚠️ Error Supabase:", error.message);
                        else console.log(`   ✅ Guardados: ${mensajesParaGuardar.length} msjs`);
                    }
                }
            } catch (msgErr) {
                console.error(`   ❌ Error trayendo mensajes:`, (msgErr as any).message);
            }

            await delay(200); // Pausa anti-saturación
        }

        console.log("\n✅ IMPORTACIÓN COMPLETADA.");

    } catch (error) {
        console.error("❌ Error General:", (error as any).message);
    }
};

importHistoryViaApi();