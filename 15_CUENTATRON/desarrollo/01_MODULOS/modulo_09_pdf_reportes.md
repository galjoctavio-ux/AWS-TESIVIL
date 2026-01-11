# Módulo 09: PDF / Reportes

> **Fase:** 4 - ADMINISTRACIÓN
> **Dependencias:** modulo_07, modulo_08
> **Estado:** ⬜ Pendiente

---

## 1. Propósito del Módulo

Implementar el sistema de generación de reportes PDF de diagnóstico para el servicio de 7 días, incluyendo edición por ingeniero y descarga en app.

---

## 2. Qué SÍ Hace

- ✅ Generación de PDF con datos de consumo
- ✅ Inclusión de gráficas de consumo
- ✅ Campo para observaciones de ingeniero
- ✅ Edición de observaciones desde Panel Admin
- ✅ Publicación de PDF para cliente
- ✅ Descarga de PDF desde la app

---

## 3. Qué NO Hace

- ❌ Generación automática sin revisión humana (CAME A-06)
- ❌ Envío automático por email/WhatsApp
- ❌ Reportes para usuarios con suscripción permanente

---

## 4. Dependencias Previas

| Dependencia | Tipo | Descripción |
|-------------|------|-------------|
| modulo_07 | Obligatoria | Panel Admin funcionando |
| modulo_08 | Obligatoria | API y datos disponibles |

---

## 5. Entradas Esperadas

| Entrada | Origen | Descripción |
|---------|--------|-------------|
| Datos de 7 días | InfluxDB | Series temporales de consumo |
| Datos del cliente | Supabase | Perfil y datos CFE |
| Datos del dispositivo | Supabase | Calibración y estado |
| Observaciones | Ingeniero | Análisis profesional |

---

## 6. Salidas Esperadas

| Salida | Destino | Descripción |
|--------|---------|-------------|
| PDF generado | Supabase Storage | Archivo PDF |
| PDF publicado | App del cliente | Descargable |
| Notificación | Cliente | "Tu reporte está listo" |

---

## 7. Criterios de "Módulo Terminado"

- [ ] Template de PDF diseñado
- [ ] PDF incluye gráficas de consumo de 7 días
- [ ] PDF incluye datos del cliente y dispositivo
- [ ] Ingeniero puede editar observaciones
- [ ] Ingeniero puede publicar reporte
- [ ] Cliente recibe notificación cuando está listo
- [ ] Cliente puede descargar PDF desde app
- [ ] PDF se guarda en Supabase Storage

---

## 8. Restricciones Explícitas para IA

| Restricción | Referencia |
|-------------|------------|
| Intervención humana OBLIGATORIA antes de entrega | CAME A-06 |
| Solo para servicio de 7 días | UXUI-054 |
| Datos de perfiles_diagnostico relevantes | Schema SQL |

---

## Contenido del PDF

| Sección | Contenido |
|---------|-----------|
| **Encabezado** | Logo, título "Diagnóstico Energético", fecha |
| **Datos del Cliente** | Nombre, dirección, tarifa CFE |
| **Resumen de Consumo** | kWh totales, promedio diario, picos detectados |
| **Gráfica de Consumo** | 7 días de datos |
| **Anomalías Detectadas** | Lista de alertas del periodo |
| **Observaciones del Ingeniero** | Análisis profesional |
| **Recomendaciones** | Generadas por ingeniero |
| **Pie de Página** | Contacto, versión del reporte |

---

## Flujo de Generación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE REPORTE PDF                                  │
└─────────────────────────────────────────────────────────────────────────┘

DÍA 7 (automático)         INGENIERO                    CLIENTE
─────────────────          ─────────                    ───────
      │                        │                            │
      ▼                        │                            │
┌───────────────┐              │                            │
│ Draft PDF     │──────────────┤                            │
│ generado      │              │                            │
│ automático    │              ▼                            │
└───────────────┘       ┌───────────────┐                   │
                        │ Revisar datos │                   │
                        │ + Agregar     │                   │
                        │ observaciones │                   │
                        └───────┬───────┘                   │
                                │                           │
                                ▼                           │
                        ┌───────────────┐                   │
                        │  Publicar     │───────────────────▶
                        │   reporte     │         ┌─────────────────┐
                        └───────────────┘         │ Notificación:   │
                                                  │ "Reporte listo" │
                                                  └────────┬────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │ Descargar PDF   │
                                                  │ desde app       │
                                                  └─────────────────┘
```

---

## Datos de perfiles_diagnostico

Esta tabla contextualiza el servicio de 7 días y debe incluirse en el PDF:

| Campo | Uso en PDF |
|-------|------------|
| Domicilio | Sección "Datos del Cliente" |
| Inventario electrodomésticos | Contexto para análisis |
| Contexto del problema | Antecedentes |

---

## Referencia

- **Plan Maestro:** Secciones 7.4, 7.5, 10.4
- **Schema:** Tabla `perfiles_diagnostico`

---

*Última actualización: 2026-01-06*
