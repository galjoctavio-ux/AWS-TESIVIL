# LETE Chat Analyzer

Servicio de análisis de chats con IA para Luz en tu Espacio.

## Instalación

```bash
cd backend-cron
npm install
cp .env.example .env
# Editar .env con tus credenciales
```

## Configuración

Edita `.env` con:
- `SUPABASE_URL` y `SUPABASE_SERVICE_KEY`
- `EVOLUTION_URL`, `EVOLUTION_APIKEY`, `EVOLUTION_INSTANCE`
- `GROQ_API_KEY_1` a `GROQ_API_KEY_5`

## Uso

### Ejecutar manualmente
```bash
# Job completo (sync + análisis)
npm run dev

# Solo sincronización
npm run sync

# Solo análisis
npm run analyze
```

### Configurar Cron (Linux)
```bash
# Editar crontab
crontab -e

# Agregar (ejecutar a las 3 AM diario):
0 3 * * * cd /ruta/a/backend-cron && /usr/bin/node dist/daily_job.js >> /var/log/lete-cron.log 2>&1
```

### Build para producción
```bash
npm run build
npm start
```

## Después de la migración

Una vez funcionando, puedes apagar el legacy backend:
1. Detener el servicio antiguo
2. Eliminar la carpeta `_Planeacion/_legacy_backend`
