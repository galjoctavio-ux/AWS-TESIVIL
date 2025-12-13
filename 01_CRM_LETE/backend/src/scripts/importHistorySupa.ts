import { Pool } from 'pg';
import { supabaseAdmin } from '../services/supabaseClient';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// CREDENCIALES EVOLUTION (POSTGRES)
const pool = new Pool({
    user: 'evolution',
    host: '172.19.0.2', // La IP interna del Docker que ya funcionó
    database: 'evolution',
    password: 'evolution',
    port: 5432,
});

// TU INSTANCE ID (El que encontramos antes)
const INSTANCE_UUID = '952f8c1c-99c9-46d3-982b-d6704972b01d';

const importDirectDb = async () => {
    console.log("🐘 INICIANDO IMPORTACIÓN MASIVA (CREANDO FALTANTES)...");

    try {
        // 1. OBTENER LISTA DE CHATS DESDE EVOLUTION
        console.log("📋 Leyendo tabla 'Chat'...");

        const queryChats = `
            SELECT "remoteJid", "name", "pushName"
            FROM "Chat"
            WHERE "instanceId" = $1
            AND "remoteJid" NOT LIKE '%@g.us' 
            AND "remoteJid" NOT LIKE '%@broadcast'
            AND "remoteJid" != 'status@broadcast'
        `;

        const resChats = await pool.query(queryChats, [INSTANCE_UUID]);
        const chats = resChats.rows;

        console.log(`📥 Se procesarán ${chats.length} conversaciones.`);

        let creados = 0;
        let actualizados = 0;

        for (const c of chats) {
            const rawId = c.remoteJid;
            if (!rawId) continue;

            // Normalización (Quitar @s.whatsapp.net y prefijos de MX)
            let whatsappId = rawId.split('@')[0];
            if (whatsappId.startsWith('521') && whatsappId.length === 13) whatsappId = whatsappId.substring(3);

            // Intentar obtener el mejor nombre posible
            const nombre = c.name || c.pushName || `Cliente ${whatsappId}`;

            process.stdout.write(`🔹 ${whatsappId} (${nombre.substring(0, 10)})... `);

            // ============================================================
            // A. OBTENER O CREAR CLIENTE (UPSERT LOGIC)
            // ============================================================
            let clienteId = null;

            // 1. Buscamos si ya existe
            const { data: clientData } = await supabaseAdmin
                .from('clientes')
                .select('id')
                .or(`whatsapp_id.eq.${whatsappId},telefono.eq.${whatsappId}`)
                .maybeSingle();

            if (clientData) {
                // YA EXISTE
                clienteId = clientData.id;
                // process.stdout.write(" (Existe) ");
            } else {
                // NO EXISTE -> LO CREAMOS
                const { data: newClient, error: insertError } = await supabaseAdmin
                    .from('clientes')
                    .insert({
                        whatsapp_id: whatsappId,
                        telefono: whatsappId,
                        nombre_completo: nombre, // Si es null, Supabase puede quejarse si es required, pero pusimos fallback arriba
                        crm_status: 'IMPORTED_HISTORY',
                        crm_intent: 'NONE',
                        // Los demás campos (saldo, citas) se crearán como NULL por defecto
                    })
                    .select('id')
                    .single();

                if (insertError) {
                    console.log(`❌ Error creando cliente: ${insertError.message}`);
                    continue; // Si falla la creación, saltamos al siguiente
                }

                if (newClient) {
                    clienteId = newClient.id;
                    process.stdout.write(" ✨ NUEVO ");
                    creados++;
                }
            }

            if (!clienteId) continue;

            // ============================================================
            // B. OBTENER MENSAJES (Extracción del JSON 'key')
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

                    // Extracción de contenido (Texto, Imagen, Audio)
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
                        contentText = `📄 [Archivo]: ${msgContent.documentMessage.fileName || 'Documento'}`;
                    } else {
                        try {
                            // Si es algo raro, lo convertimos a texto plano
                            const jsonStr = JSON.stringify(msgContent);
                            // Evitamos guardar JSONs gigantes vacíos
                            if (jsonStr.length < 5) continue;
                            contentText = jsonStr.substring(0, 100);
                        } catch { contentText = '[Media/Otro]'; }
                    }

                    if (!contentText) continue;

                    // Rol (fromMe)
                    let isFromMe = false;
                    if (msg.key && typeof msg.key === 'object') {
                        isFromMe = msg.key.fromMe === true;
                    }

                    // Fecha
                    let ts = parseInt(msg.messageTimestamp);
                    if (ts < 10000000000) ts *= 1000;
                    const createdAt = new Date(ts);

                    // ID Único del mensaje
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

                    if (error) console.log(`⚠️ Err Msjs: ${error.message}`);
                    else {
                        console.log(`✅ ${msjsParaGuardar.length} msjs`);
                        actualizados++;
                    }
                } else {
                    console.log("⚠️ (Sin contenido legible)");
                }
            } else {
                console.log("💤 (Chat vacío)");
            }

            // Pausa minúscula para no saturar CPU
            // await new Promise(r => setTimeout(r, 10)); 
        }

        console.log("\n🎉 IMPORTACIÓN FINALIZADA.");
        console.log(`🆕 Clientes Nuevos Creados: ${creados}`);
        console.log(`💬 Chats Importados/Actualizados: ${actualizados}`);

    } catch (error) {
        console.error("\n❌ ERROR GENERAL:", error);
    } finally {
        await pool.end();
    }
};

importDirectDb();