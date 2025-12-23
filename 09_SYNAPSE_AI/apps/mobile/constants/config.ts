// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://13.59.28.73:3001';

// App Configuration
export const APP_NAME = 'SYNAPSE AI';
export const APP_VERSION = '0.1.0';

// Module Colors
export const COLORS = {
    // Brand
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#6D28D9',

    // Background (Updated to spec #0B0E14)
    background: '#0B0E14',
    surface: '#12151C',
    surfaceLight: '#1A1D26',
    surfaceBorder: '#2E1065',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#6B7280',

    // Module accent colors
    engine: '#8B5CF6',
    feed: '#06B6D4',
    pulse: '#F59E0B',
    showcase: '#10B981',
    academy: '#EC4899',

    // Status
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Glow effects
    glowEngine: 'rgba(139, 92, 246, 0.4)',
    glowFeed: 'rgba(6, 182, 212, 0.4)',
    glowPulse: 'rgba(245, 158, 11, 0.4)',
    glowShowcase: 'rgba(16, 185, 129, 0.4)',
    glowAcademy: 'rgba(236, 72, 153, 0.4)',

    // Skeleton loading
    skeletonBase: '#1A1D26',
    skeletonHighlight: '#2A2D36',
};


// Typography
export const FONTS = {
    regular: 'Inter',
    medium: 'Inter-Medium',
    semibold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    mono: 'JetBrainsMono',
};

// Spacing
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Border Radius
export const RADIUS = {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
};


// Engine Module Styles (matching spec naming conventions)
export const ENGINE_STYLES = [
    { id: 'fotorealismo', label: 'Fotorealismo', description: 'Como una foto real', route: 'A' as const },
    { id: 'arquitectura', label: 'Arquitectura', description: 'Diseño espacial', route: 'A' as const },
    { id: 'minimalismo', label: 'Minimalismo', description: 'Simple y limpio', route: 'A' as const },
    { id: 'anime', label: 'Anime', description: 'Estilo japonés', route: 'B' as const },
    { id: '3d_pixar', label: '3D Pixar', description: 'Animación 3D', route: 'B' as const },
    { id: 'cyberpunk', label: 'Cyberpunk', description: 'Futurista neón', route: 'B' as const },
    { id: 'oleo', label: 'Óleo', description: 'Pintura clásica', route: 'B' as const },
    { id: 'arte_digital', label: 'Arte Digital', description: 'Ilustración moderna', route: 'B' as const },
] as const;

export type StyleId = typeof ENGINE_STYLES[number]['id'];
export type StyleRoute = 'A' | 'B';

// Full style configuration per spec 01_engine_spec.md
export const STYLES_CONFIG: Record<StyleId, {
    route: StyleRoute;
    lenses?: string[];
    techniques?: string[];
    lighting: string[];
}> = {
    // Route A: Photographic
    fotorealismo: {
        route: 'A',
        lenses: ['wide', 'macro', 'bokeh', 'drone'],
        lighting: ['natural', 'studio', 'golden', 'dramatic'],
    },
    arquitectura: {
        route: 'A',
        lenses: ['wide', 'drone', 'bokeh'],
        lighting: ['natural', 'golden', 'studio'],
    },
    minimalismo: {
        route: 'A',
        lenses: ['wide', 'macro'],
        lighting: ['studio', 'natural', 'soft'],
    },
    // Route B: Artistic
    anime: {
        route: 'B',
        techniques: ['fine_lines', 'vibrant', 'thick_lines'],
        lighting: ['soft', 'neon', 'high_contrast'],
    },
    '3d_pixar': {
        route: 'B',
        techniques: ['vibrant', 'glow', 'thick_lines'],
        lighting: ['soft', 'neon', 'studio'],
    },
    cyberpunk: {
        route: 'B',
        techniques: ['vibrant', 'fine_lines', 'glow'],
        lighting: ['neon', 'high_contrast', 'dramatic'],
    },
    oleo: {
        route: 'B',
        techniques: ['thick_lines', 'vibrant', 'fine_lines'],
        lighting: ['soft', 'dramatic', 'golden'],
    },
    arte_digital: {
        route: 'B',
        techniques: ['vibrant', 'fine_lines', 'glow'],
        lighting: ['soft', 'neon', 'high_contrast'],
    },
};

// Lens options with visual icons (Route A - Photographic)
export const LENSES = [
    { id: 'wide', label: 'Gran Angular', icon: '📷', hasImage: true },
    { id: 'macro', label: 'Macro', icon: '🔬', hasImage: true },
    { id: 'bokeh', label: 'Bokeh', icon: '✨', hasImage: true },
    { id: 'drone', label: 'Drone', icon: '🚁', hasImage: true },
] as const;

// Technique options with visual icons (Route B - Artistic)
export const TECHNIQUES = [
    { id: 'fine_lines', label: 'Líneas Finas', icon: '✏️', hasImage: true },
    { id: 'vibrant', label: 'Vibrante', icon: '🎨', hasImage: true },
    { id: 'thick_lines', label: 'Trazos Gruesos', icon: '🖌️', hasImage: true },
    { id: 'glow', label: 'Resplandor', icon: '💫', hasImage: true },
] as const;

// Lighting options with visual icons (both routes)
export const LIGHTINGS = [
    { id: 'natural', label: 'Natural', icon: '☀️', hasImage: true },
    { id: 'studio', label: 'Estudio', icon: '💡', hasImage: true },
    { id: 'golden', label: 'Golden Hour', icon: '🌅', hasImage: true },
    { id: 'dramatic', label: 'Dramática', icon: '🎭', hasImage: true },
    { id: 'soft', label: 'Suave', icon: '🌤️', hasImage: true },
    { id: 'neon', label: 'Neón', icon: '💜', hasImage: true },
    { id: 'high_contrast', label: 'Alto Contraste', icon: '⚫', hasImage: true },
] as const;

// Aspect Ratios
export const ASPECT_RATIOS = [
    { id: '1:1', label: 'Cuadrado', icon: '⬜' },
    { id: '16:9', label: 'Paisaje', icon: '🖼️' },
    { id: '9:16', label: 'Retrato', icon: '📱' },
    { id: '4:3', label: 'Clásico', icon: '📺' },
    { id: '3:2', label: 'Foto', icon: '📷' },
] as const;

// Target Engines
export const TARGET_ENGINES = [
    { id: 'midjourney', label: 'Midjourney', icon: '🎨' },
    { id: 'dalle', label: 'DALL-E', icon: '🤖' },
    { id: 'stable_diffusion', label: 'Stable Diffusion', icon: '🔮' },
    { id: 'flux', label: 'Flux', icon: '⚡' },
] as const;

// Free vs Premium limits
export const LIMITS = {
    free: {
        promptsPerDay: 5,
        historySize: 5,
        stylesAvailable: 4,
    },
    premium: {
        promptsPerDay: Infinity,
        historySize: 100,
        stylesAvailable: 8,
    },
};
