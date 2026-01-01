#!/bin/bash

# Script para actualizar nombres de clientes desde Evolution API

echo "🔄 Actualizando nombres de clientes..."

# Configuración - AJUSTA ESTOS VALORES
CRM_DB_USER="admin_crm"
CRM_DB_PASSWORD="luz_secret_2025"  # <-- CAMBIA ESTO
CRM_DB_NAME="crm_luz"
CRM_DB_HOST="localhost"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 Exportando nombres desde Evolution API...${NC}"

# Exportar todos los contactos con sus nombres
sudo docker exec postgres psql -U evolution -d evolution -c "
COPY (
  SELECT DISTINCT ON (\"remoteJid\")
    \"remoteJid\",
    COALESCE(\"pushName\", 'Sin nombre') as push_name,
    \"profilePicUrl\"
  FROM \"Contact\"
  WHERE \"pushName\" IS NOT NULL
  ORDER BY \"remoteJid\", \"updatedAt\" DESC NULLS LAST
) TO STDOUT WITH (FORMAT CSV, DELIMITER E'\t', QUOTE '\"', ESCAPE '\"', NULL '')
" > /tmp/evolution_contacts.csv

echo -e "${GREEN}✅ Contactos exportados: $(wc -l < /tmp/evolution_contacts.csv) registros${NC}"

echo -e "${BLUE}💾 Actualizando nombres en CRM...${NC}"

# Actualizar nombres en crm_luz
PGPASSWORD="$CRM_DB_PASSWORD" psql -h "$CRM_DB_HOST" -U "$CRM_DB_USER" -d "$CRM_DB_NAME" << 'EOF'
CREATE TEMP TABLE temp_contacts (
  whatsapp_id VARCHAR(50),
  client_name VARCHAR(100),
  avatar_url TEXT
);

\copy temp_contacts FROM '/tmp/evolution_contacts.csv' WITH (FORMAT CSV, DELIMITER '	', QUOTE '"', ESCAPE '"', NULL '');

-- Actualizar nombres y avatares
UPDATE conversations c
SET 
  client_name = tc.client_name,
  avatar_url = COALESCE(c.avatar_url, NULLIF(tc.avatar_url, ''))
FROM temp_contacts tc
WHERE c.whatsapp_id = tc.whatsapp_id
  AND (c.client_name IS NULL OR c.client_name = 'Sin nombre' OR c.avatar_url IS NULL);

SELECT COUNT(*) as "Registros actualizados" 
FROM conversations c
JOIN temp_contacts tc ON c.whatsapp_id = tc.whatsapp_id;

-- Mostrar estadísticas
SELECT 
  COUNT(*) as total_conversaciones,
  COUNT(CASE WHEN client_name IS NOT NULL AND client_name != 'Sin nombre' THEN 1 END) as con_nombre,
  COUNT(CASE WHEN client_name IS NULL OR client_name = 'Sin nombre' THEN 1 END) as sin_nombre,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as con_avatar
FROM conversations;
EOF

echo -e "${GREEN}✅ Nombres actualizados${NC}"

# Limpiar
rm -f /tmp/evolution_contacts.csv

echo -e "${GREEN}🎉 Actualización completada!${NC}"
