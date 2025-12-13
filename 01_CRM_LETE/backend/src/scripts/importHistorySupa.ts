import axios from 'axios';
import { supabaseAdmin } from '../services/supabaseClient';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// TUS CREDENCIALES
const EVO_URL = 'http://172.17.0.1:8080';
const EVO_APIKEY = 'B6D711FCDE4D4FD5936544120E713976';
const EVO_INSTANCE = 'LuzEnTuEspacio';

const api = axios.create({
    baseURL: EVO_URL,
    headers: { 'apikey': EVO_APIKEY }
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const importHistoryFinal = async () => {
    console.log("🚀 Iniciando Importación (Estrategia: CONTACTOS)...");

    try {
        // ==========================================
        // PASO 1: OBTENER LISTA DE JIDs (SOLO CONTACTOS)
        // ==========================================
        // Usamos findContacts (Plural) que es más estable en V2 y no carga mensajes
        console.log("📋 Intentando descargar agenda de contactos...");
        let targets = [];

        try {
            // INTENTO 1: Endpoint estándar V2 para contactos
            const res = await api.post(`/contact/findContacts/${EVO_INSTANCE}`, {
                where: {}
            });
            targets = Array.isArray(res.data) ? res.data : [];
            console.log(`✅ ¡ÉXITO! Se encontraron ${targets.length} contactos en la agenda.`);

        } catch (e: any) {
            console.error(`❌ Falló findContacts: ${e.message}`);
            if (e.response) console.error(`   Status: ${e.response.status} - ${JSON.stringify(e.response.data)}`);

            // INTENTO 2: Si falla contactos, intentamos chats una vez más pero con where vacío
            console.log("⚠️ Intentando fallback con findChats...");
            try {
                const resChat = await api.post(`/chat/findChats/${EVO_INSTANCE}`, { where: {} });
                targets = Array.isArray(resChat.data) ? resChat.data : [];
            } catch (errChat) {
                console.error("❌ Fatal: No se pudo obtener ni contactos ni chats.");
                return;
            }
        }

        if (targets.length === 0) {
            console.log("⚠️ La lista está vacía. Evolution aún no ha sincronizado la agenda o la base de datos está limpia.");
            return;
        }

        // ==========================================
        // PASO 2: PROCESAR UNO POR UNO
        // ==========================================
        console.log(`📥 Procesando ${targets.length} registros...`);

        for (const item of targets) {
            // Normalización de ID
            const rawId = item.id || item.remoteJid || item.key?.remoteJid;

            // Filtros de seguridad
            if (!rawId) continue;
            if (rawId.includes('@g.us')) continue; // Ignorar Grupos
            if (rawId.includes('@broadcast')) continue; // Ignorar Listas de difusión/Estados
            if (rawId === 'status@broadcast') continue;

            let whatsappId = rawId.split('@')[0];
            // Fix México (521 -> 52)
            if (whatsappId.startsWith('521') && whatsappId.length === 13) whatsappId = whatsappId.substring(3);

            // Nombre
            const nombre = item.pushName || item.name || item.notify || item.verifiedName || whatsappId;

            process.stdout.write(`🔹 ${whatsappId}... `);

            // 1. UPSERT CLIENTE EN SUPABASE
            let clienteId = null;
            const { data: clientData } = await supabaseAdmin
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
                console.log("❌ (Error Cliente)");
                continue;
            }

            // 2. OBTENER MENSAJES INDIVIDUALMENTE
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
                        if (typeof timestamp === 'number' && timestamp < 10000000000) timestamp *= 1000;

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
                        console.log(`✅ ${msjsParaGuardar.length} msjs`);
                    } else {
                        console.log("⚠️ (Sin texto)");
                    }
                } else {
                    console.log("💤 (Vacío)");
                }
            } catch (msgError: any) {
                // Si falla un chat específico, no detenemos el script
                console.log(`❌ (Error API: ${msgError.response?.status || msgError.message})`);
            }

            // Pequeña pausa para no saturar
            await delay(100);
        }

        console.log("\n🎉 IMPORTACIÓN FINALIZADA.");

    } catch (error) {
        console.error("❌ Error General:", error);
    }
};

importHistoryFinal();