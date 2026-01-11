# receptor_mqtt.py

## Propósito
Servicio intermediario que actúa como puente entre dispositivos ESP32 (vía MQTT) y la base de datos de series temporales (InfluxDB). Implementa lógica de suscripción, período de gracia, y protección anti-bloqueo.

## Core Logic

### Arquitectura de Flujo
```
ESP32 → MQTT Broker → receptor_mqtt.py → InfluxDB
                          ↓
                    PostgreSQL (estado)
```

### Estados de Suscripción
| Estado | Acción con datos |
|--------|-----------------|
| `active` | Envía a InfluxDB (batching) |
| `grace_period` | Guarda en PostgreSQL (`mediciones_pendientes`) |
| `expired` | Descarta datos |

### Funciones Críticas
- **Batching**: Acumula 50 mediciones o espera 10s antes de flush a InfluxDB
- **Caché de estados**: TTL de ~5 min para reducir consultas a BD
- **Anti-Poison-Pill**: Lotes que fallan repetidamente van a archivo `.log` (cuarentena)
- **Reenvío automático**: Al reactivar suscripción, datos pendientes se envían a InfluxDB

### Estructura de Datos MQTT
```json
{
  "ts_unix": 1704067200,
  "vrms": 127.5,
  "irms_p": 2.35,
  "irms_n": 2.33,
  "pwr": 298.5,
  "va": 300.2,
  "pf": 0.99,
  "leak": 0.02,
  "temp": 45.2,
  "seq": 1234
}
```

## Dependencias/Inputs
| Tipo | Recurso |
|------|---------|
| BD | PostgreSQL (Supabase) - tablas: `clientes`, `dispositivos_lete`, `dispositivo_boot_sessions`, `mediciones_pendientes` |
| TimeSeries | InfluxDB Cloud |
| Broker | MQTT (mosquitto o similar) |
| Librerías | paho-mqtt, influxdb-client, psycopg2 |

## Estado
**✅ FUNCIONAL - Producción (v5)**

Código robusto con threading, mutex, reconexión automática, y protección anti-bloqueo. Listo para producción 24/7.
