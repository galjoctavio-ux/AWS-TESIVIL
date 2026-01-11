# ESTRATEGIA MVP FINAL - CUENTATRON APP
## Documento Consolidado de Planeación | 2026-01-05

---

## 📋 Resumen Ejecutivo

**Cuentatron** evoluciona de un ecosistema disperso de páginas web y scripts hacia una **aplicación móvil nativa unificada** que centraliza todo el valor del producto.

| Métrica | Valor |
|---------|-------|
| **Objetivo MVP** | App móvil nativa Android |
| **Ideas consolidadas** | 37 capturadas (6 bloques ESTADO_SINC) |
| **Módulos legacy analizados** | 9 módulos (8 en producción, 1 obsoleto) |
| **Time-to-MVP estimado** | 6-8 semanas |

> [!IMPORTANT]
> **Cambio de paradigma:** El core ya no es WhatsApp/Telegram + páginas web dispersas. Todo se unifica en una aplicación móvil nativa con notificaciones push.

---

## 1. Visión del Producto

### Antes (Ecosistema Disperso)
```
┌─────────────────────────────────────────────────────────────┐
│                   ESTADO ACTUAL (DISPERSO)                   │
├─────────────────────────────────────────────────────────────┤
│  🌐 Landing page     → cuentatron_web (Next.js)             │
│  📊 Dashboard        → public/dashboard.html (HTML estático) │
│  📝 Registro         → public/registro.html                  │
│  👤 Mi cuenta        → public/mi-cuenta.html                 │
│  🔔 Alertas          → WhatsApp (Twilio) + Telegram (Bot)    │
│  ⚠️ Anomalías        → vigilante_calidad.py (sin UI)         │
│  🔧 Admin            → public/admin.html (sin conexión BD)   │
│  📱 Diagnóstico      → cuentatron_diagnostico (Next.js)      │
└─────────────────────────────────────────────────────────────┘
```

### Después (App Unificada)
```
┌─────────────────────────────────────────────────────────────┐
│                   VISIÓN MVP (UNIFICADO)                     │
├─────────────────────────────────────────────────────────────┤
│                    📱 APP CUENTATRON                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ · Registro y autenticación                              ││
│  │ · Dashboard de consumo en tiempo real                   ││
│  │ · Gráficas diarias, semanales, comparativas             ││
│  │ · Notificaciones push (alertas, anomalías, picos)       ││
│  │ · Gestión de cuenta y suscripción                       ││
│  │ · Vinculación de dispositivos                           ││
│  │ · Soporte: monofásico, bifásico, paneles solares        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Categorización MoSCoW Final

### ✅ MUST HAVE (Indispensables)

| Funcionalidad | Origen | Estado | Acción |
|---------------|--------|--------|--------|
| **Dispositivo Cuentatron ESP32** | Hardware | ✅ v15.7 producción | Mantener |
| **Receptor MQTT → InfluxDB** | `receptor_mqtt.py` | ✅ Producción | Mantener |
| **Cálculo de consumo kWh** | Múltiples módulos | ✅ Implementado | Integrar |
| **Cálculo de costos CFE** | `alerta_diaria.py`, `server.js` | ✅ Implementado | Integrar |
| **App móvil Android** | — | ❌ No existe | 🔧 **DESARROLLAR** |
| **Dashboard en app** | — | ❌ No existe | 🔧 **DESARROLLAR** |
| **Notificaciones push** | — | ❌ No existe | 🔧 **DESARROLLAR** |
| **Registro/Login en app** | `registro.html` (ref) | ⚠️ Referencia | 🔧 **DESARROLLAR** |
| **Vinculación de dispositivo** | — | ❌ No existe | 🔧 **DESARROLLAR** |

### 🔶 SHOULD HAVE (Deseables)

| Funcionalidad | Origen | Estado | Acción |
|---------------|--------|--------|--------|
| **Detección de anomalías** | `vigilante_calidad.py` | ✅ EWMA listo | Integrar a backend |
| **Alertas de picos/fugas** | `vigilante_calidad.py` | ✅ Lógica lista | Migrar a push |
| **Panel admin nuevo** | — | ❌ No existe | 🔧 Desarrollar (BD directa) |
| **Sistema de suscripción** | `server.js` (Stripe) | ⚠️ Parcial | 🔧 Adaptar a app |
| **Venta online nacional** | — | ❌ No existe | 🔧 Implementar |
| **Email transaccional** | `server.js` (Resend) | ✅ Listo | Adaptar templates |
| **Modelo bifásico** | Firmware soporta | ⚠️ Parcial | 🔧 Desarrollar UI |
| **Soporte paneles solares** | Idea capturada | ❌ No existe | 🔧 Desarrollar |

### 📦 COULD HAVE (Podrían estar)

| Funcionalidad | Origen | Acción |
|---------------|--------|--------|
| **Gráficas semanales** | Bot Telegram (comando) | Implementar en app |
| **Gráficas diarias** | Dashboard legacy | Reimplementar en app |
| **Comparativo periodo anterior** | Lógica parcial | Desarrollar en app |
| **Gestión de cuenta** | `mi-cuenta.html` | Reimplementar en app |
| **Portal diagnóstico** | `cuentatron_diagnostico` | ⚠️ Analizar integración |

### ❌ WON'T HAVE (Descartadas para V1)

| Funcionalidad | Razón |
|---------------|-------|
| **Dashboard web separado** | Reemplazado por app |
| **Alertas WhatsApp** | Reemplazado por push (restricciones API) |
| **Alertas Telegram** | Reemplazado por push |
| **Reporte PDF descargable** | Información en tiempo real en app |
| **Bot con IA Gemini** | Nice-to-have, no core |
| **Integración Chatwoot** | Soporte manual inicialmente |
| **Soporte iOS** | Pospuesto para V2 |
| **Páginas HTML legacy** | Obsoletas con nueva app |

---

## 3. Activos Técnicos Reutilizables

### 🟢 Listos para Producción (Sin Cambios)

| Activo | Archivo | Valor para MVP |
|--------|---------|----------------|
| Firmware ESP32 v15.7 | `sketch_esp32_lete.ino` | Hardware probado, dual-core |
| Pipeline MQTT→InfluxDB | `receptor_mqtt.py` | Batching robusto |
| Tarifas CFE escalonadas | `alerta_diaria.py` | Cálculo preciso con IVA |
| Detección EWMA | `vigilante_calidad.py` | Algoritmo de anomalías |
| Bot Telegram + Gemini | `server.js` | ⚠️ No para MVP, pero reutilizable |
| Webhooks Stripe | `server.js` | Pagos recurrentes |
| Templates Resend | `server.js` | Emails transaccionales |

### 🟡 Requieren Adaptación

| Activo | Cambio Necesario |
|--------|------------------|
| Lógica de alertas | Migrar de WhatsApp/Telegram a FCM push |
| Sistema de usuarios | Crear autenticación para app móvil |
| Dashboard | Reescribir como componentes nativos |
| Registro | Reimplementar flujo en app |

### 🔴 Descartar

| Activo | Razón |
|--------|-------|
| `servidor.py` | Obsoleto (reemplazado por receptor_mqtt) |
| Páginas HTML dispersas | Obsoletas con app unificada |
| Templates WhatsApp Twilio | No aplican para push |

---

## 4. Arquitectura Técnica MVP

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA MVP FINAL                          │
└─────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │   Google Play    │
                        │      Store       │
                        └────────┬─────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      📱 APP MÓVIL ANDROID                            │
│                                                                       │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│  │ Dashboard │ │  Alertas  │ │  Cuenta   │ │  Config   │            │
│  │  Consumo  │ │   Push    │ │  Usuario  │ │Dispositivo│            │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘            │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ HTTPS (API REST)
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         🖥️ BACKEND (API)                             │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Servicios                                     │ │
│  │  · Auth (JWT)  · Alertas  · Suscripciones  · Admin  · Consultas │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Lógica de Negocio                            │ │
│  │  · Cálculo CFE (reutilizar)  · EWMA anomalías (reutilizar)      │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  InfluxDB   │    │   Supabase   │    │    FCM       │
│  (consumo)  │    │  (usuarios)  │    │ Push Notif   │
└──────┬──────┘    └──────────────┘    └──────────────┘
       │
       │ MQTT
┌──────┴──────┐
│ receptor_   │
│ mqtt.py     │  ← REUTILIZAR
└──────┬──────┘
       │ MQTT
┌──────┴──────┐
│  Mosquitto  │
│   Broker    │
└──────┬──────┘
       │ WiFi
┌──────┴──────┐
│ CUENTATRON  │
│ ESP32 v15.7 │  ← REUTILIZAR
└─────────────┘
```

---

## 5. Happy Path del Usuario

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO PRINCIPAL DEL USUARIO                          │
└─────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐
│ 1. ADQUISICIÓN     │
├────────────────────┤
│ · Compra online    │
│ · Landing page     │
│ · Recibe paquete   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 2. ONBOARDING APP  │
├────────────────────┤
│ · Descarga app     │
│ · Crea cuenta      │
│ · Confirma email   │
│ · Inicia sesión    │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 3. VINCULACIÓN     │
├────────────────────┤
│ · Escanea QR       │
│ · Conecta WiFi     │
│ · Dispositivo ok   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 4. USO DIARIO      │
├────────────────────┤
│ · Dashboard        │
│ · Gráficas         │
│ · Alertas push     │
│ · Costo estimado   │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│ 5. VALOR CONTINUO  │
├────────────────────┤
│ · Historial        │
│ · Comparativos     │
│ · Recomendaciones  │
│ · Suscripción      │
└────────────────────┘
```

---

## 6. Modelo de Negocio MVP

### Fuentes de Ingreso

| Fuente | Tipo | Prioridad MVP |
|--------|------|---------------|
| **Venta de dispositivo** | Pago único | ✅ Primario |
| **Suscripción mensual** | Recurrente | ✅ Primario |
| **Configuraciones premium** | Upsell | 🔶 Secundario |

### Diferenciación de Precios

| Configuración | Precio Suscripción |
|---------------|-------------------|
| Monofásico | Base |
| Bifásico | +20% |
| Paneles solares | +30% |

### Funciones Gratis vs Premium

| Funcionalidad | Gratis | Suscripción |
|---------------|--------|-------------|
| Dashboard básico | ✅ | ✅ |
| Alerta diaria | ✅ | ✅ |
| Historial 7 días | ✅ | ✅ |
| Historial completo | ❌ | ✅ |
| Alertas de anomalías | ❌ | ✅ |
| Gráficas avanzadas | ❌ | ✅ |
| Comparativos | ❌ | ✅ |
| Soporte prioritario | ❌ | ✅ |

---

## 7. Deuda Técnica a Resolver

### 🔴 Crítica (Antes del MVP)

| Problema | Impacto | Acción |
|----------|---------|--------|
| Código obsoleto `servidor.py` | Confusión | Eliminar o archivar |
| JavaScript inline en HTMLs | No aplica | Ignorar (código obsoleto) |
| Calibración hardcoded ESP32 | Cada dispositivo requiere flash | Documentar proceso |

### 🟡 Media (Durante MVP)

| Problema | Impacto | Acción |
|----------|---------|--------|
| `server.js` monolítico | Difícil de mantener | Refactorizar al migrar lógica |
| Sin tests automatizados | Riesgo de regresiones | Tests críticos mínimos |

### 🟢 Baja (Post-MVP)

| Problema | Recomendación |
|----------|---------------|
| Logs sin centralizar | CloudWatch o similar |
| Templates Twilio sin documentar | Archivar con documentación |

---

## 8. Roadmap de Implementación

### Fase 1: Fundación (Semanas 1-2)

| Tarea | Entregable |
|-------|------------|
| Definir stack tecnológico app | Documento de arquitectura |
| Configurar proyecto Android | Repositorio con estructura base |
| Diseñar modelo de datos | Schema Supabase |
| Configurar FCM | Push notifications funcionando |

### Fase 2: Core App (Semanas 3-5)

| Tarea | Entregable |
|-------|------------|
| Autenticación (registro/login) | Flujo completo con email |
| Dashboard de consumo | Pantalla principal funcional |
| Vinculación de dispositivo | QR → WiFi → Vinculado |
| Notificaciones push | Alertas diarias y de anomalías |

### Fase 3: Features Completas (Semanas 6-7)

| Tarea | Entregable |
|-------|------------|
| Gráficas diarias/semanales | Componentes visuales |
| Gestión de cuenta | Perfil y configuración |
| Sistema de suscripción | Stripe integrado |
| Panel admin básico | CRUD dispositivos/usuarios |

### Fase 4: QA y Lanzamiento (Semana 8)

| Tarea | Entregable |
|-------|------------|
| Pruebas end-to-end | Casos de uso validados |
| Beta con usuarios piloto | Feedback documentado |
| Publicación Play Store | App en producción |
| Actualización landing page | Refleja nueva app |

---

## 9. Criterios de Éxito

### Métricas a 60 días

| Métrica | Mínimo | Ideal |
|---------|--------|-------|
| Descargas Play Store | 100 | 500 |
| Usuarios registrados | 50 | 200 |
| Dispositivos vinculados | 20 | 100 |
| Suscripciones activas | 10 | 50 |
| Rating Play Store | 3.5+ | 4.5+ |
| Retención 7 días | 40% | 60% |

### Señales para V2

1. ✅ 100+ usuarios activos semanales
2. ✅ Feedback positivo sobre experiencia
3. ✅ Demanda de iOS documentada
4. ✅ Solicitudes de nuevas funciones

---

## 10. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Complejidad de desarrollo app | Media | Alto | Stack conocido, MVP mínimo |
| Adopción de suscripción baja | Media | Alto | Freemium generoso, valor claro |
| Problemas de vinculación WiFi | Alta | Alto | Flujo guiado, troubleshooting en app |
| Push notifications no entregadas | Baja | Medio | FCM + fallback email |
| Hardware defectuoso en campo | Baja | Alto | QA antes de envío, garantía |

---

## 11. Documentos de Referencia

| Documento | Descripción |
|-----------|-------------|
| [01_IDEAS_CONSOLIDADO.md](file:///c:/TESIVIL/AWS-TESIVIL/AWS-TESIVIL/15_CUENTATRON/docs/planning/01_IDEAS_CONSOLIDADO.md) | 37 ideas categorizadas |
| [02_MASTER_PLAN.md](file:///c:/TESIVIL/AWS-TESIVIL/AWS-TESIVIL/15_CUENTATRON/docs/planning/02_MASTER_PLAN.md) | Plan maestro con estrategia |
| [03_ESTRATEGIA_MVP_PROPUESTA.md](file:///c:/TESIVIL/AWS-TESIVIL/AWS-TESIVIL/15_CUENTATRON/docs/planning/03_ESTRATEGIA_MVP_PROPUESTA.md) | Estrategia detallada por componente |
| `docs_analysis/modules/*.md` | Análisis técnico de 9 módulos legacy |

---

## 12. Próximos Pasos Inmediatos

1. **Día 1-2:** Seleccionar stack tecnológico (React Native, Flutter, Kotlin?)
2. **Día 3:** Configurar repositorio y estructura del proyecto
3. **Día 4:** Diseñar wireframes principales (Figma)
4. **Día 5:** Configurar Supabase + FCM
5. **Semana 2:** Implementar autenticación y pantalla principal
6. **Semana 3:** Conectar con datos reales de InfluxDB

---

> [!IMPORTANT]
> **Este es el documento guía del MVP.** Cualquier nueva funcionalidad debe evaluarse preguntando:
> 1. ¿Aporta valor al usuario en la app?  
> 2. ¿Justifica el esfuerzo de desarrollo para V1?  
> Si la respuesta es "no" a cualquiera, va a COULD HAVE o WON'T HAVE.

---

*Documento consolidado a partir del análisis de IDEAS_CONSOLIDADO, MASTER_PLAN, ESTRATEGIA_MVP_PROPUESTA, y módulos de código legacy.*
