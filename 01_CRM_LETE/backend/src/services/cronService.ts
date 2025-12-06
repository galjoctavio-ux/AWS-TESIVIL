import cron from 'node-cron';
import { pool } from '../config/db';
import { sendText } from './whatsappService';
import { SCRIPTS } from '../config/scripts';

// Variables de Bloqueo (Semáforos)
let isCron1Running = false;
let isCron2Running = false;

// --- CONFIGURACIÓN DE HORARIO ---
const isBusinessHours = (): boolean => {
    const now = new Date();
    // Ajuste UTC-6 para México (CDMX/Guadalajara)
    // (UTC Hour - 6 + 24) % 24 maneja correctamente el cambio de día
    const mxHour = (now.getUTCHours() - 6 + 24) % 24;
    
    // Rango: De 8:00 (inclusive) a 20:00 (exclusivo, es decir hasta las 19:59)
    const isOpen = mxHour >= 8 && mxHour < 20;
    
    if (!isOpen) {
        // Log ligero para no ensuciar, solo para saber que está vivo pero durmiendo
        // console.log(`🌙 Fuera de horario laboral (${mxHour}:00 MX). Zzz...`);
    }
    return isOpen;
};

// Función para esperar un tiempo aleatorio (entre 1 min y 5 min)
const randomDelay = () => {
    const ms = Math.floor(Math.random() * (300000 - 60000 + 1) + 60000); 
    console.log(`🎲 Cron: Esperando ${Math.floor(ms / 1000)} seg antes de ejecutar...`);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const initCronJobs = () => {
  console.log('⏰ SISTEMA DE CRONJOBS: INICIADO (Horario 8am - 8pm).');

  // ==========================================
  // CRON 1: ANTI-GHOSTING (Clientes recientes)
  // Ejecución: Cada 10 minutos
  // ==========================================
  cron.schedule('*/10 * * * *', async () => {
    // 1. Chequeo de Horario
    if (!isBusinessHours()) return;

    // 2. Semáforo
    if (isCron1Running) {
        console.log('⚠️ Cron 1 saltado: La ejecución anterior aún no termina.');
        return;
    }
    isCron1Running = true;

    try {
        await randomDelay(); 
        
        console.log('🔍 Ejecutando Anti-Ghosting...');
        const query = `
            SELECT id, whatsapp_id, client_name 
            FROM conversations 
            WHERE status = 'CONTACTED' 
            AND last_interaction < NOW() - INTERVAL '2 hours'
            AND last_interaction > NOW() - INTERVAL '24 hours'
            LIMIT 3;
        `;
        const result = await pool.query(query);

        if (result.rows.length > 0) {
            console.log(`🎯 Cron 1: Encontrados ${result.rows.length} candidatos.`);
            
            for (const chat of result.rows) {
                // Doble check de estado
                const check = await pool.query('SELECT status FROM conversations WHERE id = $1', [chat.id]);
                if (check.rows[0].status !== 'CONTACTED') continue;

                console.log(`👻 Rescatando a ${chat.client_name}`);
                
                await sendText(chat.whatsapp_id, SCRIPTS.GHOST_FOLLOWUP);
                
                await pool.query(
                    `UPDATE conversations SET status = 'GHOST', assigned_to_role = 'ADMIN', last_interaction = NOW() WHERE id = $1`,
                    [chat.id]
                );
                
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    } catch (error) { 
        console.error('Error Cron 1:', error); 
    } finally {
        isCron1Running = false;
    }
  });

  // ==========================================
  // CRON 2: RECUPERACIÓN LENTA (Fantasmas viejos)
  // Ejecución: Cada 20 minutos (3 por hora)
  // ==========================================
  cron.schedule('*/20 * * * *', async () => {
    // 1. Chequeo de Horario
    if (!isBusinessHours()) return;

    // 2. Semáforo
    if (isCron2Running) return;
    isCron2Running = true;

    try {
      await randomDelay(); 

      console.log('🧟 Buscando cliente antiguo (Orden: Más antiguo primero)...');
      
      // Busca 1 registro viejo
      const query = `
        SELECT * FROM conversations 
        WHERE status = 'IMPORTED_OLD' 
        ORDER BY last_interaction ASC 
        LIMIT 1
      `;
      
      const result = await pool.query(query);
      
      if (result.rows.length > 0) {
          const chat = result.rows[0];
          console.log(`🧟 Reviviendo a: ${chat.client_name}`);
          
          const msg = `Hola, buen día. ☀️\nSoy Mónica de Luz en tu Espacio.\n\nEstamos revisando reportes anteriores pendientes. Noté que te interesaste en nuestro servicio.\n\n¿Aún tienes problemas con tu instalación eléctrica/consumo o ya lograste resolverlo?\n(Quedo pendiente para cerrar tu expediente)`;
          
          await sendText(chat.whatsapp_id, msg);
          
          // Lo pasamos a GHOST para sacarlo de la lista
          await pool.query(`UPDATE conversations SET status = 'GHOST', last_interaction = NOW() WHERE id = $1`, [chat.id]);
      } else {
          console.log('   ℹ️ Lista de recuperación vacía.');
      }
    } catch (e) { 
        console.error('Error Cron 2', e); 
    } finally {
        isCron2Running = false;
    }
  });
};
