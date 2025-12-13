import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    user: 'evolution',
    host: '172.19.0.2',
    database: 'evolution',
    password: 'evolution',
    port: 5432,
});

const check = async () => {
    console.log("🕵️ INVESTIGANDO DATOS REALES EN DB...");

    try {
        // 1. REVISAR TABLA 'Chat'
        console.log("\n--- TABLA 'Chat' ---");
        const resChat = await pool.query(`SELECT count(*) FROM "Chat"`);
        console.log(`Total filas: ${resChat.rows[0].count}`);

        if (parseInt(resChat.rows[0].count) > 0) {
            const resInst = await pool.query(`SELECT DISTINCT "instanceId" FROM "Chat"`);
            console.log("InstanceIDs encontrados:", resInst.rows);
        }

        // 2. REVISAR TABLA 'Message'
        console.log("\n--- TABLA 'Message' ---");
        const resMsg = await pool.query(`SELECT count(*) FROM "Message"`);
        console.log(`Total filas: ${resMsg.rows[0].count}`);

        if (parseInt(resMsg.rows[0].count) > 0) {
            const resInstMsg = await pool.query(`SELECT DISTINCT "instanceId" FROM "Message"`);
            console.log("InstanceIDs en Mensajes:", resInstMsg.rows);

            // Ver un ejemplo de 'key' para confirmar dónde está el remoteJid
            const sample = await pool.query(`SELECT "key" FROM "Message" LIMIT 1`);
            console.log("Ejemplo de Key:", JSON.stringify(sample.rows[0].key));
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await pool.end();
    }
};

check();