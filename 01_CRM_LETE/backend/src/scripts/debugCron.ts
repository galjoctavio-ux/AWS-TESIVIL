
import { pool } from '../config/db';

const debug = async () => {
  try {
    console.log('🕵️‍♂️ DIAGNÓSTICO DE CRONJOB Y HORARIOS');
    
    // 1. Checar la hora del servidor y de la BD
    const timeCheck = await pool.query(`SELECT NOW() as db_time, CURRENT_TIMESTAMP as db_timestamp`);
    const serverTime = new Date();
    
    console.log('------------------------------------------------');
    console.log(`🖥️  Hora Node.js (Servidor): ${serverTime.toString()}`);
    console.log(`🗄️  Hora Postgres (BD):      ${timeCheck.rows[0].db_time}`);
    console.log('------------------------------------------------');

    // 2. Ver cuántos candidatos reales hay (sin filtros de hora estricta)
    const candidates = await pool.query(`
        SELECT id, client_name, status, last_interaction, 
        EXTRACT(EPOCH FROM (NOW() - last_interaction)) / 3600 as horas_pasadas
        FROM conversations 
        WHERE status = 'CONTACTED'
    `);

    // FIX: Aseguramos que rowCount sea un número
    const count = candidates.rowCount || 0;

    console.log(`📊 Clientes en estado 'CONTACTED': ${count}`);
    
    if (count > 0) {
        console.log('   Detalle de candidatos:');
        candidates.rows.forEach(c => {
            const horas = parseFloat(c.horas_pasadas);
            console.log(`   - ${c.client_name}:`);
            console.log(`     -> Última interacción: ${c.last_interaction}`);
            console.log(`     -> Horas pasadas (Cálculo BD): ${horas.toFixed(2)} horas`);
            
            if (horas >= 2 && horas <= 24) {
                console.log(`     ✅ CANDIDATO VÁLIDO (Debería enviarse)`);
            } else if (horas < 2) {
                console.log(`     ⏳ AÚN NO (Falta tiempo, lleva ${horas.toFixed(2)}h)`);
            } else {
                console.log(`     ❌ YA PASÓ (Más de 24h)`);
            }
        });
    } else {
        console.log('⚠️ No hay nadie en status CONTACTED. (¿Quizás están en OPEN o NEW?)');
    }

    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

debug();

