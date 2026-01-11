# Módulo 06: Vinculación de Dispositivo

> **Fase:** 2 - AUTH Y VINCULACIÓN
> **Dependencias:** modulo_01
> **Estado:** ⬜ Pendiente

---

## 1. Propósito del Módulo

Implementar el flujo de vinculación de un dispositivo físico Cuentatron con la cuenta de usuario, incluyendo escaneo de QR, configuración WiFi y validación de conexión.

---

## 2. Qué SÍ Hace

- ✅ Escaneo de código QR del dispositivo
- ✅ Ingreso manual de código como alternativa
- ✅ Verificación de que el dispositivo existe y está disponible
- ✅ Captura de datos CFE con ayuda visual
- ✅ Configuración de red WiFi del dispositivo
- ✅ Confirmación de vinculación exitosa

---

## 3. Qué NO Hace

- ❌ Vinculación sin QR ni código manual
- ❌ Bluetooth pairing
- ❌ NFC pairing

---

## 4. Dependencias Previas

| Dependencia | Tipo | Descripción |
|-------------|------|-------------|
| modulo_01 | Obligatoria | Usuario autenticado y onboarding completado |

---

## 5. Entradas Esperadas

| Entrada | Origen | Descripción |
|---------|--------|-------------|
| QR del dispositivo | Cámara | Device ID codificado |
| Código manual | Input usuario | Device ID si QR falla |
| Credenciales WiFi | Input usuario | SSID y password |

---

## 6. Salidas Esperadas

| Salida | Destino | Descripción |
|--------|---------|-------------|
| Dispositivo vinculado | Supabase DB | Relación cliente-dispositivo |
| Config WiFi enviada | ESP32 | Credenciales de red |
| Estado "conectado" | Dashboard | Dispositivo reportando |

---

## 7. Criterios de "Módulo Terminado"

- [ ] Cámara se abre para escanear QR
- [ ] QR se decodifica correctamente (extrae Device ID)
- [ ] Alternativa manual funciona si QR falla
- [ ] Validación: dispositivo existe en BD
- [ ] Validación: dispositivo no está asignado a otro usuario
- [ ] Input de credenciales WiFi funciona
- [ ] Dispositivo se conecta a WiFi exitosamente
- [ ] Mensaje de éxito al completar vinculación
- [ ] Datos comienzan a fluir a InfluxDB

---

## 8. Restricciones Explícitas para IA

| Restricción | Referencia |
|-------------|------------|
| DEBE existir alternativa manual al QR | UXUI-069 |
| Datos CFE se capturan durante vinculación (si no se hizo antes) | UXUI-068 |
| Ayuda visual con imágenes de recibo CFE | UXUI-069 |

---

## Flujo de Vinculación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    📱 FLUJO DE VINCULACIÓN                               │
└─────────────────────────────────────────────────────────────────────────┘

PASO 1              PASO 2              PASO 3              PASO 4
──────              ──────              ──────              ──────
   │                   │                   │                   │
   ▼                   ▼                   ▼                   ▼
┌─────────┐       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Escanear│──────▶│ Verificar   │────▶│ Config      │────▶│ Confirmar   │
│   QR    │       │ Dispositivo │     │   WiFi      │     │ Vinculación │
└─────────┘       └─────────────┘     └─────────────┘     └─────────────┘
     │                  │                   │                   │
     │            ┌─────┴─────┐             │              ┌────┴────┐
     │            │ Validar   │             │              │ ¡Éxito! │
· Abre cámara    │ que existe │        · SSID           │ Ir a    │
· Lee código     │ y está     │        · Password        │ Dashboard│
· O ingreso      │ libre      │                          └─────────┘
  manual         └───────────┘
```

---

## Pantalla de Escaneo QR

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      📱 VINCULAR DISPOSITIVO                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     ┌───────────────┐                           │    │
│  │                     │               │                           │    │
│  │                     │   📷 CÁMARA   │                           │    │
│  │                     │               │                           │    │
│  │                     │  [+] Centro   │                           │    │
│  │                     │               │                           │    │
│  │                     └───────────────┘                           │    │
│  │                                                                  │    │
│  │  Escanea el código QR que viene con tu dispositivo Cuentatron  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  ¿No tienes un QR? [Ingresar código manualmente]                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Errores de Vinculación

| Código | Mensaje | Acción |
|--------|---------|--------|
| E-QR-01 | "Este código QR no es válido" | Modal con imagen de ejemplo |
| E-QR-02 | "Dispositivo ya vinculado a otra cuenta" | Modal con enlace a soporte |
| E-WIFI-01 | "No se pudo conectar al WiFi" | Modal con campo para reintentar |

---

## Referencia

- **Plan Maestro:** Secciones 13.2.4, 14.11 (UXUI-067 a UXUI-069)

---

*Última actualización: 2026-01-06*
