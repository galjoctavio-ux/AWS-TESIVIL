import { Pool } from 'pg';
import { supabaseAdmin } from '../services/supabaseClient';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// CONFIGURACIÓN DATABASE EVOLUTION
// Usamos 'localhost' asumiendo que el puerto 5432 está expuesto en el Docker
const pool = new Pool({
    user: 'evolution',      // <--- VERIFICADO
    host: '172.19.0.2',     // <--- MANTÉN LA IP QUE YA FUNCIONÓ
    database: 'evolution',  // <--- VERIFICADO
    password: 'evolution',  // <--- LA CLAVE CORRECTA
    port: 5432,
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const importDirectDb = async () => {
    console.log("🐘 INICIANDO IMPORTACIÓN DIRECTA (POSTGRES)...");

    try {
        // 1. PRUEBA DE CONEXIÓN
        console.log("🔌 Conectando a la DB de Evolution...");
        const resTime = await pool.query('SELECT NOW()');
        console.log("✅ Conexión Exitosa. Hora DB:", resTime.rows[0].now);

        // 2. OBTENER CONTACTOS (DISTINCT remoteJid de Mensajes)
        // Preferimos sacar los IDs de la tabla de mensajes para asegurar que importamos gente con historial
        console.log("📋 Buscando conversaciones activas...");

        // NOTA: Evolution usa comillas dobles para tablas creadas con Prisma ("Message")
        const queryContacts = `
            SELECT DISTINCT "remoteJid", "pushName"
            FROM "Message"
            WHERE "remoteJid" NOT LIKE '%@g.us' 
            AND "remoteJid" NOT LIKE '%@broadcast'
        `;

        const resContacts = await pool.query(queryContacts);
        const contacts = resContacts.rows;

        console.log(`📥 Se encontraron ${contacts.length} conversaciones.`);

        for (const c of contacts) {
            const rawId = c.remoteJid;
            if (!rawId) continue;

            // Normalización
            let whatsappId = rawId.split('@')[0];
            if (whatsappId.startsWith('521') && whatsappId.length === 13) whatsappId = whatsappId.substring(3);

            const nombre = c.pushName || whatsappId;

            process.stdout.write(`🔹 Procesando ${whatsappId}... `);

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

            // B. OBTENER MENSAJES DE ESTE CHAT
            // Traemos los últimos 30 mensajes
            const queryMsgs = `
                SELECT "key", "content", "messageType", "createdAt", "remoteJid"
                FROM "Message"
                WHERE "remoteJid" = $1
                ORDER BY "createdAt" DESC
                LIMIT 30
            `;

            const resMsgs = await pool.query(queryMsgs, [rawId]);
            const messages = resMsgs.rows;

            if (messages.length > 0) {
                const msjsParaGuardar = [];

                for (const msg of messages) {
                    let contentText = '';

                    // Evolution guarda el contenido como JSON en la columna "content"
                    // Necesitamos parsearlo o leerlo según venga
                    try {
                        const contentJson = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;

                        if (msg.messageType === 'conversation') {
                            contentText = contentJson.conversation || contentJson; // A veces es string directo
                        } else if (msg.messageType === 'extendedTextMessage') {
                            contentText = contentJson.extendedTextMessage?.text || contentJson.text;
                        } else if (msg.messageType === 'imageMessage') {
                            contentText = '📸 [Imagen]';
                        } else if (msg.messageType === 'audioMessage') {
                            contentText = '🎤 [Audio]';
                        } else {
                            // Intento genérico de sacar texto
                            contentText = contentJson.text || `[${msg.messageType}]`;
                        }
                    } catch (e) {
                        contentText = '[Error parsing content]';
                    }

                    if (!contentText || typeof contentText !== 'string') continue;

                    // Determinar si es del usuario o del bot
                    // La columna "key" en Evolution suele ser un JSON que contiene { fromMe: boolean }
                    let isFromMe = false;
                    try {
                        const keyObj = typeof msg.key === 'string' ? JSON.parse(msg.key) : msg.key;
                        isFromMe = keyObj.fromMe || false;
                    } catch (e) { isFromMe = false; }

                    // Fecha
                    const createdAt = new Date(msg.createdAt); // Postgres devuelve Date object usualmente

                    // ID único
                    // Intentamos sacar el ID del mensaje del objeto key
                    let msgId = `db_${Date.now()}_${Math.random()}`;
                    try {
                        const keyObj = typeof msg.key === 'string' ? JSON.parse(msg.key) : msg.key;
                        if (keyObj.id) msgId = keyObj.id;
                    } catch (e) { }

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

                    if (error) console.log(`⚠️ Supabase Error: ${error.message}`);
                    else console.log(`✅ ${msjsParaGuardar.length} msjs`);
                }
            } else {
                console.log("💤 (Sin mensajes)");
            }
        }

        console.log("\n🎉 IMPORTACIÓN DIRECTA FINALIZADA.");

    } catch (error) {
        console.error("\n❌ ERROR CRÍTICO DE DB:", error);
        console.log("\n💡 PISTA: Si falla la conexión, asegúrate que en el docker-compose de Evolution tengas algo como:");
        console.log("   ports:");
        console.log("     - '5432:5432'");
    } finally {
        await pool.end();
    }
};

importDirectDb();