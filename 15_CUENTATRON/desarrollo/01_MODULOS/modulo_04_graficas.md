# Módulo 04: Gráficas

> **Fase:** 3 - CORE APP
> **Dependencias:** modulo_01, modulo_06
> **Estado:** ⬜ Pendiente

---

## 1. Propósito del Módulo

Implementar la sección de visualización de datos con gráficas de consumo, voltaje y corriente, incluyendo selector de periodo y navegación por tabs.

---

## 2. Qué SÍ Hace

- ✅ Gráfica de Consumo (kWh) con selector de periodo
- ✅ Gráfica de Voltaje (V) con umbrales visuales
- ✅ Gráfica de Fuga/Corriente (A)
- ✅ Navegación entre gráficas por tabs (vistas independientes)
- ✅ Selector de periodo: Hora, Día, Semana, Mes, Bimestre

---

## 3. Qué NO Hace

- ❌ Exportación de gráficas (UXUI-050)
- ❌ Scroll vertical entre gráficas (UXUI-049)
- ❌ Comparativas entre periodos

---

## 4. Dependencias Previas

| Dependencia | Tipo | Descripción |
|-------------|------|-------------|
| modulo_01 | Obligatoria | Usuario autenticado |
| modulo_06 | Obligatoria | Dispositivo vinculado |

---

## 5. Entradas Esperadas

| Entrada | Origen | Descripción |
|---------|--------|-------------|
| Datos de consumo | InfluxDB | Series temporales de kWh |
| Datos de voltaje | InfluxDB | Series temporales de V |
| Datos de corriente | InfluxDB | Series temporales de A |

---

## 6. Salidas Esperadas

| Salida | Destino | Descripción |
|--------|---------|-------------|
| Gráficas renderizadas | Pantalla | 3 tipos de gráfica |
| Estadísticas de periodo | Pantalla | Promedio, total, etc. |

---

## 7. Criterios de "Módulo Terminado"

- [ ] Navegación entre 3 gráficas por tabs
- [ ] Gráfica de Consumo funciona con selector de periodo
- [ ] Gráfica de Voltaje muestra umbrales visuales (alto/bajo)
- [ ] Gráfica de Corriente muestra datos de fuga
- [ ] Selector de periodo: Hora, Día, Semana, Mes, Bimestre
- [ ] Estado de carga mientras obtiene datos
- [ ] Sin datos = mensaje de estado vacío

---

## 8. Restricciones Explícitas para IA

| Restricción | Referencia |
|-------------|------------|
| Navegación por vistas independientes (tabs), NO scroll | UXUI-049 |
| NO implementar exportación | UXUI-050 |
| Umbrales de voltaje NO hardcoded | UXUI-037, UXUI-038 |

---

## Tipos de Gráficas

| Gráfica | Descripción | Selector Temporal |
|---------|-------------|-------------------|
| **Consumo** | Consumo eléctrico en kWh | ✅ Hora/Día/Semana/Mes/Bimestre |
| **Voltaje** | Nivel de voltaje (V) con umbrales | ⚠️ **AMB-01: Por definir** |
| **Corriente** | Corriente de fuga (A) | ⚠️ **AMB-02: Por definir** |

> [!WARNING]
> **AMBIGÜEDADES AMB-01 y AMB-02:** Los selectores de periodo para las gráficas de Voltaje y Corriente no están definidos. La IA DEBE preguntar antes de implementar.

---

## Estructura Visual

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
│  │                    📊 GRÁFICA                                    │    │
│  │                                                                  │    │
│  │  [Visualización de datos]                                       │    │
│  │                                                                  │    │
│  │  Promedio: XX.X kWh/día                                         │    │
│  │  Total periodo: XXX kWh                                          │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Referencia

- **Plan Maestro:** Sección 14.7 (UXUI-045 a UXUI-050)

---

*Última actualización: 2026-01-06*
