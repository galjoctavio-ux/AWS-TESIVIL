# PLAN MAESTRO CONSOLIDADO - CUENTATRON
## Resultado de Interrogación Socrática | 2026-01-05

> [!IMPORTANT]
> Este documento consolida toda la información extraída mediante interrogación socrática estructurada. Es la fuente de verdad para la ejecución del proyecto con IA.

---

## Control de Cambios
| Versión | Fecha       | Descripción                                              |
|---------|-------------|----------------------------------------------------------|
| 2.3     | 2026-01-05  | Integración de Decisiones Estratégicas CAME              |
| 2.2     | 2026-01-05  | Selección Tecnológica – Arquitectura Base (Preliminar)   |
| 2.1     | 2026-01-05  | Integración de Contexto Técnico del Usuario              |
| 2.0     | 2026-01-05  | Consolidación completa vía interrogación socrática       |

---

## Decisiones Estratégicas Integradas (CAME)

> [!IMPORTANT]
> Esta sección contiene las decisiones estratégicas derivadas del análisis CAME (Corregir, Afrontar, Mantener, Explotar). Estas decisiones provienen del documento `07_DECISIONES_CAME.md` y son autoritativas para la ejecución del proyecto.

### Resumen de Decisiones

| Tipo CAME | Cantidad | Enfoque |
|-----------|----------|---------|
| **Corregir** | 5 | Eliminar debilidades críticas que bloquean el MVP |
| **Afrontar** | 8 | Aceptar riesgos inherentes con planes de contingencia |
| **Mantener** | 7 | Preservar fortalezas existentes del proyecto |
| **Explotar** | 10 | Capitalizar oportunidades de mercado y técnicas |

### Decisión Crítica

**C-01 — Selección de React Native + Supabase como stack tecnológico.**

*Origen: CAME*

---

## Contexto Técnico del Usuario

> [!NOTE]
> Esta sección documenta el contexto técnico del usuario responsable del desarrollo. Esta información es **CONTEXTO**, no decisiones. Sirve como referencia para fases posteriores del proyecto.

### Perfil del Desarrollador

| Aspecto | Valor | Descripción |
|---------|-------|-------------|
| **Nivel técnico en desarrollo** | INTERMEDIO | Capacidad técnica para trabajar con herramientas de desarrollo asistido |
| **Rol en el desarrollo** | ORQUESTADOR DE IA | El usuario coordina y dirige el desarrollo mediante herramientas de IA, no programa directamente |
| **Experiencia en el dominio del problema** | AVANZADO | Conocimiento profundo del problema de consumo eléctrico, CFE, y el contexto mexicano |

### Recursos Técnicos Disponibles

| Recurso | Disponibilidad | Detalle |
|---------|----------------|---------|
| **Máquina virtual** | SÍ | AWS Ubuntu |
| **Tipo de servicios** | Gratuitos | Preferencia por servicios sin costo o tiers gratuitos |
| **Presupuesto disponible** | $0 MXN | Sin inversión monetaria directa para el MVP |
| **Infraestructura local** | PC Windows | 8 GB de RAM |

### Implicaciones para el Proyecto

> [!NOTE]
> Las siguientes observaciones son derivadas del contexto técnico documentado. No constituyen decisiones ni requerimientos.

- El rol de orquestador sugiere que las tecnologías seleccionadas podrían beneficiarse de buena documentación y soporte de herramientas de IA
- El nivel intermedio indica que tecnologías con curvas de aprendizaje moderadas podrían ser más adecuadas
- La experiencia avanzada en el dominio facilita la validación de requisitos funcionales y reglas de negocio
- Los recursos limitados (8 GB RAM local, $0 presupuesto) restringen las opciones de desarrollo local intensivo
- La VM AWS Ubuntu representa el entorno de producción disponible

### Decisiones CAME Aplicables al Contexto Técnico

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **A-01** | Afrontar | Aceptar presupuesto $0 sin margen. Contingencia: migrar datos a PostgreSQL en VM AWS si se exceden límites |
| **A-02** | Afrontar | Aceptar limitación de RAM local. Contingencia: ejecutar emulador Android en VM AWS; priorizar pruebas en dispositivo físico |
| **E-06** | Explotar | Usar Copilot/ChatGPT activamente durante desarrollo; documentar prompts efectivos |

*Origen: CAME*

---

## 1. Definición del Problema (Dolor)

### El Problema Central

| Elemento | Descripción |
|----------|-------------|
| **Dolor principal** | El usuario recibe un recibo de CFE más alto de lo esperado y **no sabe por qué** |
| **Momento del dolor** | REACTIVO — Cuando ya llegó el recibo alto (demasiado tarde) |
| **Competencia directa** | NINGUNA app en el mercado mexicano |

### Síntomas Percibidos por el Usuario

1. Sospecha de **robo de luz** por vecinos
2. Sospecha de **fugas eléctricas** en la instalación
3. **Electrodomésticos defectuosos** (refrigerador, bomba de agua)
4. **Paneles solares que no rinden** lo prometido
5. Técnicos instaladores de paneles que desaparecieron

### Lo que el Usuario Hace HOY (Sin Cuentatron)

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

### Decisiones CAME Aplicables al Problema

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **A-04** | Afrontar | Aceptar momento reactivo del dolor. No es corregible; es la naturaleza del mercado. Estrategia de marketing post-recibo CFE |
| **E-01** | Explotar | Posicionar como "única solución" en comunicación; no apresurar por competidores fantasma |
| **E-07** | Explotar | Crear variantes de copy de marketing para cada síntoma (robo, paneles, fugas, etc.) |
| **E-10** | Explotar | Posicionar Cuentatron exactamente en el 10% sin solución; mensaje: "donde el electricista no puede" |

*Origen: CAME*

### Resultado Esperado por el Usuario

| Resultado | Plazo | Detalle |
|-----------|-------|---------|
| Identificar la causa del consumo excesivo | **7 días** de monitoreo | Datos analizados por ingeniero o por la app |
| Decisión informada | Post-análisis | Cambiar refrigerador, reparar bomba, ajustar hábitos |
| Recibo de luz más bajo | Siguiente periodo de facturación | Validación tangible del valor |

### Decisiones CAME Aplicables al Diagnóstico

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **C-05** | Corregir | Definir mecanismo de diagnóstico fallback. Si a día 5 no hay anomalías claras, notificar al ingeniero para revisión manual anticipada |

*Origen: CAME*

---

## 2. Segmentos de Usuario (Priorizados)

### Ordenamiento por Volumen Esperado

| Prioridad | Segmento | Descripción | Modelo de Ingreso | Volumen Esperado |
|-----------|----------|-------------|-------------------|------------------|
| **1º** | Referido por electricista | TESIVIL instala Cuentatron por 7 días, entrega reporte, retira dispositivo | **Servicio temporal** (50% del precio del dispositivo) | ALTO (nosotros lo referimos) |
| **2º** | Usuario reactivo | Recibió recibo alto, no hay alcance de visita, compra dispositivo online | **Compra + Suscripción** | MEDIO |
| **3º** | Usuario con paneles solares | Validar si generan bien, detectar degradación, técnicos desaparecieron | **Compra + Suscripción** | MEDIO |
| **4º** | Usuario preventivo | Quiere evitar sorpresas, monitoreo proactivo | **Compra + Suscripción** | BAJO (nadie previene) |

### Características del Segmento Primario (Referido por Electricista)

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

### Decisiones CAME Aplicables a Segmentos

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **A-05** | Afrontar | Aceptar dependencia de canal de referidos. Preparar materiales para segmentos 2 y 3 desde el inicio; no depender 100% de segmento 1 |
| **E-03** | Explotar | Preparar material de capacitación para electricistas desde el inicio |

*Origen: CAME*

---

## 3. Modelo de Negocio (Dual)

### Vista General

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

### Comparación Detallada

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

### Decisiones CAME Aplicables al Modelo de Negocio

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **M-04** | Mantener | No crear apps separadas para servicio 7 días vs suscripción |
| **E-04** | Explotar | Diseñar UX que invite a la compra al final del servicio de 7 días (CTA claro en reporte) |

*Origen: CAME*

### Arquitectura de Control de Acceso

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

### Decisiones CAME Aplicables al Control de Acceso

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **M-06** | Mantener | No distribuir lógica de acceso; receptor_mqtt.py sigue siendo el gatekeeper |

*Origen: CAME*

---

## 4. Actores y Responsabilidades

### Roles del Sistema (Simplificado)

| Rol | Interfaz | Responsabilidades |
|-----|----------|-------------------|
| **Cliente Final** | App móvil Android | Registro, vincular dispositivo (QR), ver dashboard, alertas, gráficas, descargar PDF, gestionar suscripción |
| **Administrador** | Panel Admin (web) | Calibración de dispositivos, inventario, alta de dispositivos, análisis de datos, editar y generar PDF, activar/desactivar MQTT |

### Aclaración sobre el Técnico Instalador

| Elemento | Decisión |
|----------|----------|
| Rol separado | ❌ NO necesario |
| Interfaz especial | ❌ NO necesaria |
| Función real | Ayuda al cliente a darse de alta en la app y escanear QR |
| Acceso al sistema | Ninguno especial |

### Decisiones CAME Aplicables al Técnico

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **M-07** | Mantener | El técnico solo ayuda al cliente; no crear módulo de técnico en MVP |

*Origen: CAME*

### Funciones del Panel Admin

| Módulo | Funciones |
|--------|-----------|
| **Inventario** | Alta de dispositivos nuevos, asignar serial/QR, estado (disponible/asignado/retirado) |
| **Calibración** | Configurar factor de calibración por dispositivo |
| **Usuarios** | Ver clientes, estado de suscripción, historial |
| **Análisis** | Ver datos crudos de InfluxDB, gráficas, anomalías detectadas (EWMA) |
| **Reportes** | Editar observaciones de ingeniero, generar PDF |
| **Control MQTT** | Activar/congelar flujo de datos por dispositivo |

### Decisiones CAME Aplicables al Panel Admin

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **E-09** | Explotar | Diseñar UX del panel para usuarios no técnicos; incluir tooltips y guías |

*Origen: CAME*

---

## 5. Flujos Críticos

### Ciclo de Vida del Servicio de 7 Días

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

### Decisiones CAME Aplicables al Flujo de 7 Días

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **M-05** | Mantener | Usar flujo documentado como guía de implementación; no improvisar |
| **A-06** | Afrontar | Aceptar intervención manual en PDF. Es parte del valor agregado del servicio de 7 días; no automatizar en MVP |

*Origen: CAME*

### Flujo del Panel Admin (Generación de Reporte)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PANEL ADMIN - INGENIERO                          │
└─────────────────────────────────────────────────────────────────────────┘

     ┌──────────────────────────────────────────────────────────────────┐
     │  VISTA DE USUARIO (SERVICIO 7 DÍAS)                              │
     │                                                                   │
     │  · Gráficas de consumo del periodo (7 días)                       │
     │  · Datos crudos de InfluxDB                                       │
     │  · Detección de anomalías (EWMA) pre-calculadas                   │
     │  · Campo editable: "Observaciones del Ingeniero"                  │
     │  · Botón: [Generar PDF Final]                                     │
     └──────────────────────────────────────────────────────────────────┘

     Flujo:
     1. Sistema genera datos automáticos (gráficas, anomalías)
     2. Ingeniero revisa y agrega observaciones:
        - "Se detecta que el refrigerador tiene ciclos muy amplios"
        - "La bomba dura más tiempo del normal"
        - "Posible fuga a tierra detectada a las 3am"
     3. Ingeniero presiona [Generar PDF]
     4. PDF se guarda y se notifica al cliente
     5. MQTT se congela (servicio finalizado)
```

---

## 6. Arquitectura de la Aplicación

> [!NOTE]
> **Anotación de Contexto Técnico:** El usuario opera como orquestador de IA con nivel técnico intermedio. Las decisiones arquitectónicas podrían considerar frameworks con buena documentación y soporte de herramientas de IA. La VM AWS Ubuntu es el entorno de producción disponible; el presupuesto es $0 MXN, lo que orienta hacia servicios gratuitos o free tiers.

### Decisión Tecnológica (CAME C-01)

> [!IMPORTANT]
> **Decisión CAME C-01:** Se selecciona **Opción A (React Native + Supabase)** como stack tecnológico definitivo.
> 
> **Justificación:** Responde a R-04 (rol orquestador sin programación directa), R-14 (Dart menor soporte IA), R-13 (Kotlin muy complejo).
> 
> **Acción:** Descartar Opciones B y C. Iniciar desarrollo con React Native + Expo + Supabase.

*Origen: CAME*

### Decisiones Clave Confirmadas

| Decisión | Detalle |
|----------|---------|
| **Una sola app** | Misma app para servicio 7 días y suscripción permanente |
| **Control de acceso** | Vía receptor MQTT: si no hay suscripción activa, se bloquea InfluxDB |
| **Modo temporal** | El servicio de 7 días es un "estado" del usuario, no una app diferente |
| **Reporte PDF** | Generado automáticamente, revisado/editado por ingeniero desde panel admin |
| **Acceso al reporte** | PDF descargable y visible en la app (historial) |
| **Actualización de datos** | Cada ~30 minutos (ventana configurable para optimizar recursos) |
| **Stack tecnológico** | React Native + Expo + Supabase (CAME C-01) |

### Decisiones CAME Aplicables a la Frecuencia de Datos

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **A-07** | Afrontar | Aceptar frecuencia de 30 minutos. Documentar limitación al cliente; para diagnósticos críticos, reducir ventana temporalmente |

*Origen: CAME*

### Estructura de la Aplicación

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

---

## 7. Límites del MVP

> [!NOTE]
> **Anotación de Contexto Técnico:** El presupuesto de $0 MXN y la preferencia por servicios gratuitos refuerzan la decisión de mantener un MVP enfocado. La PC local con 8 GB de RAM limita las posibilidades de emulación intensiva o compilación pesada local. El rol de orquestador sugiere priorizar soluciones que minimicen configuración manual compleja.

### Alcance Confirmado

| Elemento | Decisión | Justificación |
|----------|----------|---------------|
| **Modelos de negocio** | Ambos desde día 1 | Ya hay código avanzado, scripts funcionando |
| **Panel Admin** | Interfaz funcional completa | Se delegará a otros usuarios, debe ser amigable |
| **App móvil** | Android completa | Core del producto |
| **iOS** | ❌ Excluido de MVP | Pospuesto para V2 |

### Decisiones CAME Aplicables al Alcance

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **M-03** | Mantener | Resistir tentación de sobre-ingeniería; rechazar features que agreguen complejidad innecesaria |
| **E-08** | Explotar | Escribir código pensando en iOS desde el inicio; evitar dependencias Android-only |

*Origen: CAME*

### Proyección de Escala

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

### Implicaciones de Escala para Arquitectura

| Factor | Impacto | Decisión |
|--------|---------|----------|
| **Infraestructura** | No necesita autoescalado | AWS VM actual es suficiente |
| **Base de datos** | No necesita sharding | Supabase/PostgreSQL simple |
| **InfluxDB** | Retención estándar | No necesita optimización agresiva |
| **MQTT** | Broker simple | Mosquitto actual es suficiente |
| **Complejidad** | Baja | Evitar sobre-ingeniería |

---

## 8. Dependencias y Restricciones

> [!NOTE]
> **Anotación de Contexto Técnico:** El usuario dispone de una VM AWS Ubuntu como infraestructura principal. Los recursos locales (PC Windows con 8 GB RAM) representan una restricción para desarrollo local intensivo. El presupuesto de $0 MXN indica que las dependencias de pago (como Stripe) podrían requerir uso de tiers gratuitos o alternativas sin costo.

### Dependencias Externas

| Dependencia | Estado | Responsable |
|-------------|--------|-------------|
| Diseños UI/UX | Sin bloqueo | Usuario (interno) |
| APIs de terceros | Sin bloqueo | Usuario (interno) |
| Play Store | Sin bloqueo | Usuario (interno) |
| Stripe | Sin bloqueo | Usuario (interno) |

> [!TIP]
> **Sin bloqueos externos.** El usuario controla todos los recursos necesarios.

### Timeline con Hitos (CAME C-03)

> [!IMPORTANT]
> **Decisión CAME C-03:** Crear cronograma con hitos parciales.
> 
> **Hitos definidos:**
> - **S1-S2:** Setup (configuración inicial)
> - **S3-S4:** App básica
> - **S5-S6:** Panel Admin
> - **S7-S8:** QA

*Origen: CAME*

| Aspecto | Valor |
|---------|-------|
| Timeline base | 6-8 semanas (4 hitos de 2 semanas cada uno) |
| Optimización con IA | Se espera reducción significativa |
| Fecha límite dura | No definida |
| Flexibilidad | Aceptada (CAME A-03) |

### Decisiones CAME Aplicables al Timeline

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **C-03** | Corregir | Definir 4 hitos: Setup (S1-2), App básica (S3-4), Panel Admin (S5-6), QA (S7-8) |
| **A-03** | Afrontar | Revisar progreso cada 2 semanas; ajustar alcance si hay drift significativo |

*Origen: CAME*

---

## 9. Definición de "Hecho" (Definition of Done)

### Criterios de Éxito del MVP

| Criterio | Mínimo Aceptable |
|----------|------------------|
| App Android funcional | ✅ Publicada en Play Store |
| Servicio 7 días operativo | ✅ Al menos 1 cliente atendido |
| Compra + suscripción operativo | ✅ Flujo completo funcional |
| Panel Admin funcional | ✅ Ingeniero puede generar PDFs |
| Dispositivo vinculable | ✅ QR → App → Datos en InfluxDB |

### Decisiones CAME Aplicables a la Validación

| Decisión | Tipo | Aplicación |
|----------|------|------------|
| **A-08** | Afrontar | Aceptar necesidad de cliente piloto. Usar dispositivo en domicilio propio o de conocido para validación interna |

*Origen: CAME*

### Qué NO es el MVP

- ❌ Soporte iOS
- ❌ Dashboard web para clientes (solo app)
- ❌ Alertas por WhatsApp/Telegram (reemplazadas por push)
- ❌ Bot con IA Gemini (nice-to-have)
- ❌ Miles de dispositivos simultáneos

---

## 10. Selección Tecnológica – Arquitectura Base (DECISIÓN FINAL)

> [!IMPORTANT]
> **Decisión CAME C-01:** Se ha seleccionado **Opción A: React Native + Supabase (Expo Managed)** como arquitectura definitiva del proyecto.
> 
> Las Opciones B (Flutter + Firebase) y C (Kotlin + Python Self-Hosted) quedan **DESCARTADAS**.

### 10.1 Supuestos Considerados

#### Información del Plan Maestro Tomada en Cuenta

| Aspecto | Valor Considerado | Origen |
|---------|-------------------|--------|
| Rol del desarrollador | Orquestador de IA | Sección: Perfil del Desarrollador |
| Nivel técnico | Intermedio | Sección: Perfil del Desarrollador |
| Experiencia en dominio | Avanzado | Sección: Perfil del Desarrollador |
| Infraestructura de producción | AWS VM Ubuntu | Sección: Recursos Técnicos Disponibles |
| Presupuesto | $0 MXN | Sección: Recursos Técnicos Disponibles |
| Hardware local | PC Windows 8 GB RAM | Sección: Recursos Técnicos Disponibles |
| Preferencia de servicios | Gratuitos / Free tier | Sección: Recursos Técnicos Disponibles |
| Plataforma objetivo MVP | Android únicamente | Sección: Límites del MVP |
| Escala esperada | <100 dispositivos (año 1) | Sección: Proyección de Escala |
| Componentes existentes | InfluxDB, Mosquitto MQTT, Scripts Python | Sección: Arquitectura de Control de Acceso |

#### Limitaciones Técnicas Identificadas

| Limitación | Impacto Potencial |
|------------|-------------------|
| RAM local limitada (8 GB) | Emuladores Android pueden ser lentos; compilaciones pesadas podrían requerir uso de VM |
| Presupuesto $0 | Descarta servicios de pago; limita a free tiers o soluciones auto-hospedadas |
| Sin experiencia directa en programación | Tecnologías con buena documentación y soporte de IA son preferibles |
| Solo Android en MVP | Simplifica la decisión; iOS no es factor de decisión inmediato |
| Código legacy en Python | La integración con scripts existentes podría requerir API intermedia |

---

### 10.2 Arquitectura Seleccionada: React Native + Supabase (Expo Managed)

> [!IMPORTANT]
> **DECISIÓN CAME C-01:** Esta es la arquitectura definitiva del proyecto.

**Descripción General**

Arquitectura basada en React Native con Expo como framework de desarrollo, utilizando Supabase como Backend-as-a-Service (BaaS). El flujo de datos mantiene la infraestructura existente (MQTT → InfluxDB) y agrega una capa de API para la app móvil.

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

*Origen: CAME C-01*

**Tecnologías Definitivas**

| Componente | Tecnología | Costo |
|------------|------------|-------|
| App móvil | React Native + Expo | Gratuito |
| UI Components | React Native Paper / NativeBase | Gratuito |
| Backend/Auth/DB | Supabase (free tier) | Gratuito hasta 500MB |
| Panel Admin | React + Vite | Gratuito |
| Hosting Panel | AWS VM existente | Sin costo adicional |
| Push notifications | Expo Push + FCM | Gratuito |

**Ventajas Confirmadas**

- Expo permite desarrollo sin configurar Android Studio manualmente
- Un solo lenguaje (JavaScript/TypeScript) para app y panel admin
- Supabase ofrece autenticación, base de datos y realtime incluidos
- Excelente documentación y amplio soporte de herramientas de IA (Copilot, ChatGPT)
- OTA updates permiten actualizar sin pasar por Play Store
- Curva de aprendizaje moderada para orquestadores de IA

**Riesgos Identificados con Mitigación (CAME)**

| Riesgo | Mitigación CAME |
|--------|-----------------|
| Free tier de Supabase insuficiente | C-02: Configurar alertas al 70% del límite (350MB de 500MB). A-01: Migrar a PostgreSQL en VM si se excede |
| Dependencia de servicios externos | M-02: Mantener VM AWS como respaldo disponible |
| Integración con InfluxDB existente | M-01: Crear API puente ligera; no reescribir receptor_mqtt.py |

---

### 10.3 Monitoreo de Free Tier (CAME C-02)

> [!IMPORTANT]
> **Decisión CAME C-02:** Establecer monitoreo de límites de free tier.
> 
> **Acción:** Configurar alertas en Supabase al 70% del límite (350MB de 500MB).

*Origen: CAME*

---

### 10.4 Opciones Descartadas

#### ~~Opción B: Flutter + Firebase~~ (DESCARTADA)

**Razón de descarte (CAME):** R-14 (Dart menor soporte IA), curva de aprendizaje alta para orquestador.

#### ~~Opción C: Kotlin Nativo + Backend Python~~ (DESCARTADA)

**Razón de descarte (CAME):** R-13 (Kotlin muy complejo), R-04 (rol orquestador sin programación directa), nivel de complejidad muy alto (5/5).

---

## 11. Infraestructura y Respaldo (CAME)

### Respaldo de VM AWS (CAME C-04)

> [!IMPORTANT]
> **Decisión CAME C-04:** Documentar procedimiento de respaldo de VM.
> 
> **Acción:** Crear script de backup semanal de VM AWS + exportación de InfluxDB.

*Origen: CAME*

### Decisiones de Infraestructura Consolidadas

| Decisión | Tipo | Descripción |
|----------|------|-------------|
| **C-04** | Corregir | Script de backup semanal de VM AWS + exportación de InfluxDB |
| **M-02** | Mantener | Usar VM AWS actual; no migrar a servicios nuevos innecesariamente |
| **A-01** | Afrontar | Si se exceden límites de Supabase: migrar datos a PostgreSQL en VM AWS |

*Origen: CAME*

---

## 12. Código Legacy (CAME)

### Preservación de Scripts Python (CAME M-01)

> [!IMPORTANT]
> **Decisión CAME M-01:** Mantener código legacy Python funcional.
> 
> **Acción:** No reescribir receptor_mqtt.py; crear API puente ligera entre scripts e interfaz.

*Origen: CAME*

| Componente Legacy | Acción CAME |
|-------------------|-------------|
| receptor_mqtt.py | Mantener (M-01, M-06) |
| Scripts de análisis | Mantener; integrar vía API |
| Conexión InfluxDB | Mantener; no migrar |

---

## 13. Próximos Pasos

> [!NOTE]
> **Anotación de Contexto Técnico:** La selección del stack tecnológico está **CERRADA** (CAME C-01: React Native + Supabase). El siguiente paso es iniciar diseño de wireframes y schema de base de datos.

### Para Iniciar Ejecución con IA

1. **~~Selección de stack tecnológico~~** — ✅ React Native + Expo + Supabase (CAME C-01)
2. **Diseño de base de datos** — Schema Supabase para usuarios, dispositivos, suscripciones
3. **Diseño de wireframes** — Pantallas principales de la app
4. **Prototipo de panel admin** — Interfaz web funcional
5. **Integración con código legacy** — API puente ligera (CAME M-01)
6. **Configurar monitoreo de free tier** — Alertas Supabase al 70% (CAME C-02)
7. **Crear script de respaldo** — Backup semanal VM + InfluxDB (CAME C-04)

### Decisiones CAME para Explotación Activa

| Decisión | Acción Inmediata |
|----------|------------------|
| **E-02** | Validar todas las reglas de negocio internamente antes de desarrollar |
| **E-05** | Planificar releases frecuentes post-lanzamiento via OTA updates |
| **E-06** | Usar Copilot/ChatGPT activamente; documentar prompts efectivos |

*Origen: CAME*

### Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| [01_IDEAS_CONSOLIDADO.md](./01_IDEAS_CONSOLIDADO.md) | Ideas categorizadas |
| [02_MASTER_PLAN.md](./02_MASTER_PLAN.md) | Plan original (pre-interrogación) |
| [03_ESTRATEGIA_MVP_PROPUESTA.md](./03_ESTRATEGIA_MVP_PROPUESTA.md) | Estrategia por componente |
| [04_ESTRATEGIA_MVP_FINAL.md](./04_ESTRATEGIA_MVP_FINAL.md) | Estrategia MoSCoW |
| [06_RIESGOS_Y_OPORTUNIDADES.md](./06_RIESGOS_Y_OPORTUNIDADES.md) | Análisis de riesgos y oportunidades |
| [07_DECISIONES_CAME.md](./07_DECISIONES_CAME.md) | Decisiones estratégicas CAME |
| `docs_analysis/modules/*.md` | Análisis técnico de módulos legacy |

---

## 14. Glosario

| Término | Definición |
|---------|------------|
| **Servicio 7 días** | Modelo de negocio donde TESIVIL presta el dispositivo por 7 días y entrega un reporte |
| **Compra + Suscripción** | Modelo donde el cliente compra el dispositivo y paga suscripción mensual |
| **EWMA** | Exponential Weighted Moving Average, algoritmo de detección de anomalías |
| **CFE** | Comisión Federal de Electricidad (empresa eléctrica de México) |
| **Modo temporal** | Estado del usuario que tiene servicio de 7 días activo |
| **Panel Admin** | Interfaz web para administradores/ingenieros de TESIVIL |
| **Congelar MQTT** | Bloquear el flujo de datos del dispositivo hacia InfluxDB |
| **CAME** | Corregir, Afrontar, Mantener, Explotar — Metodología de decisiones estratégicas |
| **Free tier** | Nivel gratuito de servicios cloud con límites de uso |
| **OTA updates** | Over-The-Air updates — Actualizaciones de app sin pasar por tienda |

---

*Documento generado mediante interrogación socrática estructurada.*
*Fecha de consolidación: 2026-01-05*
*Última actualización: 2026-01-05 (Integración CAME)*
*Este documento es la fuente de verdad para la ejecución del proyecto con IA.*
*Decisiones estratégicas integradas desde: 07_DECISIONES_CAME.md*
