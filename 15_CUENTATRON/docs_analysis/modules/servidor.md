# servidor.py

## Propósito
Servidor Flask básico para recibir datos de dispositivos ESP32 vía HTTP POST. Guarda mediciones en archivo CSV local. **Este es un prototipo temprano, reemplazado por receptor_mqtt.py.**

## Core Logic

### Endpoint
```
POST /datos?device=<DEVICE_ID>
Body: texto plano con mediciones (una por línea)
```

### Formato de Guardado
```csv
timestamp_servidor,device_id,vrms,irms_phase,irms_neutral,power,va,power_factor,leakage,temp_cpu,sequence,timestamp_dispositivo
```

## Dependencias/Inputs
| Tipo | Recurso |
|------|---------|
| Framework | Flask |
| Storage | Archivo local `mediciones.csv` |

## Estado
**⚠️ PROTOTIPO - Obsoleto**

Este servidor fue un MVP inicial. La arquitectura actual usa MQTT + InfluxDB (ver `receptor_mqtt.py`). **NO REUTILIZAR** - mantener solo como referencia histórica.
