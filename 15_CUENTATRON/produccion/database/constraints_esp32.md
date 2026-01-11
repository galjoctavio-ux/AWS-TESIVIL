# Restricciones Críticas para Compatibilidad ESP32

> [!CAUTION]
> **COLUMNAS Y TABLAS INAMOVIBLES**
> El firmware del ESP32 requiere estas estructuras exactas.
> Cualquier cambio causará fallas en los dispositivos físicos.

---

## Origen

**Archivo:** `legacy_source/tables_supabase_actuales/schema.sql`
**Fecha:** 2026-01-06

---

## Tabla: dispositivos (antes dispositivos_lete)

### Columnas Inamovibles

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `device_id` | text PRIMARY KEY | MAC address del ESP32 |
| `voltage_cal` | numeric | Factor de calibración de voltaje |
| `current_cal_1` | numeric | Calibración sensor de corriente 1 |
| `current_cal_2` | numeric | Calibración sensor de corriente 2 |
| `current_cal_3` | numeric | Calibración sensor de corriente 3 |
| `current_cal_4` | numeric | Calibración sensor de corriente 4 |
| `current_cal_5` | numeric | Calibración sensor de corriente 5 |
| `power_cal` | numeric | Factor de calibración de potencia |
| `data_server_url` | text | URL del servidor de datos |
| `cal_update_pending` | boolean | Flag de actualización pendiente |

### Uso de Sensores por Tipo de Plan

| Plan | current_cal usados |
|------|-------------------|
| Monofásico | 1, 2 |
| Monofásico + Paneles | 1, 2, 3 |
| Bifásico | 1, 2, 3 |
| Bifásico + Paneles | 1, 2, 3, 4, 5 |

---

## Tabla: mediciones_pendientes

### Estructura Inamovible (Completa)

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | bigserial | Auto-incremento |
| `device_id` | varchar NOT NULL | MAC del ESP32 |
| `ts_unix` | bigint NOT NULL | Timestamp Unix de medición |
| `payload_json` | text NOT NULL | Datos JSON de la medición |
| `created_at` | timestamptz | Fecha de inserción |

### Propósito

Esta tabla actúa como buffer cuando el ESP32 no puede enviar datos directamente a InfluxDB. El dispositivo almacena mediciones localmente y las sincroniza cuando recupera conexión.

---

## Tabla: planes (antes planes_lete)

### Estructura Importante

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | bigserial PRIMARY KEY | Referenciado por dispositivos |
| `nombre_plan` | text NOT NULL | Nombre legible |
| `precio` | numeric NOT NULL | Precio mensual |
| `stripe_plan_id` | text UNIQUE | ID de plan en Stripe |

### Mapeo a UXUI-029

| nombre_plan | sensores | Estado MVP |
|-------------|----------|------------|
| Monofásico | 2 | ✅ |
| Monofásico con Paneles | 3 | ✅ |
| Bifásico | 3 | ✅ |
| Bifásico con Paneles | 5 | ✅ |
| Trifásico | 4 | ❌ Excluido |
| Trifásico con Paneles | 7 | ❌ Excluido |

---

## Tabla: dispositivo_boot_sessions

### Estructura

| Columna | Tipo | Notas |
|---------|------|-------|
| `device_id` | varchar PRIMARY KEY | MAC del ESP32 |
| `boot_time_unix` | bigint NOT NULL | Timestamp del último boot |
| `last_updated` | timestamptz | Última actualización |

### Propósito

Rastrear los reinicios del dispositivo para detectar problemas de estabilidad.

---

## Tabla: perfiles_diagnostico

### Propósito

Almacena datos recogidos durante el servicio de 7 días para generar el reporte PDF.

### Campos Relevantes

| Campo | Uso |
|-------|-----|
| Domicilio (calle, numero, colonia, municipio) | Identificación del cliente |
| Inventario electrodomésticos | Contexto de consumo |
| contexto_problema | Motivo del diagnóstico |

### Municipios Permitidos

```sql
CHECK (municipio = ANY (ARRAY[
  'guadalajara', 
  'zapopan', 
  'tlaquepaque', 
  'tonala', 
  'tlajomulco', 
  'otro'
]))
```

---

## Reglas para IA

1. **NUNCA renombrar columnas inamovibles** — romperá el firmware
2. **NUNCA cambiar tipos de datos** — causará errores de parsing
3. **SIEMPRE incluir todas las columnas de calibración** — aunque algunas queden NULL
4. **SIEMPRE mantener `mediciones_pendientes`** — critical para offline mode
5. **PREGUNTAR antes de cualquier modificación** — incluso si parece mejora

---

*Documento generado: 2026-01-06*
*Basado en schema.sql de legacy_source*
