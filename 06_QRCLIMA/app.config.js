export default {
    expo: {
        ...require('./app.json').expo,
        // EAS Update configuration
        updates: {
            url: 'https://u.expo.dev/ec0bc67e-48e5-438c-b0ed-d9d55aee6bf5',
        },
        runtimeVersion: {
            policy: 'appVersion',
        },
        extra: {
            // Lee la clave de la variable de entorno, con fallback para desarrollo
            // IMPORTANT: Set GOOGLE_MAPS_API_KEY env var for builds
            googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
            // Supabase (existing - for other functions)
            supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
            supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
            // Supabase for Price Intelligence (separate DB)
            supabasePriceUrl: process.env.EXPO_PUBLIC_SUPABASE_PRICE_URL || '',
            supabasePriceAnonKey: process.env.EXPO_PUBLIC_SUPABASE_PRICE_ANON_KEY || '',
            // EAS Project ID
            eas: {
                projectId: 'ec0bc67e-48e5-438c-b0ed-d9d55aee6bf5',
            },
        },
    },
};


