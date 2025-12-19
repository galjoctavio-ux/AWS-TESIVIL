// API Configuration
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// App Configuration
export const APP_NAME = 'SYNAPSE AI';
export const APP_VERSION = '0.1.0';

// Module Colors
export const COLORS = {
    // Brand
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#6D28D9',

    // Background
    background: '#0F0F23',
    surface: '#16162A',
    surfaceLight: '#1A1A2E',
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

    // Status
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
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
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
};

// Engine Module Styles
export const ENGINE_STYLES = [
    { id: 'fotorealismo', label: 'Fotorealismo', route: 'A' },
    { id: 'anime', label: 'Anime', route: 'B' },
    { id: '3d_pixar', label: '3D Pixar', route: 'B' },
    { id: 'cyberpunk', label: 'Cyberpunk', route: 'B' },
    { id: 'oleo', label: 'Óleo', route: 'B' },
    { id: 'arte_digital', label: 'Arte Digital', route: 'B' },
    { id: 'minimalista', label: 'Minimalista', route: 'B' },
    { id: 'acuarela', label: 'Acuarela', route: 'B' },
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
