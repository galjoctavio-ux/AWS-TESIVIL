// checkTime.ts
import { query } from './config/db'; // Asegúrate de importar tu conexión real

const runAudit = async () => {
    console.log('--- 🕵️ AUDITORÍA DE TIEMPO ---');

    // 1. Hora del Servidor (Node.js / V8 Engine)
    const now = new Date();
    console.log('1. Node.js (new Date()):');
    console.log('   > ISO String (Z):', now.toISOString());
    console.log('   > Local String:  ', now.toString());
    console.log('   > Hora Detectada:', now.getHours());
    console.log('   > UTC Hours:     ', now.getUTCHours());
    console.log('------------------------------------------------');

    // 2. Hora del Sistema Operativo (Intento de ejecutar comando date)
    try {
        const { execSync } = require('child_process');
        const osDate = execSync('date').toString().trim();
        console.log('2. Ubuntu System Date:', osDate);
    } catch (e) {
        console.log('2. Ubuntu System Date: No se pudo acceder.');
    }
    console.log('------------------------------------------------');

    // 3. Hora de la Base de Datos (PostgreSQL)
    try {
        const res = await query(`
            SELECT 
                NOW() as db_now, 
                NOW()::time as db_time,
                current_setting('TIMEZONE') as db_timezone,
                EXTRACT(HOUR FROM NOW()) as db_hour_extracted
        `);
        const row = res.rows[0];
        console.log('3. PostgreSQL Info:');
        console.log('   > NOW():      ', row.db_now); // Fíjate si tiene +00 o -06 al final
        console.log('   > Timezone:   ', row.db_timezone);
        console.log('   > Hora pura:  ', row.db_hour_extracted);
    } catch (e) {
        console.error('Error consultando DB:', e);
    }
    console.log('------------------------------------------------');
};

runAudit();