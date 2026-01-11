# REGLAS DE EJECUCIÓN CON IA - CUENTATRON MVP

> [!CAUTION]
> **PRIORIDAD ABSOLUTA** — Este archivo prevalece sobre cualquier otro durante la ejecución.
> La IA DEBE seguir estas reglas estrictamente.

---

## 1. Qué PUEDE Hacer la IA (Sin Preguntar)

### Acciones Generales (IA-OK)

| # | Acción Permitida | Condición |
|---|------------------|-----------|
| IA-OK-01 | Implementar componentes descritos en módulos | Exactamente como están especificados |
| IA-OK-02 | Aplicar validaciones de formulario | Según tabla de validación del módulo |
| IA-OK-03 | Implementar flujos de navegación | Según diagramas documentados |
| IA-OK-04 | Mostrar mensajes de error | Usando códigos de error definidos |
| IA-OK-05 | Crear estados de loading/empty | Siguiendo principios UX |
| IA-OK-06 | Implementar modales de confirmación | Para acciones destructivas |
| IA-OK-07 | Aplicar jerarquía de botones | Primario > Secundario > Texto |
| IA-OK-08 | Ordenar elementos según prioridad visual | Más importante = más prominente |
| IA-OK-09 | Agregar indicadores de progreso | En operaciones > 2 segundos |
| IA-OK-10 | Implementar feedback táctil/visual | Para todas las acciones de usuario |

### Acciones Específicas de UI/UX (14-OK)

| # | Acción Permitida | Referencia |
|---|------------------|------------|
| 14-OK-01 | Implementar estructura de 4 secciones | UXUI-001 |
| 14-OK-02 | Implementar campos de onboarding activos | UXUI-023 a UXUI-027 |
| 14-OK-03 | Implementar tipos de alerta para APP | UXUI-034 a UXUI-042 |
| 14-OK-04 | Implementar tipos de plan MVP | Solo 4 tipos UXUI-029 |
| 14-OK-05 | Implementar decisiones globales | UXUI-063 a UXUI-066 |
| 14-OK-06 | Usar diagramas ASCII como referencia | Para estructura de pantallas |

---

## 2. Qué NO PUEDE Hacer la IA

### Prohibiciones Generales (IA-NO)

| # | Prohibición | Razón |
|---|-------------|-------|
| IA-NO-01 | **NO agregar pantallas no documentadas** | Evitar scope creep |
| IA-NO-02 | **NO cambiar flujos de navegación** | Afecta UX validada |
| IA-NO-03 | **NO omitir modales de confirmación** | Viola principio UX-09 |
| IA-NO-04 | **NO inventar mensajes de error** | Deben ser consistentes |
| IA-NO-05 | **NO añadir campos a formularios** | Cambia requerimientos |
| IA-NO-06 | **NO crear nuevos tipos de botón** | Rompe consistencia |
| IA-NO-07 | **NO decidir colores finales** | Fuera de alcance |
| IA-NO-08 | **NO asumir comportamiento de usuario** | Fuera de especificación |
| IA-NO-09 | **NO inferir flujos no descritos** | Causa inconsistencias |
| IA-NO-10 | **NO optimizar estética sin instrucción** | Fuera de alcance |

### Prohibiciones Específicas de UI/UX (14-NO)

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

---

## 3. Cuándo DEBE Preguntar al Usuario

### Situaciones Generales (IA-ASK)

| # | Situación | Pregunta Modelo |
|---|-----------|-----------------|
| IA-ASK-01 | Funcionalidad no documentada | "¿Cómo debo implementar [X] que no está en el módulo?" |
| IA-ASK-02 | Ambigüedad entre interpretaciones | "El documento dice [A] pero también [B]. ¿Cuál aplica?" |
| IA-ASK-03 | Conflicto entre reglas | "La regla X entra en conflicto con Y. ¿Cuál priorizo?" |
| IA-ASK-04 | Decisión de negocio implícita | "Implementar [X] afecta el modelo de negocio. ¿Procedo?" |
| IA-ASK-05 | Tecnología no especificada | "Necesito usar [librería] no mencionada. ¿Lo implemento?" |
| IA-ASK-06 | Cambio que afecta otras secciones | "Este cambio impacta [sección Y]. ¿Debo actualizar ambas?" |
| IA-ASK-07 | Error en documento fuente | "Hay un error/inconsistencia. ¿Cómo procedo?" |

### Situaciones Específicas (14-ASK)

| # | Situación | Referencia |
|---|-----------|------------|
| 14-ASK-01 | Valor marcado "Por definir" | AMB-01, AMB-02 (selectores de periodo) |
| 14-ASK-02 | Inconsistencia entre acuerdos | AMB-04 (Cambiar plan) |
| 14-ASK-03 | Detalle no especificado | AMB-03 (Config Notificaciones) |

---

## 4. Cuándo DEBE Detenerse

| Situación | Acción |
|-----------|--------|
| Error crítico no recuperable | Detener y reportar |
| Ambigüedad no resuelta en documento | Preguntar antes de continuar |
| Conflicto entre reglas sin resolución | Preguntar antes de continuar |
| Cambio que afecta compatibilidad ESP32 | **DETENERSE INMEDIATAMENTE** |

---

## 5. Manejo de Errores

| Tipo de Error | Acción |
|---------------|--------|
| Error de código | Corregir si es obvio; reportar si no |
| Error de documentación | Reportar, NO inferir corrección |
| Error de flujo | Detener y consultar |
| Conflicto con restricción ESP32 | **DETENER Y CONSULTAR** |

---

## 6. Restricciones de Base de Datos (ESP32)

> [!CAUTION]
> Las siguientes columnas y tablas son **INAMOVIBLES** por compatibilidad con el firmware ESP32.

### Tabla: dispositivos (columnas obligatorias)

```sql
voltage_cal numeric
current_cal_1 numeric
current_cal_2 numeric
current_cal_3 numeric
current_cal_4 numeric
current_cal_5 numeric
power_cal numeric
data_server_url text
cal_update_pending boolean
```

### Tabla: mediciones_pendientes (estructura obligatoria)

```sql
device_id varchar NOT NULL
ts_unix bigint NOT NULL
payload_json text NOT NULL
created_at timestamp
```

**Regla:** Las nuevas tablas DEBEN incluir estas columnas con los mismos nombres y tipos.

---

## 7. Precedencia de Documentación

| Prioridad | Documento | Uso |
|-----------|-----------|-----|
| 1 (Alta) | Este archivo (02_REGLAS) | Gobierna comportamiento IA |
| 2 | Sección 14 Plan Maestro | Acuerdos UXUI validados |
| 3 | Sección 13 Plan Maestro | Reglas genéricas UX |
| 4 | Módulos individuales | Detalle por componente |
| 5 | Plan Maestro Definitivo | Referencia completa |

---

## 8. Ambigüedades Conocidas (NO RESOLVER)

| ID | Descripción | Ubicación |
|----|-------------|-----------|
| AMB-01 | Selector periodo gráfica Voltaje | modulo_04_graficas.md |
| AMB-02 | Selector periodo gráfica Corriente | modulo_04_graficas.md |
| AMB-03 | Contenido "Config notificaciones" | modulo_05_cuenta.md |
| AMB-04 | "Cambiar plan" vs restricción | modulo_05_cuenta.md |

**Instrucción:** Preguntar ANTES de implementar cualquier funcionalidad relacionada.

---

*Documento creado: 2026-01-06*
*Prioridad: MÁXIMA*
