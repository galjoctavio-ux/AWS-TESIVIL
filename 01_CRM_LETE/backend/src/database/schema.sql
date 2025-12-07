-- Tabla Principal de Conversaciones
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    whatsapp_id VARCHAR(50) UNIQUE NOT NULL, -- RemoteJid
    client_name VARCHAR(100),
    avatar_url TEXT,
    
    -- ESTADOS DEL FLUJO
    status VARCHAR(20) DEFAULT 'NEW', 
    -- 'NEW', 'CONTACTED', 'QUALIFIED', 'TECH_POOL', 'SCHEDULED', 'CLOSED', 'GHOST'
    
    -- CLASIFICACIÓN
    service_category VARCHAR(20) DEFAULT 'UNKNOWN',
    -- 'DIAGNOSTIC', 'PROJECT', 'EMERGENCY'
    
    -- ASIGNACIÓN
    assigned_to_role VARCHAR(20) DEFAULT 'BOT', -- 'BOT', 'ADMIN', 'TECH'
    current_agent_id INT NULL, 
    
    last_interaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unread_count INT DEFAULT 0
);

-- Tabla de Mensajes
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(10) NOT NULL, -- 'CLIENT', 'AGENT', 'SYSTEM', 'BOT'
    message_type VARCHAR(10) NOT NULL, -- 'TEXT', 'IMAGE', 'AUDIO', 'NOTE'
    content TEXT,
    media_url TEXT,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar velocidad (Best Practice)
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_wa_id ON conversations(whatsapp_id);
-- Actualización: Sistema de Recordatorios y Análisis IA (07/12/2025)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS appointment_status VARCHAR(50) DEFAULT 'PENDING';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_ai_analysis_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_analyzed_id VARCHAR(255) NULL;
