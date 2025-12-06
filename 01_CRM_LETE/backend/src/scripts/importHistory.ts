import axios from 'axios';
import dotenv from 'dotenv';
import { pool } from '../config/db';

dotenv.config();

const EVOLUTION_URL = process.env.EVOLUTION_URL || 'http://172.17.0.1:8080';
const API_KEY = process.env.EVOLUTION_APIKEY || 'B6D711FCDE4D4FD5936544120E713976';
const INSTANCE = process.env.EVOLUTION_INSTANCE || 'LuzEnTuEspacio';

// Función auxiliar para guardar en BD
const saveToDb = async (dataList: any[]) => {
    let count = 0;
    for (const item of dataList) {
        // Normalización: A veces viene como 'id', a veces 'remoteJid', a veces dentro de 'key'
        const remoteJid = item.id || item.remoteJid || item.key?.remoteJid;
        const name = item.pushName || item.name || item.notify || item.verifiedName || 'Cliente Importado';

        if (!remoteJid) continue;
        if (remoteJid.includes('@g.us') || remoteJid.includes('@broadcast') || remoteJid === 'status@broadcast') continue;

        const query = `
            INSERT INTO conversations (whatsapp_id, client_name, status, last_interaction, assigned_to_role)
            VALUES ($1, $2, 'IMPORTED_OLD', NOW(), 'BOT')
            ON CONFLICT (whatsapp_id) DO NOTHING
        `;
        const res = await pool.query(query, [remoteJid, name]);
        if (res.rowCount && res.rowCount > 0) count++;
    }
    return count;
};

const importChats = async () => {
  console.log('🚀 Iniciando Protocolo de Importación Multivia...');
  
  const endpoints = [
    { method: 'POST', url: `${EVOLUTION_URL}/contact/find/${INSTANCE}`, name: '1. Buscar Contactos (POST)' },
    { method: 'POST', url: `${EVOLUTION_URL}/chat/find/${INSTANCE}`, name: '2. Buscar Chats (POST)' },
    { method: 'GET',  url: `${EVOLUTION_URL}/contact/find/${INSTANCE}`, name: '3. Buscar Contactos (GET)' }
  ];

  let totalImported = 0;
  let success = false;

  for (const attempt of endpoints) {
      try {
          console.log(`\n👉 Intentando: ${attempt.name}...`);
          const response = await axios({
              method: attempt.method,
              url: attempt.url,
              headers: { 'apikey': API_KEY, 'Content-Type': 'application/json' },
              data: {} // Body vacío para POST
          });

          const data = Array.isArray(response.data) ? response.data : (response.data.map || []);
          
          if (data.length > 0) {
              console.log(`   ✅ ¡Éxito! Se encontraron ${data.length} registros.`);
              console.log('   💾 Guardando en base de datos...');
              const saved = await saveToDb(data);
              totalImported += saved;
              success = true;
              break; // Si funcionó, dejamos de intentar
          } else {
              console.log('   ⚠️ Endpoint respondió OK pero sin datos (Lista vacía).');
          }

      } catch (error: any) {
          console.log(`   ❌ Falló: ${error.message} (Status: ${error.response?.status || 'N/A'})`);
      }
  }

  if (success) {
      console.log(`\n🎉 IMPORTACIÓN EXITOSA. Total clientes nuevos: ${totalImported}`);
  } else {
      console.log('\n⚠️ No se pudieron importar datos históricos. Es posible que la agenda esté vacía en la API o aún no se sincronice.');
      console.log('💡 RECOMENDACIÓN: Envía un mensaje nuevo desde tu celular al Bot. Eso forzará la creación del chat en el sistema.');
  }
  
  process.exit(0);
};

importChats();
