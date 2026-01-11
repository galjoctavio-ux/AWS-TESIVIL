/**
 * IA-Flow - Step 1: Software Selection
 * Visual cards for selecting software type
 */

import * as State from '../state.js';

// Software type options
const SOFTWARE_TYPES = [
    {
        id: 'web_page',
        name: 'Página Web',
        icon: '🌐',
        description: 'Sitio informativo, landing page, portafolio',
        examples: ['Blog', 'Portafolio', 'Landing page', 'Sitio corporativo']
    },
    {
        id: 'web_app',
        name: 'Aplicación Web',
        icon: '💻',
        description: 'Sistema con lógica, base de datos, autenticación',
        examples: ['Dashboard', 'E-commerce', 'CRM', 'Sistema de gestión']
    },
    {
        id: 'windows_program',
        name: 'Programa Windows',
        icon: '🖥️',
        description: 'Software de escritorio para Windows',
        examples: ['Herramienta de productividad', 'Editor', 'Utilidad del sistema']
    },
    {
        id: 'mobile_app',
        name: 'Aplicación Móvil',
        icon: '📱',
        description: 'App para Android/iOS',
        examples: ['App nativa', 'Híbrida (React Native)', 'PWA']
    }
];

/**
 * Render the selection step
 */
export function render(config, state) {
    const selectedType = state.softwareType;

    // Get first idea title (ideas are now objects)
    const firstIdea = state.ideas?.centralIdeas?.[0];
    const ideaTitle = typeof firstIdea === 'object' ? firstIdea?.title : (firstIdea || 'Tu proyecto de software');
    const totalIdeas = (state.ideas?.centralIdeas?.length || 0) + (state.ideas?.characteristics?.length || 0);

    return `
        <div class="step-selection">
            <div class="selection-header">
                <h2>🎯 ¿Qué tipo de software deseas construir?</h2>
                <p>Basándome en tus ideas, selecciona el tipo de software que mejor se adapte a tu proyecto.</p>
            </div>
            
            <div class="selection-summary">
                <div class="summary-card">
                    <div class="summary-icon">💡</div>
                    <div class="summary-content">
                        <strong>Ideas detectadas: ${totalIdeas}</strong>
                        <p>${ideaTitle}</p>
                    </div>
                </div>
            </div>
            
            <div class="software-cards">
                ${SOFTWARE_TYPES.map(type => `
                    <div class="software-card ${selectedType === type.id ? 'selected' : ''}" 
                         data-type="${type.id}">
                        <div class="card-icon">${type.icon}</div>
                        <div class="card-content">
                            <h3>${type.name}</h3>
                            <p>${type.description}</p>
                            <div class="card-examples">
                                ${type.examples.map(ex => `<span class="example-tag">${ex}</span>`).join('')}
                            </div>
                        </div>
                        <div class="card-check">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="selection-recommendation" id="selection-recommendation" style="display: none;">
                <div class="recommendation-icon">💡</div>
                <div class="recommendation-text">
                    <strong>Recomendación:</strong>
                    <p id="recommendation-content"></p>
                </div>
            </div>
            
            <!-- Sync Section -->
            <div class="selection-sync-section">
                <button id="generate-selection-sync" class="generate-sync-btn" disabled>
                    📋 Sincronizar Selección con Antigravity
                </button>
            </div>
            
            <!-- Sync Modal -->
            <div id="selection-sync-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3>📋 Sincronización: Tipo de Software</h3>
                        <button id="close-selection-sync-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <p>Copia este bloque en Antigravity para actualizar el Plan Maestro:</p>
                        <pre id="selection-sync-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-selection-sync" class="btn-primary">📋 Copiar para Antigravity</button>
                        <button id="confirm-selection-sync" class="btn-secondary" disabled>✅ Confirmar Copiado</button>
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
    setupCardListeners();
    setupSyncListeners();
    showRecommendation(state);
    updateSyncButtonState();
}

/**
 * Setup card click listeners
 */
function setupCardListeners() {
    const cards = document.querySelectorAll('.software-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selection from all cards
            cards.forEach(c => c.classList.remove('selected'));

            // Select this card
            card.classList.add('selected');

            // Update state
            const type = card.dataset.type;
            State.setState({ softwareType: type });

            // Update project name suggestion
            updateProjectNameSuggestion(type);

            // Enable sync button
            updateSyncButtonState();
        });
    });
}

/**
 * Setup sync modal listeners
 */
function setupSyncListeners() {
    const generateBtn = document.getElementById('generate-selection-sync');
    const modal = document.getElementById('selection-sync-modal');
    const closeBtn = document.getElementById('close-selection-sync-modal');
    const copyBtn = document.getElementById('copy-selection-sync');
    const confirmBtn = document.getElementById('confirm-selection-sync');
    const contentPre = document.getElementById('selection-sync-content');

    generateBtn?.addEventListener('click', () => {
        const syncBlock = generateSelectionSyncBlock();
        if (contentPre) contentPre.textContent = syncBlock;
        if (modal) modal.style.display = 'flex';
    });

    closeBtn?.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    copyBtn?.addEventListener('click', async () => {
        const content = contentPre?.textContent || '';
        try {
            await navigator.clipboard.writeText(content);
            if (copyBtn) {
                copyBtn.textContent = '✅ ¡Copiado!';
                copyBtn.classList.add('copied');
            }
            if (confirmBtn) confirmBtn.disabled = false;
            State.markSyncBlockCopied();
        } catch (error) {
            console.error('Copy failed:', error);
        }
    });

    confirmBtn?.addEventListener('click', () => {
        State.confirmAntigravityExecution();
        State.setState({ step1SyncCompleted: true }); // Mark Step 1 sync as completed
        if (modal) modal.style.display = 'none';
    });
}

/**
 * Update sync button state
 */
function updateSyncButtonState() {
    const btn = document.getElementById('generate-selection-sync');
    const state = State.getState();
    if (btn) {
        btn.disabled = !state.softwareType;
    }
}

/**
 * Generate sync block for software selection
 */
function generateSelectionSyncBlock() {
    const state = State.getState();
    const selectedType = state.softwareType;
    const typeInfo = SOFTWARE_TYPES.find(t => t.id === selectedType);
    const projectName = state.step0?.antigravityProjectName || state.projectName || 'Proyecto';
    const date = new Date().toISOString().split('T')[0];

    return `[ESTADO_SINC_ANTIGRAVITY] - Selección de Tipo de Software

## PROYECTO: ${projectName}
- Fecha: ${date}

## TIPO DE SOFTWARE SELECCIONADO
- **Tipo**: ${typeInfo?.name || selectedType}
- **Icono**: ${typeInfo?.icon || '💻'}
- **Descripción**: ${typeInfo?.description || 'N/A'}

## INSTRUCCIONES PARA ANTIGRAVITY

> Actualiza el archivo \`02_MASTER_PLAN.md\` del proyecto con la siguiente información:

1. **Agregar sección "Tipo de Software"** con el valor: ${typeInfo?.name}
2. **Actualizar alcance del MVP** para reflejar que es una ${typeInfo?.name}
3. **Ajustar stack tecnológico recomendado** según el tipo seleccionado

---
FIN DEL BLOQUE DE SINCRONIZACIÓN`;
}

/**
 * Show recommendation based on ideas
 */
function showRecommendation(state) {
    const recommendationEl = document.getElementById('selection-recommendation');
    const contentEl = document.getElementById('recommendation-content');

    if (!recommendationEl || !contentEl) return;

    // Extract text from ideas (now objects with title/description)
    const ideasText = (state.ideas?.centralIdeas || [])
        .map(idea => typeof idea === 'object' ? `${idea.title} ${idea.description || ''}` : idea)
        .join(' ');

    const charsText = (state.ideas?.characteristics || [])
        .map(char => typeof char === 'object' ? `${char.title} ${char.description || ''}` : char)
        .join(' ');

    const allIdeas = `${ideasText} ${charsText}`.toLowerCase();

    console.log('[Step1] Analyzing ideas for recommendation:', allIdeas.substring(0, 100));

    let recommendation = null;

    // Enhanced keyword detection
    if (allIdeas.includes('móvil') || allIdeas.includes('app') || allIdeas.includes('android') || allIdeas.includes('ios') || allIdeas.includes('celular')) {
        recommendation = { type: 'mobile_app', reason: 'Has mencionado funcionalidades móviles.' };
    } else if (allIdeas.includes('escritorio') || allIdeas.includes('windows') || allIdeas.includes('desktop') || allIdeas.includes('exe')) {
        recommendation = { type: 'windows_program', reason: 'Has mencionado software de escritorio.' };
    } else if (allIdeas.includes('sistema') || allIdeas.includes('login') || allIdeas.includes('base de datos') || allIdeas.includes('usuarios') || allIdeas.includes('dashboard') || allIdeas.includes('administrar') || allIdeas.includes('gestión') || allIdeas.includes('inventario') || allIdeas.includes('crm') || allIdeas.includes('comercio')) {
        recommendation = { type: 'web_app', reason: 'Tu proyecto requiere lógica de negocio y gestión de datos.' };
    } else if (allIdeas.includes('página') || allIdeas.includes('informativo') || allIdeas.includes('landing') || allIdeas.includes('portafolio') || allIdeas.includes('blog') || allIdeas.includes('sitio')) {
        recommendation = { type: 'web_page', reason: 'Tu proyecto es principalmente informativo.' };
    } else {
        // Default to web_app for complex projects
        recommendation = { type: 'web_app', reason: 'Por defecto, recomendamos una aplicación web por su versatilidad.' };
    }

    if (recommendation) {
        const typeInfo = SOFTWARE_TYPES.find(t => t.id === recommendation.type);
        contentEl.innerHTML = `
            <strong>Sugerencia:</strong> ${typeInfo.icon} <strong>${typeInfo.name}</strong><br>
            <span>${recommendation.reason}</span>
        `;
        recommendationEl.style.display = 'flex';

        // Pre-select recommended type
        const card = document.querySelector(`[data-type="${recommendation.type}"]`);
        if (card) {
            card.classList.add('selected', 'preselected');
            State.setState({ softwareType: recommendation.type });

            // Add preselect badge
            if (!card.querySelector('.preselect-badge')) {
                const badge = document.createElement('div');
                badge.className = 'preselect-badge';
                badge.textContent = '✨ Sugerido';
                card.appendChild(badge);
            }
        }
    }
}

/**
 * Update project name suggestion based on selection
 */
function updateProjectNameSuggestion(type) {
    const state = State.getState();
    const idea = state.ideas.centralIdeas[0] || '';

    // Generate a simple project name if not set
    if (!state.projectName && idea) {
        const words = idea.split(' ').slice(0, 3).join('_').replace(/[^a-zA-Z0-9_]/g, '');
        const prefix = type === 'web_page' ? 'Web' :
            type === 'web_app' ? 'App' :
                type === 'mobile_app' ? 'Mobile' : 'Desktop';
        const suggestedName = `${prefix}_${words}`.substring(0, 30);
        State.setState({ projectName: suggestedName });
    }
}

/**
 * Validate step before advancing
 */
export function validate(config, state) {
    if (!state.softwareType) {
        alert('Por favor, selecciona el tipo de software que deseas construir.');
        return false;
    }

    // Check if Step 1 sync was confirmed
    if (!state.step1SyncCompleted) {
        alert('Por favor, sincroniza la selección de software con Antigravity antes de continuar.');
        return false;
    }

    return true;
}

/**
 * Collect step data
 */
export function collectData(config, state) {
    // Determine flow type based on total functions
    let flowType = 'simple';
    if (state.totalFunciones >= 2 && state.totalFunciones <= 8) {
        flowType = 'medium';
    } else if (state.totalFunciones > 8) {
        flowType = 'complex';
    }

    return { flowType };
}
