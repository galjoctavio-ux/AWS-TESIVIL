# ESTRATEGIA MVP v2.0 - CUENTATRON APP NATIVA

> **Documento de Estrategia de Producto**  
> **Fecha:** 2026-01-05  
> **Propósito:** Definir el MVP centrado en aplicación móvil nativa unificada

---

## 📋 Resumen Ejecutivo

El proyecto Cuentatron evoluciona de un conjunto disperso de páginas web y scripts hacia una **aplicación móvil nativa unificada** que centraliza todos los procesos: registro, configuración, alertas y visualización de datos.

| Métrica | Valor |
|---------|-------|
| **Objetivo principal** | App móvil nativa Android (mínimo) |
| **Canales de alerta** | Notificaciones push (NO WhatsApp/Telegram) |
| **Dashboard** | Integrado en la app (NO página web separada) |
| **Modelo de negocio** | Suscripción + Venta online nacional |

> [!IMPORTANT]
> **Cambio de paradigma:** Ya no será un conjunto de páginas web aisladas. Todo el ecosistema Cuentatron se unifica en una sola aplicación móvil.

---

## 1. Evaluación de Componentes

### Matriz Valor-Viabilidad (1-5)

| Componente | Valor Usuario | Viabilidad Técnica | Score Total | Veredicto |
|------------|---------------|-------------------|-------------|-----------|
| **Firmware ESP32 (v15.7)** | 5 | 5 | 10 | ⭐ CORE |
| **Receptor MQTT → InfluxDB** | 5 | 5 | 10 | ⭐ CORE |
| **Cálculo tarifas CFE** | 5 | 5 | 10 | ⭐ CORE |
| **Cálculo de consumo kWh** | 5 | 5 | 10 | ⭐ CORE |
| **App móvil nativa Android** | 5 | 4 | 9 | ⭐ CORE NUEVO |
| **Notificaciones push en app** | 5 | 4 | 9 | ⭐ CORE NUEVO |
| **Dashboard en app** | 5 | 4 | 9 | ⭐ CORE NUEVO |
| **Registro en app** | 5 | 4 | 9 | ⭐ CORE NUEVO |
| **Detección de anomalías** | 4 | 5 | 9 | 🔧 INTEGRAR |
| **Alertas de picos/fugas** | 4 | 5 | 9 | 🔧 INTEGRAR |
| **Sistema de suscripción** | 4 | 4 | 8 | 🔧 IMPLEMENTAR |
| **Panel admin nuevo** | 4 | 4 | 8 | 🔧 IMPLEMENTAR |
| **Modelo bifásico** | 4 | 3 | 7 | 🔧 IMPLEMENTAR |
| **Soporte paneles solares** | 4 | 3 | 7 | 🔧 IMPLEMENTAR |
| **Venta online nacional** | 3 | 4 | 7 | 🔧 IMPLEMENTAR |
| **Email para alertas/registro** | 3 | 5 | 8 | 🔧 IMPLEMENTAR |
| **Gráficas semanales/diarias** | 4 | 4 | 8 | 📌 EN APP |
| **Comparativo periodo anterior** | 3 | 4 | 7 | 📌 EN APP |
| **Gestión de cuenta en app** | 4 | 4 | 8 | 📌 EN APP |
| **Portal diagnóstico separado** | 2 | 5 | 7 | ⚠️ ANALIZAR |
| **Dashboard web (legacy)** | 1 | 5 | 6 | ❌ RETIRAR |
| **Alertas WhatsApp/Telegram** | 1 | 5 | 6 | ❌ RETIRAR |
| **Reporte PDF descargable** | 2 | 4 | 6 | ❌ NO IMPLEMENTAR |
| **Bot con IA (Gemini)** | 2 | 4 | 6 | ❌ NO IMPLEMENTAR |
| **Integración Chatwoot** | 1 | 4 | 5 | ❌ NO IMPLEMENTAR |
| **Soporte iOS** | 3 | 2 | 5 | ⏳ POSPONER |
| **Landing page** | 3 | 5 | 8 | ✅ YA EXISTE (modificar texto) |

### Leyenda de Viabilidad Técnica
- **5** = Código listo, probado en producción
- **4** = Desarrollo estándar con tecnologías conocidas
- **3** = Requiere investigación o desarrollo moderado
- **2** = Desarrollo significativo requerido
- **1** = Alta complejidad o barreras técnicas

---

## 2. Categorización MoSCoW

### ✅ MUST HAVE (Indispensables)

> Lo mínimo para que la app tenga sentido y sea funcional.

| Funcionalidad | Justificación | Acción |
|---------------|---------------|--------|
| **Dispositivo Cuentatron operativo** | Sin hardware no hay producto | ✅ Mantener firmware v15.7 |
| **Recepción de datos MQTT** | Pipeline crítico de datos | ✅ Mantener `receptor_mqtt.py` |
| **Almacenamiento InfluxDB** | Base para cálculos y gráficas | ✅ Mantener |
| **Cálculo de consumo kWh** | Valor core del producto | ✅ Integrar a app |
| **Cálculo de costos CFE** | Traducción a dinero | ✅ Integrar a app |
| **App móvil Android** | Objetivo principal del MVP | 🔧 DESARROLLAR |
| **Dashboard en app** | Reemplaza dashboard web | 🔧 DESARROLLAR |
| **Notificaciones push** | Reemplazan WhatsApp/Telegram | 🔧 DESARROLLAR |
| **Registro en app** | Onboarding unificado | 🔧 DESARROLLAR |

### 🔶 SHOULD HAVE (Deseables)

> Importantes para la propuesta de valor completa.

| Funcionalidad | Justificación | Acción |
|---------------|---------------|--------|
| **Detección de anomalías** | Valor agregado diferenciador | 🔧 Integrar `vigilante_calidad.py` a backend |
| **Alertas de picos/fugas** | Prevención proactiva | 🔧 Migrar lógica EWMA a notificaciones push |
| **Panel admin nuevo** | Gestión de clientes/dispositivos | 🔧 Desarrollar nuevo, conexión directa a BD |
| **Sistema de suscripción** | Modelo de negocio recurrente | 🔧 Implementar en app |
| **Venta online nacional** | Escalar más allá de lo local | 🔧 Integrar con app |
| **Email transaccional** | Alertas y confirmación de registro | 🔧 Implementar (Resend) |

### 📦 COULD HAVE (Podrían estar)

> Se incluirán si hay tiempo y recursos.

| Funcionalidad | Justificación | Acción |
|---------------|---------------|--------|
| **Gráficas semanales** | Visión de tendencias | 🔧 Implementar en app |
| **Gráficas diarias** | Detalle de consumo | 🔧 Implementar en app |
| **Comparativo periodo anterior** | Insights de ahorro | 🔧 Implementar en app |
| **Gestión de cuenta en app** | Auto-servicio del usuario | 🔧 Desarrollar nuevo en app |
| **Portal de diagnóstico separado** | UX de contratación | ⚠️ Analizar si se integra a app |
| **Modelo bifásico** | Mercado industrial/comercial | 🔧 Implementar |
| **Soporte paneles solares** | Mercado sustentable | 🔧 Implementar |

### ❌ WON'T HAVE (Descartadas para V1)

> Ideas que se quedan fuera para evitar distracciones.

| Funcionalidad | Razón de Descarte |
|---------------|-------------------|
| **Dashboard web separado** | Todo el dashboard estará en la app |
| **Alertas WhatsApp** | Migrado a notificaciones push nativas |
| **Alertas Telegram** | Migrado a notificaciones push nativas |
| **Reporte PDF descargable** | Información disponible en tiempo real en la app |
| **Bot con IA (Gemini)** | Nice-to-have, no core value |
| **Integración Chatwoot** | Soporte puede manejarse diferente |
| **Soporte iOS** | Pospuesto para versiones futuras |
| **Registro web legacy** | Se usará como referencia, desarrollo nuevo en app |
| **Admin web legacy** | Se desarrollará uno nuevo con conexión directa |

---

## 3. Definición del Core MVP

### 🎯 Visión de la Versión 1.0

**Cuentatron v1.0** es una **aplicación móvil nativa para Android** que unifica todo el ecosistema del medidor inteligente: registro de usuario, configuración de dispositivo, visualización de consumo, y alertas en tiempo real mediante notificaciones push.

### Happy Path del Usuario

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO UNIFICADO EN APP MÓVIL                         │
└─────────────────────────────────────────────────────────────────────────┘

1. DESCARGA Y REGISTRO
   ├── Usuario descarga app de Google Play Store
   ├── Crea cuenta con email y contraseña
   ├── Recibe confirmación por email
   └── Inicia sesión en la app

2. CONFIGURACIÓN DE DISPOSITIVO
   ├── Usuario adquiere dispositivo Cuentatron
   ├── Escanea QR o ingresa código del dispositivo en la app
   ├── App guía proceso de conexión WiFi
   └── Dispositivo queda vinculado a la cuenta

3. MONITOREO DIARIO
   ├── Dashboard principal muestra consumo en tiempo real
   ├── Gráficas diarias y semanales de consumo
   ├── Cálculo automático de costo CFE
   └── Comparativos con periodos anteriores

4. ALERTAS INTELIGENTES
   ├── Notificación push diaria con resumen de consumo
   ├── Alertas inmediatas por picos detectados
   ├── Alertas de posibles fugas eléctricas
   └── Detección de anomalías (patrones inusuales)

5. GESTIÓN DE CUENTA
   ├── Configuración de alertas personalizadas
   ├── Gestión de suscripción y pagos
   ├── Historial de consumo y costos
   └── Soporte vía app

┌─────────────────────────────────────────────────────────────────────────┐
│                       RESULTADO ESPERADO                                │
│  Usuario tiene control total de su consumo eléctrico desde una sola    │
│  app, con alertas proactivas y sin depender de WhatsApp/Telegram.      │
└─────────────────────────────────────────────────────────────────────────┘
```

### Características de la V1.0

| Aspecto | Descripción |
|---------|-------------|
| **Plataforma** | Android (mínimo), iOS pospuesto |
| **Tipo de app** | Nativa |
| **Registro** | En la app (referencia de registro.html existente) |
| **Dashboard** | Integrado en la app |
| **Alertas** | Notificaciones push nativas |
| **Modelo de negocio** | Suscripción + Venta online |
| **Admin** | Panel nuevo con conexión directa a BD |
| **Hardware soportado** | Monofásico, Bifásico, Paneles solares |

---

## 4. Componentes a Desarrollar/Adaptar

### 🆕 Desarrollo Nuevo

| Componente | Descripción | Prioridad |
|------------|-------------|-----------|
| **App móvil Android** | Aplicación nativa principal | 🔴 Crítica |
| **Sistema de autenticación** | Registro/Login en app | 🔴 Crítica |
| **Dashboard móvil** | Visualización de consumo | 🔴 Crítica |
| **Sistema de notificaciones push** | Reemplazo de WhatsApp/Telegram | 🔴 Crítica |
| **Panel admin nuevo** | Gestión centralizada, conexión directa BD | 🟡 Alta |
| **Sistema de suscripciones** | Pagos recurrentes | 🟡 Alta |
| **Venta online** | E-commerce de dispositivos | 🟡 Alta |

### 🔄 Integrar/Adaptar de Código Existente

| Componente Original | Integración en App | Referencia |
|---------------------|-------------------|------------|
| `vigilante_calidad.py` | Lógica de detección de anomalías | Backend |
| Sistema EWMA (picos/fugas) | Alertas push automáticas | Backend |
| Cálculo de tarifas CFE | Mostrar costos en dashboard | App |
| `registro.html` | Referencia para flujo de registro | App (nuevo) |

### ✅ Mantener Sin Cambios

| Componente | Justificación |
|------------|---------------|
| Firmware ESP32 v15.7 | Ya funciona correctamente |
| `receptor_mqtt.py` | Pipeline de datos probado |
| InfluxDB | Almacenamiento de series temporales |
| Landing page | Ya existe, solo modificar textos |

### ⚠️ Analizar

| Componente | Decisión Pendiente |
|------------|-------------------|
| Portal de diagnóstico | ¿Se integra a la app o permanece separado? |

---

## 5. Arquitectura Propuesta

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA MVP v2.0                           │
└─────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │   Google Play    │
                        │      Store       │
                        └────────┬─────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      APP MÓVIL ANDROID                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │  Dashboard  │  │   Alertas   │  │   Cuenta    │  │   Tienda    │  │
│  │  Consumo    │  │    Push     │  │   Usuario   │  │   Online    │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
└───────────────────────────┬──────────────────────────────────────────┘
                            │ API REST
                            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         BACKEND                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │    Auth     │  │   Alertas   │  │   Pagos /   │  │    Admin    │  │
│  │   Service   │  │   Service   │  │ Suscripción │  │   Service   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    Lógica de Negocio                            │  │
│  │  • Cálculo CFE  • Detección anomalías  • Alertas inteligentes  │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  InfluxDB   │    │   Supabase   │    │    FCM /     │
│  (consumo)  │    │  (usuarios)  │    │  Push Notif  │
└─────────────┘    └──────────────┘    └──────────────┘
         ▲
         │ MQTT
┌────────┴────────┐
│  receptor_mqtt  │
│      .py        │
└────────┬────────┘
         │ MQTT
         ▼
┌─────────────────┐
│    Mosquitto    │
│     Broker      │
└────────┬────────┘
         │ WiFi
         ▼
┌─────────────────┐
│   Cuentatron    │
│   ESP32 v15.7   │
└─────────────────┘
```

---

## 6. Diferencias con la Estrategia Anterior

| Aspecto | Estrategia Anterior | Nueva Estrategia |
|---------|---------------------|------------------|
| **Objetivo principal** | Dashboard web + WhatsApp | App móvil nativa |
| **Alertas** | WhatsApp + Telegram | Notificaciones push |
| **Dashboard** | HTML separado | Integrado en app |
| **Registro** | Página web | En la app |
| **Modelo** | Servicio local 7 días | Suscripción + Venta nacional |
| **Admin** | Página HTML existente | Panel nuevo con BD directa |
| **App móvil** | Descartada | Objetivo principal |
| **Bifásico** | Descartado | Incluido |
| **Paneles solares** | Descartado | Incluido |
| **Suscripción** | Diferido | Incluido |
| **iOS** | Descartado | Pospuesto (después de Android) |

---

## 7. Landing Page Existente

> [!NOTE]
> La landing page ya existe y funciona. Solo requiere modificación de textos para reflejar que ahora las alertas son vía app móvil en lugar de WhatsApp.

**Cambios necesarios:**
- Reemplazar referencias a "alertas de WhatsApp" por "notificaciones en la app"
- Agregar botones de descarga de Google Play
- Actualizar beneficios para reflejar la experiencia unificada de la app

---

## 8. Próximos Pasos Inmediatos

1. **Definir stack tecnológico** para la app móvil Android
2. **Diseñar arquitectura del backend** para soportar la app
3. **Crear wireframes** de las pantallas principales de la app
4. **Definir modelo de datos** unificado
5. **Planificar integración** con código existente (vigilante, EWMA, CFE)
6. **Definir flujo de notificaciones push** (Firebase Cloud Messaging)
7. **Diseñar panel admin nuevo** con conexión directa a BD

---

## 9. Criterios de Éxito del MVP

### Métricas a 60 días del lanzamiento

| Métrica | Objetivo Mínimo | Objetivo Ideal |
|---------|-----------------|----------------|
| Descargas en Play Store | 100 | 500 |
| Usuarios registrados | 50 | 200 |
| Dispositivos vinculados | 20 | 100 |
| Suscripciones activas | 10 | 50 |
| Rating en Play Store | 3.5+ | 4.5+ |
| Notificaciones entregadas | 90% | 98% |

---

> [!IMPORTANT]
> **Este documento redefine el enfoque del proyecto.** La app móvil es el producto principal. Cualquier decisión debe evaluarse preguntando: "¿Esto aporta valor a la experiencia en la app?"

---

*Documento actualizado con nueva visión centrada en aplicación móvil nativa unificada.*
