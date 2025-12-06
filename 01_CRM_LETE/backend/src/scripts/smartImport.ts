import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

// CONFIGURACIÓN: ¿Cuántos días de silencio para considerarlo Fantasma?
const DIAS_INACTIVIDAD = 30; 

const smartImport = async () => {
  try {
    console.log('🕵️‍♂️ Iniciando Análisis Inteligente de Fantasmas...');
    
    const filePath = path.join(__dirname, '../../chats_con_fecha.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error('❌ No encuentro el archivo chats_con_fecha.csv');
        process.exit(1);
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');

    const now = Date.now() / 1000; // Tiempo actual en Segundos (WhatsApp usa segundos)
    const cutoff = now - (DIAS_INACTIVIDAD * 24 * 60 * 60); // Fecha límite hacia atrás

    let activeCount = 0;
    let ghostCount = 0;
    let errorCount = 0;

    console.log(`📅 Fecha de corte: ${new Date(cutoff * 1000).toLocaleDateString()} (Hace ${DIAS_INACTIVIDAD} días)`);
    console.log('------------------------------------------------');

    for (const line of lines) {
        const parts = line.split(',');
        if (parts.length < 2) continue;

        let remoteJid = parts[0].trim();
        let timestampStr = parts[1].trim();

        // Limpieza de comillas si el CSV las trajo
        remoteJid = remoteJid.replace(/"/g, '');
        timestampStr = timestampStr.replace(/"/g, '');

        if (!remoteJid.includes('@s.whatsapp.net')) continue;

        const lastMsgTime = parseInt(timestampStr);

        if (isNaN(lastMsgTime)) {
            errorCount++;
            continue;
        }

        // --- EL FILTRO MAESTRO ---
        if (lastMsgTime > cutoff) {
            // Habló RECIENTEMENTE (después de la fecha de corte)
            // Es un cliente activo, NO LO TOCAMOS.
            activeCount++;
            continue; 
        }

        // Si llegamos aquí, es un FANTASMA (Habló antes del corte)
        ghostCount++;

        // Insertar en BD como 'IMPORTED_OLD'
        // Nota: Si ya existe en la BD (porque ya hablamos hoy), el "ON CONFLICT DO NOTHING" lo protege.
        const query = `
            INSERT INTO conversations (whatsapp_id, client_name, status, last_interaction, assigned_to_role)
            VALUES ($1, $2, 'IMPORTED_OLD', to_timestamp($3), 'BOT')
            ON CONFLICT (whatsapp_id) DO NOTHING
        `;
        
        // Usamos el teléfono como nombre temporal si no tenemos el nombre a la mano, 
        // la IA lo corregirá cuando contesten.
        const name = `Cliente ${remoteJid.split('@')[0]}`;
        
        await pool.query(query, [remoteJid, name, lastMsgTime]);
        
        if (ghostCount % 50 === 0) process.stdout.write('👻');
    }

    console.log('\n\n📊 REPORTE DE ANÁLISIS:');
    console.log(`🟢 Activos (Ignorados): ${activeCount} (Hablaron hace menos de ${DIAS_INACTIVIDAD} días)`);
    console.log(`👻 Fantasmas (Importados): ${ghostCount} (Candidatos para revivir)`);
    console.log(`⚠️ Errores de datos: ${errorCount}`);
    console.log('------------------------------------------------');
    console.log('✅ Los fantasmas están en cola. El CronJob los procesará 1 por hora.');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

smartImport();

