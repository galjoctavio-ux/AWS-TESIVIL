// Light theme colors
export const COLORS_LIGHT = {
    // Brand
    primary: '#7C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#5B21B6',

    // Background
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceLight: '#F3F4F6',
    surfaceBorder: '#E5E7EB',

    // Text
    textPrimary: '#111827',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',

    // Module accent colors
    engine: '#7C3AED',
    feed: '#0891B2',
    pulse: '#D97706',
    showcase: '#059669',
    academy: '#DB2777',

    // Status
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',

    // Glow effects (subtle for light mode)
    glowEngine: 'rgba(124, 58, 237, 0.15)',
    glowFeed: 'rgba(8, 145, 178, 0.15)',
    glowPulse: 'rgba(217, 119, 6, 0.15)',
    glowShowcase: 'rgba(5, 150, 105, 0.15)',
    glowAcademy: 'rgba(219, 39, 119, 0.15)',

    // Skeleton loading
    skeletonBase: '#E5E7EB',
    skeletonHighlight: '#F3F4F6',
};

// Dark theme colors (current theme)
export const COLORS_DARK = {
    // Brand
    primary: '#8B5CF6',
    primaryLight: '#A78BFA',
    primaryDark: '#6D28D9',

    // Background
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

export type ThemeColors = typeof COLORS_LIGHT;
