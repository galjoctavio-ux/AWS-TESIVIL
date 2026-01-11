# PLAN MAESTRO - CUENTATRON

## Control de Cambios
| Versión | Fecha       | Descripción                                              |
|---------|-------------|----------------------------------------------------------|
| 1.0     | 2026-01-05  | Creación inicial basada en ESTADO_SINC_ANTIGRAVITY #1    |
| 1.1     | 2026-01-05  | Evolución a sistema producto-servicio (ESTADO_SINC #2)   |
| 1.2     | 2026-01-05  | Modelo dual y suscripción (ESTADO_SINC #3)               |
| 1.3     | 2026-01-05  | Definición MVP avanzado y multiplataforma (ESTADO_SINC #4)|
| 1.4     | 2026-01-05  | UX, app unificada y flujo DIY (ESTADO_SINC #5)           |
| 1.5     | 2026-01-05  | Admin, operaciones y pagos (ESTADO_SINC #6)              |
| 1.6     | 2026-01-05  | Notificaciones y paneles solares (ESTADO_SINC #7)        |
| 1.7     | 2026-01-05  | Inventario de activos técnicos y análisis de deuda       |

---

## 1. Contexto Empresarial

**Empresa:** Luz en tu Espacio  
**Servicio estrella actual:** Diagnóstico eléctrico (revisión de 1 hora)  
**Limitación identificada:** Tiempo insuficiente para diagnósticos complejos de alto consumo

> [!IMPORTANT]
> El proyecto Cuentatron opera en modelo dual: extensión de servicio local + producto nacional independiente.

---

## 2. Visión del Proyecto

**Cuentatron** es un sistema de **monitoreo energético** con modelo dual:

### Modelo A: Servicio Profesional (Local)
- Extensión del servicio de diagnóstico de Luz en tu Espacio
- Monitoreo de 7 días para casos complejos
- Entrega de reporte profesional con hallazgos

### Modelo B: Producto-Suscripción (Nacional)
- Venta de dispositivo a usuarios en todo el país
- Suscripción mensual para acceso a funciones avanzadas
- Sistema de alertas como valor continuo
- Operación básica sin suscripción activa

---

## 3. Pilares del Sistema

### Pilar 1: Hardware de Medición (Cuentatron)
Dispositivo físico que mide el consumo eléctrico y lo traduce a kWh comprensibles.

### Pilar 2: Aplicación de Visualización + Alertas
Software que permite ver consumo en tiempo real y recibe alertas proactivas de anomalías.

### Pilar 3: Servicio de Monitoreo (Local)
Préstamo del dispositivo por 7 días + análisis + reporte profesional.

### Pilar 4: Suscripción Mensual (Nacional)
Acceso continuo a funciones premium, alertas inteligentes y acompañamiento.

### Pilar 5: Separación Dispositivo-Servicio
El equipo puede comprarse independientemente del servicio de suscripción.

### Pilar 6: Notificaciones y Soporte Multi-Configuración
Notificaciones diarias de consumo + soporte para monofásico, bifásico y paneles solares.

---

## 4. Soporte de Configuraciones Eléctricas

### Tipos de Instalación Soportados
| Tipo | Descripción | Precios |
|------|-------------|----------|
| **Monofásico** | Instalación residencial estándar | Base |
| **Bifásico** | Instalación con mayor capacidad | +20% (tentativo) |
| **Con paneles solares** | Incluye generación | +30% (tentativo) |

### Funcionalidades Exclusivas para Paneles Solares
- Sección dedicada en la app
- Estimación de impacto en recibo CFE
- Balance generación vs consumo
- Alertas personalizadas para instalaciones solares
- Recomendaciones de aprovechamiento

### Sistema de Notificaciones
| Tipo | Frecuencia | Valor |
|------|------------|-------|
| Consumo diario | Diaria | Crea hábito de monitoreo |
| Alertas de pico | Inmediata | Previene sorpresas en recibo |
| Resumen semanal | Semanal | Visión general de patrones |
| Alertas solares | Según evento | Monitoreo de generación |

---

## 4. Públicos Objetivo

### Fase 1: Público Local
| Segmento | Descripción |
|----------|-------------|
| **Quién** | Clientes actuales de Luz en tu Espacio |
| **Perfil** | Alto consumo eléctrico, preocupación por factura CFE |
| **Cobertura** | Dentro del área de servicio técnico existente |
| **Modelo** | Servicio profesional + reporte |

### Fase 2: Público Nacional
| Segmento | Descripción |
|----------|-------------|
| **Quién** | Usuarios en cualquier parte del país |
| **Perfil** | Interés en control energético, autónomos |
| **Cobertura** | Sin dependencia de cobertura operativa |
| **Modelo** | Compra de equipo + suscripción opcional |

---

## 5. Experiencia de Usuario (UX)

### Enfoque DIY (Hágalo Usted Mismo)
El modelo nacional opera bajo un enfoque DIY donde el usuario:
- Compra el dispositivo (online o retail)
- Desempaca y escanea QR del empaque
- Se registra en la app
- Instala el dispositivo sin técnico

### Flujo de Activación

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│   EMPAQUE     │ →→→ │  ESCANEO QR   │ →→→ │   REGISTRO    │
│  + QR tipo A  │     │  (7 días)     │     │   en APP      │
│  + QR tipo B  │     │  (Permanente) │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

### Tipos de QR
| QR | Servicio | Suscripción | Uso |
|----|----------|-------------|-----|
| **Tipo A** | 7 días | No requerida | Servicio local Luz en tu Espacio |
| **Tipo B** | Permanente | Opcional | Venta nacional DIY |

### App Unificada
Una sola aplicación para ambos servicios:

| Funcionalidad | 7 días | Permanente |
|---------------|--------|------------|
| Gráficas de consumo | ✅ | ✅ |
| Sistema de alertas | ✅ | ✅ |
| Equipos identificados | ✅ | ✅ |
| Info preventiva CFE | ✅ | ✅ |
| Reporte descargable | ✅ | ✅ (premium) |
| Historial extenso | ❌ | ✅ (suscripción) |
| Alertas avanzadas | ❌ | ✅ (suscripción) |

### Transición 7 días → Permanente
- Al finalizar los 7 días, el usuario recibe invitación a suscripción
- La experiencia ya demostrada genera confianza para conversión
- Funnel integrado, no agresivo

---

## 6. Plataforma Administrativa (Web)

> [!NOTE]
> Panel exclusivo para operaciones internas, no accesible a usuarios finales.

### Funcionalidades del Panel Admin

| Módulo | Funcionalidad | Descripción |
|--------|---------------|-------------|
| **Dispositivos** | Control de inventario | Activos, por activar, calibraciones |
| **Clientes** | Gestión centralizada | Datos, historial, estado de suscripción |
| **Reportes** | Generación automatizada | Reportes 7 días con datos interpretados |
| **Pagos** | Gestión diferenciada | Equipo vs servicio vs suscripción |
| **Técnico** | Datos de calibración | Acceso a parámetros por dispositivo |

### Automatización de Reportes
- Generación automática al finalizar servicio de 7 días
- Plantilla estandarizada con datos del dispositivo
- Apoyo al análisis técnico humano (no reemplazo)
- Reducción de carga operativa

### Gestión de Pagos
| Tipo | Modelo | Confianza |
|------|--------|----------|
| Venta de equipo | Pago único | Alta (producto físico) |
| Servicio 7 días | Pago único | Alta (servicio completo) |
| Suscripción | Recurrente mensual | Media (requiere onboarding) |

> [!TIP]
> La confianza del usuario es criterio clave en el diseño de flujos de pago.

---

## 7. Modelo de Negocio

### Estructura de Monetización

```
┌─────────────────────────────────────────────────────────────┐
│                     MODELO LOCAL                            │
│  Servicio profesional: Diagnóstico 7 días + Reporte         │
│  Cobro: Por servicio (pago único)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    MODELO NACIONAL                          │
│  Venta de equipo: Pago único por Cuentatron                 │
│  Suscripción opcional: Mensual para alertas + premium       │
│  Sin suscripción: Funciones básicas operan                  │
└─────────────────────────────────────────────────────────────┘
```

### Sistema de Alertas (Núcleo del Valor Continuo)
- Alertas de consumo anómalo
- Notificaciones de picos de uso
- Comparativas con periodos anteriores
- Recomendaciones de ahorro

---

## 7. Alcance del Sistema

### Incluido
- ✅ Dispositivo Cuentatron (medición de consumo)
- ✅ Servicio de préstamo 7 días (modelo local)
- ✅ Venta de dispositivo (modelo nacional)
- ✅ Aplicación móvil/web de visualización
- ✅ Sistema de alertas inteligentes
- ✅ Suscripción mensual opcional
- ✅ Operación básica sin suscripción
- ✅ Reporte profesional (modelo local)
- ✅ Comparativa con tarifas CFE

### Excluido (por ahora)
- ❌ Integración directa con sistemas de CFE
- ❌ Automatización de reclamos
- ❌ Producción masiva de hardware

---

## 8. Definición del MVP

> [!IMPORTANT]
> El MVP de Cuentatron NO es un "mínimo viable" tradicional. Es un punto de partida **avanzado** que aprovecha activos técnicos previos.

### Características del MVP Avanzado
| Aspecto | Descripción |
|---------|-------------|
| **Base técnica** | Scripts y firmware previamente desarrollados |
| **Alcance** | Multiplataforma desde el inicio |
| **Plataformas** | Android (confirmado), iOS (condicionado a barreras externas) |
| **Filosofía** | Producto funcional, no prototipo mínimo |

### Activos Técnicos Previos
- Scripts de lectura de consumo
- Firmware base del dispositivo
- Lógica de traducción a kWh

### Condicionantes Aceptados
| Plataforma | Estado | Barrera |
|------------|--------|----------|
| Android | ✅ Incluida | Ninguna |
| iOS | ⚠️ Condicionada | Certificaciones App Store, costos de publicación |
| Web | Por definir | Por evaluar |

---

## 8. Objetivos MVP

| Objetivo                                      | Estado      |
|-----------------------------------------------|-------------|
| Definir arquitectura del dispositivo          | Pendiente   |
| Integrar scripts/firmware previos             | Pendiente   |
| Especificar app multiplataforma               | Pendiente   |
| Diseñar sistema de alertas                    | Pendiente   |
| Diseñar formato de reporte                    | Pendiente   |
| Validar flujo de servicio 7 días              | Pendiente   |
| Definir tiers básico vs suscripción           | Pendiente   |
| Evaluar viabilidad iOS vs descartar           | Pendiente   |
| Establecer pricing (servicio + suscripción)   | Pendiente   |

---

## 9. Fases de Ejecución

### Fase 0: Ideación (Actual)
- [x] Captura de idea base
- [x] Evolución a sistema producto-servicio
- [x] Definición de público objetivo local
- [x] Definición de público objetivo nacional
- [x] Modelo dual establecido
- [x] Definición de MVP avanzado
- [x] Identificación de activos técnicos previos
- [ ] Consolidación de requisitos
- [ ] Análisis de viabilidad técnica

### Fase 1: Investigación
- [ ] Inventario de scripts y firmware existentes
- [ ] Estudio de sensores/medidores IoT
- [ ] Mapeo de tarifas CFE vigentes
- [ ] Definición de arquitectura base (HW + SW)
- [ ] Benchmarking de soluciones existentes
- [ ] Análisis de costos de suscripción
- [ ] Evaluación de barreras iOS

### Fase 2: MVP Avanzado (Modelo Local)
- [ ] Integración de scripts/firmware previos
- [ ] App multiplataforma (Android + Web)
- [ ] Plantilla de reporte
- [ ] Prueba piloto con 1-2 clientes Luz en tu Espacio

### Fase 3: Expansión Nacional
- [ ] Sistema de alertas completo
- [ ] Modelo de suscripción
- [ ] iOS (si barreras resueltas)
- [ ] Por definir tras resultados de Fase 2

---

## 10. Riesgos Identificados

| Riesgo                                      | Impacto | Probabilidad |
|---------------------------------------------|---------|--------------|
| Complejidad de hardware IoT                 | Alto    | Media        |
| Variabilidad de tarifas CFE                 | Medio   | Alta         |
| Adopción de suscripción por usuarios        | Alto    | Media        |
| Costo de desarrollo de app + alertas        | Alto    | Media        |
| Logística de venta nacional                 | Alto    | Media        |
| Competencia de soluciones existentes        | Medio   | Media        |
| Barreras de publicación en iOS              | Medio   | Alta         |
| Deuda técnica en activos previos            | Medio   | Media        |

---

## 11. Inventario de Activos Técnicos (Análisis Legacy)

> [!NOTE]
> Esta sección documenta el análisis de código existente realizado sobre los archivos en `legacy_source/`. Los resúmenes técnicos detallados están en `docs_analysis/modules/`.

### Listado de Módulos Analizados

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| [alerta_diaria.md](../../docs_analysis/modules/alerta_diaria.md) | ✅ Producción | Alertas diarias de consumo CFE vía WhatsApp/Telegram |
| [receptor_mqtt.md](../../docs_analysis/modules/receptor_mqtt.md) | ✅ Producción | Puente MQTT→InfluxDB con lógica de suscripción |
| [vigilante_calidad.md](../../docs_analysis/modules/vigilante_calidad.md) | ✅ Producción | Detección de anomalías (voltaje, fugas, consumo fantasma) |
| [sketch_esp32_lete.md](../../docs_analysis/modules/sketch_esp32_lete.md) | ✅ Producción | Firmware ESP32 dual-core (v15.7) |
| [cuentatron_app_server.md](../../docs_analysis/modules/cuentatron_app_server.md) | ✅ Producción | Backend Node.js (Stripe, Telegram, Gemini AI) |
| [cuentatron_web.md](../../docs_analysis/modules/cuentatron_web.md) | ✅ Producción | Landing page Next.js |
| [cuentatron_diagnostico.md](../../docs_analysis/modules/cuentatron_diagnostico.md) | ✅ Producción | Portal de diagnóstico (servicio local) |
| [cuentatron_app_public.md](../../docs_analysis/modules/cuentatron_app_public.md) | ✅ Producción | Dashboard cliente HTML |
| [servidor.md](../../docs_analysis/modules/servidor.md) | ⚠️ Obsoleto | Servidor Flask MVP (reemplazado por receptor_mqtt) |

---

## 12. Bloques Reutilizables para MVP

### Listos para Integración Directa (Sin Cambios)

| Bloque | Origen | Valor |
|--------|--------|-------|
| **Tarifas CFE escalonadas** | `alerta_diaria.py` / `server.js` | Cálculo preciso de costos con IVA |
| **Detección EWMA de anomalías** | `vigilante_calidad.py` | Algoritmo de aprendizaje automático básico |
| **Batching MQTT→InfluxDB** | `receptor_mqtt.py` | Pipeline de datos robusto |
| **Firmware dual-core ESP32** | `sketch_esp32_lete.ino` | Hardware probado en producción |
| **Bot Telegram + Gemini** | `server.js` | Asistente de IA funcional |
| **Componentes landing (Next.js)** | `cuentatron_web/` | UI reutilizable (Hero, Pricing, FAQ) |

### Requieren Adaptación Menor

| Bloque | Cambio Necesario |
|--------|------------------|
| Templates de email (Resend) | Personalizar para nueva marca |
| Webhooks Stripe | Ajustar metadata para nuevo modelo |
| Sistema de vinculación Telegram | Reutilizable con cambio de bot token |

---

## 13. Análisis de Deuda Técnica

### Deuda Crítica (Resolver antes de MVP)

| Área | Problema | Impacto | Esfuerzo |
|------|----------|---------|----------|
| Dashboard HTML | JavaScript inline, sin framework | Difícil de mantener | Alto |
| `servidor.py` | Código obsoleto en repositorio | Confusión | Bajo (eliminar) |
| Calibración ESP32 | Valores hardcoded en firmware | Cada dispositivo requiere flash individual | Medio |

### Deuda Tolerable (Post-MVP)

| Área | Problema | Recomendación |
|------|----------|---------------|
| server.js (2200 líneas) | Archivo monolítico | Refactorizar en módulos |
| Templates Twilio | Múltiples templates sin documentar | Crear mapa de templates |
| Logs de Python | Sin sistema centralizado | Implementar logging a CloudWatch o similar |

### Deuda Asumida (Decisión consciente)

| Área | Justificación |
|------|---------------|
| No tests automatizados | MVP rápido, validación manual |
| HTML estático vs SPA | Funciona, priorizar funcionalidades |
| Gemini hardcoded | Sin abstracción para cambio de modelo |

---

## 14. Próximos Pasos

1. ⏳ Continuar captura de ideas adicionales
2. ✅ Inventariar scripts y firmware previos (ver sección 11)
3. ✅ Definir requisitos técnicos del dispositivo (firmware ESP32 v15.7 existente)
4. ⏳ Especificar funcionalidades de app multiplataforma
5. ✅ Diseñar lógica de alertas (ver `vigilante_calidad.py`, `alerta_diaria.py`)
6. ⏳ Establecer modelo de servicio y pricing
7. ⏳ Evaluar recursos disponibles (presupuesto, tiempo)
8. ⏳ Decidir prioridad: ¿Modelo local primero o nacional?
9. ⏳ Evaluar viabilidad y costos de publicación iOS
10. ⏳ Resolver deuda técnica crítica (ver sección 13)
11. ⏳ Documentar templates de Twilio existentes

---

*Este documento es vivo y se actualizará conforme evolucione la planeación del proyecto.*

