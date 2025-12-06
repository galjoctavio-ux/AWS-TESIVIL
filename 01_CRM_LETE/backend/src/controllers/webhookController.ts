import { Request, Response } from 'express';
import { pool } from '../config/db';
import { analyzeIntent } from '../services/aiService'; // Ahora usa la versión con memoria
import { sendText } from '../services/whatsappService'; // Ya incluye el delay humano

export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    
    // --- 1. EXTRACCIÓN Y LIMPIEZA DE DATOS ---
    let event = '';
    let messageData: any = null;

    if (body.webhook && body.webhook.events) {
        event = body.webhook.events[0];
        messageData = body.webhook.data;
    } else if (body.event) {
        event = body.event;
        messageData = body.data;
    }
    event = event ? event.toUpperCase().replace('.', '_') : '';

    // Validar que sea mensaje nuevo y tenga datos
    if (event !== 'MESSAGES_UPSERT' || !messageData || !messageData.key) {
      res.status(200).json({ status: 'ignored' });
      return;
    }

    // --- 2. DEDUPLICACIÓN (EVITAR RESPONDER 2 VECES LO MISMO) ---
    const messageId = messageData.key.id;
    const existingCheck = await pool.query('SELECT id FROM messages WHERE whatsapp_message_id = $1', [messageId]);
    
    if (existingCheck.rows.length > 0) {
        res.status(200).json({ status: 'duplicate_ignored' });
        return;
    }

    // Datos del remitente
    const isFromMe = messageData.key.fromMe;
    let remoteJid = messageData.key.remoteJid;
    if (remoteJid.includes('@lid') && messageData.key.remoteJidAlt) {
        remoteJid = messageData.key.remoteJidAlt;
    }

    const pushName = isFromMe ? 'Agente' : (messageData.pushName || 'Cliente');
    
    // Extraer contenido de texto
    let content = '';
    if (messageData.messageType === 'conversation') {
        content = messageData.message.conversation;
    } else if (messageData.messageType === 'extendedTextMessage') {
        content = messageData.message.extendedTextMessage.text;
    } else {
        content = '[Multimedia/Otros]';
    }

    console.log(`📨 ${isFromMe ? 'YO' : 'CLIENTE'}: ${content}`);

    // --- 3. GESTIÓN DE CONVERSACIÓN (UPSERT) ---
    let userQuery = '';
    let params: any[] = [];

    if (isFromMe) {
        // Si escribo yo, asumo que atiendo el caso (OPEN/ADMIN)
        userQuery = `
          INSERT INTO conversations (whatsapp_id, client_name, last_interaction, status, assigned_to_role)
          VALUES ($1, $2, NOW(), 'OPEN', 'ADMIN')
          ON CONFLICT (whatsapp_id) DO UPDATE SET last_interaction = NOW()
          RETURNING id, status, assigned_to_role;
        `;
        params = [remoteJid, 'Cliente Nuevo'];
    } else {
        // Si escribe cliente, actualizo timestamp y contador
        userQuery = `
          INSERT INTO conversations (whatsapp_id, client_name, last_interaction, status, assigned_to_role)
          VALUES ($1, $2, NOW(), 'NEW', 'BOT')
          ON CONFLICT (whatsapp_id) DO UPDATE SET 
            last_interaction = NOW(), 
            client_name = EXCLUDED.client_name,
            unread_count = conversations.unread_count + 1
          RETURNING id, status, assigned_to_role;
        `;
        params = [remoteJid, pushName];
    }
    
    const userResult = await pool.query(userQuery, params);
    const conversation = userResult.rows[0];

    // Guardar el mensaje entrante en BD
    await pool.query(
      `INSERT INTO messages (conversation_id, sender_type, message_type, content, whatsapp_message_id) 
       VALUES ($1, $2, 'TEXT', $3, $4)`,
      [conversation.id, isFromMe ? 'AGENT' : 'CLIENT', content, messageId]
    );

// =========================================================
    // 🛑 MODO DEBUG ACTIVADO: DETENER AQUÍ
    // =========================================================
    console.log('🛑 DEBUG: Mensaje guardado. Respuesta automática bloqueada.');
    res.status(200).json({ status: 'saved_debug_mode' });
    return; // <--- ESTO ES LO QUE DETIENE TODO
    // =========================================================


    // --- 4. DECISIÓN DEL CEREBRO (IA) ---
    
    // Regla 1: Si el mensaje es mío, no hago nada más.
    if (isFromMe) {
        res.status(200).json({ status: 'saved_own' });
        return;
    }

    // Regla 2: Si el chat ya no es del BOT, no intervengo.
    if (conversation.assigned_to_role !== 'BOT') {
        console.log('🤫 Chat humano activo. IA en silencio.');
        res.status(200).json({ status: 'saved_silent' });
        return;
    }

    // Regla 3: Invocar a la IA con MEMORIA (pasando conversation.id)
    // El servicio aiService se encargará de leer el historial previo.
    const analysis = await analyzeIntent(conversation.id, content);
    
    console.log(`🧠 Decisión IA: ${analysis.decision} | Razón: ${analysis.reason || 'N/A'}`);

    // --- 5. EJECUCIÓN DE LA DECISIÓN ---

    if (analysis.decision === 'REPLY' && analysis.message) {
        // A) RESPONDER
        
        // Avisamos a WhatsApp API que todo está bien antes de empezar el delay
        res.status(200).json({ status: 'processing_reply' });

        // La función sendText ya incluye:
        // 1. "Escribiendo..."
        // 2. Cálculo de delay humano
        // 3. Envío final
        await sendText(remoteJid, analysis.message || '');
        
        // Guardar la respuesta de la IA en BD
        await pool.query(
            `INSERT INTO messages (conversation_id, sender_type, message_type, content) VALUES ($1, 'BOT', 'TEXT', $2)`,
            [conversation.id, analysis.message]
        );
        
        // Actualizamos estado a CONTACTED (Ya hubo interacción)
        await pool.query(
            `UPDATE conversations SET status = 'CONTACTED', unread_count = 0 WHERE id = $1`, 
            [conversation.id]
        );

    } else {
        // B) HANDOFF (HANDOFF_OTHER o HANDOFF_READY)
        // Silencio estratégico + Transferencia a Mónica
        
        console.log('🤐 IA transfiere el caso (Silencio).');
        
        await pool.query(
            `UPDATE conversations SET status = 'OPEN', assigned_to_role = 'ADMIN', unread_count = unread_count + 1 WHERE id = $1`,
            [conversation.id]
        );
        
        res.status(200).json({ status: 'handed_off', reason: analysis.decision });
    }

  } catch (error) {
    console.error('❌ Error crítico en webhook:', error);
    // Siempre devolver 200 para evitar bucles de reintento de WhatsApp
    res.status(200).json({ error: 'Internal Error Handled' });
  }
};
