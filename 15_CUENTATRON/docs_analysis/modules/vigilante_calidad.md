# vigilante_calidad.py

## Propósito
Script de detección de anomalías en la calidad de energía eléctrica. Monitorea voltaje, fugas de corriente, consumo fantasma, y escalones de tarifa CFE. Envía alertas proactivas a clientes.

## Core Logic

### Sistema de Detección EWMA (Exponentially Weighted Moving Average)
```
Media nueva = α × valor_actual + (1-α) × media_histórica
α = 0.2 (aprendizaje) | 0.1 (producción)
```

### Tipos de Anomalías Detectadas
| Anomalía | Umbral | Acción |
|----------|--------|--------|
| Voltaje alto | > 139.7V | Alerta de picos |
| Voltaje bajo | < 114.3V | Alerta de protección |
| Fuga de corriente | > 0.5A (absoluto) ó > 4σ (EWMA) | Alerta de seguridad |
| Consumo fantasma | > 2σ del promedio horario | Alerta de gasto oculto |
| Brinco de escalón CFE | Supera límite de kWh | Aviso de tarifa mayor |

### Sistema de "Strikes"
- Requiere **2 anomalías consecutivas** para enviar alerta
- Evita falsos positivos por ruido en mediciones

### Bloques Horarios (para detección contextual)
| Bloque | Horas | Comportamiento esperado |
|--------|-------|------------------------|
| Madrugada | 0-6 | Consumo mínimo |
| Mañana | 6-9 | Inicio de actividad |
| Día laboral | 9-18 | Consumo estable |
| Tarde | 18-21 | Pico de consumo |
| Noche | 21-24 | Descenso gradual |

### Lógica Híbrida para Fugas (v2.6)
1. **Durante aprendizaje** (< 50 muestras): Umbral absoluto de 0.5A
2. **Post-aprendizaje**: Comparación con línea base EWMA

## Dependencias/Inputs
| Tipo | Recurso |
|------|---------|
| BD | PostgreSQL - columna JSONB `estadisticas_consumo` |
| TimeSeries | InfluxDB |
| API | Twilio + Telegram |
| Librerías | pandas, math, psycopg2 |

## Estado
**✅ FUNCIONAL - Producción (v2.6)**

Código sofisticado con aprendizaje automático básico. Detecta patrones anómalos sin falsos positivos excesivos.
