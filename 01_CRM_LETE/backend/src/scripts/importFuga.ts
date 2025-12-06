import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

const importFuga = async () => {
  try {
    console.log('📂 Importando lista de Fuga/Cortos...');
    
    const filePath = path.join(__dirname, '../../clientes_fuga_cortos.csv');
    
    if (!fs.existsSync(filePath)) {
        console.error('❌ No encuentro el archivo clientes_fuga_cortos.csv en la raíz del backend.');
        process.exit(1);
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');

    let count = 0;

    // Saltamos la primera línea si es el encabezado (nombre,telefono...)
    const startIdx = lines[0].includes('telefono') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // CSV Format: nombre,telefono,fecha,total
        const parts = line.split(',');
        
        // El teléfono está en la posición 1
        let rawPhone = parts[1]; 
        let rawDate = parts[2];

        if (!rawPhone) continue;

        // Limpieza
        const whatsappId = rawPhone.trim(); 
        const cleanPhone = whatsappId.replace(/\D/g, '');
        
        // Si no hay nombre, usamos el número
        const name = parts[0] || `Prospecto ${cleanPhone.slice(-4)}`;

        // Validar fecha (si no es válida, usamos NOW)
        let lastInteraction = 'NOW()';
        if (rawDate && !isNaN(Date.parse(rawDate))) {
            lastInteraction = `'${rawDate}'`;
        }

        // Insertar con estado 'IMPORTED_OLD'
        // ON CONFLICT: Si ya existe, actualizamos el estado a IMPORTED_OLD para meterlo al flujo
        // (A menos que ya esté en proceso GHOST o CLOSED)
        const query = `
            INSERT INTO conversations (whatsapp_id, client_name, status, last_interaction, assigned_to_role)
            VALUES ($1, $2, 'IMPORTED_OLD', ${lastInteraction}, 'BOT')
            ON CONFLICT (whatsapp_id) 
            DO UPDATE SET status = 'IMPORTED_OLD' 
            WHERE conversations.status NOT IN ('GHOST', 'CLOSED', 'CONTACTED');
        `;
        
        try {
            await pool.query(query, [whatsappId, name]);
            count++;
            if (count % 10 === 0) process.stdout.write('.');
        } catch (e) {
            console.error(`Error en línea ${i}:`, e);
        }
    }

    console.log(`\n✅ Importación finalizada. ${count} registros listos para reactivación.`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  }
};

importFuga();
