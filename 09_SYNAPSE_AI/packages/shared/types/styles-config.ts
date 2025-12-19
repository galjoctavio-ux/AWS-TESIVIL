// ═══════════════════════════════════════════════════════════════
// SYNAPSE_AI - Styles Configuration
// Engine Module: Style definitions and branching logic
// ═══════════════════════════════════════════════════════════════

import type { StyleId, LensId, TechniqueId, LightingId } from './index';

// ───────────────────────────────────────────────────────────────
// STYLE ROUTES
// A = Photographic (shows lenses)
// B = Artistic (shows techniques)
// ───────────────────────────────────────────────────────────────

export type StyleRoute = 'A' | 'B';

interface StyleConfig {
    id: StyleId;
    name: string;
    nameEn: string;
    route: StyleRoute;
    lenses?: LensId[];
    techniques?: TechniqueId[];
    lighting: LightingId[];
    negativePrompt: string;
    description: string;
}

export const STYLES_CONFIG: Record<StyleId, StyleConfig> = {
    // ─────────────────────────────────────────────────────────────
    // ROUTE A: Photographic Styles
    // ─────────────────────────────────────────────────────────────
    fotorealismo: {
        id: 'fotorealismo',
        name: 'Fotorealismo',
        nameEn: 'Photorealism',
        route: 'A',
        lenses: ['wide', 'macro', 'bokeh', 'drone'],
        lighting: ['natural', 'studio', 'golden', 'dramatic'],
        negativePrompt: '--no cartoon, drawing, anime, illustration',
        description: 'Imágenes ultra-realistas con calidad de fotografía profesional',
    },
    arquitectura: {
        id: 'arquitectura',
        name: 'Arquitectura',
        nameEn: 'Architecture',
        route: 'A',
        lenses: ['wide', 'drone', 'bokeh'],
        lighting: ['natural', 'golden', 'studio'],
        negativePrompt: '--no cartoon, illustration, distorted',
        description: 'Visualización arquitectónica y renders interiores/exteriores',
    },
    minimalismo: {
        id: 'minimalismo',
        name: 'Minimalismo',
        nameEn: 'Minimalism',
        route: 'A',
        lenses: ['wide', 'macro'],
        lighting: ['studio', 'natural'],
        negativePrompt: '--no busy, cluttered, detailed, complex',
        description: 'Diseño limpio y espacios negativos elegantes',
    },

    // ─────────────────────────────────────────────────────────────
    // ROUTE B: Artistic Styles
    // ─────────────────────────────────────────────────────────────
    anime: {
        id: 'anime',
        name: 'Anime',
        nameEn: 'Anime',
        route: 'B',
        techniques: ['fine_lines', 'vibrant', 'cel_shading'],
        lighting: ['soft', 'high_contrast', 'neon'],
        negativePrompt: '--no realistic, photo, 3d, western',
        description: 'Estilo japonés con líneas definidas y colores vibrantes',
    },
    '3d_pixar': {
        id: '3d_pixar',
        name: '3D Pixar',
        nameEn: '3D Pixar',
        route: 'B',
        techniques: ['global_light', 'vibrant', 'soft_texture'],
        lighting: ['soft', 'neon'],
        negativePrompt: '--no 2d, flat, sketch, realistic',
        description: 'Personajes 3D estilo Disney/Pixar con texturas suaves',
    },
    cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        nameEn: 'Cyberpunk',
        route: 'B',
        techniques: ['vibrant', 'fine_lines', 'glow'],
        lighting: ['neon', 'high_contrast'],
        negativePrompt: '--no daylight, natural, vintage, warm colors',
        description: 'Futurismo oscuro con neones y estética urbana',
    },
    oleo: {
        id: 'oleo',
        name: 'Óleo Clásico',
        nameEn: 'Oil Painting',
        route: 'B',
        techniques: ['paint_effect', 'fine_lines', 'texture'],
        lighting: ['soft', 'dramatic'],
        negativePrompt: '--no photo, digital, sharp, modern',
        description: 'Pintura al óleo con pinceladas visibles',
    },
    arte_digital: {
        id: 'arte_digital',
        name: 'Arte Digital',
        nameEn: 'Digital Art',
        route: 'B',
        techniques: ['vibrant', 'global_light', 'fine_lines'],
        lighting: ['soft', 'neon', 'high_contrast'],
        negativePrompt: '--no photo, traditional, realistic',
        description: 'Ilustración digital moderna y concept art',
    },
};

// ───────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ───────────────────────────────────────────────────────────────

export function getStyleConfig(styleId: StyleId): StyleConfig {
    return STYLES_CONFIG[styleId];
}

export function getAvailableParams(styleId: StyleId) {
    const config = STYLES_CONFIG[styleId];

    if (config.route === 'A') {
        return {
            showLenses: true,
            showTechniques: false,
            lenses: config.lenses || [],
            lighting: config.lighting,
        };
    } else {
        return {
            showLenses: false,
            showTechniques: true,
            techniques: config.techniques || [],
            lighting: config.lighting,
        };
    }
}

export function getNegativePrompt(styleId: StyleId): string {
    return STYLES_CONFIG[styleId].negativePrompt;
}

// ───────────────────────────────────────────────────────────────
// DISPLAY NAMES
// ───────────────────────────────────────────────────────────────

export const LENS_NAMES: Record<LensId, { name: string; icon: string }> = {
    wide: { name: 'Gran Angular', icon: '📷' },
    macro: { name: 'Macro', icon: '🔍' },
    bokeh: { name: 'Bokeh', icon: '✨' },
    drone: { name: 'Vista Aérea', icon: '🚁' },
};

export const TECHNIQUE_NAMES: Record<TechniqueId, { name: string; icon: string }> = {
    fine_lines: { name: 'Líneas Finas', icon: '✏️' },
    vibrant: { name: 'Vibrante', icon: '🌈' },
    cel_shading: { name: 'Cel Shading', icon: '🎨' },
    global_light: { name: 'Luz Global', icon: '💡' },
    soft_texture: { name: 'Textura Suave', icon: '☁️' },
    glow: { name: 'Brillo Neón', icon: '⚡' },
    paint_effect: { name: 'Efecto Pintura', icon: '🖌️' },
    texture: { name: 'Texturizado', icon: '🧱' },
};

export const LIGHTING_NAMES: Record<LightingId, { name: string; icon: string }> = {
    natural: { name: 'Natural', icon: '☀️' },
    studio: { name: 'Estudio', icon: '💡' },
    golden: { name: 'Golden Hour', icon: '🌅' },
    dramatic: { name: 'Dramático', icon: '🌑' },
    soft: { name: 'Suave', icon: '☁️' },
    high_contrast: { name: 'Alto Contraste', icon: '◐' },
    neon: { name: 'Neón', icon: '💜' },
};

export const ASPECT_RATIO_OPTIONS = [
    { id: '1:1', name: 'Cuadrado', icon: '□' },
    { id: '16:9', name: 'Paisaje', icon: '▭' },
    { id: '9:16', name: 'Retrato', icon: '▯' },
] as const;

export const ENGINE_OPTIONS = [
    { id: 'midjourney', name: 'Midjourney', icon: '🎨' },
    { id: 'dalle3', name: 'DALL-E 3', icon: '🤖' },
    { id: 'stable', name: 'Stable Diffusion', icon: '🖼️' },
] as const;
