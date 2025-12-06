import { Request, Response } from 'express';
import { pool } from '../config/db';
import { sendText } from '../services/whatsappService';

// 1. Obtener Lista de Chats
export const getConversations = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT id, client_name, whatsapp_id, status, unread_count, last_interaction, assigned_to_role 
      FROM conversations 
    `;
    const params: any[] = [];
    
    if (status) {
        query += ` WHERE status = $1`;
        params.push(status);
    }
    
    query += ` ORDER BY last_interaction DESC LIMIT 50`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 2. Obtener Historial
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE conversations SET unread_count = 0 WHERE id = $1', [id]);

    const result = await pool.query(
      `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 3. Enviar Mensaje Manual (MODIFICADA CON NOMBRE DE TÉCNICO)

export const sendManualMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // AHORA RECIBIMOS 'senderName' DIRECTAMENTE, YA NO BUSCAMOS EN BD
    const { content, is_internal, senderName } = req.body; 

    // ... (Validación de conversación existente sigue igual) ...
    const convResult = await pool.query('SELECT whatsapp_id FROM conversations WHERE id = $1', [id]);
    if (convResult.rows.length === 0) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
    }
    const { whatsapp_id } = convResult.rows[0];

    // --- LÓGICA SIMPLIFICADA ---
    let messageToSend = content;

    // Si nos enviaron el nombre y NO es nota interna, lo formateamos
    if (!is_internal && senderName) {
        messageToSend = `*_${senderName} escribió el siguiente mensaje:_* ${content}`;
        console.log(`📨 Enviando como: ${senderName}`);
    }
    // ---------------------------

    if (!is_internal) {
        await sendText(whatsapp_id, messageToSend);
    }

    // Guardar original en BD (Sigue igual)
    const savedMsg = await pool.query(
      `INSERT INTO messages (conversation_id, sender_type, message_type, content, is_internal) 
       VALUES ($1, 'AGENT', 'TEXT', $2, $3) RETURNING *`,
      [id, content, is_internal || false]
    );

    await pool.query('UPDATE conversations SET last_interaction = NOW() WHERE id = $1', [id]);
    res.json(savedMsg.rows[0]);

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 4. Actualizar Estado
export const updateConversationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assigned_to_role } = req.body;

    if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
    }

    let query = `UPDATE conversations SET status = $1`;
    const params = [status, id];

    if (assigned_to_role) {
        query += `, assigned_to_role = $2 WHERE id = $3`;
        params.splice(1, 0, assigned_to_role);
    } else {
        query += ` WHERE id = $2`;
    }
    
    query += ` RETURNING *`;

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 5. OBTENER O CREAR CHAT POR TELÉFONO
export const getOrCreateByPhone = async (req: Request, res: Response) => {
  try {
    const { phone, name } = req.body;

    if (!phone) {
        res.status(400).json({ error: 'Phone is required' });
        return;
    }

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '521' + cleanPhone;
    const whatsappId = `${cleanPhone}@s.whatsapp.net`;

    let query = `SELECT * FROM conversations WHERE whatsapp_id = $1`;
    let result = await pool.query(query, [whatsappId]);

    if (result.rows.length > 0) {
        res.json(result.rows[0]);
    } else {
        const insertQuery = `
            INSERT INTO conversations (whatsapp_id, client_name, status, assigned_to_role, unread_count)
            VALUES ($1, $2, 'TECH_POOL', 'TECH', 0) 
            RETURNING *
        `;
        const insertResult = await pool.query(insertQuery, [whatsappId, name || 'Cliente Nuevo']);
        res.json(insertResult.rows[0]);
    }

  } catch (error) {
    console.error('Error finding/creating chat:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};
