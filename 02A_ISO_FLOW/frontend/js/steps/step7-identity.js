/**
 * IA-Flow - Step 7: Visual Identity
 * Color palette selector and style configuration
 */

import * as State from '../state.js';

// Preset color palettes
const COLOR_PALETTES = [
    {
        id: 'purple-violet',
        name: 'Púrpura Violeta',
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#a855f7',
        preview: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)'
    },
    {
        id: 'blue-cyan',
        name: 'Azul Cian',
        primary: '#3b82f6',
        secondary: '#0ea5e9',
        accent: '#06b6d4',
        preview: 'linear-gradient(135deg, #3b82f6, #0ea5e9, #06b6d4)'
    },
    {
        id: 'green-teal',
        name: 'Verde Menta',
        primary: '#10b981',
        secondary: '#14b8a6',
        accent: '#2dd4bf',
        preview: 'linear-gradient(135deg, #10b981, #14b8a6, #2dd4bf)'
    },
    {
        id: 'orange-amber',
        name: 'Naranja Ámbar',
        primary: '#f97316',
        secondary: '#f59e0b',
        accent: '#eab308',
        preview: 'linear-gradient(135deg, #f97316, #f59e0b, #eab308)'
    },
    {
        id: 'pink-rose',
        name: 'Rosa Coral',
        primary: '#ec4899',
        secondary: '#f43f5e',
        accent: '#fb7185',
        preview: 'linear-gradient(135deg, #ec4899, #f43f5e, #fb7185)'
    },
    {
        id: 'slate-gray',
        name: 'Gris Profesional',
        primary: '#475569',
        secondary: '#64748b',
        accent: '#94a3b8',
        preview: 'linear-gradient(135deg, #475569, #64748b, #94a3b8)'
    }
];

// Style presets
const STYLE_PRESETS = [
    { id: 'moderno', name: 'Moderno', icon: '✨', description: 'Bordes redondeados, sombras suaves' },
    { id: 'minimalista', name: 'Minimalista', icon: '🎯', description: 'Limpio, sin decoraciones' },
    { id: 'corporativo', name: 'Corporativo', icon: '🏢', description: 'Profesional, estructurado' },
    { id: 'creativo', name: 'Creativo', icon: '🎨', description: 'Formas orgánicas, dinámico' }
];

// Font options
const FONT_OPTIONS = [
    { id: 'Inter', name: 'Inter', sample: 'Aa Bb Cc' },
    { id: 'Roboto', name: 'Roboto', sample: 'Aa Bb Cc' },
    { id: 'Poppins', name: 'Poppins', sample: 'Aa Bb Cc' },
    { id: 'Outfit', name: 'Outfit', sample: 'Aa Bb Cc' },
    { id: 'system-ui', name: 'Sistema', sample: 'Aa Bb Cc' }
];

/**
 * Render the visual identity step
 */
export function render(config, state) {
    const vi = state.visualIdentity;

    return `
        <div class="step-identity">
            <div class="identity-header">
                <h2>🎨 Identidad Visual</h2>
                <p>Define el aspecto visual de tu proyecto. Estos colores y estilos serán aplicados por Antigravity.</p>
            </div>
            
            <div class="identity-sections">
                <!-- Color Palette -->
                <div class="identity-section">
                    <h3>🎨 Paleta de Colores</h3>
                    <p class="section-description">Selecciona una paleta predefinida o personaliza los colores.</p>
                    
                    <div class="palette-grid">
                        ${COLOR_PALETTES.map(palette => `
                            <div class="palette-card ${vi.primaryColor === palette.primary ? 'selected' : ''}" 
                                 data-palette="${palette.id}"
                                 data-primary="${palette.primary}"
                                 data-secondary="${palette.secondary}"
                                 data-accent="${palette.accent}">
                                <div class="palette-preview" style="background: ${palette.preview}"></div>
                                <div class="palette-name">${palette.name}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="custom-colors">
                        <h4>O personaliza:</h4>
                        <div class="color-inputs">
                            <label class="color-input">
                                <span>Primario</span>
                                <input type="color" id="color-primary" value="${vi.primaryColor}">
                            </label>
                            <label class="color-input">
                                <span>Secundario</span>
                                <input type="color" id="color-secondary" value="${vi.secondaryColor}">
                            </label>
                            <label class="color-input">
                                <span>Acento</span>
                                <input type="color" id="color-accent" value="${vi.accentColor}">
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Style Preset -->
                <div class="identity-section">
                    <h3>✨ Estilo Visual</h3>
                    <p class="section-description">¿Qué estilo representa mejor tu proyecto?</p>
                    
                    <div class="style-grid">
                        ${STYLE_PRESETS.map(style => `
                            <div class="style-card ${vi.style === style.id ? 'selected' : ''}" 
                                 data-style="${style.id}">
                                <div class="style-icon">${style.icon}</div>
                                <div class="style-name">${style.name}</div>
                                <div class="style-desc">${style.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Dark Mode Toggle -->
                <div class="identity-section">
                    <h3>🌙 Modo de Color</h3>
                    
                    <div class="mode-toggle">
                        <button class="mode-btn ${!vi.darkMode ? 'active' : ''}" data-mode="light">
                            <span class="mode-icon">☀️</span>
                            <span>Modo Claro</span>
                        </button>
                        <button class="mode-btn ${vi.darkMode ? 'active' : ''}" data-mode="dark">
                            <span class="mode-icon">🌙</span>
                            <span>Modo Oscuro</span>
                        </button>
                    </div>
                </div>
                
                <!-- Font Selection -->
                <div class="identity-section">
                    <h3>📝 Tipografía</h3>
                    <p class="section-description">Selecciona la fuente principal del proyecto.</p>
                    
                    <div class="font-grid">
                        ${FONT_OPTIONS.map(font => `
                            <div class="font-card ${vi.fontFamily === font.id ? 'selected' : ''}" 
                                 data-font="${font.id}">
                                <div class="font-sample" style="font-family: ${font.id}, sans-serif">${font.sample}</div>
                                <div class="font-name">${font.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <!-- Live Preview -->
            <div class="identity-preview">
                <h4>Vista Previa</h4>
                <div id="live-preview" class="live-preview" 
                     style="--preview-primary: ${vi.primaryColor}; 
                            --preview-secondary: ${vi.secondaryColor};
                            --preview-accent: ${vi.accentColor};
                            background: ${vi.darkMode ? '#1a1a24' : '#ffffff'}">
                    <div class="preview-header" style="background: linear-gradient(135deg, ${vi.primaryColor}, ${vi.secondaryColor})">
                        <span style="font-family: ${vi.fontFamily}, sans-serif">${state.projectName || 'Mi Proyecto'}</span>
                    </div>
                    <div class="preview-content">
                        <div class="preview-card">
                            <span style="font-family: ${vi.fontFamily}, sans-serif; color: ${vi.darkMode ? '#f8fafc' : '#1a1a24'}">
                                Ejemplo de contenido
                            </span>
                        </div>
                        <button class="preview-btn" style="background: ${vi.accentColor}">Botón</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Initialize the step
 */
export async function init(config, state) {
    setupPaletteSelector();
    setupCustomColors();
    setupStyleSelector();
    setupModeToggle();
    setupFontSelector();
}

/**
 * Setup palette selector
 */
function setupPaletteSelector() {
    const cards = document.querySelectorAll('.palette-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const primary = card.dataset.primary;
            const secondary = card.dataset.secondary;
            const accent = card.dataset.accent;

            // Update color inputs
            document.getElementById('color-primary').value = primary;
            document.getElementById('color-secondary').value = secondary;
            document.getElementById('color-accent').value = accent;

            // Update state
            State.setNestedValue('visualIdentity.primaryColor', primary);
            State.setNestedValue('visualIdentity.secondaryColor', secondary);
            State.setNestedValue('visualIdentity.accentColor', accent);

            updatePreview();
        });
    });
}

/**
 * Setup custom color inputs
 */
function setupCustomColors() {
    const primaryInput = document.getElementById('color-primary');
    const secondaryInput = document.getElementById('color-secondary');
    const accentInput = document.getElementById('color-accent');

    if (primaryInput) {
        primaryInput.addEventListener('input', () => {
            State.setNestedValue('visualIdentity.primaryColor', primaryInput.value);
            updatePreview();
        });
    }

    if (secondaryInput) {
        secondaryInput.addEventListener('input', () => {
            State.setNestedValue('visualIdentity.secondaryColor', secondaryInput.value);
            updatePreview();
        });
    }

    if (accentInput) {
        accentInput.addEventListener('input', () => {
            State.setNestedValue('visualIdentity.accentColor', accentInput.value);
            updatePreview();
        });
    }
}

/**
 * Setup style selector
 */
function setupStyleSelector() {
    const cards = document.querySelectorAll('.style-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            State.setNestedValue('visualIdentity.style', card.dataset.style);
        });
    });
}

/**
 * Setup mode toggle
 */
function setupModeToggle() {
    const buttons = document.querySelectorAll('.mode-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const isDark = btn.dataset.mode === 'dark';
            State.setNestedValue('visualIdentity.darkMode', isDark);
            updatePreview();
        });
    });
}

/**
 * Setup font selector
 */
function setupFontSelector() {
    const cards = document.querySelectorAll('.font-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            State.setNestedValue('visualIdentity.fontFamily', card.dataset.font);
            updatePreview();
        });
    });
}

/**
 * Update live preview
 */
function updatePreview() {
    const state = State.getState();
    const vi = state.visualIdentity;
    const preview = document.getElementById('live-preview');

    if (preview) {
        preview.style.setProperty('--preview-primary', vi.primaryColor);
        preview.style.setProperty('--preview-secondary', vi.secondaryColor);
        preview.style.setProperty('--preview-accent', vi.accentColor);
        preview.style.background = vi.darkMode ? '#1a1a24' : '#ffffff';

        const header = preview.querySelector('.preview-header');
        if (header) {
            header.style.background = `linear-gradient(135deg, ${vi.primaryColor}, ${vi.secondaryColor})`;
        }

        const btn = preview.querySelector('.preview-btn');
        if (btn) {
            btn.style.background = vi.accentColor;
        }

        const text = preview.querySelector('.preview-card span');
        if (text) {
            text.style.color = vi.darkMode ? '#f8fafc' : '#1a1a24';
            text.style.fontFamily = `${vi.fontFamily}, sans-serif`;
        }
    }
}

/**
 * Validate step
 */
export function validate(config, state) {
    // All fields have defaults
    return true;
}

/**
 * Collect step data
 */
export function collectData(config, state) {
    return null;
}
