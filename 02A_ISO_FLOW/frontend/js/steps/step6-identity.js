/**
 * IA-Flow - Step 6: Visual Identity
 * Two paths: User-guided or AI-automatic design
 */

import * as State from '../state.js';

/**
 * Render the visual identity step
 */
export function render(config, state) {
    const identityState = state.identityEvaluation || {};

    return `
        <div class="step-identity">
            <div class="identity-intro">
                <div class="intro-card">
                    <div class="intro-icon">🎨</div>
                    <div class="intro-content">
                        <h3>Identidad Visual del Proyecto</h3>
                        <p>Define los colores, tipografía y estilo visual. Puedes guiar a la IA con tus preferencias o dejar que elija automáticamente.</p>
                    </div>
                </div>
                
                <div class="agent-notice">
                    <span class="notice-icon">💡</span>
                    <span class="notice-text">
                        <strong>Importante:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity para este prompt.
                    </span>
                </div>
            </div>
            
            <!-- Path Selection -->
            ${!identityState.pathSelected ? `
                <div class="path-selection">
                    <h3>¿Cómo prefieres definir la identidad visual?</h3>
                    
                    <div class="path-options">
                        <div class="path-option" data-path="custom">
                            <div class="path-icon">🎯</div>
                            <div class="path-content">
                                <h4>Personalizado</h4>
                                <p>Proporciona tus preferencias de colores, estilos y referencias. La IA las usará como base.</p>
                            </div>
                            <button id="select-custom-path" class="path-btn">Elegir →</button>
                        </div>
                        
                        <div class="path-option" data-path="auto">
                            <div class="path-icon">✨</div>
                            <div class="path-content">
                                <h4>Automático (IA decide)</h4>
                                <p>La IA analizará el proyecto y creará la mejor identidad visual posible.</p>
                            </div>
                            <button id="select-auto-path" class="path-btn">Elegir →</button>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <!-- Custom Path Form with Visual Selectors -->
            ${identityState.pathSelected === 'custom' && !identityState.completed ? `
                <div class="identity-sections">
                    <!-- Color Palette -->
                    <div class="identity-section">
                        <h3>🎨 Paleta de Colores</h3>
                        <p class="section-description">Selecciona una paleta predefinida o personaliza los colores.</p>
                        
                        <div class="palette-grid">
                            <div class="palette-card ${state.visualIdentity?.primaryColor === '#6366f1' ? 'selected' : ''}" 
                                 data-palette="purple-violet"
                                 data-primary="#6366f1"
                                 data-secondary="#8b5cf6"
                                 data-accent="#a855f7">
                                <div class="palette-preview" style="background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)"></div>
                                <div class="palette-name">Púrpura Violeta</div>
                            </div>
                            <div class="palette-card ${state.visualIdentity?.primaryColor === '#3b82f6' ? 'selected' : ''}" 
                                 data-palette="blue-cyan"
                                 data-primary="#3b82f6"
                                 data-secondary="#0ea5e9"
                                 data-accent="#06b6d4">
                                <div class="palette-preview" style="background: linear-gradient(135deg, #3b82f6, #0ea5e9, #06b6d4)"></div>
                                <div class="palette-name">Azul Cian</div>
                            </div>
                            <div class="palette-card ${state.visualIdentity?.primaryColor === '#10b981' ? 'selected' : ''}" 
                                 data-palette="green-teal"
                                 data-primary="#10b981"
                                 data-secondary="#14b8a6"
                                 data-accent="#2dd4bf">
                                <div class="palette-preview" style="background: linear-gradient(135deg, #10b981, #14b8a6, #2dd4bf)"></div>
                                <div class="palette-name">Verde Menta</div>
                            </div>
                            <div class="palette-card ${state.visualIdentity?.primaryColor === '#f97316' ? 'selected' : ''}" 
                                 data-palette="orange-amber"
                                 data-primary="#f97316"
                                 data-secondary="#f59e0b"
                                 data-accent="#eab308">
                                <div class="palette-preview" style="background: linear-gradient(135deg, #f97316, #f59e0b, #eab308)"></div>
                                <div class="palette-name">Naranja Ámbar</div>
                            </div>
                            <div class="palette-card ${state.visualIdentity?.primaryColor === '#ec4899' ? 'selected' : ''}" 
                                 data-palette="pink-rose"
                                 data-primary="#ec4899"
                                 data-secondary="#f43f5e"
                                 data-accent="#fb7185">
                                <div class="palette-preview" style="background: linear-gradient(135deg, #ec4899, #f43f5e, #fb7185)"></div>
                                <div class="palette-name">Rosa Coral</div>
                            </div>
                            <div class="palette-card ${state.visualIdentity?.primaryColor === '#475569' ? 'selected' : ''}" 
                                 data-palette="slate-gray"
                                 data-primary="#475569"
                                 data-secondary="#64748b"
                                 data-accent="#94a3b8">
                                <div class="palette-preview" style="background: linear-gradient(135deg, #475569, #64748b, #94a3b8)"></div>
                                <div class="palette-name">Gris Profesional</div>
                            </div>
                        </div>
                        
                        <div class="custom-colors">
                            <h4>O personaliza:</h4>
                            <div class="color-inputs">
                                <label class="color-input">
                                    <span>Primario</span>
                                    <input type="color" id="color-primary" value="${state.visualIdentity?.primaryColor || '#6366f1'}">
                                </label>
                                <label class="color-input">
                                    <span>Secundario</span>
                                    <input type="color" id="color-secondary" value="${state.visualIdentity?.secondaryColor || '#8b5cf6'}">
                                </label>
                                <label class="color-input">
                                    <span>Acento</span>
                                    <input type="color" id="color-accent" value="${state.visualIdentity?.accentColor || '#a855f7'}">
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Style Preset -->
                    <div class="identity-section">
                        <h3>✨ Estilo Visual</h3>
                        <p class="section-description">¿Qué estilo representa mejor tu proyecto?</p>
                        
                        <div class="style-grid">
                            <div class="style-card ${state.visualIdentity?.style === 'moderno' ? 'selected' : ''}" data-style="moderno">
                                <div class="style-icon">✨</div>
                                <div class="style-name">Moderno</div>
                                <div class="style-desc">Bordes redondeados, sombras suaves</div>
                            </div>
                            <div class="style-card ${state.visualIdentity?.style === 'minimalista' ? 'selected' : ''}" data-style="minimalista">
                                <div class="style-icon">🎯</div>
                                <div class="style-name">Minimalista</div>
                                <div class="style-desc">Limpio, sin decoraciones</div>
                            </div>
                            <div class="style-card ${state.visualIdentity?.style === 'corporativo' ? 'selected' : ''}" data-style="corporativo">
                                <div class="style-icon">🏢</div>
                                <div class="style-name">Corporativo</div>
                                <div class="style-desc">Profesional, estructurado</div>
                            </div>
                            <div class="style-card ${state.visualIdentity?.style === 'creativo' ? 'selected' : ''}" data-style="creativo">
                                <div class="style-icon">🎨</div>
                                <div class="style-name">Creativo</div>
                                <div class="style-desc">Formas orgánicas, dinámico</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Dark Mode Toggle -->
                    <div class="identity-section">
                        <h3>🌙 Modo de Color</h3>
                        
                        <div class="mode-toggle">
                            <button class="mode-btn ${!state.visualIdentity?.darkMode ? 'active' : ''}" data-mode="light">
                                <span class="mode-icon">☀️</span>
                                <span>Modo Claro</span>
                            </button>
                            <button class="mode-btn ${state.visualIdentity?.darkMode ? 'active' : ''}" data-mode="dark">
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
                            <div class="font-card ${state.visualIdentity?.fontFamily === 'Inter' ? 'selected' : ''}" data-font="Inter">
                                <div class="font-sample" style="font-family: Inter, sans-serif">Aa Bb Cc</div>
                                <div class="font-name">Inter</div>
                            </div>
                            <div class="font-card ${state.visualIdentity?.fontFamily === 'Roboto' ? 'selected' : ''}" data-font="Roboto">
                                <div class="font-sample" style="font-family: Roboto, sans-serif">Aa Bb Cc</div>
                                <div class="font-name">Roboto</div>
                            </div>
                            <div class="font-card ${state.visualIdentity?.fontFamily === 'Poppins' ? 'selected' : ''}" data-font="Poppins">
                                <div class="font-sample" style="font-family: Poppins, sans-serif">Aa Bb Cc</div>
                                <div class="font-name">Poppins</div>
                            </div>
                            <div class="font-card ${state.visualIdentity?.fontFamily === 'Outfit' ? 'selected' : ''}" data-font="Outfit">
                                <div class="font-sample" style="font-family: Outfit, sans-serif">Aa Bb Cc</div>
                                <div class="font-name">Outfit</div>
                            </div>
                            <div class="font-card ${state.visualIdentity?.fontFamily === 'system-ui' ? 'selected' : ''}" data-font="system-ui">
                                <div class="font-sample" style="font-family: system-ui, sans-serif">Aa Bb Cc</div>
                                <div class="font-name">Sistema</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Additional Notes -->
                    <div class="identity-section">
                        <h3>📝 Notas Adicionales (opcional)</h3>
                        <textarea id="identity-notes" class="identity-textarea" 
                            placeholder="Ej: Referencias de diseño, inspiraciones, qué evitar..."
                            rows="3">${identityState.notes || ''}</textarea>
                    </div>
                    
                    <div class="path-actions">
                        <button id="back-to-selection" class="btn-secondary">← Cambiar opción</button>
                        <button id="generate-custom-prompt" class="generate-sync-btn">
                            📋 Generar Prompt con mis Preferencias
                        </button>
                    </div>
                </div>
            ` : ''}
            
            <!-- Auto Path -->
            ${identityState.pathSelected === 'auto' && !identityState.completed ? `
                <div class="auto-path-info">
                    <div class="auto-icon">✨</div>
                    <h3>Modo Automático</h3>
                    <p>La IA analizará el tipo de proyecto, el público objetivo y las mejores prácticas para crear una identidad visual óptima.</p>
                    
                    <div class="path-actions">
                        <button id="back-to-selection-auto" class="btn-secondary">← Cambiar opción</button>
                        <button id="generate-auto-prompt" class="generate-sync-btn">
                            📋 Generar Prompt Automático
                        </button>
                    </div>
                </div>
            ` : ''}
            
            <!-- Confirmation after prompt -->
            ${identityState.promptGenerated && !identityState.completed ? `
                <div class="phase-actions" style="margin-top: var(--spacing-lg);">
                    <button id="confirm-identity-done" class="btn-success">
                        ✅ Confirmar que Antigravity completó la Identidad Visual
                    </button>
                </div>
            ` : ''}
            
            <!-- Completed state -->
            ${identityState.completed ? `
                <div class="identity-completed">
                    <div class="completed-icon">✅</div>
                    <h3>Identidad Visual Completada</h3>
                    <p>El archivo <code>06_IDENTIDAD_VISUAL.md</code> ha sido generado.</p>
                </div>
            ` : ''}
            
            <!-- Sync Modal -->
            <div id="identity-sync-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3>📋 Prompt: Identidad Visual</h3>
                        <button id="close-identity-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <div class="agent-reminder">
                            <span class="agent-icon">🚀</span>
                            <span><strong>Recuerda:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity.</span>
                        </div>
                        <p>Copia este prompt y pégalo en Antigravity:</p>
                        <pre id="identity-sync-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-identity-sync" class="btn-primary">📋 Copiar Prompt</button>
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
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const modal = document.getElementById('identity-sync-modal');
    const closeBtn = document.getElementById('close-identity-modal');
    const copyBtn = document.getElementById('copy-identity-sync');
    const contentPre = document.getElementById('identity-sync-content');

    // Path selection
    document.getElementById('select-custom-path')?.addEventListener('click', () => {
        State.setNestedValue('identityEvaluation.pathSelected', 'custom');
        location.reload();
    });

    document.getElementById('select-auto-path')?.addEventListener('click', () => {
        State.setNestedValue('identityEvaluation.pathSelected', 'auto');
        location.reload();
    });

    // Back to selection
    document.getElementById('back-to-selection')?.addEventListener('click', () => {
        State.setNestedValue('identityEvaluation.pathSelected', null);
        location.reload();
    });
    document.getElementById('back-to-selection-auto')?.addEventListener('click', () => {
        State.setNestedValue('identityEvaluation.pathSelected', null);
        location.reload();
    });

    // Palette selector
    document.querySelectorAll('.palette-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.palette-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const primary = card.dataset.primary;
            const secondary = card.dataset.secondary;
            const accent = card.dataset.accent;

            // Update color inputs
            const primaryInput = document.getElementById('color-primary');
            const secondaryInput = document.getElementById('color-secondary');
            const accentInput = document.getElementById('color-accent');
            if (primaryInput) primaryInput.value = primary;
            if (secondaryInput) secondaryInput.value = secondary;
            if (accentInput) accentInput.value = accent;

            // Update state
            State.setNestedValue('visualIdentity.primaryColor', primary);
            State.setNestedValue('visualIdentity.secondaryColor', secondary);
            State.setNestedValue('visualIdentity.accentColor', accent);
        });
    });

    // Custom color inputs
    document.getElementById('color-primary')?.addEventListener('input', (e) => {
        State.setNestedValue('visualIdentity.primaryColor', e.target.value);
    });
    document.getElementById('color-secondary')?.addEventListener('input', (e) => {
        State.setNestedValue('visualIdentity.secondaryColor', e.target.value);
    });
    document.getElementById('color-accent')?.addEventListener('input', (e) => {
        State.setNestedValue('visualIdentity.accentColor', e.target.value);
    });

    // Style selector
    document.querySelectorAll('.style-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            State.setNestedValue('visualIdentity.style', card.dataset.style);
        });
    });

    // Mode toggle
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            State.setNestedValue('visualIdentity.darkMode', btn.dataset.mode === 'dark');
        });
    });

    // Font selector
    document.querySelectorAll('.font-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.font-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            State.setNestedValue('visualIdentity.fontFamily', card.dataset.font);
        });
    });

    // Identity notes
    document.getElementById('identity-notes')?.addEventListener('input', (e) => {
        State.setNestedValue('identityEvaluation.notes', e.target.value);
    });

    // Generate custom prompt
    document.getElementById('generate-custom-prompt')?.addEventListener('click', () => {
        const prompt = generateCustomPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modal) modal.style.display = 'flex';
        State.setNestedValue('identityEvaluation.promptGenerated', true);
    });

    // Generate auto prompt
    document.getElementById('generate-auto-prompt')?.addEventListener('click', () => {
        const prompt = generateAutoPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modal) modal.style.display = 'flex';
        State.setNestedValue('identityEvaluation.promptGenerated', true);
    });

    // Confirm completion
    document.getElementById('confirm-identity-done')?.addEventListener('click', () => {
        State.setNestedValue('identityEvaluation.completed', true);
        State.setState({ step6SyncCompleted: true });
        setTimeout(() => location.reload(), 100);
    });

    // Modal controls
    closeBtn?.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
        if (State.getState().identityEvaluation?.promptGenerated) {
            location.reload();
        }
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            if (State.getState().identityEvaluation?.promptGenerated) {
                location.reload();
            }
        }
    });

    copyBtn?.addEventListener('click', async () => {
        const content = contentPre?.textContent || '';
        try {
            await navigator.clipboard.writeText(content);
            if (copyBtn) {
                copyBtn.textContent = '✅ ¡Copiado!';
                copyBtn.classList.add('copied');
            }
        } catch (error) {
            console.error('Copy failed:', error);
        }
    });
}

/**
 * Generate Custom (User-Guided) Prompt
 */
function generateCustomPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_del_proyecto}';
    const vi = state.visualIdentity || {};
    const identity = state.identityEvaluation || {};

    // Map style to readable text
    const styleMap = {
        'moderno': 'Moderno - Bordes redondeados, sombras suaves',
        'minimalista': 'Minimalista - Limpio, sin decoraciones',
        'corporativo': 'Corporativo - Profesional, estructurado',
        'creativo': 'Creativo - Formas orgánicas, dinámico'
    };

    return `Actúa como Diseñador Senior de Identidad Visual especializado en productos digitales y sistemas de diseño.

## Contexto:
Estás diseñando la identidad visual para el proyecto ${projectName}.
El usuario ha proporcionado preferencias específicas que DEBES respetar como base del diseño.

## Preferencias del Usuario:

### Paleta de Colores Seleccionada:
- **Color Primario:** ${vi.primaryColor}
- **Color Secundario:** ${vi.secondaryColor}
- **Color de Acento:** ${vi.accentColor}

### Estilo Visual:
${styleMap[vi.style] || vi.style}

### Modo de Color Preferido:
${vi.darkMode ? 'Modo Oscuro' : 'Modo Claro'}

### Tipografía:
Fuente principal: ${vi.fontFamily}
${identity.notes ? `
### Notas Adicionales del Usuario:
${identity.notes}
` : ''}

## Tarea:
Genera el documento \`06_IDENTIDAD_VISUAL.md\` con la identidad visual completa.

## El documento debe incluir:

1. **Paleta de Colores**
   - Color primario (con código hexadecimal)
   - Color secundario
   - Color de acento
   - Colores de fondo (claro/oscuro)
   - Colores semánticos (éxito, error, advertencia, info)
   - Justificación de la selección

2. **Tipografía**
   - Fuente principal (headlines)
   - Fuente secundaria (body text)
   - Tamaños de fuente (escala tipográfica)
   - Pesos de fuente a utilizar

3. **Estilo Visual**
   - Bordes (border-radius)
   - Sombras
   - Espaciado (sistema de spacing)
   - Iconografía (estilo recomendado)

4. **Modo Oscuro/Claro**
   - Definición de paleta para cada modo
   - Reglas de contraste

5. **Aplicación en Componentes**
   - Botones (estados)
   - Inputs
   - Cards
   - Navegación

## Restricciones:
- Mantén coherencia con las preferencias del usuario
- Asegura accesibilidad (contraste WCAG AA mínimo)
- Diseño orientado a MVP (no sobre-diseñar)

## Formato:
Documento Markdown con secciones claras, códigos de color copiables, y ejemplos prácticos.`;
}

/**
 * Generate Automatic (AI-Decided) Prompt
 */
function generateAutoPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_del_proyecto}';
    const softwareType = state.softwareType || 'aplicación web';

    // Map software type to Spanish
    const typeMap = {
        'web_page': 'página web',
        'web_app': 'aplicación web',
        'mobile_app': 'aplicación móvil',
        'windows_program': 'programa de escritorio'
    };

    return `Actúa como Diseñador Senior de Identidad Visual especializado en productos digitales y sistemas de diseño.

## Contexto:
Estás diseñando la identidad visual para el proyecto ubicado en la carpeta **${projectName}**.
El tipo de software es: ${typeMap[softwareType] || softwareType}.

Analiza el Plan Maestro (02_MASTER_PLAN.md) y los documentos existentes del proyecto en ${projectName} para entender:
- El propósito del software
- El público objetivo
- El tono y personalidad del producto
- Las mejores prácticas del sector

## Tarea:
DECIDE AUTÓNOMAMENTE la mejor identidad visual posible basándote en:
1. El análisis del proyecto
2. Tendencias actuales de diseño
3. Mejores prácticas de UX/UI
4. Psicología del color aplicada al tipo de producto

Genera el documento \`06_IDENTIDAD_VISUAL.md\` con la identidad visual completa.

## El documento debe incluir:

1. **Análisis y Justificación**
   - Por qué elegiste esta dirección visual
   - Cómo se alinea con el propósito del proyecto

2. **Paleta de Colores**
   - Color primario (con código hexadecimal)
   - Color secundario
   - Color de acento
   - Colores de fondo (claro/oscuro)
   - Colores semánticos (éxito, error, advertencia, info)
   - Justificación de cada selección

3. **Tipografía**
   - Fuente principal (headlines)
   - Fuente secundaria (body text)
   - Tamaños de fuente (escala tipográfica)
   - Pesos de fuente a utilizar

4. **Estilo Visual**
   - Bordes (border-radius)
   - Sombras
   - Espaciado (sistema de spacing)
   - Iconografía (estilo recomendado)

5. **Modo Oscuro/Claro**
   - Definición de paleta para cada modo
   - Reglas de contraste

6. **Aplicación en Componentes**
   - Botones (estados)
   - Inputs
   - Cards
   - Navegación

## Criterios de Decisión:
- Profesionalismo y modernidad
- Diferenciación en el mercado
- Accesibilidad (contraste WCAG AA mínimo)
- Escalabilidad del sistema de diseño
- Orientado a MVP (elegante pero no sobre-diseñado)

## Formato:
Documento Markdown con secciones claras, códigos de color copiables, y ejemplos prácticos.`;
}

/**
 * Validate step
 */
export function validate(config, state) {
    if (!state.step6SyncCompleted) {
        alert('Por favor, completa la Identidad Visual antes de continuar.');
        return false;
    }
    return true;
}

/**
 * Collect step data
 */
export function collectData(config, state) {
    return null;
}
