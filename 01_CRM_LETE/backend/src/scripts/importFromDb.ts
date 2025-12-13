import { Pool } from 'pg';
import { supabaseAdmin } from '../services/supabaseClient';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// CREDENCIALES DB EVOLUTION (Las que funcionan)
const pool = new Pool({
    user: 'evolution',
    host: '172.19.0.2',
    database: 'evolution',
    password: 'evolution',
    port: 5432,
});

// TU INSTANCE UUID
const INSTANCE_UUID = '952f8c1c-99c9-46d3-982b-d6704972b01d';

const importDirectDb = async () => {
    console.log("🐘 INICIANDO IMPORTACIÓN MASIVA (Corregido: Solo columnas existentes)...");

    try {
        // 1. LEER CHATS (Quitamos pushName porque no existe en esta tabla)
        console.log("📋 Leyendo tabla 'Chat' de Evolution...");

        const queryChats = `
            SELECT "remoteJid", "name"
            FROM "Chat"
            WHERE "instanceId" = $1
            AND "remoteJid" NOT LIKE '%@g.us' 
            AND "remoteJid" NOT LIKE '%@broadcast'
            AND "remoteJid" != 'status@broadcast'
        `;

        const resChats = await pool.query(queryChats, [INSTANCE_UUID]);
        const chats = resChats.rows;

        console.log(`📥 Se encontraron ${chats.length} conversaciones.`);

        let creados = 0;
        let actualizados = 0;

        for (const c of chats) {
            const rawId = c.remoteJid;
            if (!rawId) continue;

            // Limpieza del número
            let whatsappId = rawId.split('@')[0];
            if (whatsappId.startsWith('521') && whatsappId.length === 13) whatsappId = whatsappId.substring(3);

            // Intentamos conseguir un nombre, si es null usamos el número
            const nombre = c.name || `Cliente ${whatsappId}`;

            process.stdout.write(`🔹 ${whatsappId}... `);

            // ============================================================
            // A. GESTIÓN DEL CLIENTE (CREAR SI NO EXISTE)
            // ============================================================
            let clienteId = null;

            // 1. Buscar si ya existe
            const { data: clientData } = await supabaseAdmin
                .from('clientes')
                .select('id')
                .or(`whatsapp_id.eq.${whatsappId},telefono.eq.${whatsappId}`)
                .maybeSingle();

            if (clientData) {
                clienteId = clientData.id;
            } else {
                // 2. CREAR (Si no existe)
                const { data: newClient, error: insertError } = await supabaseAdmin
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

                if (insertError) {
                    console.log(`❌ Error creando: ${insertError.message}`);
                    continue;
                }

                if (newClient) {
                    clienteId = newClient.id;
                    process.stdout.write(" ✨ CREADO ");
                    creados++;
                }
            }

            if (!clienteId) continue;

            // ============================================================
            // B. IMPORTAR MENSAJES (POSTGRES -> SUPABASE)
            // ============================================================
            const queryMsgs = `
                SELECT "key", "message", "messageType", "messageTimestamp"
                FROM "Message"
                WHERE "instanceId" = $1
                AND "key"->>'remoteJid' = $2
                ORDER BY "messageTimestamp" DESC
                LIMIT 30
            `;

            const resMsgs = await pool.query(queryMsgs, [INSTANCE_UUID, rawId]);
            const messages = resMsgs.rows;

            if (messages.length > 0) {
                const msjsParaGuardar = [];

                for (const msg of messages) {
                    let contentText = '';
                    const msgContent = msg.message;

                    if (!msgContent) continue;

                    // Extracción de contenido
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
                        contentText = `📄 [Archivo]: ${msgContent.documentMessage.fileName || 'Doc'}`;
                    } else {
                        try {
                            const jsonStr = JSON.stringify(msgContent);
                            if (jsonStr.length > 5) contentText = jsonStr.substring(0, 100);
                        } catch { contentText = '[Media/Otro]'; }
                    }

                    if (!contentText) continue;

                    // Rol
                    const isFromMe = msg.key?.fromMe === true;

                    // Fecha
                    let ts = parseInt(msg.messageTimestamp);
                    if (ts < 10000000000) ts *= 1000;

                    const msgId = msg.key?.id || `db_${Date.now()}_${Math.random()}`;

                    msjsParaGuardar.push({
                        cliente_id: clienteId,
                        whatsapp_message_id: msgId,
                        role: isFromMe ? 'assistant' : 'user',
                        content: contentText,
                        created_at: new Date(ts).toISOString(),
                        status: 'read'
                    });
                }

                if (msjsParaGuardar.length > 0) {
                    const { error } = await supabaseAdmin
                        .from('mensajes_whatsapp')
                        .upsert(msjsParaGuardar, { onConflict: 'whatsapp_message_id', ignoreDuplicates: true });

                    if (!error) {
                        console.log(`✅ ${msjsParaGuardar.length} msjs`);
                        actualizados++;
                    }
                }
            } else {
                console.log("💤 (Vacío)");
            }
        }

        console.log("\n🎉 IMPORTACIÓN FINALIZADA.");
        console.log(`🆕 Clientes Nuevos: ${creados}`);
        console.log(`💬 Chats Procesados: ${actualizados}`);

    } catch (error) {
        console.error("\n❌ ERROR CRÍTICO:", error);
    } finally {
        await pool.end();
    }
};

importDirectDb();