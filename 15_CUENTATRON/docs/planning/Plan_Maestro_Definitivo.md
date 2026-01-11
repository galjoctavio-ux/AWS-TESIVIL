# PLAN MAESTRO DEFINITIVO - CUENTATRON MVP

> [!IMPORTANT]
> Este documento consolida **toda** la documentación de planeación del proyecto Cuentatron.  
> Es la fuente de verdad única para la ejecución del proyecto.  
> **Fecha de consolidación:** 2026-01-05

---

## ÍNDICE

1. [Introducción y Objetivo del Documento](#1-introducción-y-objetivo-del-documento)
2. [Alcance del MVP](#2-alcance-del-mvp)
3. [Ideas y Contexto Inicial](#3-ideas-y-contexto-inicial)
   - 3.1 Contexto Empresarial
   - 3.2 Idea Base: Cuentatron (Dispositivo)
   - 3.3 Ideas de Servicio Profesional (Modelo Local)
   - 3.4 Ideas de Modelo Nacional (Producto-Suscripción)
   - 3.5 Ideas de Definición MVP
   - 3.6 Ideas de Experiencia de Usuario (UX) y App
   - 3.7 Ideas de Administración y Operaciones
   - 3.8 Ideas de Notificaciones y Configuraciones Eléctricas
   - 3.9 Resumen de 37 Ideas Capturadas
4. [Contexto Técnico del Usuario](#4-contexto-técnico-del-usuario)
   - 4.1 Perfil del Desarrollador
   - 4.2 Implicaciones para el Proyecto
5. [Recursos Técnicos Disponibles](#5-recursos-técnicos-disponibles)
   - 5.1 Infraestructura Disponible
   - 5.2 Restricciones Presupuestarias
6. [Selección Tecnológica – Arquitectura Base](#6-selección-tecnológica--arquitectura-base)
   - 6.1 Decisión Definitiva: React Native + Supabase (CAME C-01)
   - 6.2 Supuestos Considerados
   - 6.3 Tecnologías Definitivas
   - 6.4 Opciones Descartadas
7. [Plan Maestro Integrado](#7-plan-maestro-integrado)
   - 7.1 Definición del Problema (Dolor)
   - 7.2 Segmentos de Usuario Priorizados
   - 7.3 Modelo de Negocio Dual
   - 7.4 Actores y Responsabilidades
   - 7.5 Flujos Críticos del Servicio
   - 7.6 Arquitectura de la Aplicación
   - 7.7 Plataforma Administrativa (Panel Admin)
   - 7.8 Sistema de Alertas y Notificaciones
   - 7.9 Inventario de Activos Técnicos (Legacy)
   - 7.10 Bloques Reutilizables para MVP
   - 7.11 Deuda Técnica Identificada
8. [Riesgos y Oportunidades (ISO 9001:2015)](#8-riesgos-y-oportunidades-iso-90012015)
   - 8.1 Lista de Riesgos Identificados (20)
   - 8.2 Lista de Oportunidades Identificadas (20)
9. [Decisiones Estratégicas CAME](#9-decisiones-estratégicas-came)
   - 9.1 Corregir (5 decisiones)
   - 9.2 Afrontar (8 decisiones)
   - 9.3 Mantener (7 decisiones)
   - 9.4 Explotar (10 decisiones)
   - 9.5 Resumen Ejecutivo CAME
10. [Implicaciones para la Ejecución](#10-implicaciones-para-la-ejecución)
    - 10.1 Timeline con Hitos
    - 10.2 Criterios de Éxito del MVP
    - 10.3 Roadmap de Implementación
    - 10.4 Próximos Pasos Inmediatos
11. [Límites y Exclusiones del Proyecto](#11-límites-y-exclusiones-del-proyecto)
    - 11.1 Alcance Confirmado del MVP
    - 11.2 Exclusiones Explícitas
12. [Glosario](#12-glosario)
13. [Diseño UX/UI Funcional (Ejecución IA)](#13-diseño-uxui-funcional-ejecución-ia)
    - 13.1 Principios de UX del Sistema
    - 13.2 Estructura de Navegación
    - 13.3 Componentes UI Funcionales
    - 13.4 Reglas Explícitas para Ejecución con IA
14. [Planeación de Interfaz y Experiencia de Usuario (UI/UX)](#14-planeación-de-interfaz-y-experiencia-de-usuario-uiux)
    - 14.1 Origen y Trazabilidad
    - 14.2 Estructura General de la Aplicación (UXUI-001 a UXUI-005)
    - 14.3 Pantalla Inicio - Dashboard (UXUI-006 a UXUI-013)
    - 14.4 Flujo de Onboarding (UXUI-014 a UXUI-028)
    - 14.5 Tipos de Plan MVP (UXUI-029 a UXUI-030)
    - 14.6 Sistema de Alertas (UXUI-031 a UXUI-044)
    - 14.7 Sección Gráficas (UXUI-045 a UXUI-050)
    - 14.8 Sección Cuenta (UXUI-051 a UXUI-054)
    - 14.9 Panel Admin Web (UXUI-055 a UXUI-062)
    - 14.10 Decisiones Globales UX (UXUI-063 a UXUI-066)
    - 14.11 Flujo de Vinculación de Dispositivo (UXUI-067 a UXUI-069)
    - 14.12 Restricciones Operativas para Ejecución con IA
    - 14.13 Ambigüedades Detectadas

---

## Control de Versiones del Documento

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.0 | 2026-01-05 | Consolidación definitiva de toda la planeación |
| 1.1 | 2026-01-05 | Agregada Sección 13: Diseño UX/UI Funcional (Ejecución IA) |
| 1.2 | 2026-01-06 | Agregada Sección 14: Planeación de UI/UX con 69 acuerdos validados (origen: ACUERDOS_UXUI_MVP.md) |

---

## Documentos de Origen Consolidados

> [!NOTE]
> Todos los documentos originales han sido preservados íntegros en la carpeta `_Planeacion_Archivos_Origen/`.

| # | Documento Original | Líneas | Contenido Principal |
|---|-------------------|--------|---------------------|
| 1 | 00_RESUMEN_EJECUTIVO.md | 148 | Resumen de sesión de ideación, 37 ideas, 6 pilares del sistema |
| 2 | 01_IDEAS_CONSOLIDADO.md | 335 | 37 ideas categorizadas con detalle completo |
| 3 | 02_MASTER_PLAN.md | 422 | Plan original con inventario de activos técnicos legacy |
| 4 | 03_ESTRATEGIA_MVP_PROPUESTA.md | 362 | Estrategia centrada en app móvil nativa Android |
| 5 | 04_ESTRATEGIA_MVP_FINAL.md | 431 | Categorización MoSCoW final, arquitectura y roadmap |
| 6 | 05_PLAN_MAESTRO_CONSOLIDADO.md | 854 | Versión 2.3 con interrogación socrática + decisiones CAME |
| 7 | 06_RIESGOS_Y_OPORTUNIDADES.md | 326 | 20 riesgos + 20 oportunidades bajo enfoque ISO 9001:2015 |
| 8 | 07_DECISIONES_CAME.md | 111 | 30 decisiones estratégicas (5C + 8A + 7M + 10E) |

---

## 1. Introducción y Objetivo del Documento

### Propósito

Este documento consolida **toda** la información de planeación del proyecto **Cuentatron MVP** generada durante la fase de ideación y diseño estratégico. Es el resultado de integrar múltiples documentos de trabajo, incluyendo:

- Plan Maestro en distintas versiones
- Documento de Ideas Consolidado
- Contexto Técnico del Usuario
- Recursos Técnicos Disponibles
- Selección Tecnológica (Arquitectura Base)
- Análisis de Riesgos y Oportunidades (ISO 9001:2015)
- Decisiones Estratégicas CAME

### Objetivo

Servir como **fuente de verdad única** para la ejecución del proyecto, asegurando que toda la información relevante esté correctamente estructurada, sin pérdida de detalle, y lista para ser utilizada en las fases de desarrollo e implementación.

### Reglas de Uso

1. Este documento es de **solo lectura estratégica** — no se modifica durante la ejecución
2. Cualquier cambio de alcance debe documentarse en documentos separados
3. Las decisiones CAME son autoritativas y deben respetarse durante la implementación
4. Los documentos de origen permanecen archivados en `_Planeacion_Archivos_Origen/`

### Datos de la Sesión de Planeación

| Métrica | Valor |
|---------|-------|
| **Bloques procesados** | 7 ESTADO_SINC_ANTIGRAVITY |
| **Total de ideas** | 37 capturadas y documentadas |
| **Documentos consolidados** | 8 archivos de planeación |
| **Versión de consolidación** | 1.0 (2026-01-05) |
| **Carpeta del proyecto** | `15_CUENTATRON` |

---

## 2. Alcance del MVP

### 2.1 Visión del Producto

**Cuentatron** es un sistema de **monitoreo energético** con modelo dual que evoluciona de un ecosistema disperso de páginas web y scripts hacia una **aplicación móvil nativa unificada** que centraliza todo el valor del producto.

| Métrica | Valor |
|---------|-------|
| **Objetivo MVP** | App móvil nativa Android |
| **Ideas consolidadas** | 37 capturadas (6 bloques ESTADO_SINC) |
| **Módulos legacy analizados** | 9 módulos (8 en producción, 1 obsoleto) |
| **Time-to-MVP estimado** | 6-8 semanas |

> [!IMPORTANT]
> **Cambio de paradigma:** El core ya no es WhatsApp/Telegram + páginas web dispersas. Todo se unifica en una aplicación móvil nativa con notificaciones push.

### 2.2 Alcance Confirmado del MVP

| Elemento | Decisión | Justificación |
|----------|----------|---------------|
| **Modelos de negocio** | Ambos desde día 1 | Ya hay código avanzado, scripts funcionando |
| **Panel Admin** | Interfaz funcional completa | Se delegará a otros usuarios, debe ser amigable |
| **App móvil** | Android completa | Core del producto |
| **iOS** | ❌ Excluido de MVP | Pospuesto para V2 |

### 2.3 Públicos Objetivo

| Público | Alcance | Modelo | Característica |
|---------|---------|--------|----------------|
| Clientes Luz en tu Espacio | Local | Servicio 7 días | Cobertura técnica existente |
| Usuarios nacionales | Nacional | DIY + Suscripción | Sin dependencia operativa |
| Usuarios con paneles solares | Nacional | Premium | Funcionalidades especializadas |

### 2.4 Pilares del Sistema

| # | Pilar | Descripción |
|---|-------|-------------|
| 1 | Hardware | Dispositivo Cuentatron (medición kWh) |
| 2 | App + Alertas | Visualización y notificaciones push |
| 3 | Servicio Local | Préstamo 7 días + reporte profesional |
| 4 | Suscripción Nacional | Funciones premium recurrentes |
| 5 | Separación Dispositivo-Servicio | Flexibilidad comercial |
| 6 | Multi-Configuración + Solar | Soporte monofásico/bifásico/solar |

---

## 3. Ideas y Contexto Inicial

### 3.1 Contexto Empresarial

| Elemento | Valor |
|----------|-------|
| **Empresa matriz** | Luz en tu Espacio |
| **Servicio actual** | Diagnóstico eléctrico (revisión de 1 hora) |
| **Problema detectado** | Tiempo insuficiente para diagnósticos complejos de alto consumo |

> [!IMPORTANT]
> El proyecto Cuentatron opera en modelo dual: extensión de servicio local + producto nacional independiente.

### 3.2 Idea Base: Cuentatron (Dispositivo)

| Atributo | Valor |
|----------|-------|
| **Nombre** | Cuentatron |
| **Clasificación** | Herramienta de visibilización de consumo eléctrico |
| **Prioridad** | ALTA - Base del sistema |

**Descripción:** Dispositivo para medir consumo eléctrico del usuario y traducirlo a kWh para informar sobre su consumo frente a CFE.

**Problema Identificado:** Falta de claridad del usuario sobre su consumo real y facturado.

**Estado de Madurez:**
- [x] Capturada y normalizada
- [x] Problema principal identificado
- [x] Evolución a sistema producto-servicio
- [x] Modelo dual definido (local + nacional)
- [ ] Evaluación técnica pendiente

---

### 3.3 Ideas de Servicio Profesional (Modelo Local)

#### 3.3.1 Servicio de Diagnóstico Extendido
| Atributo | Valor |
|----------|-------|
| **Tipo** | Servicio |
| **Descripción** | Uso del Cuentatron como base de un servicio extendido de diagnóstico eléctrico de alto consumo |
| **Valor** | Soluciona la limitación del diagnóstico de 1 hora |

#### 3.3.2 Monitoreo Prolongado (7 días)
| Atributo | Valor |
|----------|-------|
| **Tipo** | Servicio |
| **Descripción** | Servicio de revisión prolongada de 7 días para casos donde una revisión de 1 hora no es suficiente |
| **Valor** | Captura patrones de consumo que una visita puntual no detecta |

#### 3.3.3 Reporte Profesional
| Atributo | Valor |
|----------|-------|
| **Tipo** | Entregable |
| **Descripción** | Entrega de un reporte profesional con hallazgos basados en datos reales |
| **Valor** | Documento tangible que respalda el servicio y genera confianza |

#### 3.3.4 Aplicación de Visualización
| Atributo | Valor |
|----------|-------|
| **Tipo** | Software |
| **Descripción** | Visualización continua del consumo mediante una aplicación durante el periodo de monitoreo |
| **Valor** | El cliente puede ver su consumo en tiempo real durante los 7 días |

---

### 3.4 Ideas de Modelo Nacional (Producto-Suscripción)

#### 3.4.1 Segundo Público Objetivo (Nacional)
| Atributo | Valor |
|----------|-------|
| **Tipo** | Estrategia |
| **Descripción** | Público a nivel nacional, independiente de cobertura operativa de Luz en tu Espacio |
| **Valor** | Escala sin limitaciones geográficas |

#### 3.4.2 Monitoreo Permanente (Largo Plazo)
| Atributo | Valor |
|----------|-------|
| **Tipo** | Producto |
| **Descripción** | Cuentatron como herramienta de monitoreo energético doméstico a largo plazo |
| **Valor** | Transición de servicio puntual a relación continua con el cliente |

#### 3.4.3 Suscripción Mensual
| Atributo | Valor |
|----------|-------|
| **Tipo** | Modelo de Negocio |
| **Descripción** | Servicio permanente bajo esquema de suscripción mensual |
| **Valor** | Ingresos recurrentes y predecibles |

#### 3.4.4 Sistema de Alertas
| Atributo | Valor |
|----------|-------|
| **Tipo** | Funcionalidad Core |
| **Descripción** | Sistema de alertas como núcleo del valor continuo del servicio |
| **Valor** | Justifica la suscripción con acompañamiento proactivo |

#### 3.4.5 Separación Dispositivo-Servicio
| Atributo | Valor |
|----------|-------|
| **Tipo** | Estrategia Comercial |
| **Descripción** | Separación conceptual entre venta del equipo y acceso al servicio |
| **Valor** | Flexibilidad en modelos de monetización |

#### 3.4.6 Operación Básica Sin Suscripción
| Atributo | Valor |
|----------|-------|
| **Tipo** | Estrategia de Producto |
| **Descripción** | Operación básica del dispositivo aun sin suscripción activa |
| **Valor** | Reduce barrera de entrada y genera confianza |

---

### 3.5 Ideas de Definición MVP

#### 3.5.1 MVP Avanzado (No Mínimo Tradicional)
| Atributo | Valor |
|----------|-------|
| **Tipo** | Estrategia de Producto |
| **Descripción** | Definición de un MVP más avanzado que el estándar debido al estado del proyecto |
| **Valor** | El MVP parte de una base sólida, no desde cero |

#### 3.5.2 Uso de Activos Previos
| Atributo | Valor |
|----------|-------|
| **Tipo** | Recurso Técnico |
| **Descripción** | Uso de desarrollos previos (scripts y firmware) como base del MVP |
| **Valor** | Acelera el desarrollo y reduce costos |

#### 3.5.3 Expectativa Multiplataforma
| Atributo | Valor |
|----------|-------|
| **Tipo** | Requisito |
| **Descripción** | Expectativa de disponibilidad multiplataforma desde la fase MVP |
| **Valor** | Mayor alcance desde el lanzamiento inicial |

#### 3.5.4 Inclusión Condicionada de Plataforma
| Atributo | Valor |
|----------|-------|
| **Tipo** | Decisión Técnica |
| **Descripción** | Inclusión condicional de una plataforma sujeta a barreras externas aceptadas |
| **Valor** | Flexibilidad ante restricciones externas (ej. App Store, certificaciones) |

---

### 3.6 Ideas de Experiencia de Usuario (UX) y App

#### 3.6.1 Enfoque "Hágalo Usted Mismo" (DIY)
| Atributo | Valor |
|----------|-------|
| **Tipo** | Estrategia de Producto |
| **Descripción** | Enfoque DIY para el público general, sin necesidad de técnico |
| **Valor** | Escala nacional sin dependencia operativa |

#### 3.6.2 Empaque como Punto de Entrada
| Atributo | Valor |
|----------|-------|
| **Tipo** | UX / Activación |
| **Descripción** | El empaque del dispositivo como punto de entrada al alta en la plataforma |
| **Valor** | Experiencia de unboxing guiada hacia el registro |

#### 3.6.3 Registro vía QR Diferenciado
| Atributo | Valor |
|----------|-------|
| **Tipo** | UX / Flujo |
| **Descripción** | Registro en la app mediante dos tipos de QR según el servicio (7 días o permanente) |
| **Valor** | Personalización del onboarding según contexto de compra |

**Tipos de QR:**
| QR | Servicio | Suscripción | Uso |
|----|----------|-------------|-----|
| **Tipo A** | 7 días | No requerida | Servicio local Luz en tu Espacio |
| **Tipo B** | Permanente | Opcional | Venta nacional DIY |

#### 3.6.4 App Unificada
| Atributo | Valor |
|----------|-------|
| **Tipo** | Arquitectura |
| **Descripción** | Unificación funcional de la app para servicios de 7 días y permanente |
| **Valor** | Una sola app, una sola base de código, dos experiencias |

**Funcionalidades por Modo:**
| Funcionalidad | 7 días | Permanente |
|---------------|--------|------------|
| Gráficas de consumo | ✅ | ✅ |
| Sistema de alertas | ✅ | ✅ |
| Equipos identificados | ✅ | ✅ |
| Info preventiva CFE | ✅ | ✅ |
| Reporte descargable | ✅ | ✅ (premium) |
| Historial extenso | ❌ | ✅ (suscripción) |
| Alertas avanzadas | ❌ | ✅ (suscripción) |

#### 3.6.5 Servicio de 7 Días Sin Suscripción
| Atributo | Valor |
|----------|-------|
| **Tipo** | Modelo de Servicio |
| **Descripción** | El servicio de 7 días no requiere suscripción, es una experiencia completa |
| **Valor** | Baja barrera de entrada, experiencia de prueba real |

#### 3.6.6 Transición Natural a Permanente
| Atributo | Valor |
|----------|-------|
| **Tipo** | Estrategia de Conversión |
| **Descripción** | Transición natural del servicio de 7 días al servicio permanente |
| **Valor** | Funnel de conversión integrado en la experiencia |

#### 3.6.7 App como Centro de Interpretación
| Atributo | Valor |
|----------|-------|
| **Tipo** | Funcionalidad Core |
| **Descripción** | La app como centro de gráficas, alertas, equipos identificados e información preventiva de CFE |
| **Valor** | Todo el valor interpretativo en un solo lugar |

---

### 3.7 Ideas de Administración y Operaciones

#### 3.7.1 Plataforma Web Administrativa
| Atributo | Valor |
|----------|-------|
| **Tipo** | Software |
| **Descripción** | Plataforma web exclusiva para administración del sistema |
| **Valor** | Control centralizado sin depender de la app móvil |

#### 3.7.2 Control de Clientes y Dispositivos
| Atributo | Valor |
|----------|-------|
| **Tipo** | Funcionalidad Admin |
| **Descripción** | Control centralizado de clientes y dispositivos (activos y por activar) |
| **Valor** | Visibilidad operativa completa del ecosistema |

#### 3.7.3 Acceso a Calibraciones y Datos Técnicos
| Atributo | Valor |
|----------|-------|
| **Tipo** | Funcionalidad Admin |
| **Descripción** | Acceso administrativo a calibraciones y datos técnicos por dispositivo |
| **Valor** | Soporte técnico y mantenimiento remoto |

#### 3.7.4 Reportes Automatizados
| Atributo | Valor |
|----------|-------|
| **Tipo** | Automatización |
| **Descripción** | Generación automatizada de reportes del servicio de 7 días |
| **Valor** | Estandarización y reducción de carga operativa |

#### 3.7.5 Automatización como Apoyo al Análisis
| Atributo | Valor |
|----------|-------|
| **Tipo** | Estrategia Operativa |
| **Descripción** | Automatización como apoyo al análisis técnico humano, no reemplazo |
| **Valor** | Equilibrio entre eficiencia y criterio profesional |

#### 3.7.6 Gestión de Pagos Diferenciada
| Atributo | Valor |
|----------|-------|
| **Tipo** | Modelo de Negocio |
| **Descripción** | Gestión de pagos diferenciada según tipo de producto (equipo vs servicio) |
| **Valor** | Claridad financiera y flexibilidad comercial |

#### 3.7.7 Confianza como Criterio de Pagos
| Atributo | Valor |
|----------|-------|
| **Tipo** | Estrategia UX |
| **Descripción** | Confianza del usuario como criterio clave en el diseño de pagos |
| **Valor** | Reduce fricción y aumenta conversión |

---

### 3.8 Ideas de Notificaciones y Configuraciones Eléctricas

#### 3.8.1 Notificaciones como Componente Crítico
| Atributo | Valor |
|----------|-------|
| **Tipo** | Funcionalidad Core |
| **Descripción** | Notificaciones como componente crítico del valor del servicio |
| **Valor** | Mantiene al usuario informado y justifica la suscripción |

#### 3.8.2 Comunicación Diaria del Consumo
| Atributo | Valor |
|----------|-------|
| **Tipo** | Estrategia de Engagement |
| **Descripción** | Comunicación diaria del consumo como hábito del usuario |
| **Valor** | Crea dependencia positiva y retención |

#### 3.8.3 Soporte Multi-Configuración
| Atributo | Valor |
|----------|-------|
| **Tipo** | Funcionalidad Técnica |
| **Descripción** | Ampliación del soporte a monofásico, bifásico y configuraciones con paneles solares |
| **Valor** | Mayor cobertura de tipos de instalación |

**Tipos de Instalación Soportados:**
| Tipo | Descripción | Precios |
|------|-------------|----------|
| **Monofásico** | Instalación residencial estándar | Base |
| **Bifásico** | Instalación con mayor capacidad | +20% (tentativo) |
| **Con paneles solares** | Incluye generación | +30% (tentativo) |

#### 3.8.4 Precios Diferenciados por Tipo de Servicio
| Atributo | Valor |
|----------|-------|
| **Tipo** | Modelo de Negocio |
| **Descripción** | Diferenciación de precios según tipo de servicio eléctrico |
| **Valor** | Monetización justa según complejidad |

#### 3.8.5 Sección Exclusiva para Paneles Solares
| Atributo | Valor |
|----------|-------|
| **Tipo** | Funcionalidad App |
| **Descripción** | Sección exclusiva en la app para usuarios con paneles solares |
| **Valor** | Experiencia personalizada para segmento específico |

**Funcionalidades Exclusivas para Paneles Solares:**
- Sección dedicada en la app
- Estimación de impacto en recibo CFE
- Balance generación vs consumo
- Alertas personalizadas para instalaciones solares
- Recomendaciones de aprovechamiento

#### 3.8.6 Estimación de Impacto Solar en CFE
| Atributo | Valor |
|----------|-------|
| **Tipo** | Funcionalidad App |
| **Descripción** | Estimación del impacto de los paneles solares en el recibo de CFE |
| **Valor** | Responde a pregunta clave del usuario solar |

#### 3.8.7 Alertas Personalizadas para Paneles Solares
| Atributo | Valor |
|----------|-------|
| **Tipo** | Funcionalidad App |
| **Descripción** | Alertas personalizadas para instalaciones con paneles solares |
| **Valor** | Monitoreo especializado de generación vs consumo |

---

### 3.9 Resumen de 37 Ideas Capturadas

| # | Idea | Tipo | Problema/Valor Central | Estado |
|---|------|------|------------------------|--------|
| 1 | Cuentatron (dispositivo) | Hardware | Medir consumo real vs facturado | Capturada |
| 2 | Diagnóstico extendido | Servicio | Superar límite de 1 hora | Capturada |
| 3 | Monitoreo 7 días | Servicio | Detectar patrones no visibles | Capturada |
| 4 | Reporte profesional | Entregable | Evidencia tangible para el cliente | Capturada |
| 5 | App de visualización | Software | Visibilidad en tiempo real | Capturada |
| 6 | Público local | Estrategia | Clientes Luz en tu Espacio | Capturada |
| 7 | Público nacional | Estrategia | Escala sin límite geográfico | Capturada |
| 8 | Monitoreo permanente | Producto | Relación continua con cliente | Capturada |
| 9 | Suscripción mensual | Modelo Negocio | Ingresos recurrentes | Capturada |
| 10 | Sistema de alertas | Funcionalidad | Valor continuo y proactivo | Capturada |
| 11 | Separación equipo-servicio | Estrategia | Flexibilidad comercial | Capturada |
| 12 | Operación sin suscripción | Estrategia | Reduce barrera de entrada | Capturada |
| 13 | MVP avanzado | Estrategia | Punto de partida sólido, no mínimo | Capturada |
| 14 | Activos previos (scripts/FW) | Recurso | Acelera desarrollo, reduce costos | Capturada |
| 15 | Expectativa multiplataforma | Requisito | Mayor alcance desde MVP | Capturada |
| 16 | Plataforma condicionada | Decisión | Flexibilidad ante barreras externas | Capturada |
| 17 | Enfoque DIY | Estrategia | Escala sin dependencia operativa | Capturada |
| 18 | Empaque como entrada | UX | Unboxing guiado al registro | Capturada |
| 19 | Registro QR diferenciado | UX | Onboarding personalizado | Capturada |
| 20 | App unificada | Arquitectura | Una app, dos experiencias | Capturada |
| 21 | 7 días sin suscripción | Servicio | Experiencia completa de prueba | Capturada |
| 22 | Transición a permanente | Conversión | Funnel integrado en experiencia | Capturada |
| 23 | App centro interpretativo | Funcionalidad | Todo el valor en un solo lugar | Capturada |
| 24 | Plataforma web admin | Software | Control centralizado del sistema | Capturada |
| 25 | Control clientes/dispositivos | Admin | Visibilidad operativa completa | Capturada |
| 26 | Calibraciones y datos técn. | Admin | Soporte técnico remoto | Capturada |
| 27 | Reportes automatizados | Automatización | Estandarización, menos carga operativa | Capturada |
| 28 | Automatización como apoyo | Operaciones | Equilibrio eficiencia vs criterio humano | Capturada |
| 29 | Pagos diferenciados | Modelo Negocio | Claridad financiera | Capturada |
| 30 | Confianza en pagos | UX | Reduce fricción, aumenta conversión | Capturada |
| 31 | Notificaciones críticas | Funcionalidad | Mantiene usuario informado | Capturada |
| 32 | Comunicación diaria consumo | Engagement | Crea hábito y retención | Capturada |
| 33 | Soporte multi-configuración | Técnico | Monofásico, bifásico, solar | Capturada |
| 34 | Precios diferenciados | Modelo Negocio | Monetización justa por complejidad | Capturada |
| 35 | Sección paneles solares | App | Experiencia personalizada solar | Capturada |
| 36 | Estimación impacto solar CFE | App | Responde pregunta clave usuario solar | Capturada |
| 37 | Alertas personalizadas solar | App | Monitoreo generación vs consumo | Capturada |

### 3.10 Evolución del Concepto

```
Fase 1: [Dispositivo aislado]
    ↓
Fase 2: [Sistema Producto-Servicio Local]
    ↓
Fase 3: [Modelo Dual: Local + Nacional con Suscripción]
    ↓
Fase 4: [MVP Avanzado + Multiplataforma]
    ↓
Fase 5: [UX Unificada + Flujo DIY + Transición]

                    ┌─────────────────────────────────┐
                    │         CUENTATRON              │
                    │   Empaque + QR + Firmware       │
                    └───────────────┬─────────────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
    ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
    │  MODELO LOCAL │       │  APP UNIFICADA│       │MODELO NACIONAL│
    │  (Servicio)   │       │ · Gráficas    │       │  (DIY)        │
    │  · 7 días     │       │ · Alertas     │       │ · Suscripción │
    │  · Reporte    │       │ · Equipos     │       │ · Permanente  │
    └───────────────┘       │ · Info CFE    │       └───────────────┘
                            └───────────────┘
                                    │
                            ┌───────▼───────┐
                            │ TRANSICIÓN   │
                            │ 7 días → Perm│
                            └───────────────┘
```

---

<!-- CONTINÚA EN SIGUIENTE BLOQUE: Secciones 4-6 -->

## 4. Contexto Técnico del Usuario

> [!NOTE]
> Esta sección documenta el contexto técnico del usuario responsable del desarrollo. Esta información es **CONTEXTO**, no decisiones. Sirve como referencia para fases posteriores del proyecto.

### 4.1 Perfil del Desarrollador

| Aspecto | Valor | Descripción |
|---------|-------|-------------|
| **Nivel técnico en desarrollo** | INTERMEDIO | Capacidad técnica para trabajar con herramientas de desarrollo asistido |
| **Rol en el desarrollo** | ORQUESTADOR DE IA | El usuario coordina y dirige el desarrollo mediante herramientas de IA, no programa directamente |
| **Experiencia en el dominio del problema** | AVANZADO | Conocimiento profundo del problema de consumo eléctrico, CFE, y el contexto mexicano |

### 4.2 Implicaciones para el Proyecto

> [!NOTE]
> Las siguientes observaciones son derivadas del contexto técnico documentado. No constituyen decisiones ni requerimientos.

| Observación | Implicación |
|-------------|-------------|
| Rol de orquestador | Las tecnologías seleccionadas podrían beneficiarse de buena documentación y soporte de herramientas de IA |
| Nivel intermedio | Tecnologías con curvas de aprendizaje moderadas podrían ser más adecuadas |
| Experiencia avanzada en dominio | Facilita la validación de requisitos funcionales y reglas de negocio |
| Recursos limitados (8 GB RAM local, $0 presupuesto) | Restringen las opciones de desarrollo local intensivo |
| VM AWS Ubuntu | Representa el entorno de producción disponible |

### 4.3 Decisiones CAME Aplicables al Contexto Técnico

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **A-01** | Afrontar | Aceptar presupuesto $0 sin margen. Contingencia: migrar datos a PostgreSQL en VM AWS si se exceden límites |
| **A-02** | Afrontar | Aceptar limitación de RAM local. Contingencia: ejecutar emulador Android en VM AWS; priorizar pruebas en dispositivo físico |
| **E-06** | Explotar | Usar Copilot/ChatGPT activamente durante desarrollo; documentar prompts efectivos |

*Origen: CAME*

---

## 5. Recursos Técnicos Disponibles

### 5.1 Infraestructura Disponible

| Recurso | Disponibilidad | Detalle |
|---------|----------------|---------|
| **Máquina virtual** | SÍ | AWS Ubuntu |
| **Tipo de servicios** | Gratuitos | Preferencia por servicios sin costo o tiers gratuitos |
| **Presupuesto disponible** | $0 MXN | Sin inversión monetaria directa para el MVP |
| **Infraestructura local** | PC Windows | 8 GB de RAM |

### 5.2 Restricciones Presupuestarias

| Aspecto | Restricción | Impacto |
|---------|-------------|---------|
| Presupuesto total | $0 MXN | Solo servicios con free tier o auto-hospedados |
| Costos de infraestructura | Ya cubiertos | VM AWS existente, sin costo adicional |
| Costos de publicación | Pendiente | Play Store (~$25 USD único) |
| Costos operativos recurrentes | Deben ser $0 | Tiers gratuitos de Supabase, FCM, etc. |

### 5.3 Dependencias Externas

| Dependencia | Estado | Responsable |
|-------------|--------|-------------|
| Diseños UI/UX | Sin bloqueo | Usuario (interno) |
| APIs de terceros | Sin bloqueo | Usuario (interno) |
| Play Store | Sin bloqueo | Usuario (interno) |
| Stripe | Sin bloqueo | Usuario (interno) |

> [!TIP]
> **Sin bloqueos externos.** El usuario controla todos los recursos necesarios.

### 5.4 Limitaciones Técnicas Identificadas

| Limitación | Impacto Potencial |
|------------|-------------------|
| RAM local limitada (8 GB) | Emuladores Android pueden ser lentos; compilaciones pesadas podrían requerir uso de VM |
| Presupuesto $0 | Descarta servicios de pago; limita a free tiers o soluciones auto-hospedadas |
| Sin experiencia directa en programación | Tecnologías con buena documentación y soporte de IA son preferibles |
| Solo Android en MVP | Simplifica la decisión; iOS no es factor de decisión inmediato |
| Código legacy en Python | La integración con scripts existentes podría requerir API intermedia |

---

## 6. Selección Tecnológica – Arquitectura Base

> [!IMPORTANT]
> **Decisión CAME C-01:** Se ha seleccionado **Opción A: React Native + Supabase (Expo Managed)** como arquitectura definitiva del proyecto.
> 
> Las Opciones B (Flutter + Firebase) y C (Kotlin + Python Self-Hosted) quedan **DESCARTADAS**.

### 6.1 Decisión Definitiva: React Native + Supabase (CAME C-01)

**Justificación:** Responde a R-04 (rol orquestador sin programación directa), R-14 (Dart menor soporte IA), R-13 (Kotlin muy complejo).

**Acción:** Descartar Opciones B y C. Iniciar desarrollo con React Native + Expo + Supabase.

### 6.2 Supuestos Considerados

#### Información del Plan Maestro Tomada en Cuenta

| Aspecto | Valor Considerado | Origen |
|---------|-------------------|--------|
| Rol del desarrollador | Orquestador de IA | Perfil del Desarrollador |
| Nivel técnico | Intermedio | Perfil del Desarrollador |
| Experiencia en dominio | Avanzado | Perfil del Desarrollador |
| Infraestructura de producción | AWS VM Ubuntu | Recursos Técnicos Disponibles |
| Presupuesto | $0 MXN | Recursos Técnicos Disponibles |
| Hardware local | PC Windows 8 GB RAM | Recursos Técnicos Disponibles |
| Preferencia de servicios | Gratuitos / Free tier | Recursos Técnicos Disponibles |
| Plataforma objetivo MVP | Android únicamente | Límites del MVP |
| Escala esperada | <100 dispositivos (año 1) | Proyección de Escala |
| Componentes existentes | InfluxDB, Mosquitto MQTT, Scripts Python | Arquitectura de Control de Acceso |

### 6.3 Tecnologías Definitivas

| Componente | Tecnología | Costo |
|------------|------------|-------|
| App móvil | React Native + Expo | Gratuito |
| UI Components | React Native Paper / NativeBase | Gratuito |
| Backend/Auth/DB | Supabase (free tier) | Gratuito hasta 500MB |
| Panel Admin | React + Vite | Gratuito |
| Hosting Panel | AWS VM existente | Sin costo adicional |
| Push notifications | Expo Push + FCM | Gratuito |

### 6.4 Arquitectura Técnica Definitiva

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DEFINITIVA: REACT NATIVE + SUPABASE     │
└─────────────────────────────────────────────────────────────────────────┘

   ESP32 ──MQTT──▶ Mosquitto ──▶ receptor_mqtt.py ──▶ InfluxDB
                                        │
                                        ▼
                                  Supabase DB
                                   (sync API)
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
             📱 App Android                          🖥️ Panel Admin
             (React Native)                          (React Web)
```

**Diagrama Completo de Arquitectura:**

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

### 6.5 Ventajas de la Arquitectura Seleccionada

- Expo permite desarrollo sin configurar Android Studio manualmente
- Un solo lenguaje (JavaScript/TypeScript) para app y panel admin
- Supabase ofrece autenticación, base de datos y realtime incluidos
- Excelente documentación y amplio soporte de herramientas de IA (Copilot, ChatGPT)
- OTA updates permiten actualizar sin pasar por Play Store
- Curva de aprendizaje moderada para orquestadores de IA

### 6.6 Riesgos Identificados con Mitigación (CAME)

| Riesgo | Mitigación CAME |
|--------|-----------------|
| Free tier de Supabase insuficiente | C-02: Configurar alertas al 70% del límite (350MB de 500MB). A-01: Migrar a PostgreSQL en VM si se excede |
| Dependencia de servicios externos | M-02: Mantener VM AWS como respaldo disponible |
| Integración con InfluxDB existente | M-01: Crear API puente ligera; no reescribir receptor_mqtt.py |

### 6.7 Monitoreo de Free Tier (CAME C-02)

> [!IMPORTANT]
> **Decisión CAME C-02:** Establecer monitoreo de límites de free tier.
> 
> **Acción:** Configurar alertas en Supabase al 70% del límite (350MB de 500MB).

### 6.8 Opciones Descartadas

#### ~~Opción B: Flutter + Firebase~~ (DESCARTADA)

**Razón de descarte (CAME):** R-14 (Dart menor soporte IA), curva de aprendizaje alta para orquestador.

#### ~~Opción C: Kotlin Nativo + Backend Python~~ (DESCARTADA)

**Razón de descarte (CAME):** R-13 (Kotlin muy complejo), R-04 (rol orquestador sin programación directa), nivel de complejidad muy alto (5/5).

---

<!-- CONTINÚA EN SIGUIENTE BLOQUE: Secciones 7-9 -->

## 7. Plan Maestro Integrado

### 7.1 Definición del Problema (Dolor)

#### El Problema Central

| Elemento | Descripción |
|----------|-------------|
| **Dolor principal** | El usuario recibe un recibo de CFE más alto de lo esperado y **no sabe por qué** |
| **Momento del dolor** | REACTIVO — Cuando ya llegó el recibo alto (demasiado tarde) |
| **Competencia directa** | NINGUNA app en el mercado mexicano |

#### Síntomas Percibidos por el Usuario

1. Sospecha de **robo de luz** por vecinos
2. Sospecha de **fugas eléctricas** en la instalación
3. **Electrodomésticos defectuosos** (refrigerador, bomba de agua)
4. **Paneles solares que no rinden** lo prometido
5. Técnicos instaladores de paneles que desaparecieron

#### Lo que el Usuario Hace HOY (Sin Cuentatron)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROCESO ACTUAL DEL USUARIO                           │
└─────────────────────────────────────────────────────────────────────────┘

     RECIBO ALTO
         │
         ▼
    ┌──────────┐
    │ Reclama  │──────▶ CFE los ignora (no es problema de CFE)
    │  a CFE   │
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │  Llama   │──────▶ Detecta fuga en 1 hora (90% de casos)
    │electricis│
    └────┬─────┘
         │
         ▼ (10% de casos no resueltos)
    ┌──────────┐
    │  Queda   │──────▶ Sin solución, problema persiste
    │  sin     │
    │respuesta │
    └──────────┘

>>> AQUÍ ENTRA CUENTATRON <<<
```

#### Resultado Esperado por el Usuario

| Resultado | Plazo | Detalle |
|-----------|-------|---------|
| Identificar la causa del consumo excesivo | **7 días** de monitoreo | Datos analizados por ingeniero o por la app |
| Decisión informada | Post-análisis | Cambiar refrigerador, reparar bomba, ajustar hábitos |
| Recibo de luz más bajo | Siguiente periodo de facturación | Validación tangible del valor |

---

### 7.2 Segmentos de Usuario Priorizados

#### Ordenamiento por Volumen Esperado

| Prioridad | Segmento | Descripción | Modelo de Ingreso | Volumen Esperado |
|-----------|----------|-------------|-------------------|------------------|
| **1º** | Referido por electricista | TESIVIL instala Cuentatron por 7 días, entrega reporte, retira dispositivo | **Servicio temporal** (50% del precio del dispositivo) | ALTO (nosotros lo referimos) |
| **2º** | Usuario reactivo | Recibió recibo alto, no hay alcance de visita, compra dispositivo online | **Compra + Suscripción** | MEDIO |
| **3º** | Usuario con paneles solares | Validar si generan bien, detectar degradación, técnicos desaparecieron | **Compra + Suscripción** | MEDIO |
| **4º** | Usuario preventivo | Quiere evitar sorpresas, monitoreo proactivo | **Compra + Suscripción** | BAJO (nadie previene) |

#### Características del Segmento Primario (Referido por Electricista)

```
┌─────────────────────────────────────────────────────────────────────────┐
│             SEGMENTO 1: REFERIDO POR ELECTRICISTA                       │
└─────────────────────────────────────────────────────────────────────────┘

  Origen: Cliente de Luz en tu Espacio
  Motivo: Electricista no pudo resolver en visita de 1 hora
  Expectativa: Diagnóstico profesional en 7 días
  
  ┌──────────────────────────────────────────────────────────────────────┐
  │  FLUJO:                                                               │
  │                                                                       │
  │  Electricista → Instala dispositivo → Monitoreo 7 días →             │
  │  → Ingeniero analiza → PDF con diagnóstico → Retira dispositivo      │
  │                                                                       │
  │  UPSELL: Si le gustó el servicio → Compra dispositivo + suscripción  │
  └──────────────────────────────────────────────────────────────────────┘
```

---

### 7.3 Modelo de Negocio Dual

#### Vista General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MODELO DE NEGOCIO CUENTATRON                          │
└─────────────────────────────────────────────────────────────────────────┘

         ┌────────────────────────────────────────────────────┐
         │         MODELO A: SERVICIO DE 7 DÍAS               │
         │  ─────────────────────────────────────────────────  │
         │  · Dispositivo PRESTADO por TESIVIL                │
         │  · Monitoreo de 7 días                             │
         │  · Reporte ANALIZADO POR INGENIERO (PDF)           │
         │  · Se RETIRA el dispositivo al final               │
         │  · Precio: 50% del costo del dispositivo           │
         └───────────────────────┬────────────────────────────┘
                                 │
                     ¿Le gustó el servicio?
                                 │
              ┌──────────────────┴──────────────────┐
              ▼                                     ▼
       [NO → Fin]                            [SÍ → Upsell]
                                                    │
                                                    ▼
         ┌────────────────────────────────────────────────────┐
         │         MODELO B: COMPRA + SUSCRIPCIÓN             │
         │  ─────────────────────────────────────────────────  │
         │  · COMPRA dispositivo (pago único)                 │
         │  · Suscripción mensual                             │
         │  · Dashboard, alertas, gráficas, predicciones      │
         │  · SIN reporte de ingeniero                        │
         └────────────────────────────────────────────────────┘
```

#### Comparación Detallada

| Característica | Servicio 7 días | Compra + Suscripción |
|----------------|-----------------|----------------------|
| Dispositivo | Prestado por TESIVIL | Propiedad del cliente |
| Duración | 7 días | Indefinido |
| Reporte de ingeniero | ✅ PDF con análisis profesional | ❌ No incluido |
| Dashboard en app | ✅ Acceso durante 7 días | ✅ Acceso permanente |
| Alertas | ✅ Durante 7 días | ✅ Siempre (según suscripción) |
| Gráficas | ✅ Durante 7 días | ✅ Siempre |
| Predicción de recibo | ✅ | ✅ |
| Precio | 50% del precio del dispositivo | 100% dispositivo + suscripción mensual |

#### Arquitectura de Control de Acceso

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CONTROL DE ACCESO POR SUSCRIPCIÓN                    │
└─────────────────────────────────────────────────────────────────────────┘

          DISPOSITIVO ESP32
               │
               │ MQTT
               ▼
        ┌─────────────┐
        │ receptor_   │──── ¿Suscripción activa? ────┐
        │ mqtt.py     │                              │
        └─────────────┘                              │
               │                                     │
        ┌──────┴──────┐                       ┌──────┴──────┐
        │  SÍ ACTIVA  │                       │  NO ACTIVA  │
        └──────┬──────┘                       └──────┬──────┘
               │                                     │
               ▼                                     ▼
        ┌─────────────┐                       ┌─────────────┐
        │  InfluxDB   │                       │  BLOQUEAR   │
        │  (datos ok) │                       │  (sin datos)│
        └─────────────┘                       └─────────────┘
               │
               ▼
        ┌─────────────┐
        │  APP MÓVIL  │
        │  (dashboard)│
        └─────────────┘

> [!NOTE]
> El control se hace a nivel de receptor MQTT. Si no hay suscripción activa,
> el flujo de datos hacia InfluxDB se bloquea/congela.
```

---

### 7.4 Actores y Responsabilidades

#### Roles del Sistema (Simplificado)

| Rol | Interfaz | Responsabilidades |
|-----|----------|-------------------|
| **Cliente Final** | App móvil Android | Registro, vincular dispositivo (QR), ver dashboard, alertas, gráficas, descargar PDF, gestionar suscripción |
| **Administrador** | Panel Admin (web) | Calibración de dispositivos, inventario, alta de dispositivos, análisis de datos, editar y generar PDF, activar/desactivar MQTT |

#### Aclaración sobre el Técnico Instalador

| Elemento | Decisión |
|----------|----------|
| Rol separado | ❌ NO necesario |
| Interfaz especial | ❌ NO necesaria |
| Función real | Ayuda al cliente a darse de alta en la app y escanear QR |
| Acceso al sistema | Ninguno especial |

#### Funciones del Panel Admin

| Módulo | Funciones |
|--------|-----------|
| **Inventario** | Alta de dispositivos nuevos, asignar serial/QR, estado (disponible/asignado/retirado) |
| **Calibración** | Configurar factor de calibración por dispositivo |
| **Usuarios** | Ver clientes, estado de suscripción, historial |
| **Análisis** | Ver datos crudos de InfluxDB, gráficas, anomalías detectadas (EWMA) |
| **Reportes** | Editar observaciones de ingeniero, generar PDF |
| **Control MQTT** | Activar/congelar flujo de datos por dispositivo |

---

### 7.5 Flujos Críticos del Servicio

#### Ciclo de Vida del Servicio de 7 Días

```
┌─────────────────────────────────────────────────────────────────────────┐
│               CICLO DE VIDA - SERVICIO 7 DÍAS                           │
└─────────────────────────────────────────────────────────────────────────┘

  DÍA 0                                              DÍA 7
    │                                                  │
    ▼                                                  ▼
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Técnico │────▶│ Cliente │────▶│ Datos   │────▶│  Admin  │────▶│ MQTT se │
│ instala │     │ escanea │     │ fluyen  │     │ genera  │     │ congela │
│ device  │     │   QR    │     │ 7 días  │     │   PDF   │     │         │
└─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │                                │
                     │         AUTOMÁTICO             │
                     └────────────────────────────────┘
                         Servicio activo 7 días

                               POST-PDF
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
             ┌───────────┐               ┌───────────┐
             │ NO COMPRA │               │ SÍ COMPRA │
             │           │               │           │
             │ · Datos   │               │ · Activa  │
             │   conge-  │               │   suscrip │
             │   lados   │               │ · Datos   │
             │ · PDF     │               │   fluyen  │
             │   visible │               │ · Sin PDF │
             └───────────┘               └───────────┘
```

#### Flujo del Happy Path del Usuario

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

### 7.6 Estructura de la Aplicación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      📱 APP MÓVIL ANDROID                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │  Dashboard  │ │   Alertas   │ │   Cuenta    │ │  Reportes   │        │
│  │   Consumo   │ │    Push     │ │   Usuario   │ │    PDF      │        │
│  │             │ │             │ │             │ │             │        │
│  │ · kWh actual│ │ · Anomalías │ │ · Perfil    │ │ · Historial │        │
│  │ · Gráficas  │ │ · Picos     │ │ · Suscripción│ │ · Descargar│        │
│  │ · Predicción│ │ · Fugas     │ │ · Dispositivo│ │            │        │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    ESTADO DEL USUARIO                             │   │
│  │  · Servicio 7 días (temporal)  →  "Tu reporte estará listo en X" │   │
│  │  · Suscripción activa          →  Dashboard completo              │   │
│  │  · Sin suscripción             →  Datos congelados                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Decisiones Clave de Arquitectura Confirmadas

| Decisión | Detalle |
|----------|---------|
| **Una sola app** | Misma app para servicio 7 días y suscripción permanente |
| **Control de acceso** | Vía receptor MQTT: si no hay suscripción activa, se bloquea InfluxDB |
| **Modo temporal** | El servicio de 7 días es un "estado" del usuario, no una app diferente |
| **Reporte PDF** | Generado automáticamente, revisado/editado por ingeniero desde panel admin |
| **Acceso al reporte** | PDF descargable y visible en la app (historial) |
| **Actualización de datos** | Cada ~30 minutos (ventana configurable para optimizar recursos) |
| **Stack tecnológico** | React Native + Expo + Supabase (CAME C-01) |

---

### 7.7 Sistema de Alertas y Notificaciones

| Tipo | Frecuencia | Valor |
|------|------------|-------|
| Consumo diario | Diaria | Crea hábito de monitoreo |
| Alertas de pico | Inmediata | Previene sorpresas en recibo |
| Resumen semanal | Semanal | Visión general de patrones |
| Alertas solares | Según evento | Monitoreo de generación |

---

### 7.8 Inventario de Activos Técnicos (Legacy)

> [!NOTE]
> Esta sección documenta el análisis de código existente realizado sobre los archivos en `legacy_source/`. Los resúmenes técnicos detallados están en `docs_analysis/modules/`.

#### Listado de Módulos Analizados

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| alerta_diaria.md | ✅ Producción | Alertas diarias de consumo CFE vía WhatsApp/Telegram |
| receptor_mqtt.md | ✅ Producción | Puente MQTT→InfluxDB con lógica de suscripción |
| vigilante_calidad.md | ✅ Producción | Detección de anomalías (voltaje, fugas, consumo fantasma) |
| sketch_esp32_lete.md | ✅ Producción | Firmware ESP32 dual-core (v15.7) |
| cuentatron_app_server.md | ✅ Producción | Backend Node.js (Stripe, Telegram, Gemini AI) |
| cuentatron_web.md | ✅ Producción | Landing page Next.js |
| cuentatron_diagnostico.md | ✅ Producción | Portal de diagnóstico (servicio local) |
| cuentatron_app_public.md | ✅ Producción | Dashboard cliente HTML |
| servidor.md | ⚠️ Obsoleto | Servidor Flask MVP (reemplazado por receptor_mqtt) |

---

### 7.9 Bloques Reutilizables para MVP

#### Listos para Integración Directa (Sin Cambios)

| Bloque | Origen | Valor |
|--------|--------|-------|
| **Tarifas CFE escalonadas** | `alerta_diaria.py` / `server.js` | Cálculo preciso de costos con IVA |
| **Detección EWMA de anomalías** | `vigilante_calidad.py` | Algoritmo de aprendizaje automático básico |
| **Batching MQTT→InfluxDB** | `receptor_mqtt.py` | Pipeline de datos robusto |
| **Firmware dual-core ESP32** | `sketch_esp32_lete.ino` | Hardware probado en producción |
| **Bot Telegram + Gemini** | `server.js` | Asistente de IA funcional |
| **Componentes landing (Next.js)** | `cuentatron_web/` | UI reutilizable (Hero, Pricing, FAQ) |

#### Requieren Adaptación Menor

| Bloque | Cambio Necesario |
|--------|------------------|
| Templates de email (Resend) | Personalizar para nueva marca |
| Webhooks Stripe | Ajustar metadata para nuevo modelo |
| Sistema de vinculación Telegram | Reutilizable con cambio de bot token |

---

### 7.10 Deuda Técnica Identificada

#### Deuda Crítica (Resolver antes de MVP)

| Área | Problema | Impacto | Esfuerzo |
|------|----------|---------|----------|
| Dashboard HTML | JavaScript inline, sin framework | Difícil de mantener | Alto |
| `servidor.py` | Código obsoleto en repositorio | Confusión | Bajo (eliminar) |
| Calibración ESP32 | Valores hardcoded en firmware | Cada dispositivo requiere flash individual | Medio |

#### Deuda Tolerable (Post-MVP)

| Área | Problema | Recomendación |
|------|----------|---------------|
| server.js (2200 líneas) | Archivo monolítico | Refactorizar en módulos |
| Templates Twilio | Múltiples templates sin documentar | Crear mapa de templates |
| Logs de Python | Sin sistema centralizado | Implementar logging a CloudWatch o similar |

#### Deuda Asumida (Decisión consciente)

| Área | Justificación |
|------|---------------|
| No tests automatizados | MVP rápido, validación manual |
| HTML estático vs SPA | Funciona, priorizar funcionalidades |
| Gemini hardcoded | Sin abstracción para cambio de modelo |

---

### 7.11 Proyección de Escala

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PROYECCIÓN DE DISPOSITIVOS ACTIVOS                    │
└─────────────────────────────────────────────────────────────────────────┘

     Dispositivos
          │
      100+│                                            ┌─────────
          │                                       ╱    │  Año 6+
       50 │                              ┌───────      │
          │                         ╱    │  Años 3-4   │
        5 │        ┌────────────────     │             │
          │   ╱    │  Año 1              │             │
          │────────┴──────────────────────────────────────────────▶ Tiempo
              MVP      Crecimiento     Madurez

> [!IMPORTANT]
> Nunca se esperan MILES de dispositivos. Esto simplifica las decisiones
> de infraestructura (no se requiere autoescalado agresivo).
```

#### Implicaciones de Escala para Arquitectura

| Factor | Impacto | Decisión |
|--------|---------|----------|
| **Infraestructura** | No necesita autoescalado | AWS VM actual es suficiente |
| **Base de datos** | No necesita sharding | Supabase/PostgreSQL simple |
| **InfluxDB** | Retención estándar | No necesita optimización agresiva |
| **MQTT** | Broker simple | Mosquitto actual es suficiente |
| **Complejidad** | Baja | Evitar sobre-ingeniería |

---

## 8. Riesgos y Oportunidades (ISO 9001:2015)

> [!NOTE]
> Este análisis se realizó bajo el enfoque normativo ISO 9001:2015 – Punto 6.1. Fuente: `05_PLAN_MAESTRO_CONSOLIDADO.md` versión 2.2.

### 8.1 Lista de Riesgos Identificados (20)

| # | Riesgo | Descripción | Origen en Documento |
|---|--------|-------------|---------------------|
| R-01 | Presupuesto de $0 MXN sin margen de contingencia | No existe margen para costos imprevistos, servicios de emergencia o excesos de límites en tiers gratuitos | Recursos Técnicos Disponibles |
| R-02 | Limitación de RAM en hardware local | La PC local con 8 GB de RAM podría ser insuficiente para emuladores Android o compilación intensiva | Recursos Técnicos Disponibles |
| R-03 | Dependencia de tiers gratuitos de servicios externos | Las opciones de arquitectura dependen de tiers gratuitos con límites específicos (500MB Supabase, 1GB Firestore) | Opciones de Arquitectura Base |
| R-04 | Rol de orquestador sin experiencia directa en programación | El usuario actúa como orquestador de IA, no programa directamente. Dificultades en debugging avanzado | Perfil del Desarrollador |
| R-05 | Ausencia de fecha límite dura definida | No existe una fecha límite dura para el MVP. Podría resultar en extensión indefinida del desarrollo | Timeline |
| R-06 | Integración con código legacy en Python | Los scripts existentes están en Python. Se requiere crear API puente adicional | Limitaciones Técnicas |
| R-07 | Momento reactivo del dolor del usuario | El usuario experimenta el problema cuando ya recibió el recibo alto. Ciclo de adquisición dependiente de eventos externos | El Problema Central |
| R-08 | Dependencia de un solo canal de adquisición prioritario | El segmento de mayor volumen depende exclusivamente de referidos por electricistas de TESIVIL | Segmentos de Usuario |
| R-09 | Ausencia de rol técnico dedicado para soporte | No hay disponibilidad de soporte técnico externo documentada | Información Adicional Requerida |
| R-10 | Control de suscripción a nivel de receptor MQTT | Una falla en receptor_mqtt.py afectaría tanto a usuarios activos como inactivos | Arquitectura de Control de Acceso |
| R-11 | Único punto de infraestructura de producción | La VM AWS Ubuntu es la única infraestructura de producción disponible. Sin redundancia documentada | Recursos Técnicos Disponibles |
| R-12 | Exclusión de iOS en MVP sin plan de migración documentado | iOS está excluido del MVP y pospuesto para V2. No se documenta estrategia de futura expansión | Alcance Confirmado |
| R-13 | Complejidad técnica de Opción C (Kotlin + Python) | La Opción C presenta nivel de complejidad "Muy Alto" (5/5) con múltiples riesgos de probabilidad "Alta" | Opción C de Arquitectura (DESCARTADA) |
| R-14 | Dart como lenguaje menos común en Opción B | Flutter + Firebase utiliza Dart, un lenguaje con menor soporte de herramientas de IA | Opción B de Arquitectura (DESCARTADA) |
| R-15 | Timeline base de 6-8 semanas sin desglose detallado | No incluye cronograma detallado con hitos específicos, entregables parciales, o puntos de control | Timeline |
| R-16 | Dependencia de validación con al menos 1 cliente para éxito | El criterio de éxito requiere "Al menos 1 cliente atendido". Sin cliente disponible, no se cumple | Criterios de Éxito del MVP |
| R-17 | Expectativa de resultado en 7 días de monitoreo | El usuario espera identificar la causa en exactamente 7 días. Si el problema requiere más tiempo, diagnóstico incompleto | Resultado Esperado por el Usuario |
| R-18 | Proceso de generación de PDF con intervención manual | El flujo requiere que un ingeniero revise datos y genere el documento manualmente | Flujo del Panel Admin |
| R-19 | Algoritmo EWMA como único método de detección de anomalías | La detección se basa únicamente en EWMA. Podría no detectar todos los tipos de anomalías | Flujo del Panel Admin |
| R-20 | Frecuencia de actualización de datos cada ~30 minutos | Podría no capturar eventos de consumo de corta duración o picos transitorios | Decisiones Clave Confirmadas |

---

### 8.2 Lista de Oportunidades Identificadas (20)

| # | Oportunidad | Descripción | Origen en Documento |
|---|-------------|-------------|---------------------|
| O-01 | Ausencia de competencia directa en el mercado mexicano | No existe ninguna app competidora directa en el mercado mexicano | El Problema Central |
| O-02 | Experiencia avanzada del usuario en el dominio del problema | Conocimiento profundo del problema de consumo eléctrico, CFE, y contexto mexicano | Perfil del Desarrollador |
| O-03 | Canal de adquisición controlado internamente | El segmento prioritario es manejado directamente por TESIVIL, control sobre calidad y volumen de leads | Segmentos de Usuario |
| O-04 | Código y scripts funcionales existentes | El proyecto cuenta con código avanzado y scripts funcionando (receptor_mqtt.py, InfluxDB, Mosquitto) | Alcance Confirmado |
| O-05 | Infraestructura de producción disponible sin costo adicional | La VM AWS Ubuntu existente puede servir como entorno de producción sin costos adicionales | Implicaciones de Escala |
| O-06 | Modelo de negocio dual con conversión interna | El modelo permite conversión de clientes del servicio de 7 días hacia compra + suscripción (upsell) | Modelo de Negocio Dual |
| O-07 | Sin bloqueos externos para iniciar desarrollo | El usuario controla todos los recursos necesarios. No existen dependencias externas bloqueantes | Dependencias Externas |
| O-08 | Escala limitada simplifica arquitectura | Proyección de menos de 100 dispositivos en año 1 y nunca miles permite evitar sobre-ingeniería | Proyección de Escala |
| O-09 | Una sola app para ambos modelos de negocio | La decisión de una única aplicación reduce esfuerzo de desarrollo y mantenimiento | Decisiones Clave Confirmadas |
| O-10 | OTA updates disponibles en arquitectura seleccionada | React Native + Expo permite actualizaciones Over-the-Air sin pasar por Play Store | Opción A de Arquitectura |
| O-11 | Excelente soporte de herramientas de IA en arquitectura seleccionada | JavaScript/TypeScript cuenta con soporte excelente de Copilot, ChatGPT, alineándose con rol de orquestador | Opción A de Arquitectura |
| O-12 | Múltiples síntomas percibidos como puntos de entrada | 5 síntomas documentados pueden servir como diferentes puntos de entrada de marketing | Síntomas Percibidos por el Usuario |
| O-13 | Segmento de usuarios con paneles solares | Segmento específico que necesita validar rendimiento y detectar degradación | Segmentos de Usuario |
| O-14 | Escalabilidad futura a iOS con arquitectura seleccionada | React Native permite reutilizar el mismo código base para futura expansión a iOS | Tabla Comparativa |
| O-15 | Flujo de servicio estructurado y documentado | El ciclo de vida del servicio de 7 días está claramente documentado con pasos definidos | Ciclo de Vida del Servicio |
| O-16 | Optimización esperada con asistencia de IA | La asistencia de IA puede reducir significativamente el timeline base de desarrollo | Timeline |
| O-17 | Panel Admin delegable a otros usuarios | El panel está diseñado para ser amigable y delegable a otros usuarios (ingenieros) | Alcance Confirmado |
| O-18 | Rol del técnico instalador simplificado | El técnico no requiere interfaz especial ni acceso al sistema. Simplifica el flujo | Aclaración sobre el Técnico Instalador |
| O-19 | Control de acceso centralizado y simple | El mecanismo de control está centralizado en un único punto (receptor MQTT) | Arquitectura de Control de Acceso |
| O-20 | Proceso actual del usuario claramente identificado | El flujo actual del usuario sin Cuentatron está documentado, incluyendo puntos de falla | Lo que el Usuario Hace HOY |

---

## 9. Decisiones Estratégicas CAME

> [!IMPORTANT]
> Las decisiones CAME (Corregir, Afrontar, Mantener, Explotar) son autoritativas para la ejecución del proyecto. Se derivan del análisis de riesgos y oportunidades.

### 9.1 CORREGIR (Debilidades que deben eliminarse)

| # | Decisión | Responde a | Acción Concreta |
|---|----------|------------|-----------------|
| C-01 | **Seleccionar Opción A (React Native + Supabase)** | R-04 (rol orquestador sin programación directa), R-14 (Dart menor soporte IA), R-13 (Kotlin muy complejo) | Descartar Opciones B y C. Iniciar desarrollo con React Native + Expo + Supabase |
| C-02 | **Establecer monitoreo de límites de free tier** | R-03 (dependencia de tiers gratuitos) | Configurar alertas en Supabase al 70% del límite (350MB de 500MB) |
| C-03 | **Crear cronograma con hitos parciales** | R-15 (timeline sin desglose) | Definir 4 hitos: Setup (S1-2), App básica (S3-4), Panel Admin (S5-6), QA (S7-8) |
| C-04 | **Documentar procedimiento de respaldo de VM** | R-11 (único punto de infraestructura) | Crear script de backup semanal de VM AWS + exportación de InfluxDB |
| C-05 | **Definir mecanismo de diagnóstico fallback** | R-17 (expectativa 7 días fija), R-19 (EWMA único método) | Si a día 5 no hay anomalías claras, notificar al ingeniero para revisión manual anticipada |

---

### 9.2 AFRONTAR (Amenazas que deben aceptarse con plan de contingencia)

| # | Decisión | Responde a | Plan de Contingencia |
|---|----------|------------|---------------------|
| A-01 | **Aceptar presupuesto $0 sin margen** | R-01 (presupuesto $0) | Si se exceden límites: migrar datos a PostgreSQL en VM AWS (ya disponible) |
| A-02 | **Aceptar limitación de RAM local** | R-02 (8GB RAM) | Ejecutar emulador Android en VM AWS si local es lento; priorizar pruebas en dispositivo físico |
| A-03 | **Aceptar timeline flexible** | R-05 (sin fecha límite) | Revisar progreso cada 2 semanas; ajustar alcance si hay drift significativo |
| A-04 | **Aceptar momento reactivo del dolor** | R-07 (cliente llega cuando ya tiene problema) | No es corregible; es la naturaleza del mercado. Estrategia de marketing post-recibo CFE |
| A-05 | **Aceptar dependencia de canal de referidos** | R-08 (canal único prioritario) | Preparar materiales para segmentos 2 y 3 desde el inicio; no depender 100% de seg. 1 |
| A-06 | **Aceptar intervención manual en PDF** | R-18 (ingeniero revisa y genera) | Es parte del valor agregado del servicio de 7 días; no automatizar en MVP |
| A-07 | **Aceptar frecuencia de 30 minutos** | R-20 (puede perder picos cortos) | Documentar limitación al cliente; para diagnósticos críticos, reducir ventana temporalmente |
| A-08 | **Aceptar necesidad de cliente piloto** | R-16 (requiere 1 cliente para validar) | Usar dispositivo en domicilio propio o de conocido para validación interna |

---

### 9.3 MANTENER (Fortalezas que deben preservarse)

| # | Decisión | Responde a | Cómo Mantener |
|---|----------|------------|---------------|
| M-01 | **Mantener código legacy Python funcional** | O-04 (scripts funcionando) | No reescribir receptor_mqtt.py; crear API puente ligera entre scripts e interfaz |
| M-02 | **Mantener infraestructura AWS existente** | O-05 (VM sin costo), O-07 (sin bloqueos) | Usar VM actual; no migrar a servicios nuevos innecesariamente |
| M-03 | **Mantener arquitectura simple** | O-08 (escala <100 dispositivos) | Resistir tentación de sobre-ingeniería; rechazar features que agreguen complejidad innecesaria |
| M-04 | **Mantener una sola app** | O-09 (misma app ambos modelos) | No crear apps separadas para servicio 7 días vs suscripción |
| M-05 | **Mantener flujo de servicio documentado** | O-15 (ciclo 7 días claro) | Usar flujo documentado como guía de implementación; no improvisar |
| M-06 | **Mantener control centralizado MQTT** | O-19 (punto único de control) | No distribuir lógica de acceso; receptor_mqtt.py sigue siendo el gatekeeper |
| M-07 | **Mantener rol simplificado del técnico** | O-18 (sin interfaz especial) | El técnico solo ayuda al cliente; no crear módulo de técnico en MVP |

---

### 9.4 EXPLOTAR (Oportunidades que deben aprovecharse activamente)

| # | Decisión | Responde a | Cómo Explotar |
|---|----------|------------|---------------|
| E-01 | **Explotar ausencia de competencia** | O-01 (ninguna app en México) | Posicionar como "única solución" en comunicación; no apresurar por competidores fantasma |
| E-02 | **Explotar conocimiento de dominio** | O-02 (experiencia avanzada) | Validar todas las reglas de negocio internamente antes de desarrollar; reducir iteraciones |
| E-03 | **Explotar canal de referidos controlado** | O-03 (TESIVIL refiere) | Preparar material de capacitación para electricistas desde el inicio |
| E-04 | **Explotar modelo de upsell** | O-06 (conversión interna) | Diseñar UX que invite a la compra al final del servicio de 7 días (CTA claro en reporte) |
| E-05 | **Explotar OTA updates** | O-10 (actualizaciones sin Play Store) | Planificar releases frecuentes post-lanzamiento; no esperar a versiones "perfectas" |
| E-06 | **Explotar soporte de IA** | O-11 (excelente para JS/TS), O-16 (optimización con IA) | Usar Copilot/ChatGPT activamente durante desarrollo; documentar prompts efectivos |
| E-07 | **Explotar múltiples síntomas** | O-12 (5 puntos de entrada) | Crear variantes de copy de marketing para cada síntoma (robo, paneles, fugas, etc.) |
| E-08 | **Explotar escalabilidad futura iOS** | O-14 (React Native reutilizable) | Escribir código pensando en iOS desde el inicio; evitar dependencias Android-only |
| E-09 | **Explotar panel delegable** | O-17 (ingenieros pueden usar panel) | Diseñar UX del panel para usuarios no técnicos; incluir tooltips y guías |
| E-10 | **Explotar gap del proceso actual** | O-20 (10% sin solución) | Posicionar Cuentatron exactamente en ese 10%; mensaje: "donde el electricista no puede" |

---

### 9.5 Resumen Ejecutivo CAME

| Tipo CAME | Cantidad | Enfoque |
|-----------|----------|---------|
| **Corregir** | 5 | Eliminar debilidades críticas que bloquean el MVP |
| **Afrontar** | 8 | Aceptar riesgos inherentes con planes de contingencia |
| **Mantener** | 7 | Preservar fortalezas existentes del proyecto |
| **Explotar** | 10 | Capitalizar oportunidades de mercado y técnicas |

**Decisión más crítica:** `C-01` — Selección de React Native + Supabase como stack tecnológico.

---

<!-- CONTINÚA EN SIGUIENTE BLOQUE: Secciones 10-12 -->

## 10. Implicaciones para la Ejecución

### 10.1 Timeline con Hitos (CAME C-03)

> [!IMPORTANT]
> **Decisión CAME C-03:** Cronograma de 6-8 semanas con 4 hitos definidos.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ROADMAP DE IMPLEMENTACIÓN MVP                         │
└─────────────────────────────────────────────────────────────────────────┘

  SEMANA 1-2          SEMANA 3-4          SEMANA 5-6          SEMANA 7-8
  ──────────          ──────────          ──────────          ──────────
      │                   │                   │                   │
      ▼                   ▼                   ▼                   ▼
┌───────────┐       ┌───────────┐       ┌───────────┐       ┌───────────┐
│   HITO 1  │       │   HITO 2  │       │   HITO 3  │       │   HITO 4  │
│  SETUP    │──────▶│  CORE APP │──────▶│  FEATURES │──────▶│  QA +     │
│           │       │           │       │ COMPLETAS │       │ LANZAM.   │
└───────────┘       └───────────┘       └───────────┘       └───────────┘
```

### 10.2 Detalle de Hitos

| Hito | Semanas | Entregables |
|------|---------|-------------|
| **HITO 1: Fundación** | S1-2 | Repo configurado, Supabase + FCM setup, Auth básico, "Hello World" en device |
| **HITO 2: Core App** | S3-4 | Dashboard funcional, Conexión InfluxDB, Gráficas básicas, Push notifications |
| **HITO 3: Features Completas** | S5-6 | Panel Admin funcional, Gestión de suscripciones, Alertas EWMA, PDF de reportes |
| **HITO 4: QA y Lanzamiento** | S7-8 | Testing completo, Bug fixes, Publicación Play Store, Cliente piloto |

### 10.3 Criterios de Éxito del MVP

| Métrica | Objetivo a 60 días |
|---------|-------------------|
| **Descargas** | >50 |
| **Usuarios activos** | >10 |
| **Dispositivos conectados** | >5 |
| **Suscripciones activas** | >3 |
| **Rating Play Store** | >4.0 |
| **Notificaciones entregadas** | 100% |
| **Cliente piloto atendido** | Al menos 1 |

### 10.4 Señales para V2

| Señal | Acción |
|-------|--------|
| >50 usuarios activos | Evaluar iOS |
| Free tier >70% | Migrar a PostgreSQL VM |
| >10 solicitudes de paneles solares | Priorizar módulo solar |
| Rating <3.5 | Pausar features, priorizar UX |

---

### 10.5 Próximos Pasos Inmediatos

1. **~~Selección de stack tecnológico~~** — ✅ React Native + Expo + Supabase (CAME C-01)
2. **Diseño de base de datos** — Schema Supabase para usuarios, dispositivos, suscripciones
3. **Diseño de wireframes** — Pantallas principales de la app
4. **Prototipo de panel admin** — Interfaz web funcional
5. **Integración con código legacy** — API puente ligera (CAME M-01)
6. **Configurar monitoreo de free tier** — Alertas Supabase al 70% (CAME C-02)
7. **Crear script de respaldo** — Backup semanal VM + InfluxDB (CAME C-04)

### 10.6 Decisiones CAME para Explotación Activa

| Decisión | Acción Inmediata |
|----------|------------------|
| **E-02** | Validar todas las reglas de negocio internamente antes de desarrollar |
| **E-05** | Planificar releases frecuentes post-lanzamiento via OTA updates |
| **E-06** | Usar Copilot/ChatGPT activamente; documentar prompts efectivos |
| **E-08** | Escribir código pensando en iOS desde el inicio |

---

## 11. Límites y Exclusiones del Proyecto

### 11.1 Alcance Confirmado del MVP

| Elemento | Incluido | Justificación |
|----------|----------|---------------|
| App móvil Android | ✅ | Core del producto |
| Panel Admin web | ✅ | Delegable a ingenieros |
| Modelo Servicio 7 días | ✅ | Segmento prioritario |
| Modelo Compra + Suscripción | ✅ | Código avanzado existente |
| Dashboard en app | ✅ | Reemplaza páginas web dispersas |
| Alertas push (FCM) | ✅ | Reemplaza WhatsApp/Telegram |
| Reporte PDF | ✅ | Valor agregado del servicio |
| Integración InfluxDB | ✅ | Reutilizar receptor_mqtt.py |
| Cálculo tarifas CFE | ✅ | Reutilizar lógica existente |
| Detección EWMA | ✅ | Reutilizar vigilante_calidad.py |

### 11.2 Exclusiones Explícitas

| Elemento | Excluido | Razón |
|----------|----------|-------|
| iOS | ❌ MVP | Pospuesto para V2 (CAME E-08) |
| Dashboard web separado | ❌ | Todo en la app móvil |
| Alertas WhatsApp | ❌ | Migrar a push notifications |
| Alertas Telegram | ❌ | Migrar a push notifications |
| Bot de IA en app | ❌ | Post-MVP |
| Chatwoot/soporte chat | ❌ | No prioritario |
| Reporte PDF automático sin revisión | ❌ | Ingeniero revisa (valor agregado) |
| Producción masiva de hardware | ❌ | Fuera de alcance |
| Integración directa con CFE | ❌ | No viable |
| Sistema de reclamos | ❌ | Fuera de alcance |
| Interfaz especial para técnico | ❌ | Simplificado (CAME M-07) |
| Tests automatizados | ❌ | Validación manual en MVP |

### 11.3 Qué NO es el MVP

| Aspecto | Aclaración |
|---------|------------|
| **No es un producto terminado** | Es la primera versión funcional para validar el mercado |
| **No resuelve todos los casos** | Solo monofásico en V1; bifásico y solar para V2 |
| **No es perfecto** | Se espera iterar rápidamente con OTA updates |
| **No reemplaza al electricista** | Cuentatron complementa, no sustituye |
| **No predice con 100% de precisión** | Estimaciones basadas en datos históricos |

---

## 12. Glosario

| Término | Definición |
|---------|------------|
| **Servicio 7 días** | Modelo de negocio donde TESIVIL presta el dispositivo por 7 días y entrega un reporte profesional |
| **Compra + Suscripción** | Modelo donde el cliente compra el dispositivo y paga suscripción mensual para acceso a funcionalidades premium |
| **EWMA** | Exponential Weighted Moving Average, algoritmo de detección de anomalías utilizado para identificar consumos inusuales |
| **CFE** | Comisión Federal de Electricidad (empresa eléctrica de México) |
| **Modo temporal** | Estado del usuario que tiene servicio de 7 días activo |
| **Panel Admin** | Interfaz web para administradores/ingenieros de TESIVIL para gestionar dispositivos, usuarios y reportes |
| **Congelar MQTT** | Bloquear el flujo de datos del dispositivo hacia InfluxDB cuando la suscripción no está activa |
| **CAME** | Corregir, Afrontar, Mantener, Explotar — Metodología de decisiones estratégicas derivada del análisis DAFO |
| **Free tier** | Nivel gratuito de servicios cloud con límites de uso (ej. 500MB en Supabase) |
| **OTA updates** | Over-The-Air updates — Actualizaciones de app sin pasar por tienda de aplicaciones |
| **receptor_mqtt.py** | Script Python que actúa como puente entre Mosquitto broker y InfluxDB, controlando el flujo de datos |
| **InfluxDB** | Base de datos de series temporales donde se almacenan las mediciones de consumo |
| **Mosquitto** | Broker MQTT ligero utilizado para la comunicación con los dispositivos ESP32 |
| **ESP32** | Microcontrolador con WiFi integrado utilizado en el dispositivo Cuentatron |
| **Supabase** | Plataforma Backend-as-a-Service que proporciona autenticación, base de datos PostgreSQL y APIs |
| **FCM** | Firebase Cloud Messaging — Servicio de Google para envío de notificaciones push |
| **Expo** | Framework que simplifica el desarrollo de aplicaciones React Native |
| **React Native** | Framework de JavaScript para crear aplicaciones móviles nativas |
| **DIY** | Do It Yourself (Hágalo Usted Mismo) — Enfoque de producto sin necesidad de técnico |
| **Upsell** | Estrategia de venta que ofrece al cliente un producto/servicio de mayor valor |
| **Orquestador de IA** | Rol de desarrollo donde el usuario coordina y dirige herramientas de IA sin programar directamente |
| **kWh** | Kilovatio-hora, unidad de medida de consumo eléctrico |
| **ISO 9001:2015** | Norma internacional de gestión de calidad, punto 6.1 se refiere a riesgos y oportunidades |

---

## 13. Diseño UX/UI Funcional (Ejecución IA)

> [!IMPORTANT]
> Esta sección define **reglas funcionales explícitas** para la implementación de la interfaz de usuario.
> Está diseñada para ejecución asistida por IA bajo norma ISO 9001.
> 
> **NO INCLUYE:** Diseño gráfico, colores finales, wireframes visuales, ni optimización estética.
> **SÍ INCLUYE:** Estructura, reglas y restricciones que la IA debe seguir sin inferencias.

### 13.1 Principios de UX del Sistema (Reglas Obligatorias)

> [!CAUTION]
> Estos principios son **OBLIGATORIOS** durante la ejecución. La IA NO puede omitirlos ni modificarlos.

| # | Principio | Regla Explícita | Prohibición |
|---|-----------|-----------------|-------------|
| UX-01 | **Claridad sobre estética** | Todo elemento debe tener función clara y documentada | NO agregar elementos decorativos sin función |
| UX-02 | **Consistencia de interacción** | Misma acción = mismo comportamiento en toda la app | NO crear variaciones de comportamiento para acciones idénticas |
| UX-03 | **Feedback inmediato** | Toda acción del usuario debe generar respuesta visible en < 300ms | NO dejar acciones sin confirmación visual |
| UX-04 | **Estados explícitos** | Cada componente debe mostrar su estado actual (activo, inactivo, cargando, error) | NO ocultar estados del sistema al usuario |
| UX-05 | **Prevención de errores** | Validar inputs antes de envío; deshabilitar acciones inválidas | NO permitir envío de formularios con errores |
| UX-06 | **Recuperación de errores** | Todo error debe incluir: descripción + acción sugerida | NO mostrar errores técnicos crudos al usuario |
| UX-07 | **Progreso visible** | Operaciones > 2 segundos deben mostrar indicador de progreso | NO congelar UI durante operaciones largas |
| UX-08 | **Jerarquía visual** | Información más importante = más prominente | NO dar igual peso visual a todos los elementos |
| UX-09 | **Acciones reversibles** | Acciones destructivas requieren confirmación explícita | NO ejecutar eliminaciones sin modal de confirmación |
| UX-10 | **Simplicidad de flujo** | Máximo 3 toques para llegar a cualquier función principal | NO crear navegación profunda (> 3 niveles) |

#### Alineación ISO 9001

| Cláusula ISO | Aplicación en UX |
|--------------|------------------|
| 6.1 Riesgos | UX-06, UX-09: Mitigar riesgo de pérdida de datos por error de usuario |
| 7.4 Comunicación | UX-03, UX-04: Comunicación clara del estado del sistema |
| 8.5.1 Control de producción | UX-02: Consistencia en el comportamiento del producto |
| 10.2 No conformidad | UX-06: Manejo estructurado de errores |

---

### 13.2 Estructura de Navegación

#### 13.2.1 Pantalla Inicial (Splash → Auth)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE PANTALLA INICIAL                             │
└─────────────────────────────────────────────────────────────────────────┘

   ┌───────────────┐
   │    SPLASH     │   ← Duración: 2 segundos (fijo)
   │   (Logo app)  │   ← Sin interacción posible
   └───────┬───────┘
           │
           ▼
   ┌───────────────────────────────────────────────────────────────┐
   │                    ¿SESIÓN ACTIVA?                            │
   └───────────────────────────────────────────────────────────────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
   [SÍ]       [NO]
     │           │
     ▼           ▼
┌─────────┐  ┌─────────────┐
│DASHBOARD│  │ AUTH SCREEN │
│ (Home)  │  │             │
└─────────┘  │ · Login     │
             │ · Registro  │
             │ · Recuperar │
             └─────────────┘
```

| Pantalla | Componentes Obligatorios | Notas |
|----------|-------------------------|-------|
| **Splash** | Logo, indicador de carga | Sin botones ni navegación |
| **Login** | Email, contraseña, botón entrar, enlace registro, enlace recuperar | Email con validación en tiempo real |
| **Registro** | Email, contraseña, confirmar contraseña, checkbox términos, botón crear | Contraseña: mínimo 8 caracteres |
| **Recuperar** | Email, botón enviar, enlace volver | Mensaje de confirmación tras envío |

> [!WARNING]
> **⚠️ REQUIERE DECISIÓN HUMANA:** ¿Tiempo de expiración de sesión? 
> **Valor por defecto:** 7 días sin actividad.

---

#### 13.2.2 Menú Principal (Bottom Navigation)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          📱 APP CUENTATRON                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                        [CONTENIDO DE SECCIÓN]                            │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                         BOTTOM NAVIGATION                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ 🏠       │  │ 🔔       │  │ 📊       │  │ ⚙️       │                 │
│  │ Inicio   │  │ Alertas  │  │ Reportes │  │ Cuenta   │                 │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

| Índice | Sección | Descripción | Estado inicial |
|--------|---------|-------------|----------------|
| 1 | **Inicio** | Dashboard de consumo actual | Vista por defecto al abrir |
| 2 | **Alertas** | Lista de notificaciones y anomalías | Badge con contador si hay nuevas |
| 3 | **Reportes** | Historial de reportes PDF descargables | Vacío si no hay reportes |
| 4 | **Cuenta** | Perfil, dispositivo, suscripción, configuración | Sin badge |

**Regla de navegación:** Tocar sección activa = scroll al inicio de esa sección.

---

#### 13.2.3 Submenús por Sección

##### Sección: Inicio (Dashboard)
| Subsección | Contenido | Acceso |
|------------|-----------|--------|
| Consumo actual | kWh en tiempo real, gráfica del día | Visible por defecto |
| Historial | Gráficas semanales/mensuales | Swipe horizontal o tabs |
| Estimación CFE | Costo estimado del periodo actual | Card inferior del dashboard |

##### Sección: Alertas
| Subsección | Contenido | Acceso |
|------------|-----------|--------|
| Todas | Lista completa de alertas | Tab por defecto |
| No leídas | Filtro de alertas nuevas | Tab secundario |
| Configuración | Preferencias de notificación | Icono ⚙️ en header |

##### Sección: Reportes
| Subsección | Contenido | Acceso |
|------------|-----------|--------|
| Disponibles | PDFs generados | Lista scrollable |
| Pendientes | Estado de reportes en generación | Badge en header si hay pendientes |

##### Sección: Cuenta
| Subsección | Contenido | Acceso |
|------------|-----------|--------|
| Perfil | Nombre, email, foto | Tap en avatar |
| Dispositivo | Serial, estado, WiFi, calibración | Card de dispositivo |
| Suscripción | Plan actual, fecha renovación, botón gestionar | Card de suscripción |
| Ayuda | FAQ, contacto, términos | Enlaces en lista |
| Cerrar sesión | Botón de logout | Final de la sección |

---

#### 13.2.4 Flujo Principal (Happy Path)

```
┌─────────────────────────────────────────────────────────────────────────┐
│              HAPPY PATH: PRIMER USO → DASHBOARD ACTIVO                   │
└─────────────────────────────────────────────────────────────────────────┘

PASO 1                PASO 2                PASO 3                PASO 4
──────                ──────                ──────                ──────
    │                     │                     │                     │
    ▼                     ▼                     ▼                     ▼
┌─────────┐         ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ Splash  │────────▶│  Registro   │──────▶│  Vincular   │──────▶│  Dashboard  │
│         │         │  (nuevo)    │       │  Dispositivo│       │   (activo)  │
└─────────┘         └─────────────┘       └─────────────┘       └─────────────┘
                          │                     │
                    · Email           · Escanear QR
                    · Contraseña      · Conectar WiFi
                    · Aceptar TyC     · Confirmar
                          │                     │
                          ▼                     ▼
                    [Verificación]      [Datos fluyendo]


TIEMPO ESTIMADO: 5-7 minutos (primera vez)
TOQUES: Máximo 15 interacciones
```

| Paso | Criterio de éxito | Feedback al usuario |
|------|------------------|---------------------|
| 1. Splash | App carga correctamente | Animación de logo |
| 2. Registro | Cuenta creada | "Revisa tu email para verificar" |
| 3. Verificar email | Email confirmado | "¡Email verificado!" + auto-login |
| 4. Vincular dispositivo | QR escaneado exitosamente | "Dispositivo encontrado: [SERIAL]" |
| 5. Conectar WiFi | Dispositivo conectado | "Conectado. Recibiendo datos..." |
| 6. Dashboard | Datos visibles | Gráfica con primeras lecturas |

---

#### 13.2.5 Flujos de Error

> [!IMPORTANT]
> Cada error debe seguir el formato: **CÓDIGO + MENSAJE + ACCIÓN**

| Código | Contexto | Mensaje para Usuario | Acción Sugerida | Componente UI |
|--------|----------|---------------------|-----------------|---------------|
| E-AUTH-01 | Login fallido | "Email o contraseña incorrectos" | "Intenta de nuevo o recupera tu contraseña" | Toast (3s) + highlight campos |
| E-AUTH-02 | Email no verificado | "Tu email aún no está verificado" | "Reenviar correo de verificación" | Modal con botón |
| E-AUTH-03 | Sesión expirada | "Tu sesión ha expirado" | "Inicia sesión nuevamente" | Modal → redirige a login |
| E-QR-01 | QR no reconocido | "Este código QR no es válido" | "Asegúrate de escanear el QR del dispositivo Cuentatron" | Modal con imagen de ejemplo |
| E-QR-02 | Dispositivo ya asignado | "Este dispositivo ya está vinculado a otra cuenta" | "Contacta soporte si crees que es un error" | Modal con enlace a soporte |
| E-WIFI-01 | No conecta a red | "No se pudo conectar al WiFi" | "Verifica la contraseña e intenta de nuevo" | Modal con campo de retry |
| E-NET-01 | Sin conexión a internet | "Sin conexión a internet" | "Verifica tu conexión y vuelve a intentar" | Banner persistente (top) |
| E-NET-02 | Timeout de servidor | "El servidor no responde" | "Intenta de nuevo en unos minutos" | Toast (5s) + botón reintentar |
| E-SUBS-01 | Suscripción vencida | "Tu suscripción ha vencido" | "Renueva para seguir viendo tus datos" | Modal con botón a pagos |
| E-DATA-01 | Sin datos disponibles | "Aún no hay datos de consumo" | "Los datos aparecerán cuando el dispositivo esté conectado" | Estado vacío con ilustración |

> [!WARNING]
> **⚠️ REQUIERE DECISIÓN HUMANA:** ¿Modo offline con datos cached o bloqueo total?
> **Valor por defecto:** Mostrar última data con banner "Datos de [fecha]. Sin conexión."

---

### 13.3 Componentes UI Funcionales

#### 13.3.1 Botones

| Tipo | Uso | Apariencia | Estados | Restricciones |
|------|-----|------------|---------|---------------|
| **Primario** | Acción principal de la pantalla | Fondo sólido, texto contrastante | Normal, Hover, Pressed, Disabled, Loading | Máximo 1 por pantalla |
| **Secundario** | Acciones alternativas | Borde, fondo transparente | Normal, Hover, Pressed, Disabled | Sin límite |
| **Crítico** | Acciones destructivas (eliminar, cerrar sesión) | Fondo rojo/advertencia | Normal, Hover, Pressed, Disabled | Siempre requiere confirmación |
| **Texto** | Navegación menor (enlaces) | Solo texto, sin fondo ni borde | Normal, Hover, Pressed | Para acciones terciarias |
| **Icono** | Acciones rápidas (compartir, filtrar) | Solo icono, área de toque 44x44px mínimo | Normal, Pressed | Siempre con tooltip en long-press |

**Reglas de botones:**
1. Botón primario siempre va abajo o a la derecha
2. Botón "Cancelar" siempre a la izquierda de "Confirmar"
3. Botones deshabilitados muestran tooltip explicando por qué
4. Estado "Loading" reemplaza texto por spinner, mantiene ancho

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    JERARQUÍA DE BOTONES                                  │
└─────────────────────────────────────────────────────────────────────────┘

   ┌─────────────────────────────┐
   │     BOTÓN PRIMARIO          │  ← Acción principal (Guardar, Continuar)
   │     [     Continuar     ]   │
   └─────────────────────────────┘

   ┌─────────────────────────────┐
   │     BOTÓN SECUNDARIO        │  ← Acción alternativa (Cancelar, Atrás)
   │     [     Cancelar      ]   │
   └─────────────────────────────┘

   ┌─────────────────────────────┐
   │     BOTÓN CRÍTICO           │  ← Acción destructiva (Eliminar)
   │     [  ⚠️ Eliminar      ]   │
   └─────────────────────────────┘

   Enlace de texto               ← Navegación menor
```

---

#### 13.3.2 Formularios

| Campo | Tipo | Validación | Mensaje de Error | Máscara |
|-------|------|------------|------------------|---------|
| Email | TextInput (email) | Regex email válido | "Ingresa un email válido" | Ninguna |
| Contraseña | TextInput (password) | Mínimo 8 caracteres | "Mínimo 8 caracteres" | Oculta con toggle |
| Nombre | TextInput | No vacío, solo letras y espacios | "Ingresa un nombre válido" | Ninguna |
| WiFi SSID | TextInput | No vacío | "Selecciona o ingresa tu red WiFi" | Ninguna |
| WiFi Password | TextInput (password) | No vacío | "Ingresa la contraseña de tu WiFi" | Oculta con toggle |

**Reglas de formularios:**
1. Validación en tiempo real al perder foco (onBlur)
2. Error se muestra debajo del campo, en rojo
3. Campos válidos muestran checkmark verde
4. Botón de submit deshabilitado hasta que todo sea válido
5. Focus automático en primer campo con error al intentar submit

**Estructura de campo:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ANATOMÍA DE CAMPO DE FORMULARIO                       │
└─────────────────────────────────────────────────────────────────────────┘

   Label del campo
   ┌─────────────────────────────────────────┐
   │  Placeholder o valor                  📧 │  ← Icono opcional a la derecha
   └─────────────────────────────────────────┘
   ❌ Mensaje de error (si aplica)

Estados:
   · Normal:   Borde gris
   · Focus:    Borde primario, label arriba
   · Error:    Borde rojo, mensaje visible
   · Success:  Borde verde, checkmark
   · Disabled: Fondo gris, no editable
```

---

#### 13.3.3 Modales

| Tipo | Uso | Componentes | Cierre | Prioridad |
|------|-----|-------------|--------|-----------|
| **Informativo** | Mensajes importantes sin acción requerida | Título, descripción, botón "Entendido" | Tap fuera, botón | Baja |
| **Confirmación** | Acciones que requieren aceptación | Título, descripción, botón Cancelar + Confirmar | Solo botones | Media |
| **Destructivo** | Eliminaciones o acciones irreversibles | Título rojo, descripción, Cancelar + Eliminar (rojo) | Solo botones | Alta |
| **Input** | Solicitar dato al usuario | Título, campo de texto, Cancelar + Aceptar | Solo botones | Media |
| **Carga** | Proceso en background | Spinner, texto de estado | No cierra (auto-dismiss al completar) | Alta |

**Reglas de modales:**
1. Solo un modal visible a la vez
2. Background oscurecido al 50% opacidad
3. Modal siempre centrado vertical y horizontalmente
4. Ancho: 90% del ancho de pantalla, máximo 400px
5. Animación de entrada: fade + scale desde 95%

---

#### 13.3.4 Alertas y Notificaciones

| Tipo | Ubicación | Duración | Interacción | Uso |
|------|-----------|----------|-------------|-----|
| **Toast** | Bottom, sobre nav | 3-5 segundos | Swipe para dismiss | Confirmaciones, errores menores |
| **Banner** | Top, debajo de header | Persistente | Botón de acción o dismiss | Errores de conexión, advertencias |
| **Badge** | Sobre icono de nav | Permanente hasta interacción | Tap en sección | Indicar items nuevos |
| **Push** | Sistema operativo | Según config usuario | Tap abre sección relacionada | Alertas de consumo, anomalías |

**Categorías de severidad:**

| Severidad | Color | Icono | Ejemplos |
|-----------|-------|-------|----------|
| **Info** | Azul | ℹ️ | "Reporte disponible", "Actualización completada" |
| **Success** | Verde | ✅ | "Dispositivo conectado", "Pago exitoso" |
| **Warning** | Amarillo | ⚠️ | "Suscripción por vencer", "Consumo elevado" |
| **Error** | Rojo | ❌ | "Error de conexión", "Pago fallido" |
| **Critical** | Rojo oscuro | 🚨 | "Fuga detectada", "Anomalía crítica" |

---

### 13.4 Reglas Explícitas para Ejecución con IA

> [!CAUTION]
> **ESTAS REGLAS SON OBLIGATORIAS.** La IA debe seguirlas estrictamente durante la implementación.

#### 13.4.1 Qué PUEDE hacer la IA (Sin preguntar)

| # | Acción Permitida | Condición |
|---|------------------|-----------|
| IA-OK-01 | Implementar componentes descritos en este documento | Exactamente como están especificados |
| IA-OK-02 | Aplicar validaciones de formulario | Según tabla de validación |
| IA-OK-03 | Implementar flujos de navegación | Según diagramas de esta sección |
| IA-OK-04 | Mostrar mensajes de error | Usando tabla de códigos de error |
| IA-OK-05 | Crear estados de loading/empty | Siguiendo principios UX-03, UX-07 |
| IA-OK-06 | Implementar modales de confirmación | Para acciones marcadas como destructivas |
| IA-OK-07 | Aplicar jerarquía de botones | Según reglas de botones |
| IA-OK-08 | Ordenar elementos según prioridad visual | Regla UX-08 |
| IA-OK-09 | Agregar indicadores de progreso | En operaciones > 2 segundos |
| IA-OK-10 | Implementar feedback táctil/visual | Para todas las acciones de usuario |

---

#### 13.4.2 Qué NO PUEDE decidir la IA

| # | Prohibición | Razón | Referencia |
|---|-------------|-------|------------|
| IA-NO-01 | **NO agregar pantallas no documentadas** | Evitar scope creep | Sección 13.2 |
| IA-NO-02 | **NO cambiar flujos de navegación** | Afecta UX validada | Sección 13.2.4 |
| IA-NO-03 | **NO omitir modales de confirmación** | Viola UX-09 | 13.1 Principios |
| IA-NO-04 | **NO inventar mensajes de error** | Deben ser consistentes | 13.2.5 |
| IA-NO-05 | **NO añadir campos a formularios** | Cambia requerimientos | 13.3.2 |
| IA-NO-06 | **NO crear nuevos tipos de botón** | Rompe consistencia | 13.3.1 |
| IA-NO-07 | **NO decidir colores finales** | Fuera de alcance de este documento | Restricciones |
| IA-NO-08 | **NO asumir comportamiento de usuario** | Fuera de especificación | Restricciones |
| IA-NO-09 | **NO inferir flujos no descritos** | Causa inconsistencias | Restricciones |
| IA-NO-10 | **NO optimizar estética sin instrucción** | Fuera de alcance | Restricciones |

---

#### 13.4.3 Cuándo DEBE preguntar al usuario

| # | Situación | Pregunta Modelo | Tipo de Decisión |
|---|-----------|-----------------|------------------|
| IA-ASK-01 | Funcionalidad no está documentada | "¿Cómo debo implementar [X] que no está en el Plan Maestro?" | Alcance |
| IA-ASK-02 | Ambigüedad entre dos interpretaciones | "El documento dice [A], pero también [B]. ¿Cuál aplica para [contexto]?" | Clarificación |
| IA-ASK-03 | Conflicto entre reglas | "La regla UX-X entra en conflicto con UX-Y en este caso. ¿Cuál priorizo?" | Priorización |
| IA-ASK-04 | Decisión de negocio implícita | "Implementar [X] afecta [modelo de negocio]. ¿Procedo?" | Negocio |
| IA-ASK-05 | Tecnología no especificada | "Necesito usar [librería/servicio] no mencionado. ¿Lo implemento?" | Técnica |
| IA-ASK-06 | Cambio que afecta otras secciones | "Este cambio impacta [sección Y]. ¿Debo actualizar ambas?" | Impacto |
| IA-ASK-07 | Error en documento fuente | "Hay un error/inconsistencia en el documento. ¿Cómo procedo?" | Corrección |

---

#### 13.4.4 Marcadores de Ambigüedad para Revisión Humana

Todas las siguientes decisiones están pendientes y marcadas en este documento:

| Marcador | Ubicación | Decisión Pendiente | Valor por Defecto Aplicado |
|----------|-----------|-------------------|---------------------------|
| ⚠️ RDH-01 | 13.2.1 | Tiempo de expiración de sesión | 7 días sin actividad |
| ⚠️ RDH-02 | 13.2.5 | Modo offline (datos cached vs bloqueo) | Datos cached con banner |
| ⚠️ RDH-03 | No especificado | Idioma de la aplicación | Español MX únicamente |
| ⚠️ RDH-04 | No especificado | Orientación de pantalla | Portrait fijo |

> [!NOTE]
> Los valores por defecto se aplicarán durante la ejecución. Si el usuario desea cambiarlos, debe indicarlo explícitamente antes de la implementación del componente afectado.

---

### 13.5 Matriz de Referencia Rápida

#### Componente → Regla UX Aplicable

| Componente | Reglas que Aplican |
|------------|-------------------|
| Splash screen | UX-03, UX-07 |
| Login/Registro | UX-05, UX-06 |
| Dashboard | UX-04, UX-08 |
| Alertas | UX-03, UX-04 |
| Modales | UX-09, UX-06 |
| Formularios | UX-05, UX-03 |
| Navegación | UX-02, UX-10 |
| Errores | UX-06 |
| Botones | UX-01, UX-02 |

#### Decisiones CAME Relacionadas

| Decisión CAME | Relación con UX/UI |
|---------------|-------------------|
| **E-04** (Explotar upsell) | Diseñar CTA claro al final del servicio de 7 días |
| **E-09** (Panel delegable) | UX del panel con tooltips y guías para no técnicos |
| **M-04** (Una sola app) | No crear experiencias UI separadas para cada modelo |
| **A-06** (PDF con intervención) | No automatizar UI de generación de reporte |

---

> [!NOTE]
> Todos los documentos de origen han sido preservados en `_Planeacion_Archivos_Origen/`.

| Archivo | Propósito |
|---------|-----------|
| [00_RESUMEN_EJECUTIVO.md](./_Planeacion_Archivos_Origen/00_RESUMEN_EJECUTIVO.md) | Resumen de sesión de ideación |
| [01_IDEAS_CONSOLIDADO.md](./_Planeacion_Archivos_Origen/01_IDEAS_CONSOLIDADO.md) | Ideas categorizadas (37) |
| [02_MASTER_PLAN.md](./_Planeacion_Archivos_Origen/02_MASTER_PLAN.md) | Plan original con inventario legacy |
| [03_ESTRATEGIA_MVP_PROPUESTA.md](./_Planeacion_Archivos_Origen/03_ESTRATEGIA_MVP_PROPUESTA.md) | Estrategia por componente |
| [04_ESTRATEGIA_MVP_FINAL.md](./_Planeacion_Archivos_Origen/04_ESTRATEGIA_MVP_FINAL.md) | Estrategia MoSCoW final |
| [05_PLAN_MAESTRO_CONSOLIDADO.md](./_Planeacion_Archivos_Origen/05_PLAN_MAESTRO_CONSOLIDADO.md) | Versión 2.3 con interrogación socrática |
| [06_RIESGOS_Y_OPORTUNIDADES.md](./_Planeacion_Archivos_Origen/06_RIESGOS_Y_OPORTUNIDADES.md) | Análisis ISO 9001:2015 |
| [07_DECISIONES_CAME.md](./_Planeacion_Archivos_Origen/07_DECISIONES_CAME.md) | Decisiones estratégicas CAME |
| `docs_analysis/modules/*.md` | Análisis técnico de módulos legacy |

---

*Documento consolidado el 2026-01-05*  
*Este documento es la fuente de verdad única para la ejecución del proyecto Cuentatron MVP.*  
*Las decisiones CAME son autoritativas y deben respetarse durante la implementación.*

---

## 14. Planeación de Interfaz y Experiencia de Usuario (UI/UX)

> [!IMPORTANT]
> Esta sección contiene **acuerdos explícitos validados con el usuario humano**.
> Cada acuerdo tiene un ID único (UXUI-XXX) y es trazable al documento de origen.
> 
> **Documento de origen:** `ACUERDOS_UXUI_MVP.md`
> **Total de acuerdos:** 69 (UXUI-001 a UXUI-069)
> **Fecha de validación:** 2026-01-06
> **Estado:** ✅ COMPLETO

> [!CAUTION]
> **REGLA PARA IA EJECUTORA:** Esta sección tiene prioridad sobre la Sección 13 en caso de conflicto.
> Los acuerdos aquí documentados son decisiones humanas definitivas y NO deben modificarse ni reinterpretarse.

---

### 14.1 Origen y Trazabilidad

| Atributo | Valor |
|----------|-------|
| **Documento de origen** | `ACUERDOS_UXUI_MVP.md` |
| **Ruta completa** | `15_CUENTATRON/docs/planning/ACUERDOS_UXUI_MVP.md` |
| **Total de acuerdos** | 69 |
| **Rango de IDs** | UXUI-001 a UXUI-069 |
| **Fecha de inicio validación** | 2026-01-05 |
| **Fecha de cierre validación** | 2026-01-06 |
| **Participantes** | Usuario propietario + IA Antigravity |

#### Índice de Acuerdos por Sección

| Rango | Sección | Cantidad |
|-------|---------|----------|
| UXUI-001 a UXUI-005 | Estructura General | 5 |
| UXUI-006 a UXUI-013 | Pantalla Inicio (Dashboard) | 8 |
| UXUI-014 a UXUI-028 | Onboarding | 15 |
| UXUI-029 a UXUI-030 | Tipos de Plan MVP | 2 |
| UXUI-031 a UXUI-044 | Alertas (UI + Tipos) | 14 |
| UXUI-045 a UXUI-050 | Gráficas | 6 |
| UXUI-051 a UXUI-054 | Cuenta | 4 |
| UXUI-055 a UXUI-062 | Panel Admin | 8 |
| UXUI-063 a UXUI-066 | Decisiones Globales RDH | 4 |
| UXUI-067 a UXUI-069 | Vinculación de Dispositivo | 3 |
| **TOTAL** | | **69** |

---

### 14.2 Estructura General de la Aplicación (UXUI-001 a UXUI-005)

#### UXUI-001: Menú Principal (Bottom Navigation)

| Atributo | Valor Definitivo |
|----------|------------------|
| **Componente** | Bottom Navigation |
| **Número de secciones** | 4 (FIJO) |
| **Secciones** | Inicio, Alertas, Gráficas, Cuenta |
| **Fecha validación** | 2026-01-05 |

**Reglas para IA:**
- La navegación principal DEBE tener exactamente 4 secciones
- El orden DEBE ser: Inicio, Alertas, Gráficas, Cuenta
- NO agregar ni quitar secciones sin aprobación humana

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          📱 APP CUENTATRON                               │
├─────────────────────────────────────────────────────────────────────────┤
│                        [CONTENIDO DE SECCIÓN]                            │
├─────────────────────────────────────────────────────────────────────────┤
│                         BOTTOM NAVIGATION                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ 🏠       │  │ 🔔       │  │ 📊       │  │ ⚙️       │                 │
│  │ Inicio   │  │ Alertas  │  │ Gráficas │  │ Cuenta   │                 │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
```

#### UXUI-002: Sección "Reportes"

| Atributo | Valor Definitivo |
|----------|------------------|
| **Decisión** | ❌ **ELIMINADA** del menú principal |
| **Razón** | Los reportes PDF no son permanentes; las gráficas son el valor central |
| **Ubicación alternativa** | Sección Cuenta → Subsección "Mis Reportes" (solo servicio 7 días) |
| **Fecha validación** | 2026-01-05 |

**Regla para IA:** NO crear sección "Reportes" en el menú principal.

#### UXUI-003: Nueva Sección "Gráficas"

| Atributo | Valor Definitivo |
|----------|------------------|
| **Decisión** | ✅ INCLUIDA en menú principal |
| **Contenido** | Picos de voltaje, consumo por hora, y todas las gráficas |
| **Fecha validación** | 2026-01-05 |

**Regla para IA:** La sección Gráficas DEBE contener todas las visualizaciones de datos.

#### UXUI-004: Panel Admin

| Atributo | Valor Definitivo |
|----------|------------------|
| **Decisión** | ✅ **Web separada** |
| **Tecnología** | React + Vite (según arquitectura definitiva) |
| **Independencia** | Completamente independiente de la app móvil |
| **Fecha validación** | 2026-01-05 |

**Regla para IA:** El Panel Admin NO es parte de la app móvil. Es una aplicación web separada.

#### UXUI-005: Diferenciación Visual 7 días vs Permanente

| Atributo | Valor Definitivo |
|----------|------------------|
| **Decisión** | ❌ **No habrá diferencia visual** |
| **Diferenciación real** | Solo diferencia de acceso a funcionalidades |
| **Fecha validación** | 2026-01-05 |

**Regla para IA:** NO crear temas, colores o estilos diferentes para usuarios de 7 días vs permanente. La UI es idéntica; las diferencias son funcionales (acceso a features).

---

### 14.3 Pantalla Inicio - Dashboard (UXUI-006 a UXUI-013)

| ID | Elemento | Decisión | En Pantalla Inicio |
|----|----------|----------|-------------------|
| **UXUI-006** | Consumo actual (kWh) | ✅ Permanece | SÍ |
| **UXUI-007** | Estado del dispositivo | ✅ Permanece | SÍ |
| **UXUI-008** | Última alerta | ✅ Permanece | SÍ |
| **UXUI-009** | Mini-gráfica del día | ❌ **Se mueve a Gráficas** | NO |
| **UXUI-010** | Estimación de costo CFE | ✅ Permanece (ampliada) | SÍ |
| **UXUI-011** | Fecha de corte CFE | ✅ Nuevo elemento | SÍ |
| **UXUI-012** | kWh bimestre anterior | ✅ Consumo bimestre anterior | SÍ |
| **UXUI-013** | Predicción de recibo | ✅ En kWh Y en pesos MXN | SÍ |

#### Estructura Definitiva de Pantalla Inicio

**Reglas para IA:**
1. La pantalla Inicio DEBE contener exactamente los elementos marcados con "SÍ" arriba
2. La mini-gráfica del día NO debe estar en Inicio; pertenece a Gráficas
3. La predicción DEBE mostrar AMBOS valores: kWh estimados Y pesos mexicanos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          📱 PANTALLA INICIO                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  CONSUMO ACTUAL                                                   │   │
│  │  ████████████████████████  15.7 kWh  (hoy)                       │   │
│  │  Barra de progreso comparando con el consumo promedio diario     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  📅 INFORMACIÓN CFE                                               │   │
│  │  · Fecha de corte: 15 de febrero 2026                            │   │
│  │  · Bimestre anterior: 245 kWh                                     │   │
│  │  · Predicción periodo actual: ~280 kWh / ~$850 MXN               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌────────────────────────┐  ┌────────────────────────┐                 │
│  │  📡 DISPOSITIVO        │  │  🔔 ÚLTIMA ALERTA      │                 │
│  │  ✅ Conectado          │  │  ⚠️ Pico de consumo    │                 │
│  │  Cuentatron-A7F3      │  │  hace 2 horas          │                 │
│  └────────────────────────┘  └────────────────────────┘                 │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 14.4 Flujo de Onboarding (UXUI-014 a UXUI-028)

#### 14.4.1 Conceptos de Onboarding

| ID | Concepto | Decisión | Nota |
|----|----------|----------|------|
| **UXUI-014** | Ubicación de reportes PDF | Sección Cuenta → "Mis reportes" | Solo servicio 7 días |
| **UXUI-015** | Fecha de corte CFE | Usuario ingresa manualmente durante Onboarding | — |
| **UXUI-016** | Ayuda visual CFE | Modales con icono "?" mostrando imagen del recibo | Zona marcada |
| **UXUI-017** | Autenticación primaria | ✅ **Google Auth** | Nombre y correo automáticos |
| **UXUI-017b** | Autenticación alternativa | ✅ **Login tradicional** | Email + código de 6 dígitos |
| **UXUI-018** | Campo Teléfono WhatsApp | ❌ **ELIMINADO** | No hay alertas WhatsApp |
| **UXUI-019** | Tipo Servicio vs Tipo Tarifa | Son **DOS campos diferentes** | Tipo Servicio ligado a compra |

> [!NOTE]
> **Regla de autenticación:** Si el usuario usa Google Auth, el campo "Nombre" NO aparece porque Google provee esa información. Si usa login tradicional, debe ingresar nombre manualmente.

#### 14.4.2 Campos del Formulario de Onboarding

| ID | Campo | Tipo | Obligatorio | Ayuda Visual | Estado |
|----|-------|------|-------------|--------------|--------|
| **UXUI-020** | Nombre Completo | — | — | — | ❌ **ELIMINADO** (se obtiene de Google Auth) |
| **UXUI-021** | Correo Electrónico | — | — | — | ❌ **ELIMINADO** (se obtiene de Google Auth) |
| **UXUI-022** | Teléfono WhatsApp | — | — | — | ❌ **ELIMINADO** (no necesario) |
| **UXUI-023** | Tipo de Tarifa CFE | Select/Dropdown | ✅ SÍ | ✅ Modal con imagen | Opciones: 01, 01A, 01B, PDBT, DAC |
| **UXUI-024** | Última Fecha de Corte | DatePicker | ✅ SÍ | ✅ Modal con imagen | Se extrae día + ciclo bimestral |
| **UXUI-025** | Lectura Actual del Medidor (kWh) | NumberInput | ✅ SÍ | ✅ Modal con imagen del medidor | — |
| **UXUI-026** | Consumo Último Recibo (kWh) | NumberInput | ✅ SÍ | ✅ Modal con imagen | — |
| **UXUI-027** | Lectura Cierre Periodo Anterior | NumberInput | ✅ SÍ | ✅ Modal con imagen | — |
| **UXUI-028** | Tipo de Servicio Eléctrico | — | — | — | ❌ **NO es campo de usuario** (ligado a compra) |

**Reglas para IA:**
1. Los campos UXUI-020, UXUI-021, UXUI-022, UXUI-028 NO deben implementarse como inputs de usuario
2. Los campos UXUI-023 a UXUI-027 son OBLIGATORIOS y deben tener ayuda visual
3. Para UXUI-025 (Lectura Actual), usar fotos del medidor físico, NO del recibo

#### 14.4.3 Opciones de Tipo de Tarifa CFE (para UXUI-023)

| Código | Nombre |
|--------|--------|
| 01 | Tarifa 01 (Residencial básica) |
| 01A | Tarifa 01A (Consumo bajo) |
| 01B | Tarifa 01B (Consumo medio) |
| PDBT | PDBT (Pequeña demanda baja tensión) |
| DAC | DAC (Doméstico de Alto Consumo) |

**Regla para IA:** Estas son las ÚNICAS opciones válidas para el selector de tarifa.

#### 14.4.4 Flujo de Onboarding (Diagrama)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE ONBOARDING ACTUALIZADO                       │
└─────────────────────────────────────────────────────────────────────────┘

PASO 1              PASO 2              PASO 3              PASO 4
──────              ──────              ──────              ──────
   │                   │                   │                   │
   ▼                   ▼                   ▼                   ▼
┌─────────┐       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Google  │──────▶│  Datos CFE  │────▶│  Vincular   │────▶│  Dashboard  │
│ Auth o  │       │(OBLIGATORIO)│     │ Dispositivo │     │   (activo)  │
│ Login   │       └─────────────┘     └─────────────┘     └─────────────┘
│ Trad.   │            │                   │
     │            ┌─────┴─────┐             │
     │            │ CAMPOS:   │             │
· Nombre auto    │ · Tarifa  │        · Escanear QR
· Email auto     │ · Fecha   │        · Conectar WiFi
                 │ · Lecturas│        · Confirmar
                 │           │
                 │ + AYUDA   │
                 │ VISUAL    │
                 └───────────┘
```

---

### 14.5 Tipos de Plan MVP (UXUI-029 a UXUI-030)

> [!IMPORTANT]
> **Decisión del usuario:** Los tipos trifásicos están **DESCARTADOS** para el MVP.

#### UXUI-029: Tipos de Plan Incluidos en MVP

| Tipo de Plan | Campos de Corriente | Estado MVP |
|--------------|---------------------|------------|
| **Monofásico** | 2 sensores | ✅ INCLUIDO |
| **Monofásico (con paneles)** | 3 sensores | ✅ INCLUIDO |
| **Bifásico (sin paneles)** | 3 sensores | ✅ INCLUIDO |
| **Bifásico (con paneles)** | 5 sensores | ✅ INCLUIDO |
| ~~Trifásico (sin paneles)~~ | 4 sensores | ❌ DESCARTADO MVP |
| ~~Trifásico (con paneles)~~ | 7 sensores | ❌ DESCARTADO MVP |

**Regla para IA:** Solo implementar soporte para los 4 tipos marcados como INCLUIDO. NO implementar trifásico.

#### UXUI-030: Implicación para Panel Admin

El panel admin DEBE mostrar solo las opciones de plan incluidas en MVP para el dropdown de aprovisionamiento de dispositivos.

---

### 14.6 Sistema de Alertas (UXUI-031 a UXUI-044)

#### 14.6.1 Acuerdos de UI para Lista de Alertas

| ID | Acuerdo | Valor Definitivo |
|----|---------|------------------|
| **UXUI-031** | Estructura de cada alerta en lista | Título + Descripción breve + Hora |
| **UXUI-032** | Filtros en lista de alertas | Filtro por tipo (consumo, pico, voltaje, etc.) |
| **UXUI-033** | Acción al tocar alerta | Abre **modal** con detalle completo + gráfica si aplica |

#### 14.6.2 Tipos de Alerta - Alertas Diarias para Usuario (APP)

| ID | Tipo | Descripción | Frecuencia | Destino |
|----|------|-------------|------------|---------|
| **UXUI-034** | Reporte Diario | Consumo de ayer + acumulado + proyección | Diaria | ✅ APP |
| **UXUI-035** | Aviso Corte 3 Días | Recordatorio 3 días antes de fecha de corte CFE | Evento | ✅ APP |
| **UXUI-036** | Día de Corte | Resumen final: kWh + costo estimado | Evento | ✅ APP |

#### 14.6.3 Tipos de Alerta - Alertas de Calidad para Usuario (APP)

| ID | Tipo | Descripción | Frecuencia | Incluye Gráfica |
|----|------|-------------|------------|-----------------|
| **UXUI-037** | Picos de Voltaje Alto | Detectados picos sobre umbral configurable | Inmediata | ✅ SÍ |
| **UXUI-038** | Voltaje Bajo | Detectado voltaje bajo umbral configurable | Inmediata | ✅ SÍ |
| **UXUI-039** | Fuga de Corriente | Posible fuga detectada | Inmediata | ✅ SÍ |
| **UXUI-040** | Consumo Fantasma | Consumo inusual a hora específica | Inmediata | ✅ SÍ |
| **UXUI-041** | Brinco de Escalón | Ha superado umbral de tarifa CFE | Evento | ❌ NO |
| **UXUI-042** | Felicitación Conexión | Primera medición recibida | Única | ❌ NO |

> [!IMPORTANT]
> **UXUI-037 y UXUI-038:** Los valores de umbral (ej. 139.7V alto, 114.3V bajo) **NO se hardcodean**. Deben ser configurables desde el Panel Admin.

#### 14.6.4 Tipos de Alerta - Solo Panel Admin

| ID | Tipo | Descripción | Destino |
|----|------|-------------|---------|
| **UXUI-043** | Recordatorio Conexión | Cliente escaneó QR pero no hay datos en InfluxDB | ❌ Solo ADMIN |
| **UXUI-044** | Dispositivo Offline | Dispositivo sin reportar datos | ❌ Solo ADMIN |

**Regla para IA:** Las alertas UXUI-043 y UXUI-044 NO deben aparecer en la app móvil del usuario final.

#### 14.6.5 Estructura Visual de Lista de Alertas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        📱 SECCIÓN ALERTAS                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ FILTROS: [Todas] [Consumo] [Voltaje] [Picos] [CFE] [Sistema]   │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ⚡ Picos de Alto Voltaje                                        │    │
│  │ Se detectaron 5 picos sobre 139.7V en la última hora           │    │
│  │                                            Hace 45 min          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📊 Consumo de Ayer                                              │    │
│  │ Consumiste 12.5 kWh (más alto que tu promedio)                  │    │
│  │                                            Hoy 7:00 AM          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 14.6.6 Modal de Detalle de Alerta

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        📱 MODAL DE ALERTA                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ ⚡ Picos de Alto Voltaje                             [X Cerrar] │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │                                                                  │    │
│  │ Se detectaron **5 picos de alto voltaje** en tu instalación    │    │
│  │ en la última hora.                                              │    │
│  │                                                                  │    │
│  │ **Recomendación:** Usar reguladores de voltaje en equipos      │    │
│  │ sensibles como computadoras, televisores y refrigeradores.     │    │
│  │                                                                  │    │
│  │ ┌───────────────────────────────────────────────────────────┐  │    │
│  │ │            📊 GRÁFICA DE VOLTAJE (última hora)            │  │    │
│  │ │  140V ─────────────────────────────────────────────────   │  │    │
│  │ │       ╱╲                  ╱╲    ╱╲                        │  │    │
│  │ │  127V ──────────────────────────────────────────────────  │  │    │
│  │ │  114V ─────────────────────────────────────────────────   │  │    │
│  │ │       10:00  10:15  10:30  10:45  11:00                   │  │    │
│  │ └───────────────────────────────────────────────────────────┘  │    │
│  │                                                                  │    │
│  │  Fecha: 6 de enero 2026, 10:45 AM                              │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 14.7 Sección Gráficas (UXUI-045 a UXUI-050)

| ID | Acuerdo | Valor Definitivo |
|----|---------|------------------|
| **UXUI-045** | Gráficas de Consumo | **Unificadas** con selector de periodo |
| **UXUI-046** | Selector de periodo | Hora, Día, Semana, Mes, Bimestre, **Periodo CFE** |
| **UXUI-047** | Gráfica de Voltaje | ✅ Incluida |
| **UXUI-048** | Gráfica de Fuga/Corriente | ✅ Incluida |
| **UXUI-049** | Navegación entre gráficas | **Vistas independientes** (no scroll vertical) |
| **UXUI-050** | Exportar gráficas | ❌ No incluido en MVP |

#### 14.7.1 Tipos de Gráficas en MVP

| Gráfica | Descripción | Selector Temporal |
|---------|-------------|-------------------|
| **Consumo** | Consumo eléctrico en kWh | ✅ Hora / Día / Semana / Mes / Bimestre |
| **Voltaje** | Nivel de voltaje (V) con umbrales visuales | ⚠️ Por definir |
| **Fuga/Corriente** | Corriente de fuga detectada (A) | ⚠️ Por definir |

> [!WARNING]
> **AMBIGÜEDAD AMB-01 y AMB-02:** Los selectores de periodo para las gráficas de Voltaje y Fuga/Corriente están marcados como "Por definir". La IA NO debe inventar valores; debe consultar al usuario antes de implementar.

**Regla para IA:** 
- La navegación entre gráficas DEBE ser por vistas independientes (tabs/segmented control), NO por scroll
- NO implementar exportación de gráficas en MVP

#### 14.7.2 Estructura de Navegación de Gráficas

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        📱 SECCIÓN GRÁFICAS                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ NAVEGACIÓN: [Consumo] [Voltaje] [Corriente]                     │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ SELECTOR: [Hora] [Día] [Semana] [Mes] [Bimestre]               │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    📊 GRÁFICA DE CONSUMO                        │    │
│  │                                                                  │    │
│  │  15 kWh ┌─────────────────────────────────────────────────┐    │    │
│  │         │                        ╱╲                        │    │    │
│  │  10 kWh │              ╱╲╱╲    ╱  ╲                       │    │    │
│  │         │        ╱╲  ╱    ╲  ╱    ╲                       │    │    │
│  │   5 kWh │      ╱  ╲╱        ╲╱      ╲                     │    │    │
│  │         │    ╱                        ╲                   │    │    │
│  │   0 kWh └────────────────────────────────────────────────┘    │    │
│  │          Lun   Mar   Mie   Jue   Vie   Sab   Dom              │    │
│  │                                                                  │    │
│  │  Consumo promedio: 12.5 kWh/día                                 │    │
│  │  Total semana: 87.5 kWh                                         │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 14.7.3 Vista de Gráfica de Voltaje

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    ⚡ GRÁFICA DE VOLTAJE                         │    │
│  │                                                                  │    │
│  │  139.7V ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (ALTO)         │    │
│  │  127V   ──────────╱╲────────────╱╲──────────────────────        │    │
│  │  114.3V ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (BAJO)         │    │
│  │          00:00  04:00  08:00  12:00  16:00  20:00  24:00        │    │
│  │                                                                  │    │
│  │  ● Voltaje actual: 126.5V (Normal)                              │    │
│  │  ● Picos hoy: 0                                                  │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 14.8 Sección Cuenta (UXUI-051 a UXUI-054)

| ID | Acuerdo | Valor Definitivo |
|----|---------|------------------|
| **UXUI-051** | Perfil de usuario | Nombre + Email + Foto de Google + Config notificaciones |
| **UXUI-052** | Gestión de suscripción | Ver estado + Cancelar + ~~Cambiar plan~~ |
| **UXUI-053** | Mis Dispositivos | ✅ Listar, ver estado, desvincular |
| **UXUI-054** | Mis Reportes | ✅ Solo para servicio de 7 días |

> [!WARNING]
> **AMBIGÜEDAD AMB-04 (UXUI-052):** El documento original menciona "Cambiar plan", pero existe una restricción previa que indica que los usuarios **NO pueden cambiar su tipo de suscripción** ya que está ligada al dispositivo físico. Esta es una **inconsistencia** que se documenta pero NO se resuelve.

#### 14.8.1 Subsecciones de Cuenta

| Subsección | Contenido | Visible para |
|------------|-----------|--------------| 
| **Perfil** | Foto, nombre, email, configuración de notificaciones | Todos |
| **Mi Suscripción** | Estado, plan actual, opción de cancelar | Suscripción permanente |
| **Mis Dispositivos** | Lista de dispositivos vinculados, estado, desvincular | Todos |
| **Mis Reportes** | PDFs de diagnóstico descargables | Solo servicio 7 días |

**Regla para IA:** 
- La subsección "Mis Reportes" NO debe mostrarse a usuarios con suscripción permanente
- La opción "Cambiar plan" NO debe implementarse (ver AMB-04)

#### 14.8.2 Estructura Visual de Sección Cuenta

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        📱 SECCIÓN CUENTA                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  📷 [Foto de Google]                                            │    │
│  │  Juan Pérez                                                      │    │
│  │  juan.perez@gmail.com                                           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 🔔 Configuración de Notificaciones                          >  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 💳 Mi Suscripción                                            >  │    │
│  │    Plan: Bifásico sin paneles | Estado: Activa                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📡 Mis Dispositivos (2)                                      >  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📄 Mis Reportes (Solo servicio 7 días)                       >  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 🚪 Cerrar Sesión                                                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 14.8.3 Pantalla "Mi Suscripción"

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      📱 MI SUSCRIPCIÓN                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Plan Actual: **Bifásico sin paneles**                          │    │
│  │  Precio: $XXX MXN/mes                                           │    │
│  │  Estado: ✅ Activa                                               │    │
│  │  Próximo cobro: 15 de febrero 2026                              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  [  Cancelar Suscripción  ]  (texto rojo)                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### 14.8.4 Pantalla "Mis Dispositivos"

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      📱 MIS DISPOSITIVOS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  📡 Cuentatron-A7F3                                             │    │
│  │  Plan: Bifásico sin paneles                                     │    │
│  │  Estado: ✅ Conectado                                            │    │
│  │  Última lectura: hace 5 min                                     │    │
│  │                                              [Desvincular]      │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  [  + Vincular Nuevo Dispositivo  ]                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 14.9 Panel Admin Web (UXUI-055 a UXUI-062)

| ID | Acuerdo | Valor Definitivo |
|----|---------|------------------|
| **UXUI-055** | Plataforma | Web separada (React + Vite) |
| **UXUI-056** | Estructura | Panel centralizado (no funciones aisladas) |

#### 14.9.1 Módulos del Panel Admin MVP

| ID | Módulo | Funcionalidad |
|----|--------|---------------|
| **UXUI-057** | Aprovisionar Dispositivo | Alta de nuevo dispositivo con calibración + genera QR |
| **UXUI-058** | Gestión de Planes | Listar/editar planes disponibles |
| **UXUI-059** | Control de Suscripciones | Ver estado, activar/cancelar acceso |
| **UXUI-060** | Alertas Admin | Recordatorio conexión, dispositivo offline |
| **UXUI-061** | Generación de Reportes | Crear PDF de diagnóstico (servicio 7 días) |
| **UXUI-062** | Usuarios/Clientes | Ver lista de clientes, datos CFE, estado |

**Regla para IA:** El Panel Admin DEBE implementar todos los módulos listados como pantallas/secciones independientes.

#### 14.9.2 Datos de Calibración para Aprovisionamiento (UXUI-057)

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| Device ID (MAC) | TextInput | ✅ | Validación regex MAC |
| Plan Asignado | Select | ✅ | Carga dinámica desde API |
| Voltage CAL | NumberInput | ✅ | Factor de calibración |
| Current CAL 1-7 | NumberInput | Dinámico | Según tipo de plan (2 a 5 campos) |
| Power CAL | NumberInput | ✅ | Factor de calibración |

> [!NOTE]
> La "Llave Secreta Admin" del legacy se descarta. El panel admin tendrá su propio sistema de login.

**Resultado del flujo:** Genera QR para descarga con URL de registro.

#### 14.9.3 Flujo de Aprovisionamiento de Dispositivo

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
                        │                   │
                  (Según plan,        · Voltage CAL
                   campos de          · Current CAL (2-5)
                   corriente)         · Power CAL
```

---

### 14.10 Decisiones Globales UX (UXUI-063 a UXUI-066)

> [!IMPORTANT]
> Estas decisiones afectan el comportamiento general de la aplicación.
> Fueron confirmadas **explícitamente** por el usuario.

| ID | Decisión | Valor Confirmado | Fecha |
|----|----------|------------------|-------|
| **UXUI-063** | Expiración de sesión | **7 días** sin actividad | 2026-01-06 |
| **UXUI-064** | Modo offline | **Bloqueo total** (sin cached data) | 2026-01-06 |
| **UXUI-065** | Idioma | **Español MX** únicamente | 2026-01-06 |
| **UXUI-066** | Orientación de pantalla | **Portrait fijo** | 2026-01-06 |

**Reglas para IA:**
1. La sesión DEBE expirar después de 7 días de inactividad (no antes, no después)
2. NO implementar modo offline con datos cacheados; la app DEBE bloquear acceso sin conexión
3. NO implementar soporte multiidioma; todos los textos en español mexicano
4. NO permitir rotación a landscape; la app DEBE bloquearse en portrait

> [!NOTE]
> La decisión UXUI-064 (Bloqueo total) **difiere** del valor por defecto propuesto en la Sección 13.2.5 (datos cached con banner). **Esta sección tiene precedencia.**

---

### 14.11 Flujo de Vinculación de Dispositivo (UXUI-067 a UXUI-069)

| ID | Acuerdo | Valor Definitivo |
|----|---------|------------------|
| **UXUI-067** | Método de vinculación | Escaneo de QR code |
| **UXUI-068** | Datos CFE en vinculación | Tarifa, Fecha corte, Lecturas |
| **UXUI-069** | Ayuda visual | Modales con imágenes del recibo CFE |

#### 14.11.1 Flujo de Vinculación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    📱 FLUJO DE VINCULACIÓN                               │
└─────────────────────────────────────────────────────────────────────────┘

PASO 1              PASO 2              PASO 3              PASO 4
──────              ──────              ──────              ──────
   │                   │                   │                   │
   ▼                   ▼                   ▼                   ▼
┌─────────┐       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Escanear│──────▶│ Verificar   │────▶│ Ingresar    │────▶│ Confirmar   │
│   QR    │       │ Dispositivo │     │ Datos CFE   │     │ Vinculación │
└─────────┘       └─────────────┘     └─────────────┘     └─────────────┘
     │                  │                   │                   │
     │            ┌─────┴─────┐       ┌─────┴─────┐             │
     │            │ Validar   │       │ CAMPOS:   │        ┌────┴────┐
· Abre cámara    │ que el    │       │ · Tarifa  │        │ ¡Éxito! │
· Lee código     │ dispositivo│      │ · Fecha   │        │ Ir a    │
· Extrae ID      │ existe y   │      │ · Lecturas│        │ Dashboard│
                 │ está libre │       │ + AYUDA   │        └─────────┘
                 └───────────┘       │ VISUAL    │
                                     └───────────┘
```

#### 14.11.2 Pantalla de Escaneo QR

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      📱 VINCULAR DISPOSITIVO                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                                                                  │    │
│  │                     ┌───────────────┐                           │    │
│  │                     │               │                           │    │
│  │                     │   📷 CÁMARA   │                           │    │
│  │                     │               │                           │    │
│  │                     │  [+] Centro   │                           │    │
│  │                     │               │                           │    │
│  │                     └───────────────┘                           │    │
│  │                                                                  │    │
│  │  Escanea el código QR que viene con tu dispositivo Cuentatron  │    │
│  │                                                                  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ¿No tienes un QR? [Ingresar código manualmente]                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Regla para IA:** DEBE existir una alternativa para ingresar código manualmente en caso de que el QR no funcione.

---

### 14.12 Restricciones Operativas para Ejecución con IA

> [!CAUTION]
> Estas restricciones son **OBLIGATORIAS** para cualquier IA que ejecute la implementación de UI/UX.

#### 14.12.1 Precedencia de Documentación

| Prioridad | Sección | Descripción |
|-----------|---------|-------------|
| 1 (Alta) | **Sección 14** | Acuerdos validados con usuario humano |
| 2 (Media) | **Sección 13** | Reglas genéricas de UX/UI funcional |
| 3 (Baja) | Otros documentos | Referencias complementarias |

En caso de conflicto entre Sección 13 y Sección 14, **la Sección 14 tiene precedencia**.

#### 14.12.2 Qué PUEDE hacer la IA (Derivado de Sección 14)

| # | Acción Permitida | Condición |
|---|------------------|-----------|
| 14-OK-01 | Implementar estructura de 4 secciones | Exactamente como UXUI-001 |
| 14-OK-02 | Implementar campos de onboarding | Solo los marcados como activos |
| 14-OK-03 | Implementar tipos de alerta para APP | UXUI-034 a UXUI-042 |
| 14-OK-04 | Implementar tipos de plan MVP | Solo los 4 marcados como INCLUIDO |
| 14-OK-05 | Implementar decisiones globales | Valores confirmados de UXUI-063 a UXUI-066 |
| 14-OK-06 | Usar diagramas ASCII como referencia | Para estructura de pantallas |

#### 14.12.3 Qué NO PUEDE hacer la IA (Derivado de Sección 14)

| # | Prohibición | Razón UXUI |
|---|-------------|------------|
| 14-NO-01 | NO agregar sección "Reportes" al menú | UXUI-002 la eliminó |
| 14-NO-02 | NO crear diferencias visuales 7días vs Permanente | UXUI-005 lo prohíbe |
| 14-NO-03 | NO implementar campo teléfono WhatsApp | UXUI-018 lo eliminó |
| 14-NO-04 | NO implementar tipos trifásicos | UXUI-029 los descartó |
| 14-NO-05 | NO mostrar alertas admin en app usuario | UXUI-043, UXUI-044 |
| 14-NO-06 | NO implementar exportación de gráficas | UXUI-050 lo excluyó |
| 14-NO-07 | NO implementar modo offline con cache | UXUI-064 decidió bloqueo |
| 14-NO-08 | NO implementar multiidioma | UXUI-065 solo español MX |
| 14-NO-09 | NO permitir landscape | UXUI-066 solo portrait |

#### 14.12.4 Cuándo DEBE preguntar la IA (Derivado de Sección 14)

| # | Situación | Ejemplo |
|---|-----------|---------|
| 14-ASK-01 | Valor marcado "Por definir" | Selector periodo en gráfica Voltaje |
| 14-ASK-02 | Inconsistencia entre acuerdos | Cambiar plan vs restricción de cambio |
| 14-ASK-03 | Detalle no especificado | Contenido exacto de Config Notificaciones (UXUI-051) |

---

### 14.13 Ambigüedades Detectadas

> [!WARNING]
> Las siguientes ambigüedades fueron identificadas durante la integración.
> **NO han sido resueltas** — requieren decisión humana futura.

| ID | Ubicación | Descripción | Estado |
|----|-----------|-------------|--------|
| **AMB-01** | UXUI-046 | Selector de periodo para gráfica de Voltaje → "Por definir" | ⏳ PENDIENTE |
| **AMB-02** | UXUI-046 | Selector de periodo para gráfica de Fuga/Corriente → "Por definir" | ⏳ PENDIENTE |
| **AMB-03** | UXUI-051 | Contenido específico de "Config notificaciones" no detallado | ⏳ PENDIENTE |
| **AMB-04** | UXUI-052 | "Cambiar plan" mencionado pero existe restricción previa que lo prohíbe | ⏳ INCONSISTENCIA |

**Instrucción para IA:** Antes de implementar cualquier funcionalidad relacionada con estas ambigüedades, DEBE consultar al usuario humano.

---

### 14.14 Imágenes de Ayuda CFE (Assets Requeridos)

| Imagen | Propósito | Estado |
|--------|-----------|--------|
| `recibo-tarifa.png` | Ubicación de tipo de tarifa en recibo | Por crear |
| `recibo-fecha-corte.png` | Ubicación de fecha de corte en recibo | Por crear |
| `recibo-consumo.png` | Ubicación de consumo (kWh) en recibo | Por crear |
| `recibo-lectura-cierre.png` | Ubicación de lectura de cierre en recibo | Por crear |
| `medidor-lectura.png` | Cómo leer el medidor físico | Por crear |

> [!NOTE]
> Para UXUI-025 (Lectura Actual del Medidor) se deben usar fotos del medidor físico, NO imágenes del recibo.

---

### 14.15 Matriz de Relación: Sección 13 ↔ Sección 14

| Concepto | Sección 13 (Genérico) | Sección 14 (Validado) | Precedencia |
|----------|----------------------|----------------------|-------------|
| Menú principal | 4 secciones (Inicio, Alertas, Reportes, Cuenta) | 4 secciones (Inicio, Alertas, **Gráficas**, Cuenta) | **S14** |
| Modo offline | Datos cached con banner (default) | Bloqueo total (UXUI-064) | **S14** |
| Expiración sesión | 7 días (marcado RDH) | 7 días (confirmado UXUI-063) | Coinciden |
| Idioma | Español MX (marcado RDH) | Español MX (UXUI-065) | Coinciden |
| Orientación | Portrait fijo (marcado RDH) | Portrait fijo (UXUI-066) | Coinciden |

---

*Sección integrada el 2026-01-06*
*Origen: ACUERDOS_UXUI_MVP.md (69 acuerdos validados con usuario humano)*
*Integración realizada por: IA Antigravity*

