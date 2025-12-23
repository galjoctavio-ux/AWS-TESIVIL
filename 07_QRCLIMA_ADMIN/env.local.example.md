# ============================================
# Mr. Frío Admin - Variables de Entorno
# ============================================
# 
# INSTRUCCIONES:
# 1. Copia este archivo a .env.local
# 2. Reemplaza los valores PLACEHOLDER con tus claves reales
# 3. NUNCA subas .env.local a Git
# 
# ============================================

# ============================================
# FIREBASE ADMIN SDK
# Obtener de: Firebase Console > Configuración > Cuentas de servicio
# ============================================

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# La clave privada debe estar en una sola línea con \n para los saltos de línea
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"

# ============================================
# NEXTAUTH (Autenticación del panel)
# ============================================

# Genera un secret aleatorio con: openssl rand -base64 32
NEXTAUTH_SECRET=your-super-secret-key-here

# URL donde corre el panel admin
NEXTAUTH_URL=http://localhost:3000

# ============================================
# CONTROL DE ACCESO
# ============================================

# Emails autorizados para acceder al panel (separados por coma)
ADMIN_EMAILS=admin@tudominio.com,otro.admin@tudominio.com

# ============================================
# GROQ AI (Para moderación avanzada)
# ============================================

# Opcional - Solo si quieres re-evaluar contenido desde el panel
GROQ_API_KEY=gsk_your_groq_key
