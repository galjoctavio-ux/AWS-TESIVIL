# ═══════════════════════════════════════════════════════════════
# SYNAPSE_AI - Environment Variables
# ═══════════════════════════════════════════════════════════════
# Copy this file to .env and fill in the values
# NEVER commit .env to version control

# ───────────────────────────────────────────────────────────────
# SUPABASE (Database + Auth + Storage)
# Get from: https://app.supabase.com → Project Settings → API
# ───────────────────────────────────────────────────────────────
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxx

# ───────────────────────────────────────────────────────────────
# AI PROVIDERS
# ───────────────────────────────────────────────────────────────

# GROQ - Used for: Engine (Prompts), Pulse (Refiner), Showcase (Moderation)
# Get from: https://console.groq.com/keys
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxx

# GEMINI - Used for: Feed (News Processing)
# Get from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxx

# OPENROUTER - Used for: Pulse (Model Sync)
# Get from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxx

# ───────────────────────────────────────────────────────────────
# MOBILE APP (Expo)
# ───────────────────────────────────────────────────────────────
# Get from: https://expo.dev/accounts/[your-username]/settings/access-tokens
EXPO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxx

# EAS Build Configuration
EXPO_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# ───────────────────────────────────────────────────────────────
# DEPLOYMENT (VPS)
# ───────────────────────────────────────────────────────────────
VPS_HOST=your-server.example.com
VPS_USER=deploy
VPS_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----...

# ───────────────────────────────────────────────────────────────
# PUSH NOTIFICATIONS (Firebase Cloud Messaging)
# ───────────────────────────────────────────────────────────────
FCM_SERVER_KEY=AAAAxxxxxxxxxxxxxxxxxxxxxxx

# ───────────────────────────────────────────────────────────────
# OPTIONAL: Analytics & Ads
# ───────────────────────────────────────────────────────────────
# ADMOB_APP_ID=ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx
# ADMOB_BANNER_ID=ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx

# ───────────────────────────────────────────────────────────────
# STRIPE (Academy Payments)
# Get from: https://dashboard.stripe.com/apikeys
# ───────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxx

# App URL for Stripe redirects
APP_URL=https://synapse.app

# ───────────────────────────────────────────────────────────────
# DEVELOPMENT
# ───────────────────────────────────────────────────────────────
NODE_ENV=development
API_PORT=3000
LOG_LEVEL=debug

