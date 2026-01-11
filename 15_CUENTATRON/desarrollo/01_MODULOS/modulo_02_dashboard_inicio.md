# Módulo 02: Dashboard / Inicio

> **Fase:** 3 - CORE APP
> **Dependencias:** modulo_01, modulo_06, modulo_08
> **Estado:** ⬜ Pendiente

---

## 1. Propósito del Módulo

Implementar la pantalla principal (Home) que muestra el resumen de consumo eléctrico, estado del dispositivo, información CFE y alertas recientes.

---

## 2. Qué SÍ Hace

- ✅ Consumo actual del día (kWh)
- ✅ Estado del dispositivo (conectado/desconectado)
- ✅ Última alerta recibida
- ✅ Fecha de corte CFE
- ✅ Consumo del bimestre anterior (kWh)
- ✅ Predicción del periodo actual (kWh Y pesos MXN)

---

## 3. Qué NO Hace

- ❌ Mini-gráfica del día (pertenece a modulo_04_graficas - UXUI-009)
- ❌ Historial extenso (pertenece a modulo_04_graficas)
- ❌ Lista completa de alertas (pertenece a modulo_03_alertas)

---

## 4. Dependencias Previas

| Dependencia | Tipo | Descripción |
|-------------|------|-------------|
| modulo_01 | Obligatoria | Usuario autenticado con datos CFE |
| modulo_06 | Obligatoria | Dispositivo vinculado y enviando datos |
| modulo_08 | Obligatoria | API funcionando, datos fluyendo |

---

## 5. Entradas Esperadas

| Entrada | Origen | Descripción |
|---------|--------|-------------|
| Datos de consumo | InfluxDB vía API | Lecturas del dispositivo |
| Datos de usuario | Supabase | Tarifa, fecha corte, lecturas iniciales |
| Estado dispositivo | API | Conectado/desconectado |
| Última alerta | API | Alerta más reciente |

---

## 6. Salidas Esperadas

| Salida | Destino | Descripción |
|--------|---------|-------------|
| Dashboard renderizado | Pantalla | 6 elementos visibles |
| Navegación a alertas | modulo_03 | Tap en última alerta |
| Navegación a dispositivo | modulo_05 | Tap en estado dispositivo |

---

## 7. Criterios de "Módulo Terminado"

- [ ] Dashboard muestra consumo actual del día en kWh
- [ ] Dashboard muestra estado del dispositivo con indicador visual
- [ ] Dashboard muestra última alerta con título y hora
- [ ] Dashboard muestra fecha de corte CFE
- [ ] Dashboard muestra consumo del bimestre anterior
- [ ] Dashboard muestra predicción en kWh Y en pesos MXN
- [ ] Tap en última alerta navega a sección Alertas
- [ ] Tap en dispositivo navega a sección Cuenta > Dispositivos
- [ ] Datos se actualizan al hacer pull-to-refresh
- [ ] Estado de carga visible mientras obtiene datos

---

## 8. Restricciones Explícitas para IA

| Restricción | Referencia |
|-------------|------------|
| NO incluir mini-gráfica del día | UXUI-009 |
| Predicción DEBE mostrar AMBOS valores (kWh Y pesos) | UXUI-013 |
| Sin datos = mostrar estado vacío con mensaje | UX-04 |
| Modo offline = bloqueo total | UXUI-064 |

---

## Estructura Visual

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          📱 PANTALLA INICIO                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  CONSUMO ACTUAL                                                   │   │
│  │  ████████████████████████  15.7 kWh  (hoy)                       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  📅 INFORMACIÓN CFE                                               │   │
│  │  · Fecha de corte: 15 de febrero 2026                            │   │
│  │  · Bimestre anterior: 245 kWh                                     │   │
│  │  · Predicción: ~280 kWh / ~$850 MXN                               │   │
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

## Referencia

- **Plan Maestro:** Sección 14.3 (UXUI-006 a UXUI-013)

---

*Última actualización: 2026-01-06*
