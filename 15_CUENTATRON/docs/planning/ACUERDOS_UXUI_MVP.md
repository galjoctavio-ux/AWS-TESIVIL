# ACUERDOS UX/UI - CUENTATRON MVP

> [!IMPORTANT]
> Este documento registra **todos los acuerdos explícitos** alcanzados durante la sesión de definición UX/UI.
> Cada acuerdo tiene un identificador único y fecha de aprobación.
> 
> **Fecha de inicio:** 2026-01-05
> **Estado:** ✅ COMPLETO (69 acuerdos)

---

## Índice de Acuerdos

| Rango | Sección |
|-------|---------|
| UXUI-001 a UXUI-005 | Estructura General |
| UXUI-006 a UXUI-013 | Pantalla Inicio (Dashboard) |
| UXUI-014 a UXUI-019 | Onboarding - Conceptos |
| UXUI-020 a UXUI-028 | Onboarding - Campos del Formulario |
| UXUI-029 a UXUI-030 | Tipos de Plan MVP |
| UXUI-031 a UXUI-044 | Alertas (UI + Tipos) |
| UXUI-045 a UXUI-050 | Gráficas |
| UXUI-051 a UXUI-054 | Cuenta |
| UXUI-055 a UXUI-062 | Panel Admin |
| UXUI-063 a UXUI-066 | Decisiones Globales RDH |
| UXUI-067 a UXUI-069 | Vinculación de Dispositivo |

---

## 1. Estructura General de la Aplicación

| ID | Acuerdo | Decisión | Fecha |
|----|---------|----------|-------|
| **UXUI-001** | Menú principal (Bottom Navigation) | **Inicio, Alertas, Gráficas, Cuenta** (4 secciones) | 2026-01-05 |
| **UXUI-002** | Sección "Reportes" | ❌ **ELIMINADA** - Los reportes PDF no son permanentes; las gráficas son el valor central | 2026-01-05 |
| **UXUI-003** | Nueva sección "Gráficas" | ✅ Contendrá: picos de voltaje, consumo por hora, y todas las gráficas en general | 2026-01-05 |
| **UXUI-004** | Panel Admin | ✅ **Web separada**, independiente de la app móvil | 2026-01-05 |
| **UXUI-005** | Diferenciación visual 7 días vs Permanente | ❌ **No habrá diferencia visual**, solo diferencia de acceso a funcionalidades | 2026-01-05 |

### Diagrama del Menú Principal

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

---

## 2. Pantalla INICIO (Dashboard)

| ID | Acuerdo | Decisión | Fecha |
|----|---------|----------|-------|
| **UXUI-006** | Consumo actual (kWh) | ✅ Permanece en Inicio | 2026-01-05 |
| **UXUI-007** | Estado del dispositivo | ✅ Permanece en Inicio | 2026-01-05 |
| **UXUI-008** | Última alerta | ✅ Permanece en Inicio | 2026-01-05 |
| **UXUI-009** | Mini-gráfica del día | ❌ **Se mueve a sección Gráficas** (no en Inicio) | 2026-01-05 |
| **UXUI-010** | Estimación de costo CFE | ✅ Permanece, **ampliada** con más información | 2026-01-05 |
| **UXUI-011** | Fecha de corte CFE | ✅ Nuevo elemento en Inicio | 2026-01-06 |
| **UXUI-012** | kWh bimestre anterior | ✅ Consumo del bimestre inmediato anterior | 2026-01-06 |
| **UXUI-013** | Predicción de recibo | ✅ Estimado en **kWh** y en **pesos mexicanos (MXN)** | 2026-01-06 |

### Estructura de Pantalla Inicio

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

## 3. Flujo de Onboarding

| ID | Acuerdo | Decisión | Fecha |
|----|---------|----------|-------|
| **UXUI-014** | Ubicación de reportes PDF | Sección **Cuenta** → Subsección "Mis reportes" (solo servicio 7 días) | 2026-01-06 |
| **UXUI-015** | Fecha de corte CFE | Usuario la **ingresa manualmente** durante el **Onboarding** | 2026-01-06 |
| **UXUI-016** | Ayuda visual CFE | Modales con icono "?" mostrando imagen del recibo con zona marcada | 2026-01-06 |
| **UXUI-017** | Autenticación primaria | ✅ **Google Auth** - nombre y correo se obtienen automáticamente | 2026-01-06 |
| **UXUI-017b** | Autenticación alternativa | ✅ **Login tradicional** - Email + código de 6 dígitos para verificar | 2026-01-06 |
| **UXUI-018** | Campo Teléfono WhatsApp | ❌ **ELIMINADO** - ya no es necesario (no hay alertas WhatsApp) | 2026-01-06 |
| **UXUI-019** | Tipo de Servicio vs Tipo de Tarifa | Son **DOS campos diferentes**: Tipo de Servicio ligado a compra del dispositivo; Tipo de Tarifa CFE es campo separado | 2026-01-06 |

> [!NOTE]
> **Regla de autenticación:** Si el usuario usa Google Auth, el campo "Nombre" no aparece porque Google provee esa información. Si usa login tradicional, debe ingresar nombre manualmente.

### Campos del Formulario de Onboarding (Actualizados)

| ID | Campo | Tipo | Obligatorio | Ayuda Visual | Origen |
|----|-------|------|-------------|--------------|--------|
| **UXUI-020** | Nombre Completo | — | — | — | ❌ **ELIMINADO** - se obtiene de Google Auth |
| **UXUI-021** | Correo Electrónico | — | — | — | ❌ **ELIMINADO** - se obtiene de Google Auth |
| **UXUI-022** | Teléfono WhatsApp | — | — | — | ❌ **ELIMINADO** - ya no necesario |
| **UXUI-023** | Tipo de Tarifa CFE | Select/Dropdown | ✅ SÍ | ✅ Modal con imagen | Opciones: 01, 01A, 01B, PDBT, DAC |
| **UXUI-024** | Última Fecha de Corte | DatePicker | ✅ SÍ | ✅ Modal con imagen | Se extrae día de corte + ciclo bimestral |
| **UXUI-025** | Lectura Actual del Medidor (kWh) | NumberInput | ✅ SÍ | ✅ Modal con imagen del medidor físico | — |
| **UXUI-026** | Consumo Último Recibo (kWh) | NumberInput | ✅ SÍ | ✅ Modal con imagen | — |
| **UXUI-027** | Lectura Cierre Periodo Anterior (kWh) | NumberInput | ✅ SÍ | ✅ Modal con imagen | — |
| **UXUI-028** | Tipo de Servicio Eléctrico | — | — | — | ❌ **NO es campo de usuario** - ligado a la compra del dispositivo |

### Opciones de Tipo de Tarifa CFE

| Código | Nombre |
|--------|--------|
| 01 | Tarifa 01 (Residencial básica) |
| 01A | Tarifa 01A (Consumo bajo) |
| 01B | Tarifa 01B (Consumo medio) |
| PDBT | PDBT (Pequeña demanda baja tensión) |
| DAC | DAC (Doméstico de Alto Consumo) |

### Flujo de Onboarding (Actualizado)

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

## 4. Hallazgos del Código Legacy

> [!NOTE]
> Esta sección documenta patrones de UI/UX extraídos del análisis del código existente en `legacy_source/`.
> Sirve como referencia para decisiones de diseño de la nueva app.

### 4.1 Tipos de Plan/Servicio (VALIDADO)

> [!IMPORTANT]
> **Decisión del usuario:** Trifásicos DESCARTADOS para MVP.

| Tipo de Plan | Campos de Corriente | Estado MVP |
|--------------|---------------------|------------|
| **Monofásico** | 2 sensores | ✅ INCLUIDO |
| **Monofásico (con paneles)** | 3 sensores | ✅ INCLUIDO |
| **Bifásico (sin paneles)** | 3 sensores | ✅ INCLUIDO |
| **Bifásico (con paneles)** | 5 sensores | ✅ INCLUIDO |
| ~~Trifásico (sin paneles)~~ | 4 sensores | ❌ DESCARTADO MVP |
| ~~Trifásico (con paneles)~~ | 7 sensores | ❌ DESCARTADO MVP |

**ID Acuerdo: UXUI-029** — Solo monofásico y bifásico (con/sin paneles) en MVP.

### 4.2 Pantallas Legacy Identificadas

| Archivo | Propósito | Elementos Clave |
|---------|-----------|-----------------|
| `admin.html` | Aprovisionar dispositivo | Device ID (MAC), Plan, Calibración, QR |
| `registro.html` | Activar dispositivo (usuario) | Datos personales, datos CFE, Turnstile |
| `dashboard.html` | Panel de usuario | Lista de dispositivos, estado, cancelar suscripción |
| `mi-cuenta.html` | Gestión de cuenta | Login por enlace mágico, perfil, dispositivos |
| `bienvenido.html` | Post-registro | Confirmación de activación |

### 4.3 Patrones de UI Legacy a Reutilizar

| Patrón | Descripción | Archivo Origen |
|--------|-------------|----------------|
| ~~Login por enlace mágico~~ | ❌ REEMPLAZADO por Google Auth + código 6 dígitos | — |
| **Google Auth** | ✅ Login con Google (obtiene nombre y email automáticamente) | NUEVO |
| **Login tradicional** | ✅ Email + código de 6 dígitos para verificar correo | NUEVO |
| **Modales de ayuda visual** | ✅ Icono "?" abre modal con imagen del recibo CFE | `registro.html` |
| **Estados de carga** | ✅ "Verificando...", "Cargando...", "Procesando..." | Todos |
| **Template de tarjeta de dispositivo** | ✅ Muestra ID, Plan, Estado, Precio, Acción | `dashboard.html` |
| **Estado vacío** | ✅ Mensaje cuando no hay dispositivos + CTA | `dashboard.html` |
| **Validación en tiempo real** | ✅ Email, MAC Address (sin teléfono) | `registro.html`, `admin.html` |

### 4.4 Datos de Calibración (Solo Panel Admin)

El panel admin requiere estos campos para aprovisionar un dispositivo:

| Campo | Tipo | Obligatorio | Notas |
|-------|------|-------------|-------|
| Device ID (MAC) | TextInput | ✅ | Validación regex MAC |
| Plan Asignado | Select | ✅ | Carga dinámica desde API |
| Voltage CAL | NumberInput | ✅ | Factor de calibración |
| Current CAL 1-7 | NumberInput | Dinámico | Según tipo de plan |
| Power CAL | NumberInput | ✅ | Factor de calibración |

> [!NOTE]
> La "Llave Secreta Admin" del legacy se descarta. El panel admin tendrá su propio sistema de login.

**Resultado:** Genera QR para descarga con URL de registro.

### 4.5 Imágenes de Ayuda CFE (Assets Existentes)

| Imagen | Propósito |
|--------|-----------|
| `recibo-tarifa.png` | Ubicación de tipo de tarifa en recibo |
| `recibo-fecha-corte.png` | Ubicación de fecha de corte en recibo |
| `recibo-consumo.png` | Ubicación de consumo (kWh) en recibo |
| `recibo-lectura-cierre.png` | Ubicación de lectura de cierre en recibo |

**Nota del usuario:** Para "Lectura Actual del Medidor" se usarán fotos del medidor físico, no imágenes del recibo.

---

## 5. Sección Alertas

### 5.1 Acuerdos de UI para Alertas

| ID | Acuerdo | Decisión | Fecha |
|----|---------|----------|-------|
| **UXUI-031** | Estructura de cada alerta en lista | Título + Descripción breve + Hora | 2026-01-06 |
| **UXUI-032** | Filtros en lista de alertas | Filtro por tipo (consumo, pico, voltaje, etc.) | 2026-01-06 |
| **UXUI-033** | Acción al tocar alerta | Abre **modal** con detalle completo + gráfica si aplica | 2026-01-06 |

### 5.2 Tipos de Alerta (VALIDADOS)

> [!IMPORTANT]
> **Validación del usuario:** 2026-01-06
> - Alertas diarias 1-3: ✅ Incluidas en app
> - Alerta 4 (Recordatorio Conexión): Solo Panel Admin
> - Alertas de Calidad: ✅ Todas incluidas

#### Alertas Diarias para Usuario

| ID | Tipo | Descripción | Frecuencia | Estado MVP |
|----|------|-------------|------------|------------|
| **UXUI-034** | Reporte Diario | Consumo de ayer + acumulado del periodo + proyección | Diaria | ✅ APP |
| **UXUI-035** | Aviso Corte 3 Días | Recordatorio que faltan 3 días para fecha de corte CFE | Evento | ✅ APP |
| **UXUI-036** | Día de Corte | Resumen final del periodo: kWh + costo estimado | Evento | ✅ APP |

#### Alertas de Calidad para Usuario

| ID | Tipo | Descripción | Frecuencia | Estado MVP |
|----|------|-------------|------------|------------|
| **UXUI-037** | Picos de Voltaje Alto | Detectados picos sobre umbral configurable | Inmediata | ✅ APP + Gráfica |
| **UXUI-038** | Voltaje Bajo | Detectado voltaje bajo umbral configurable | Inmediata | ✅ APP + Gráfica |

> [!IMPORTANT]
> Los valores de umbral (ej. 139.7V alto, 114.3V bajo) **NO se hardcodean**. Deben ser configurables desde el Panel Admin.
| **UXUI-039** | Fuga de Corriente | Posible fuga detectada | Inmediata | ✅ APP + Gráfica |
| **UXUI-040** | Consumo Fantasma | Consumo inusual a hora específica | Inmediata | ✅ APP + Gráfica |
| **UXUI-041** | Brinco de Escalón | Ha superado umbral de tarifa CFE | Evento | ✅ APP |
| **UXUI-042** | Felicitación Conexión | Primera medición recibida del dispositivo | Única | ✅ APP |
| **UXUI-043** | Recordatorio Conexión | Cliente compró Cuentatron, escaneó QR pero no hay datos en InfluxDB (no ha instalado) | Diaria | ✅ APP |

#### Alertas Solo Panel Admin

| ID | Tipo | Descripción | Frecuencia | Estado MVP |
|----|------|-------------|------------|------------|
| **UXUI-044** | Dispositivo Offline | Dispositivo sin reportar datos | Inmediata (cCuando un dispositivo lleve al menos 1 hora sin reportar datos) | ❌ Solo ADMIN |

### 5.3 Estructura Visual de Lista de Alertas

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
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 🗓️ Recordatorio de Corte                                        │    │
│  │ Tu fecha de corte es el 15 de febrero                          │    │
│  │                                            Ayer 8:00 AM         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.4 Modal de Detalle de Alerta

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

## 6. Sección Gráficas

### 6.1 Acuerdos de UI para Gráficas

| ID | Acuerdo | Decisión | Fecha |
|----|---------|----------|-------|
| **UXUI-045** | Gráficas de Consumo | **Unificadas** con selector de periodo | 2026-01-06 |
| **UXUI-046** | Selector de periodo | Hora, Día, Semana, Mes, Bimestre, **Periodo CFE** | 2026-01-06 |
| **UXUI-047** | Gráfica de Voltaje | ✅ Incluida | 2026-01-06 |
| **UXUI-048** | Gráfica de Fuga/Corriente | ✅ Incluida | 2026-01-06 |
| **UXUI-049** | Navegación entre gráficas | **Vistas independientes** (no scroll vertical) | 2026-01-06 |
| **UXUI-050** | Exportar gráficas | ❌ No incluido en MVP | 2026-01-06 |

### 6.2 Tipos de Gráficas en MVP

| Gráfica | Descripción | Selector Temporal |
|---------|-------------|-------------------|
| **Consumo** | Consumo eléctrico en kWh | ✅ Hora / Día / Semana / Mes / Bimestre |
| **Voltaje** | Nivel de voltaje (V) con umbrales visuales | ✅ Por definir |
| **Fuga/Corriente** | Corriente de fuga detectada (A) | ✅ Por definir |

### 6.3 Estructura de Navegación de Gráficas

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
│  │                                                                  │    │
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
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.4 Vista de Gráfica de Voltaje

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

## 7. Sección Cuenta

### 7.1 Acuerdos de UI para Cuenta

| ID | Acuerdo | Decisión | Fecha |
|----|---------|----------|-------|
| **UXUI-051** | Perfil de usuario | Nombre + Email + Foto de Google + Config notificaciones | 2026-01-06 |
| **UXUI-052** | Gestión de suscripción | Ver estado + Cancelar + Cambiar plan | 2026-01-06 |
| **UXUI-053** | Mis Dispositivos | ✅ Sí (listar, ver estado, desvincular) | 2026-01-06 |
| **UXUI-054** | Mis Reportes | ✅ Solo para servicio de 7 días | 2026-01-06 |

### 7.2 Subsecciones de Cuenta

| Subsección | Contenido | Visible para |
|------------|-----------|--------------|
| **Perfil** | Foto, nombre, email, configuración de notificaciones | Todos |
| **Mi Suscripción** | Estado, plan actual, opción de cancelar | Suscripción permanente |

> [!WARNING]
> Los usuarios **NO pueden cambiar su tipo de suscripción** ya que está ligada al dispositivo físico. Si desean cambiar de plan, deben cancelar y adquirir un nuevo dispositivo con el plan deseado.
| **Mis Dispositivos** | Lista de dispositivos vinculados, estado, desvincular | Todos |
| **Mis Reportes** | PDFs de diagnóstico descargables | Solo servicio 7 días |

### 7.3 Estructura Visual de Sección Cuenta

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

### 7.4 Pantalla "Mi Suscripción"

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

### 7.5 Pantalla "Mis Dispositivos"

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

## 8. Panel Admin (Web)

### 8.1 Acuerdos de UI para Panel Admin

| ID | Acuerdo | Decisión | Fecha |
|----|---------|----------|-------|
| **UXUI-055** | Plataforma | Web separada (React + Vite) | 2026-01-06 |
| **UXUI-056** | Estructura | Panel centralizado (no funciones aisladas) | 2026-01-06 |

### 8.2 Módulos del Panel Admin MVP

| ID | Módulo | Funcionalidad |
|----|--------|---------------|
| **UXUI-057** | Aprovisionar Dispositivo | Alta de nuevo dispositivo con calibración + genera QR |
| **UXUI-058** | Gestión de Planes | Listar/editar planes disponibles |
| **UXUI-059** | Control de Suscripciones | Ver estado, activar/cancelar acceso |
| **UXUI-060** | Alertas Admin | Recordatorio conexión, dispositivo offline |
| **UXUI-061** | Generación de Reportes | Crear PDF de diagnóstico (servicio 7 días) |
| **UXUI-062** | Usuarios/Clientes | Ver lista de clientes, datos CFE, estado |

### 8.3 Flujo de Aprovisionamiento de Dispositivo

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

## 9. Decisiones Globales de UX (RDH)

> [!IMPORTANT]
> Estas decisiones afectan el comportamiento general de la aplicación.
> Fueron confirmadas explícitamente por el usuario.

| ID | Decisión | Valor Confirmado | Fecha |
|----|----------|------------------|-------|
| **UXUI-063** | Expiración de sesión | **7 días** sin actividad | 2026-01-06 |
| **UXUI-064** | Modo offline | **Bloqueo total** (sin cached data) | 2026-01-06 |
| **UXUI-065** | Idioma | **Español MX** únicamente | 2026-01-06 |
| **UXUI-066** | Orientación de pantalla | **Portrait fijo** | 2026-01-06 |

---

## 10. Flujo de Vinculación de Dispositivo

> ⚠️ **Basado en análisis del legacy (registro.html)**

### 10.1 Acuerdos de UI para Vinculación

| ID | Acuerdo | Decisión | Fecha |
|----|---------|----------|-------|
| **UXUI-067** | Método de vinculación | Escaneo de QR code | 2026-01-06 |
| **UXUI-068** | Datos CFE en vinculación | Tarifa, Fecha corte, Lecturas | 2026-01-06 |
| **UXUI-069** | Ayuda visual | Modales con imágenes del recibo CFE | 2026-01-06 |

### 10.2 Flujo de Vinculación

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

### 10.3 Pantalla de Escaneo QR

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

---

## Control de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 0.1 | 2026-01-05 | Estructura inicial, menú principal |
| 0.2 | 2026-01-06 | Campos de onboarding, Google Auth, eliminación de campos innecesarios |
| 0.3 | 2026-01-06 | Alertas, Gráficas, Cuenta, Panel Admin, Decisiones RDH, Flujo Vinculación |

---

*Documento generado durante sesión de definición UX/UI*
*Especialista: Antigravity (IA) | Usuario: Propietario del proyecto*
*Total de acuerdos: 69 (UXUI-001 a UXUI-069)*
