// =============================================================================
// TESIVIL App Hub - Configuración
// =============================================================================

const CONFIG = {
    // Supabase Configuration
    // TODO: Reemplazar con tus credenciales reales de Supabase
    SUPABASE_URL: 'https://bokcbcvarvvzkaqakclu.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJva2NiY3ZhcnZ2emthcWFrY2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTkxNzUsImV4cCI6MjA4MTkzNTE3NX0.KUD-BrHqQqTwGtpkQL6wqPWMrK6bKSykaxuQFiivCpc',

    // Direct Download Base URL (VM)
    DOWNLOAD_BASE_URL: 'https://apps.tesivil.com/downloads/apks/',

    // App Settings
    APP_NAME: 'TESIVIL App Hub',
    APP_DESCRIPTION: 'Catálogo de aplicaciones del ecosistema TESIVIL',

    // UI Settings
    SKELETON_COUNT: 8, // Número de skeletons a mostrar durante carga
    ANIMATION_DURATION: 300, // ms

    // Categories
    CATEGORIES: {
        'all': 'Todas',
        'android': 'Android',
        'web': 'Web App',
        'desktop': 'Desktop',
        'api': 'API/Servicio'
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
