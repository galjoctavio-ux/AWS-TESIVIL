# ============================================
# Mr. Frío - Configuración de Entorno
# ============================================
# INSTRUCCIONES:
# 1. Copia este archivo a .env
# 2. Reemplaza los valores PLACEHOLDER con tus claves reales
# 3. NUNCA subas el archivo .env a Git
# ============================================

# ============================================
# FIREBASE CONFIGURATION
# ============================================
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# ============================================
# STRIPE CONFIGURATION
# Obtén tus claves en: https://dashboard.stripe.com/apikeys
# ============================================

# Clave Pública (Publishable Key) - Segura para el cliente
# Usa pk_test_... para desarrollo y pk_live_... para producción
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_PLACEHOLDER

# Clave Secreta (Secret Key) - SOLO EN BACKEND/CLOUD FUNCTIONS
# NUNCA incluyas esto en la app móvil
# STRIPE_SECRET_KEY=sk_test_PLACEHOLDER

# Webhook Secret - Para Cloud Functions
# STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER

# ============================================
# MERCADO PAGO CONFIGURATION
# Obtén tus claves en: https://www.mercadopago.com.mx/developers/panel/app
# ============================================

# Clave Pública (Public Key) - Segura para el cliente
# Usa TEST-... para desarrollo y APP_USR-... para producción
EXPO_PUBLIC_MP_PUBLIC_KEY=TEST-PLACEHOLDER

# Access Token - SOLO EN BACKEND/CLOUD FUNCTIONS
# NUNCA incluyas esto en la app móvil
# MP_ACCESS_TOKEN=TEST-1234567890

# ============================================
# APP CONFIGURATION
# ============================================

# URL base de la API (Cloud Functions)
EXPO_PUBLIC_API_URL=https://us-central1-your-project.cloudfunctions.net

# URL del QR Web View
EXPO_PUBLIC_QR_WEB_URL=https://qr.tesivil.app/a

# ============================================
# GROQ AI CONFIGURATION (Para moderación de comentarios en Training)
# Obtén tu clave en: https://console.groq.com/keys
# ============================================
# Usamos Groq por su velocidad y costo - Para moderar comentarios en tiempo real
EXPO_PUBLIC_GROQ_API_KEY=tu_api_key_aqui

# ============================================
# GEMINI 2.5 FLASH CONFIGURATION (Para generación de noticias)
# Obtén tu clave en: https://aistudio.google.com/app/apikey
# ============================================
# Usamos Gemini para generar contenido de noticias HVAC automáticamente
EXPO_PUBLIC_GEMINI_API_KEY=tu_api_key_aqui

# ============================================
# DESARROLLO
# ============================================
# Modo de desarrollo (true/false)
EXPO_PUBLIC_DEV_MODE=true

# Habilitar logs detallados
EXPO_PUBLIC_DEBUG_LOGGING=true
