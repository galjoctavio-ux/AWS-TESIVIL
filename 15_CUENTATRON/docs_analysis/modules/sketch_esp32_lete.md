# sketch_esp32_lete.ino (Firmware ESP32)

## Propósito
Firmware del dispositivo Cuentatrón. Mide consumo eléctrico en tiempo real usando sensores CT (transformadores de corriente) y envía datos vía MQTT. Arquitectura dual-core para máxima confiabilidad.

## Core Logic

### Arquitectura Dual-Core
| Núcleo | Función | Prioridad |
|--------|---------|-----------|
| **Núcleo 1** (Escritor) | Medición + guardado en SD | Alta - nunca se interrumpe |
| **Núcleo 0** (Mensajero) | WiFi + MQTT + OTA | Oportunista - usa huecos |

### Hardware Soportado
- **MCU**: ESP32
- **Display**: OLED SSD1306 (128x64)
- **RTC**: DS3231 (timestamps confiables sin WiFi)
- **Storage**: Tarjeta SD (buffer local)
- **Sensores**: CT para corriente (EmonLib), divisor resistivo para voltaje
- **Indicadores**: NeoPixel (4 LEDs)

### Sistema de Medición
```cpp
// Calibración por defecto
float voltage_cal = 153.5;
float current_cal_phase = 106.0;
float current_cal_neutral = 106.0;
float phase_cal = 1.7;

// Cálculo de fuga
data.leakage = fabs(irms_phase - irms_neutral);
```

### Batching en SD
- Cada archivo `.dat` contiene 10 mediciones
- Formato: `<timestamp>.dat`
- El Núcleo 0 envía y elimina archivos procesados

### Sistema de Recuperación
| Falla | Comportamiento |
|-------|---------------|
| RTC falla | LED rojo fijo, reintentos cada 30s |
| SD falla | LED rojo parpadeante, reintentos cada 30s |
| WiFi perdido | Continúa midiendo, guarda en SD |
| MQTT desconectado | Re-encolado automático |

### Botón Multifunción
| Duración | Acción |
|----------|--------|
| 5 segundos | Ventana de mantenimiento (NTP, OTA) |
| 10 segundos | Reset de credenciales WiFi |

### Ventana de Mantenimiento (3:00 AM)
- Sincroniza NTP
- Revisa actualizaciones OTA
- Consulta configuración de servidor MQTT desde Supabase

## Dependencias/Inputs
| Tipo | Recurso |
|------|---------|
| Librerías | WiFiManager, EmonLib, PubSubClient, RTClib, ArduinoJson |
| Cloud | MQTT Broker, Supabase (config) |
| Archivo | `/mqtt_config.json` en SD |
| Archivo | `secrets.h` (credenciales MQTT) |

## Estado
**✅ FUNCIONAL - Producción (v15.7)**

Firmware maduro con watchdog, modo de falla graceful, y arquitectura no-bloqueante. Probado para operación 24/7.
