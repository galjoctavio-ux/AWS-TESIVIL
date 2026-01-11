# API Puente - Documentación Técnica

> **Módulo:** 08 - Backend/API  
> **Propósito:** Conectar scripts Python legacy con la nueva infraestructura Supabase

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        VM AWS (Ubuntu)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐   │
│   │   Mosquitto  │     │  InfluxDB    │     │  receptor_   │   │
│   │   (MQTT)     │────▶│              │◀────│  mqtt.py     │   │
│   └──────────────┘     └──────────────┘     └──────────────┘   │
│          │                                         │            │
│          │                                         │            │
│          │              ┌──────────────────────────┘            │
│          │              │                                       │
│          │              ▼                                       │
│          │      ┌──────────────┐                                │
│          │      │  Supabase    │◀──── NUEVO: Conexión directa   │
│          │      │  (PostgreSQL)│       vía psycopg2             │
│          │      └──────────────┘                                │
│          │              │                                       │
│          ▼              │                                       │
│   ┌──────────────┐      │                                       │
│   │   ESP32      │      │                                       │
│   │ (dispositivo)│      │                                       │
│   └──────────────┘      │                                       │
│                         │                                       │
└─────────────────────────│───────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Supabase Cloud      │
              │   (Auth, Realtime,    │
              │    Storage)           │
              └───────────────────────┘
                          │
           ┌──────────────┴──────────────┐
           ▼                             ▼
    ┌──────────────┐              ┌──────────────┐
    │  App Android │              │ Panel Admin  │
    │(React Native)│              │(React + Vite)│
    └──────────────┘              └──────────────┘
```

---

## Estrategia de Integración (CAME M-01)

> **Decisión CAME:** NO reescribir scripts Python. Crear API puente ligera.

### Cambios en `receptor_mqtt.py`

El script existente ya usa `psycopg2` para conectarse a PostgreSQL (Supabase). Los cambios necesarios son mínimos:

| Cambio | Descripción | Impacto |
|--------|-------------|---------|
| Variables de entorno | Actualizar credenciales de Supabase nuevo | Bajo |
| Nombres de tablas | Ajustar a nuevo schema (`dispositivos` en lugar de `dispositivos_lete`) | Medio |
| Consulta de suscripción | Ajustar JOIN con tabla `usuarios` | Medio |

---

## Modificaciones Requeridas

### 1. Variables de Entorno (.env)

```env
# SUPABASE NUEVO
DB_HOST=db.odovajnvgbzamkceouyn.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASS=[password_del_proyecto_nuevo]

# El resto permanece igual
INFLUX_URL=...
MQTT_BROKER_HOST=...
```

### 2. Ajuste de Consulta SQL (receptor_mqtt.py)

**ANTES (línea ~438-443):**
```python
sql = """
    SELECT c.subscription_status, c.fecha_proximo_pago 
    FROM clientes c
    JOIN dispositivos_lete d ON c.id = d.cliente_id
    WHERE d.device_id = %s
"""
```

**DESPUÉS:**
```python
sql = """
    SELECT u.subscription_status, u.fecha_proximo_pago 
    FROM usuarios u
    JOIN dispositivos d ON u.id = d.usuario_id
    WHERE d.device_id = %s
"""
```

### 3. Ajuste de Tabla de Boot Sessions (receptor_mqtt.py)

**ANTES (línea ~139-145):**
```python
cursor.execute("""
    CREATE TABLE IF NOT EXISTS dispositivo_boot_sessions (
        device_id VARCHAR(20) PRIMARY KEY,
        ...
    )
""")
```

**DESPUÉS:** 
No necesita cambio - la tabla ya existe en el nuevo schema con la misma estructura.

---

## Plan de Migración

### Fase 1: Preparación (sin downtime)
1. ✅ Crear proyecto Supabase nuevo
2. ✅ Ejecutar schema con tablas vacías
3. ⬜ Migrar datos de dispositivos existentes (si aplica)

### Fase 2: Cambio de Conexión
1. ⬜ Actualizar `.env` en el servidor con nuevas credenciales
2. ⬜ Aplicar parche a `receptor_mqtt.py`
3. ⬜ Reiniciar servicio

### Fase 3: Verificación
1. ⬜ Verificar que mensajes MQTT llegan
2. ⬜ Verificar escritura en InfluxDB
3. ⬜ Verificar estados de suscripción

---

## Endpoints Supabase (para App y Panel)

La App y el Panel Admin se conectarán directamente a Supabase usando el SDK oficial:

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/v1/signup` | Registro con email |
| POST | `/auth/v1/token?grant_type=password` | Login email + OTP |
| POST | `/auth/v1/token?grant_type=id_token` | Login Google |
| POST | `/auth/v1/logout` | Cerrar sesión |

### Datos (REST API)
| Método | Tabla | Descripción |
|--------|-------|-------------|
| GET | `/rest/v1/usuarios` | Perfil del usuario |
| PATCH | `/rest/v1/usuarios` | Actualizar perfil/CFE |
| GET | `/rest/v1/dispositivos` | Dispositivos del usuario |
| GET | `/rest/v1/alertas` | Alertas del usuario |
| PATCH | `/rest/v1/alertas` | Marcar alerta como leída |
| GET | `/rest/v1/planes` | Lista de planes disponibles |

### Realtime
| Tabla | Eventos | Uso |
|-------|---------|-----|
| `alertas` | INSERT | Push notification en tiempo real |
| `dispositivos` | UPDATE | Actualización de estado |

---

## Archivos a Modificar

| Archivo | Ubicación | Cambios |
|---------|-----------|---------|
| `.env` | VM AWS | Credenciales Supabase |
| `receptor_mqtt.py` | VM AWS | Ajuste de queries SQL |

---

*Documento generado: 2026-01-06*
