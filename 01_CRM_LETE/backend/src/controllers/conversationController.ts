import { Request, Response } from 'express';
import { pool } from '../config/db';
import { sendText } from '../services/whatsappService';
import { generateTechSummary } from '../services/aiInternalService';

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

// 2. Obtener Historial (MODIFICADO: LÓGICA DE SEGURIDAD)
export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { view } = req.query; // Detectamos si es view=tech

    await pool.query('UPDATE conversations SET unread_count = 0 WHERE id = $1', [id]);

    if (view === 'tech') {
      // --- LÓGICA DE VISTA SEGURA PARA TÉCNICO ---
      const convData = await pool.query(
        'SELECT tech_summary, tech_assigned_at FROM conversations WHERE id = $1',
        [id]
      );

      const summary = convData.rows[0]?.tech_summary;
      const assignedAt = convData.rows[0]?.tech_assigned_at;

      // Si nunca se asignó fecha (casos viejos), usamos fecha actual como referencia
      const refDate = assignedAt || new Date().toISOString();

      // Solo mensajes DESPUÉS de la asignación
      const messages = await pool.query(
        `SELECT * FROM messages 
             WHERE conversation_id = $1 
             AND (created_at >= $2 OR $2 IS NULL)
             ORDER BY created_at ASC`,
        [id, refDate]
      );

      res.json({
        mode: 'tech_safe_view',
        summary: summary,
        messages: messages.rows
      });

    } else {
      // --- LÓGICA ADMIN (VER TODO) ---
      const result = await pool.query(
        `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
        [id]
      );
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 3. Send Manual (Con soporte para senderName)
export const sendManualMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, is_internal, senderName } = req.body;

    const convResult = await pool.query('SELECT whatsapp_id FROM conversations WHERE id = $1', [id]);
    if (convResult.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    const { whatsapp_id } = convResult.rows[0];

    // Formato de mensaje con nombre del técnico
    let messageToSend = content;
    if (!is_internal && senderName) {
      messageToSend = `*_${senderName} escribió:_* ${content}`;
    }

    if (!is_internal) {
      await sendText(whatsapp_id, messageToSend);
    }

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

// 4. Update Status (MODIFICADO: AQUÍ ESTÁ EL DISPARADOR)
export const updateConversationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assigned_to_role } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    let finalQuery = '';
    let finalParams: any[] = [];

    if (assigned_to_role) {
      // Actualizamos estado, rol y LA FECHA DE ASIGNACIÓN si es técnico
      finalQuery = `
            UPDATE conversations 
            SET status = $1, 
                assigned_to_role = $2,
                tech_assigned_at = CASE 
                    WHEN $2 = 'TECH' OR $1 = 'TECH_POOL' THEN COALESCE(tech_assigned_at, NOW())
                    ELSE tech_assigned_at 
                END
            WHERE id = $3 RETURNING *`;
      finalParams = [status, assigned_to_role, id];
    } else {
      finalQuery = `UPDATE conversations SET status = $1 WHERE id = $2 RETURNING *`;
      finalParams = [status, id];
    }

    const result = await pool.query(finalQuery, finalParams);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const updatedConv = result.rows[0];

    // --- DISPARADOR (TRIGGER) ---
    // Si asignamos a TECH o POOL, generamos resumen en segundo plano
    if (updatedConv.assigned_to_role === 'TECH' || updatedConv.status === 'TECH_POOL') {
      generateTechSummary(Number(id)).catch(err => console.error("Error background IA:", err));
    }

    res.json(updatedConv);

  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// 5. Get/Create by Phone (MODIFICADO: Para botón de Agenda)
export const getOrCreateByPhone = async (req: Request, res: Response) => {
  try {
    const { phone, name } = req.body;
    if (!phone) { res.status(400).json({ error: 'Phone is required' }); return; }

    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '521' + cleanPhone;
    const whatsappId = `${cleanPhone}@s.whatsapp.net`;

    let query = `SELECT * FROM conversations WHERE whatsapp_id = $1`;
    let result = await pool.query(query, [whatsappId]);

    let conversation;

    if (result.rows.length > 0) {
      conversation = result.rows[0];

      // REGLA: Si entra por agenda y no hay resumen, tratamos de generarlo
      if (!conversation.tech_summary) {
        generateTechSummary(conversation.id);
      }
      // Marcamos fecha de entrada si no existía
      if (!conversation.tech_assigned_at) {
        await pool.query('UPDATE conversations SET tech_assigned_at = NOW() WHERE id = $1', [conversation.id]);
      }
    } else {
      // Crear nuevo caso
      const insertQuery = `
            INSERT INTO conversations (whatsapp_id, client_name, status, assigned_to_role, unread_count, tech_assigned_at)
            VALUES ($1, $2, 'TECH_POOL', 'TECH', 0, NOW())
            RETURNING *
        `;
      const insertResult = await pool.query(insertQuery, [whatsappId, name || 'Cliente Nuevo']);
      conversation = insertResult.rows[0];
    }
    res.json(conversation);

  } catch (error) {
    console.error('Error finding/creating chat:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};
