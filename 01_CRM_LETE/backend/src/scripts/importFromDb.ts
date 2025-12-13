import { Pool } from 'pg';
import { supabaseAdmin } from '../services/supabaseClient';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// CREDENCIALES VERIFICADAS (IP DOCKER + USR/PASS EVOLUTION)
const pool = new Pool({
    user: 'evolution',
    host: '172.19.0.2',
    database: 'evolution',
    password: 'evolution',
    port: 5432,
});

const INSTANCE_NAME = 'LuzEnTuEspacio'; // Para filtrar solo tu instancia

const importDirectDb = async () => {
    console.log("🐘 INICIANDO IMPORTACIÓN FINAL (SCHEMA ADAPTADO)...");

    try {
        // 1. OBTENER CONTACTOS DESDE LA TABLA 'Chat'
        // Esta tabla ya tiene el resumen perfecto
        console.log("📋 Leyendo tabla 'Chat'...");

        const queryChats = `
            SELECT "remoteJid", "name"
            FROM "Chat"
            WHERE "instanceId" = $1
            AND "remoteJid" NOT LIKE '%@g.us' 
            AND "remoteJid" NOT LIKE '%@broadcast'
        `;

        const resChats = await pool.query(queryChats, [INSTANCE_NAME]);
        const chats = resChats.rows;

        console.log(`📥 Se encontraron ${chats.length} conversaciones activas.`);

        for (const c of chats) {
            const rawId = c.remoteJid;
            if (!rawId) continue;

            // Normalización
            let whatsappId = rawId.split('@')[0];
            if (whatsappId.startsWith('521') && whatsappId.length === 13) whatsappId = whatsappId.substring(3);

            const nombre = c.name || whatsappId;

            process.stdout.write(`🔹 ${whatsappId}... `);

            // A. UPSERT CLIENTE EN SUPABASE
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
                        crm_status: 'IMPORTED_DB',
                        crm_intent: 'NONE'
                    })
                    .select('id')
                    .single();
                if (newClient) clienteId = newClient.id;
            }

            if (!clienteId) {
                console.log("❌ (Skip Cliente)");
                continue;
            }

            // B. OBTENER MENSAJES (Extrayendo remoteJid del JSON 'key')
            // OJO: Postgres usa ->> para extraer texto de JSONB
            const queryMsgs = `
                SELECT "key", "message", "messageType", "messageTimestamp", "pushName"
                FROM "Message"
                WHERE "instanceId" = $1
                AND "key"->>'remoteJid' = $2
                ORDER BY "messageTimestamp" DESC
                LIMIT 30
            `;

            const resMsgs = await pool.query(queryMsgs, [INSTANCE_NAME, rawId]);
            const messages = resMsgs.rows;

            if (messages.length > 0) {
                const msjsParaGuardar = [];

                for (const msg of messages) {
                    let contentText = '';

                    // msg.message ya viene como objeto gracias a 'pg'
                    const msgContent = msg.message;

                    // Extracción robusta del contenido
                    if (!msgContent) continue;

                    if (msg.messageType === 'conversation') {
                        contentText = msgContent.conversation;
                    } else if (msg.messageType === 'extendedTextMessage') {
                        contentText = msgContent.extendedTextMessage?.text || msgContent.text;
                    } else if (msgContent.imageMessage) {
                        contentText = '📸 [Imagen]';
                    } else if (msgContent.audioMessage) {
                        contentText = '🎤 [Audio]';
                    } else if (msgContent.videoMessage) {
                        contentText = '🎥 [Video]';
                    } else if (msgContent.documentMessage) {
                        contentText = '📄 [Documento]';
                    } else {
                        // Último recurso: stringify
                        contentText = typeof msgContent === 'string' ? msgContent : JSON.stringify(msgContent).substring(0, 50);
                    }

                    if (!contentText) continue;

                    // Determinar rol (fromMe)
                    let isFromMe = false;
                    if (msg.key && typeof msg.key === 'object') {
                        isFromMe = msg.key.fromMe === true;
                    }

                    // Fecha (messageTimestamp suele ser SEGUNDOS en Baileys, JS usa MS)
                    let ts = parseInt(msg.messageTimestamp);
                    if (ts < 10000000000) ts *= 1000;
                    const createdAt = new Date(ts);

                    // ID
                    const msgId = msg.key?.id || `db_${Date.now()}_${Math.random()}`;

                    msjsParaGuardar.push({
                        cliente_id: clienteId,
                        whatsapp_message_id: msgId,
                        role: isFromMe ? 'assistant' : 'user',
                        content: contentText,
                        created_at: createdAt.toISOString(),
                        status: 'read'
                    });
                }

                if (msjsParaGuardar.length > 0) {
                    const { error } = await supabaseAdmin
                        .from('mensajes_whatsapp')
                        .upsert(msjsParaGuardar, { onConflict: 'whatsapp_message_id', ignoreDuplicates: true });

                    if (error) console.log(`⚠️ Err: ${error.message}`);
                    else console.log(`✅ ${msjsParaGuardar.length} msjs`);
                }
            } else {
                console.log("💤 (Sin mensajes)");
            }
        }

        console.log("\n🎉 IMPORTACIÓN DIRECTA FINALIZADA.");

    } catch (error) {
        console.error("\n❌ ERROR:", error);
    } finally {
        await pool.end();
    }
};

importDirectDb();