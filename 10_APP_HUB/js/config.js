// =============================================================================
// TESIVIL App Hub - Configuración
// =============================================================================

const CONFIG = {
    // Supabase Configuration
    // TODO: Reemplazar con tus credenciales reales de Supabase
    SUPABASE_URL: 'https://tu-proyecto.supabase.co',
    SUPABASE_ANON_KEY: 'tu-anon-key-aqui',

    // Google Drive Download Base URL
    DRIVE_DOWNLOAD_BASE: 'https://drive.google.com/uc?export=download&id=',

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
