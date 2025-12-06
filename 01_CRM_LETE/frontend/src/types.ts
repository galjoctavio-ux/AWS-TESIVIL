export interface Conversation {
  id: number;
  client_name: string;
  whatsapp_id: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'TECH_POOL' | 'SCHEDULED' | 'OPEN' | 'CLOSED';
  unread_count: number;
  last_interaction: string;
  assigned_to_role: string;
}

export interface Message {
  id: number;
  sender_type: 'CLIENT' | 'AGENT' | 'BOT' | 'SYSTEM';
  message_type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'NOTE';
  content: string;
  is_internal: boolean;
  created_at: string;
}
