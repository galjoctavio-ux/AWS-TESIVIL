# Módulo 03: Alertas

> **Fase:** 3 - CORE APP
> **Dependencias:** modulo_01, modulo_06, modulo_08
> **Estado:** ⬜ Pendiente

---

## 1. Propósito del Módulo

Implementar el sistema de notificaciones push y la sección de alertas en la app, incluyendo lista de alertas, filtros, y detalle con gráficas.

---

## 2. Qué SÍ Hace

- ✅ 8 tipos de alerta para usuario (ver lista abajo)
- ✅ Lista de alertas con filtros por tipo
- ✅ Modal de detalle al tocar alerta
- ✅ Gráficas en modal para alertas de calidad
- ✅ Badge con contador de alertas no leídas
- ✅ Push notifications vía FCM

---

## 3. Qué NO Hace

- ❌ Alertas para administrador en app usuario (UXUI-043, UXUI-044)
- ❌ Alertas por WhatsApp
- ❌ Alertas por Telegram
- ❌ Umbrales de voltaje hardcoded (deben ser configurables)

---

## 4. Dependencias Previas

| Dependencia | Tipo | Descripción |
|-------------|------|-------------|
| modulo_01 | Obligatoria | Usuario autenticado |
| modulo_06 | Obligatoria | Dispositivo vinculado |
| modulo_08 | Obligatoria | FCM configurado, API funcionando |

---

## 5. Entradas Esperadas

| Entrada | Origen | Descripción |
|---------|--------|-------------|
| Eventos de consumo | API (vigilante_calidad.py) | Detección de anomalías |
| Datos de usuario | Supabase | Preferencias de notificación |
| Datos CFE | Supabase | Fecha de corte para alertas de corte |

---

## 6. Salidas Esperadas

| Salida | Destino | Descripción |
|--------|---------|-------------|
| Notificaciones push | Dispositivo | Alertas en tiempo real |
| Lista de alertas | Pantalla | Histórico de alertas |
| Badge contador | Bottom Navigation | Número de no leídas |

---

## 7. Criterios de "Módulo Terminado"

- [ ] Lista de alertas muestra título + descripción + hora
- [ ] Filtros funcionan: Todas, Consumo, Voltaje, Picos, CFE, Sistema
- [ ] Tap en alerta abre modal con detalle completo
- [ ] Modal incluye gráfica para alertas de calidad (UXUI-037 a UXUI-040)
- [ ] Push notifications llegan al dispositivo
- [ ] Badge muestra contador de no leídas
- [ ] Los 8 tipos de alerta funcionan correctamente

---

## 8. Restricciones Explícitas para IA

| Restricción | Referencia |
|-------------|------------|
| NO mostrar alertas admin (Recordatorio Conexión, Dispositivo Offline) | UXUI-043, UXUI-044 |
| Umbrales de voltaje configurables desde Panel Admin | UXUI-037, UXUI-038 |
| Alertas de calidad DEBEN incluir gráfica | UXUI-037 a UXUI-040 |
| Alertas "Brinco Escalón" y "Felicitación" NO incluyen gráfica | UXUI-041, UXUI-042 |

---

## Tipos de Alerta para Usuario (APP)

### Alertas Diarias

| ID | Tipo | Descripción | Frecuencia |
|----|------|-------------|------------|
| UXUI-034 | Reporte Diario | Consumo de ayer + acumulado + proyección | Diaria |
| UXUI-035 | Aviso Corte 3 Días | Recordatorio 3 días antes de fecha de corte | Evento |
| UXUI-036 | Día de Corte | Resumen final: kWh + costo estimado | Evento |

### Alertas de Calidad (con gráfica)

| ID | Tipo | Descripción | Frecuencia |
|----|------|-------------|------------|
| UXUI-037 | Picos de Voltaje Alto | Picos sobre umbral configurable | Inmediata |
| UXUI-038 | Voltaje Bajo | Bajo umbral configurable | Inmediata |
| UXUI-039 | Fuga de Corriente | Posible fuga detectada | Inmediata |
| UXUI-040 | Consumo Fantasma | Consumo inusual a hora específica | Inmediata |

### Alertas de Sistema (sin gráfica)

| ID | Tipo | Descripción | Frecuencia |
|----|------|-------------|------------|
| UXUI-041 | Brinco de Escalón | Superó umbral de tarifa CFE | Evento |
| UXUI-042 | Felicitación Conexión | Primera medición recibida | Única |

---

## Estructura Visual: Lista de Alertas

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
│  │ Se detectaron 5 picos sobre umbral en la última hora           │    │
│  │                                            Hace 45 min          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │ 📊 Consumo de Ayer                                              │    │
│  │ Consumiste 12.5 kWh (más alto que tu promedio)                  │    │
│  │                                            Hoy 7:00 AM          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Referencia

- **Plan Maestro:** Sección 14.6 (UXUI-031 a UXUI-044)
- **Scripts:** `../produccion/assets/scripts_alertas/vigilante_calidad.py`

---

*Última actualización: 2026-01-06*
