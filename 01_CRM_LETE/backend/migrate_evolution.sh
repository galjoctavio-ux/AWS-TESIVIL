#!/bin/bash

# Script de migración de Evolution API a CRM usando Docker
# Este script se ejecuta directamente en tu VM

echo "🚀 Iniciando migración de Evolution API a CRM..."

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuración - AJUSTA ESTOS VALORES
CRM_DB_USER="admin_crm"
CRM_DB_PASSWORD="luz_secret_2025"
CRM_DB_NAME="crm_luz"
CRM_DB_HOST="localhost"  # Si PostgreSQL está en el mismo servidor

echo -e "${BLUE}📊 Extrayendo datos de Evolution API...${NC}"

# 1. Exportar chats de Evolution API
sudo docker exec postgres psql -U evolution -d evolution -t -A -F"|" -c "
SELECT 
  c.\"remoteJid\",
  COALESCE(c.\"name\", co.\"pushName\", 'Sin nombre'),
  COALESCE(co.\"profilePicUrl\", ''),
  COALESCE(c.\"updatedAt\", c.\"createdAt\"),
  c.\"unreadMessages\"
FROM \"Chat\" c
LEFT JOIN \"Contact\" co ON c.\"remoteJid\" = co.\"remoteJid\" 
  AND c.\"instanceId\" = co.\"instanceId\"
ORDER BY c.\"createdAt\" DESC
" > /tmp/evolution_chats.csv

echo -e "${GREEN}✅ Chats exportados: $(wc -l < /tmp/evolution_chats.csv) registros${NC}"

# 2. Exportar mensajes de Evolution API
echo -e "${BLUE}📨 Extrayendo mensajes...${NC}"

sudo docker exec postgres psql -U evolution -d evolution -c "
COPY (
  SELECT 
    m.\"key\"->>'remoteJid' as remote_jid,
    CASE WHEN (m.\"key\"->>'fromMe')::boolean THEN 'AGENT' ELSE 'CLIENT' END as sender_type,
    CASE 
      WHEN m.\"message\"->>'conversation' IS NOT NULL THEN 'text'
      WHEN m.\"message\"->'extendedTextMessage' IS NOT NULL THEN 'text'
      WHEN m.\"message\"->'imageMessage' IS NOT NULL THEN 'image'
      WHEN m.\"message\"->'videoMessage' IS NOT NULL THEN 'video'
      WHEN m.\"message\"->'audioMessage' IS NOT NULL THEN 'audio'
      WHEN m.\"message\"->'documentMessage' IS NOT NULL THEN 'document'
      ELSE 'text'
    END as message_type,
    COALESCE(
      m.\"message\"->>'conversation',
      m.\"message\"->'extendedTextMessage'->>'text',
      m.\"message\"->'imageMessage'->>'caption',
      m.\"message\"->'videoMessage'->>'caption',
      '[Media]'
    ) as content,
    COALESCE(
      m.\"message\"->'imageMessage'->>'url',
      m.\"message\"->'videoMessage'->>'url',
      m.\"message\"->'audioMessage'->>'url',
      m.\"message\"->'documentMessage'->>'url',
      ''
    ) as media_url,
    to_timestamp(m.\"messageTimestamp\") as created_at
  FROM \"Message\" m
  WHERE m.\"key\"->>'remoteJid' IS NOT NULL
  ORDER BY m.\"messageTimestamp\" ASC
) TO STDOUT WITH (FORMAT CSV, DELIMITER E'\t', QUOTE '\"', ESCAPE '\"', NULL '')
" > /tmp/evolution_messages.csv

echo -e "${GREEN}✅ Mensajes exportados: $(wc -l < /tmp/evolution_messages.csv) registros${NC}"

# 3. Importar chats a crm_luz
echo -e "${BLUE}💾 Importando conversaciones a CRM...${NC}"

PGPASSWORD="$CRM_DB_PASSWORD" psql -h "$CRM_DB_HOST" -U "$CRM_DB_USER" -d "$CRM_DB_NAME" << 'EOF'
CREATE TEMP TABLE temp_chats (
  whatsapp_id VARCHAR(50),
  client_name VARCHAR(100),
  avatar_url TEXT,
  last_interaction TIMESTAMP,
  unread_count INTEGER
);

\copy temp_chats FROM '/tmp/evolution_chats.csv' WITH (FORMAT csv, DELIMITER '|');

INSERT INTO conversations (
  whatsapp_id,
  client_name,
  avatar_url,
  status,
  service_category,
  assigned_to_role,
  last_interaction,
  unread_count
)
SELECT 
  whatsapp_id,
  client_name,
  NULLIF(avatar_url, ''),
  'ACTIVE',
  'UNKNOWN',
  'BOT',
  last_interaction,
  unread_count
FROM temp_chats
ON CONFLICT (whatsapp_id) DO UPDATE SET
  client_name = EXCLUDED.client_name,
  avatar_url = EXCLUDED.avatar_url,
  last_interaction = EXCLUDED.last_interaction,
  unread_count = EXCLUDED.unread_count;

SELECT COUNT(*) as "Conversaciones importadas" FROM conversations;
EOF

echo -e "${GREEN}✅ Conversaciones importadas${NC}"

# 4. Importar mensajes a crm_luz
echo -e "${BLUE}💬 Importando mensajes a CRM...${NC}"

PGPASSWORD="$CRM_DB_PASSWORD" psql -h "$CRM_DB_HOST" -U "$CRM_DB_USER" -d "$CRM_DB_NAME" << 'EOF'
CREATE TEMP TABLE temp_messages (
  remote_jid VARCHAR(50),
  sender_type VARCHAR(10),
  message_type VARCHAR(10),
  content TEXT,
  media_url TEXT,
  created_at TIMESTAMP
);

\copy temp_messages FROM '/tmp/evolution_messages.csv' WITH (FORMAT CSV, DELIMITER '	', QUOTE '"', ESCAPE '"', NULL '');

INSERT INTO messages (
  conversation_id,
  sender_type,
  message_type,
  content,
  media_url,
  is_internal,
  created_at
)
SELECT 
  c.id,
  tm.sender_type,
  tm.message_type,
  tm.content,
  NULLIF(tm.media_url, ''),
  false,
  tm.created_at
FROM temp_messages tm
JOIN conversations c ON c.whatsapp_id = tm.remote_jid;

SELECT COUNT(*) as "Mensajes importados" FROM messages;
EOF

echo -e "${GREEN}✅ Mensajes importados${NC}"

# 5. Limpiar archivos temporales
echo -e "${BLUE}🧹 Limpiando archivos temporales...${NC}"
rm -f /tmp/evolution_chats.csv /tmp/evolution_messages.csv

echo -e "${GREEN}🎉 Migración completada exitosamente!${NC}"
echo -e "${BLUE}📊 Verifica los datos en tu base de datos crm_luz${NC}"
