# ÍNDICE GENERAL - CUENTATRON MVP

> [!IMPORTANT]
> **PUNTO DE ENTRADA OBLIGATORIO** para cualquier ejecución con IA.
> Este documento gobierna toda la ejecución del proyecto.
> 
> **Referencia completa:** [Plan_Maestro_Definitivo.md](../docs/planning/Plan_Maestro_Definitivo.md)

---

## Objetivo Único de Ejecución

Desarrollar **Cuentatron MVP**: App móvil Android + Panel Admin Web para monitoreo energético con modelo dual (Servicio 7 días + Suscripción permanente).

---

## Alcance Exacto del MVP

| Elemento | Incluido | Excluido |
|----------|----------|----------|
| App móvil | ✅ Android | ❌ iOS |
| Panel Admin | ✅ Web (React + Vite) | — |
| Servicio 7 días | ✅ | — |
| Suscripción permanente | ✅ | — |
| Notificaciones | ✅ Push (FCM) | ❌ WhatsApp/Telegram |
| Tipos de plan | ✅ 4 tipos (mono/bifásico ± paneles) | ❌ Trifásico |

---

## Arquitectura Base

```
ESP32 ──MQTT──▶ Mosquitto ──▶ receptor_mqtt.py ──▶ InfluxDB
                                    │
                                    ▼
                              Supabase DB
                               (sync API)
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
             📱 App Android                   🖥️ Panel Admin
             (React Native)                   (React + Vite)
```

| Componente | Tecnología |
|------------|------------|
| App móvil | React Native + Expo |
| Backend | Supabase (auth, DB, realtime) |
| Panel Admin | React + Vite |
| Time Series DB | InfluxDB (existente) |
| MQTT Broker | Mosquitto (existente) |
| Push Notifications | Expo Push + FCM |

---

## Orden de Ejecución de Módulos

```
FASE 1: INFRAESTRUCTURA
   └── modulo_08_backend_api

FASE 2: AUTH Y VINCULACIÓN
   ├── modulo_01_auth_onboarding
   └── modulo_06_vinculacion

FASE 3: CORE APP
   ├── modulo_02_dashboard_inicio
   ├── modulo_03_alertas
   ├── modulo_04_graficas
   └── modulo_05_cuenta

FASE 4: ADMINISTRACIÓN
   ├── modulo_07_panel_admin
   └── modulo_09_pdf_reportes
```

---

## Lista de Módulos

| # | Módulo | Archivo | Estado |
|---|--------|---------|--------|
| 01 | Auth & Onboarding | [modulo_01_auth_onboarding.md](./01_MODULOS/modulo_01_auth_onboarding.md) | ⬜ Pendiente |
| 02 | Dashboard/Inicio | [modulo_02_dashboard_inicio.md](./01_MODULOS/modulo_02_dashboard_inicio.md) | ⬜ Pendiente |
| 03 | Alertas | [modulo_03_alertas.md](./01_MODULOS/modulo_03_alertas.md) | ⬜ Pendiente |
| 04 | Gráficas | [modulo_04_graficas.md](./01_MODULOS/modulo_04_graficas.md) | ⬜ Pendiente |
| 05 | Cuenta | [modulo_05_cuenta.md](./01_MODULOS/modulo_05_cuenta.md) | ⬜ Pendiente |
| 06 | Vinculación | [modulo_06_vinculacion.md](./01_MODULOS/modulo_06_vinculacion.md) | ⬜ Pendiente |
| 07 | Panel Admin | [modulo_07_panel_admin.md](./01_MODULOS/modulo_07_panel_admin.md) | ⬜ Pendiente |
| 08 | Backend/API | [modulo_08_backend_api.md](./01_MODULOS/modulo_08_backend_api.md) | ⬜ Pendiente |
| 09 | PDF/Reportes | [modulo_09_pdf_reportes.md](./01_MODULOS/modulo_09_pdf_reportes.md) | ⬜ Pendiente |

---

## Dependencias entre Módulos

| Módulo | Depende de |
|--------|------------|
| modulo_01 | (ninguno) |
| modulo_02 | modulo_01, modulo_06, modulo_08 |
| modulo_03 | modulo_01, modulo_06, modulo_08 |
| modulo_04 | modulo_01, modulo_06 |
| modulo_05 | modulo_01 |
| modulo_06 | modulo_01 |
| modulo_07 | modulo_08 |
| modulo_08 | (ninguno) |
| modulo_09 | modulo_07, modulo_08 |

---

## Decisiones Globales

| Decisión | Valor | Origen |
|----------|-------|--------|
| Expiración sesión | 7 días sin actividad | UXUI-063 |
| Modo offline | Bloqueo total | UXUI-064 |
| Idioma | Español MX | UXUI-065 |
| Orientación | Portrait fijo | UXUI-066 |

---

## Criterios de Cierre del MVP

| Métrica | Objetivo |
|---------|----------|
| Descargas | >50 |
| Usuarios activos | >10 |
| Dispositivos conectados | >5 |
| Suscripciones activas | >3 |
| Rating Play Store | >4.0 |
| Cliente piloto atendido | ≥1 |

---

## Referencias

- **Reglas de Ejecución IA:** [02_REGLAS_DE_EJECUCION_IA.md](./02_REGLAS_DE_EJECUCION_IA.md)
- **Plan Maestro Definitivo:** [Plan_Maestro_Definitivo.md](../docs/planning/Plan_Maestro_Definitivo.md)
- **Restricciones ESP32:** [constraints_esp32.md](../produccion/database/constraints_esp32.md)

---

*Documento creado: 2026-01-06*
*Versión: 1.0*
