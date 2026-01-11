# cuentatron_app/server.js (Backend Node.js)

## Propósito
Backend principal del sistema Cuentatrón. Maneja suscripciones (Stripe), bot de Telegram con IA (Gemini), webhooks, proxy de autenticación, y lógica de negocio para alertas.

## Core Logic

### Módulos Principales

#### 1. Gestión de Suscripciones (Stripe)
- Webhook para `checkout.session.completed`
- Actualiza estado en PostgreSQL
- Envía email de bienvenida + WhatsApp

#### 2. Bot de Telegram con IA
```javascript
// Flujo de vinculación
/start → Email → Código 6 dígitos → Vinculado

// Comandos disponibles
/voltaje, /watts, /consumo_hoy, /consumo_ayer
/grafica_ayer, /grafica_semanal
/usar_telegram, /usar_whatsapp
```

#### 3. Asistente Gemini (Intención Natural)
| Intención | Handler |
|-----------|---------|
| `pedir_proyeccion_pago` | Calcula estimado de recibo CFE |
| `pedir_diagnostico_fuga_tierra` | Consulta estado de fuga |
| `pedir_diagnostico_fantasma` | Detecta consumo nocturno anómalo |
| `pedir_diagnostico_voltaje` | Evalúa estabilidad eléctrica |
| `pedir_hora_pico` | Identifica hora de máximo consumo |
| `soporte_humano` | Transfiere a Chatwoot |
| `faq_servicios_empresa` | Responde preguntas generales |

#### 4. Integración Chatwoot
- Webhook bidireccional
- Transfer de chat humano ↔ bot
- Timer de 1 hora para sesión humana

#### 5. Lógica de Tarifas CFE
```javascript
const TARIFAS_CFE = {
    '01': [
        { hasta_kwh: 150, precio: 1.08 },
        { hasta_kwh: 280, precio: 1.32 },
        { hasta_kwh: Infinity, precio: 3.85 }
    ],
    // ... más tarifas
};
```

### Endpoints Clave
| Ruta | Método | Función |
|------|--------|---------|
| `/webhook/stripe` | POST | Procesa pagos |
| `/api/telegram-webhook` | POST | Bot de Telegram |
| `/api/chatwoot-webhook` | POST | Integración soporte |
| `/auth/v1/*` | PROXY | Autenticación Supabase |

## Dependencias/Inputs
| Tipo | Recurso |
|------|---------|
| BD | Supabase (PostgreSQL) |
| TimeSeries | InfluxDB |
| Pagos | Stripe |
| Mensajería | Twilio (WhatsApp), Telegram Bot API |
| Email | Resend |
| IA | Google Gemini 2.5 Flash |
| Soporte | Chatwoot |
| Gráficas | QuickChart |

## Estado
**✅ FUNCIONAL - Producción**

Backend completo con integraciones múltiples. Código extenso (2200+ líneas) pero bien organizado con manejo de errores.
