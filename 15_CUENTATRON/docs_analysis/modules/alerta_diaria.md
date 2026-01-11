# alerta_diaria.py

## Propósito
Script de alertas diarias para el sistema LETE (Cuentatrón). Lee datos de consumo desde InfluxDB, calcula proyecciones de costos según tarifas CFE, y envía alertas personalizadas a clientes vía WhatsApp (Twilio) y/o Telegram.

## Core Logic

### Funciones Principales
- **Cálculo de consumo**: Integra datos de potencia desde InfluxDB para obtener kWh consumidos
- **Proyección de recibo CFE**: Calcula costos estimados usando estructura escalonada de tarifas (01, 01A, PDBT, DAC)
- **Lógica de "Primer Periodo"**: Maneja clientes nuevos calculando kWh "acarreados" pre-instalación
- **Sistema de alertas duales**: WhatsApp (Twilio templates) + Telegram (mensajes formateados)

### Reglas de Negocio
| Regla | Acción |
|-------|--------|
| Día de corte | Envía resumen final del periodo |
| 3 días antes del corte | Recordatorio de fecha próxima |
| Diario (sin proyección) | Primeros 5 días del ciclo |
| Diario (con proyección) | Después de 5 días, incluye estimación de pago |

### Algoritmo de Cálculo de Costos
```python
# Estructura escalonada CFE (ej. Tarifa 01)
TARIFAS_CFE = {
    '01': [
        {'hasta_kwh': 150, 'precio': 1.08},
        {'hasta_kwh': 280, 'precio': 1.32},
        {'hasta_kwh': float('inf'), 'precio': 3.85}
    ]
}
# Costo final = (suma de escalones) × 1.16 (IVA)
```

## Dependencias/Inputs
| Tipo | Recurso |
|------|---------|
| BD | PostgreSQL (Supabase) - tablas: `clientes`, `dispositivos_lete` |
| TimeSeries | InfluxDB - bucket de mediciones |
| API | Twilio (WhatsApp templates) |
| API | Telegram Bot API |
| Config | Variables de entorno (.env) |

## Estado
**✅ FUNCIONAL - Producción**

Código maduro, bien estructurado con manejo de errores (tenacity para reintentos), logging completo, y lógica de negocio validada para tarifas CFE mexicanas.
