import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// CREDENCIALES QUE YA FUNCIONARON
const pool = new Pool({
    user: 'evolution',
    host: '172.19.0.2',
    database: 'evolution',
    password: 'evolution',
    port: 5432,
});

const inspect = async () => {
    console.log("🕵️ INSPECCIONANDO ESQUEMA DE DB...");
    try {
        // 1. Ver qué tablas existen
        console.log("\n--- TABLAS DISPONIBLES ---");
        const resTables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log(resTables.rows.map(r => r.table_name).join(', '));

        // 2. Ver columnas de la tabla 'Message'
        console.log("\n--- COLUMNAS EN 'Message' ---");
        const resMsg = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Message'
        `);
        resMsg.rows.forEach(r => console.log(`   - ${r.column_name} (${r.data_type})`));

        // 3. Ver columnas de la tabla 'Chat' (si existe, es mejor sacar contactos de aquí)
        console.log("\n--- COLUMNAS EN 'Chat' ---");
        const resChat = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Chat'
        `);
        if (resChat.rows.length > 0) {
            resChat.rows.forEach(r => console.log(`   - ${r.column_name} (${r.data_type})`));
        } else {
            console.log("   (La tabla Chat no existe o tiene otro nombre)");
        }

    } catch (error) {
        console.error("❌ Error inspeccionando:", error);
    } finally {
        await pool.end();
    }
};

inspect();