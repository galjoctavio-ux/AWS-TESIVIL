# IA-Flow

Sistema de flujo de desarrollo de software asistido por IA basado en ISO 9001.

## 🚀 Características

- **Chat con IA**: Interfaz de chat para describir tu idea de software
- **Flujo ISO 9001**: Proceso estructurado basado en estándares de calidad
- **Integración con Antigravity**: Bloques de sincronización para tareas de código
- **Múltiples APIs de IA**: Groq (principal) + Gemini Flash (respaldo)
- **Rate Limiting**: Protección contra abuso con límites por IP
- **Sistema de Donaciones**: Stripe integration para apoyar el servicio

## 📋 Requisitos

- Node.js 18+
- NPM o Yarn
- Cuentas en:
  - [Groq](https://console.groq.com/) (API keys gratuitas)
  - [Google AI Studio](https://aistudio.google.com/) (Gemini API)
  - [Stripe](https://stripe.com/) (pagos)
  - [Google reCAPTCHA](https://www.google.com/recaptcha/) (anti-bot)

## 🛠️ Instalación

1. **Clonar e instalar dependencias**:
   ```bash
   cd 02_PROJECT_IA-FLOW
   npm install
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus API keys
   ```

3. **Configurar el archivo `.env`**:
   ```env
   # Groq API Keys (6 keys para rotación)
   GROQ_API_KEY_1=gsk_xxx
   GROQ_API_KEY_2=gsk_xxx
   # ... hasta GROQ_API_KEY_6
   
   # Gemini Flash (respaldo)
   GEMINI_API_KEY=xxx
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   
   # Google reCAPTCHA
   RECAPTCHA_SITE_KEY=xxx
   RECAPTCHA_SECRET_KEY=xxx
   ```

## 🏃 Ejecución

### Desarrollo

```bash
npm run dev
```

Esto inicia:
- Backend en `http://localhost:3000`
- Frontend en `http://localhost:5173`

### Producción

```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
02_PROJECT_IA-FLOW/
├── frontend/               # Interfaz de usuario
│   ├── index.html         # HTML principal
│   ├── css/styles.css     # Estilos premium
│   └── js/                # Módulos JavaScript
│       ├── main.js        # Entrada principal
│       ├── chat.js        # Lógica del chat
│       ├── antigravityBlock.js  # Bloques de sync
│       ├── donationPopup.js     # Popup de donación
│       └── stripe.js      # Integración Stripe
│
├── backend/               # Servidor API
│   ├── server.js         # Express server
│   ├── routes/           # Endpoints API
│   │   ├── chat.js       # Chat con IA
│   │   ├── flow.js       # Estado del flujo
│   │   └── stripe.js     # Pagos
│   ├── middleware/       # Middleware
│   │   ├── rateLimiter.js    # Rate limiting
│   │   └── recaptcha.js      # Anti-bot
│   └── services/         # Servicios
│       ├── aiService.js      # Groq/Gemini
│       ├── flowService.js    # Motor de flujo
│       └── donorService.js   # Gestión donadores
│
├── flujo-iso.json        # Definición del flujo
├── package.json          # Dependencias
└── .env                  # Variables de entorno
```

## 🔄 Flujo de Trabajo

1. **Usuario describe su idea** → Chat con IA
2. **IA clasifica y estructura** → Determina tipo de flujo
3. **Nodos browser_ai** → Procesados por Groq/Gemini
4. **Nodos antigravity** → Generan bloque para copiar a Antigravity
5. **Usuario pega respuesta de Antigravity** → Continúa el flujo

## 💳 Sistema de Donaciones

- **Límite normal**: 20 consultas/día
- **Límite donadores**: 50 consultas/día
- **Popup de donación**: Aparece después de 3 consultas en 5 minutos (no bloqueante)

## 🛡️ Seguridad

- **Rate Limiting**: Límite por IP con ventana de 24h
- **reCAPTCHA**: Verificación anti-bot al inicio
- **CORS**: Configurado para frontend permitido
- **Rotación de API Keys**: 6 keys de Groq en round-robin

## 📝 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/config` | Configuración pública |
| POST | `/api/chat` | Enviar mensaje |
| POST | `/api/chat/antigravity-response` | Respuesta de Antigravity |
| GET | `/api/flow/status` | Estado del flujo |
| GET | `/api/flow/schema` | Esquema JSON |
| POST | `/api/stripe/create-checkout` | Crear sesión de pago |
| POST | `/api/captcha/verify` | Verificar CAPTCHA |
| GET | `/api/donor/verify` | Verificar si es donador |

## 🤝 Contribuir

1. Fork del repositorio
2. Crear rama de feature
3. Commit de cambios
4. Push a la rama
5. Crear Pull Request

## 📄 Licencia

MIT
