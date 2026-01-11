# Módulo 08: Backend / API

> **Fase:** 1 - INFRAESTRUCTURA
> **Dependencias:** Ninguna (infraestructura base)
> **Estado:** ⬜ Pendiente

---

## 1. Propósito del Módulo

Configurar e integrar todos los servicios backend necesarios: Supabase (auth, DB), InfluxDB, Mosquitto MQTT, FCM para push notifications, y crear API puente con scripts Python legacy.

---

## 2. Qué SÍ Hace

- ✅ Configurar Supabase (Auth, Database, Storage, Realtime)
- ✅ Crear schema de base de datos con restricciones ESP32
- ✅ Configurar FCM para push notifications
- ✅ Crear API puente ligera para scripts Python
- ✅ Integrar con InfluxDB existente
- ✅ Integrar con Mosquitto existente

---

## 3. Qué NO Hace

- ❌ Reescribir receptor_mqtt.py (CAME M-01)
- ❌ Reescribir vigilante_calidad.py
- ❌ Migrar de InfluxDB a otra tecnología

---

## 4. Dependencias Previas

| Dependencia | Tipo | Descripción |
|-------------|------|-------------|
| Ninguna | — | Este es el módulo de infraestructura base |

---

## 5. Entradas Esperadas

| Entrada | Origen | Descripción |
|---------|--------|-------------|
| Credenciales Supabase | Configuración | URL, anon key, service key |
| Credenciales FCM | Firebase Console | Server key |
| Acceso a VM AWS | SSH | Para scripts Python |

---

## 6. Salidas Esperadas

| Salida | Destino | Descripción |
|--------|---------|-------------|
| API de autenticación | App y Panel | Login, registro, tokens |
| API de datos | App y Panel | CRUD de entidades |
| Push notifications | Dispositivos | Alertas en tiempo real |
| Sync con InfluxDB | App | Datos de consumo |

---

## 7. Criterios de "Módulo Terminado"

- [ ] Supabase proyecto creado y configurado
- [ ] Schema de BD creado con restricciones ESP32
- [ ] Auth funciona (Google + email magic link)
- [ ] FCM configurado y enviando notificaciones
- [ ] API puente conecta con scripts Python
- [ ] Datos fluyen desde InfluxDB
- [ ] Documentación de endpoints creada

---

## 8. Restricciones Explícitas para IA

| Restricción | Referencia |
|-------------|------------|
| NO reescribir scripts Python legacy | CAME M-01 |
| Crear API puente ligera | CAME M-01 |
| Mantener arquitectura simple | CAME M-03 |
| Incluir columnas inamovibles ESP32 | Schema SQL |

---

## Schema de Base de Datos (Restricciones ESP32)

> [!CAUTION]
> Las siguientes columnas son **INAMOVIBLES** por compatibilidad con firmware ESP32.

### Tabla: dispositivos

```sql
CREATE TABLE dispositivos (
  device_id text PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  plan_id bigint REFERENCES planes(id),
  estado text DEFAULT 'sin_vender',
  cliente_id bigint REFERENCES clientes(id),
  
  -- COLUMNAS INAMOVIBLES ESP32 --
  voltage_cal numeric,
  current_cal_1 numeric,
  current_cal_2 numeric,
  current_cal_3 numeric,
  current_cal_4 numeric,
  current_cal_5 numeric,
  power_cal numeric,
  data_server_url text,
  cal_update_pending boolean DEFAULT false
);
```

### Tabla: mediciones_pendientes

```sql
CREATE TABLE mediciones_pendientes (
  id bigserial PRIMARY KEY,
  device_id varchar NOT NULL,
  ts_unix bigint NOT NULL,
  payload_json text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Tabla: planes

```sql
CREATE TABLE planes (
  id bigserial PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  nombre_plan text NOT NULL,
  precio numeric NOT NULL,
  stripe_plan_id text UNIQUE
);
```

---

## Arquitectura de Integración

```
ESP32 ──MQTT──▶ Mosquitto ──▶ receptor_mqtt.py ──▶ InfluxDB
                                      │
                                      ▼
                          ┌─────────────────────┐
                          │   API PUENTE        │
                          │   (Python/Node)     │
                          └──────────┬──────────┘
                                     │
                                     ▼
                              Supabase DB
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
             📱 App Android                    🖥️ Panel Admin
```

---

## Tecnologías

| Componente | Tecnología | Costo |
|------------|------------|-------|
| Auth + DB | Supabase | Free tier (500MB) |
| Push | Expo Push + FCM | Gratuito |
| Time Series | InfluxDB | Existente |
| MQTT | Mosquitto | Existente |
| Hosting | AWS VM Ubuntu | Existente |

---

## Referencia

- **Plan Maestro:** Secciones 6, 7.6, 7.9
- **Schema Legacy:** `../produccion/database/schema_legacy_referencia.sql`
- **Restricciones ESP32:** `../produccion/database/constraints_esp32.md`

---

*Última actualización: 2026-01-06*
