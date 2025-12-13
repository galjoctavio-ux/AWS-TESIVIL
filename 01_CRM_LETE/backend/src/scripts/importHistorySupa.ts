import axios from 'axios';
import { supabaseAdmin } from '../services/supabaseClient';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// CONFIGURACIÓN
const EVO_URL = 'http://172.17.0.1:8080';
const EVO_APIKEY = 'B6D711FCDE4D4FD5936544120E713976';
const EVO_INSTANCE = 'LuzEnTuEspacio';

const api = axios.create({
    baseURL: EVO_URL,
    headers: { 'apikey': EVO_APIKEY }
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const importHistoryFinal = async () => {
    console.log("🚀 Iniciando Importación ROBUSTA (Estrategia 1-a-1)...");

    try {
        // ==========================================
        // PASO 1: OBTENER LISTA DE CONTACTOS/CHATS
        // ==========================================
        // Usamos /chat/find (singular) porque suele ser metadata ligera y no explota
        console.log("📋 Obteniendo lista de chats activos...");
        let targets = [];

        try {
            const res = await api.post(`/chat/find/${EVO_INSTANCE}`, {});
            targets = Array.isArray(res.data) ? res.data : [];
            console.log(`✅ Se encontraron ${targets.length} chats vía /chat/find`);
        } catch (e) {
            console.warn("⚠️ Falló /chat/find, intentando /contact/find...");
            try {
                const resContact = await api.post(`/contact/find/${EVO_INSTANCE}`, {});
                targets = Array.isArray(resContact.data) ? resContact.data : [];
                console.log(`✅ Se encontraron ${targets.length} contactos vía /contact/find`);
            } catch (errContact) {
                console.error("❌ Fatal: No se pudo obtener la lista de nadie.");
                return;
            }
        }

        // ==========================================
        // PASO 2: PROCESAR UNO POR UNO
        // ==========================================
        console.log(`📥 Procesando ${targets.length} registros uno por uno...`);

        for (const item of targets) {
            // Normalización de ID
            const rawId = item.id || item.remoteJid || item.key?.remoteJid;
            if (!rawId || rawId.includes('@g.us') || rawId.includes('@broadcast') || rawId === 'status@broadcast') continue;

            let whatsappId = rawId.split('@')[0];
            // Fix México
            if (whatsappId.startsWith('521') && whatsappId.length === 13) whatsappId = whatsappId.substring(3);

            // Nombre
            const nombre = item.pushName || item.name || item.notify || item.verifiedName || whatsappId;

            process.stdout.write(`🔹 Procesando ${whatsappId} (${nombre})... `);

            // 1. UPSERT CLIENTE EN SUPABASE
            let clienteId = null;
            const { data: clientData, error: clientError } = await supabaseAdmin
                .from('clientes')
                .select('id')
                .or(`whatsapp_id.eq.${whatsappId},telefono.eq.${whatsappId}`)
                .maybeSingle();

            if (clientData) {
                clienteId = clientData.id;
            } else {
                const { data: newClient } = await supabaseAdmin
                    .from('clientes')
                    .insert({
                        whatsapp_id: whatsappId,
                        telefono: whatsappId,
                        nombre_completo: nombre,
                        crm_status: 'IMPORTED_HISTORY',
                        crm_intent: 'NONE'
                    })
                    .select('id')
                    .single();
                if (newClient) clienteId = newClient.id;
            }

            if (!clienteId) {
                console.log("❌ Error gestionando cliente.");
                continue;
            }

            // 2. OBTENER MENSAJES INDIVIDUALMENTE
            // Aquí es donde evitamos el error 500 global. Si este falla, solo falla este usuario.
            try {
                const resMsgs = await api.post(`/chat/findMessages/${EVO_INSTANCE}`, {
                    where: { key: { remoteJid: rawId } },
                    options: { limit: 15, sort: { order: 'DESC' } }
                });

                const messages = resMsgs.data;
                if (messages && Array.isArray(messages) && messages.length > 0) {
                    const msjsParaGuardar = [];
                    for (const msg of messages) {
                        let content = '';
                        const type = msg.messageType;

                        // Extracción segura
                        if (type === 'conversation') content = msg.message?.conversation;
                        else if (type === 'extendedTextMessage') content = msg.message?.extendedTextMessage?.text;
                        else if (msg.message?.imageMessage) content = '📸 [Imagen]';
                        else if (msg.message?.audioMessage) content = '🎤 [Audio]';
                        else content = `[${type}]`;

                        if (!content) continue;

                        let timestamp = msg.messageTimestamp;
                        if (timestamp < 10000000000) timestamp *= 1000;

                        msjsParaGuardar.push({
                            cliente_id: clienteId,
                            whatsapp_message_id: msg.key?.id || `hist_${Date.now()}_${Math.random()}`,
                            role: msg.key?.fromMe ? 'assistant' : 'user',
                            content: content,
                            created_at: new Date(timestamp).toISOString(),
                            status: 'read'
                        });
                    }

                    if (msjsParaGuardar.length > 0) {
                        await supabaseAdmin.from('mensajes_whatsapp')
                            .upsert(msjsParaGuardar, { onConflict: 'whatsapp_message_id', ignoreDuplicates: true });
                        console.log(`✅ ${msjsParaGuardar.length} msjs guardados.`);
                    } else {
                        console.log("⚠️ Sin mensajes de texto.");
                    }
                } else {
                    console.log("⚠️ Chat vacío.");
                }
            } catch (msgError) {
                // AQUÍ ATRAPAMOS EL ERROR DEL MEDIA URL SI SUCEDE EN ESTE CHAT ESPECÍFICO
                console.log(`❌ Error al leer mensajes: ${(msgError as any).message}`);
            }

            await delay(200); // Respiro
        }

        console.log("\n🎉 IMPORTACIÓN FINALIZADA.");

    } catch (error) {
        console.error("❌ Error General:", error);
    }
};

importHistoryFinal();