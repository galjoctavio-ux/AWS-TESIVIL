# Módulo 07: Panel Admin

> **Fase:** 4 - ADMINISTRACIÓN
> **Dependencias:** modulo_08
> **Estado:** ⬜ Pendiente

---

## 1. Propósito del Módulo

Implementar la interfaz web de administración del sistema Cuentatron, separada de la app móvil, para gestionar dispositivos, usuarios, suscripciones y reportes.

---

## 2. Qué SÍ Hace

- ✅ Aprovisionar dispositivos (alta + calibración + QR)
- ✅ Gestión de planes disponibles
- ✅ Control de suscripciones (activar/cancelar acceso)
- ✅ Alertas de administrador
- ✅ Generación de reportes PDF (servicio 7 días)
- ✅ Lista de usuarios/clientes

---

## 3. Qué NO Hace

- ❌ Funciones de app móvil
- ❌ Interfaz dentro de la app
- ❌ Reportes automáticos sin revisión humana

---

## 4. Dependencias Previas

| Dependencia | Tipo | Descripción |
|-------------|------|-------------|
| modulo_08 | Obligatoria | API backend funcionando |

---

## 5. Entradas Esperadas

| Entrada | Origen | Descripción |
|---------|--------|-------------|
| Datos de usuarios | Supabase DB | Lista de clientes |
| Datos de dispositivos | Supabase DB | Inventario |
| Datos de consumo | InfluxDB | Para reportes |
| Planes | Supabase DB | Configuración de planes |

---

## 6. Salidas Esperadas

| Salida | Destino | Descripción |
|--------|---------|-------------|
| Dispositivo aprovisionado | Supabase DB | Con calibración |
| QR code | Archivo/Print | Para empaque |
| PDF de diagnóstico | Supabase Storage | Para descarga en app |
| Control MQTT | receptor_mqtt.py | Activar/congelar |

---

## 7. Criterios de "Módulo Terminado"

- [ ] Login de administrador funciona
- [ ] Dashboard muestra métricas generales
- [ ] Aprovisionar dispositivo: MAC, Plan, Calibraciones → Genera QR
- [ ] Gestión de planes: listar, editar, crear
- [ ] Control de suscripciones: ver estado, activar, cancelar
- [ ] Alertas admin: Recordatorio conexión, Dispositivo offline
- [ ] Generación de PDF: crear, editar observaciones, publicar
- [ ] Lista de usuarios: ver datos CFE, estado, historial

---

## 8. Restricciones Explícitas para IA

| Restricción | Referencia |
|-------------|------------|
| Plataforma web separada (React + Vite) | UXUI-055 |
| NO parte de la app móvil | UXUI-004 |
| PDF requiere intervención humana | CAME A-06 |
| Solo 4 tipos de plan en dropdown | UXUI-029 |

---

## Módulos del Panel Admin

| ID | Módulo | Funcionalidad |
|----|--------|---------------|
| UXUI-057 | Aprovisionar Dispositivo | Alta + calibración + genera QR |
| UXUI-058 | Gestión de Planes | Listar/editar planes |
| UXUI-059 | Control de Suscripciones | Ver estado, activar/cancelar |
| UXUI-060 | Alertas Admin | Recordatorio conexión, offline |
| UXUI-061 | Generación de Reportes | PDF de diagnóstico |
| UXUI-062 | Usuarios/Clientes | Lista, datos CFE, estado |

---

## Datos de Calibración para Aprovisionamiento

> [!CAUTION]
> Estas columnas son **INAMOVIBLES** — requeridas por el firmware ESP32.

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| Device ID (MAC) | TextInput | ✅ | Validación regex MAC |
| Plan Asignado | Select | ✅ | Solo 4 tipos MVP |
| voltage_cal | NumberInput | ✅ | Factor de calibración |
| current_cal_1 a current_cal_5 | NumberInput | Dinámico | Según tipo de plan (2-5 campos) |
| power_cal | NumberInput | ✅ | Factor de calibración |

---

## Flujo de Aprovisionamiento

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    💻 PANEL ADMIN - APROVISIONAR                         │
└─────────────────────────────────────────────────────────────────────────┘

PASO 1              PASO 2              PASO 3              PASO 4
──────              ──────              ──────              ──────
   │                   │                   │                   │
   ▼                   ▼                   ▼                   ▼
┌─────────┐       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Ingresar │──────▶│ Seleccionar│────▶│  Ingresar   │────▶│  Generar    │
│  MAC ID  │       │    Plan    │     │ Calibración │     │  QR Code    │
└─────────┘       └─────────────┘     └─────────────┘     └─────────────┘
                        │                   │
                  (Según plan,        · voltage_cal
                   campos de          · current_cal (2-5)
                   corriente)         · power_cal
```

---

## Planes MVP (Dropdown)

| Tipo | Campos de Corriente |
|------|---------------------|
| Monofásico | 2 (current_cal_1, current_cal_2) |
| Monofásico + Paneles | 3 |
| Bifásico | 3 |
| Bifásico + Paneles | 5 |

**Trifásico:** ❌ EXCLUIDO del MVP (UXUI-029)

---

## Referencia

- **Plan Maestro:** Secciones 7.7, 14.9 (UXUI-055 a UXUI-062)
- **Schema SQL:** `../produccion/database/constraints_esp32.md`

---

*Última actualización: 2026-01-06*
