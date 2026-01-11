/**
 * IA-Flow - Step 5: UX/UI Functional Design
 * Defines structure, navigation and functional components
 */

import * as State from '../state.js';

/**
 * Render the UX/UI functional step
 */
export function render(config, state) {
    const uxState = state.uxuiEvaluation || {};

    return `
        <div class="step-uxui">
            <div class="uxui-intro">
                <div class="intro-card">
                    <div class="intro-icon">📐</div>
                    <div class="intro-content">
                        <h3>Diseño UX/UI Funcional</h3>
                        <p>Antigravity definirá la estructura de navegación, componentes UI y reglas funcionales para la ejecución con IA.</p>
                    </div>
                </div>
                
                <div class="agent-notice">
                    <span class="notice-icon">💡</span>
                    <span class="notice-text">
                        <strong>Importante:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity para este prompt.
                        Esto asegura un contexto limpio y especializado.
                    </span>
                </div>
            </div>
            
            <!-- Scope Info -->
            <div class="scope-info">
                <h4>📋 Alcance de este paso:</h4>
                <div class="scope-columns">
                    <div class="scope-do">
                        <strong>✅ SÍ incluye:</strong>
                        <ul>
                            <li>Estructura de navegación</li>
                            <li>Principios de UX</li>
                            <li>Componentes UI funcionales</li>
                            <li>Reglas para ejecución con IA</li>
                        </ul>
                    </div>
                    <div class="scope-dont">
                        <strong>❌ NO incluye:</strong>
                        <ul>
                            <li>Diseño gráfico</li>
                            <li>Colores finales</li>
                            <li>Wireframes visuales</li>
                            <li>Estética</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <!-- UX/UI Phase -->
            <div class="uxui-phase ${uxState.completed ? 'completed' : uxState.started ? 'active' : ''}">
                <div class="phase-header">
                    <div class="phase-number">📐</div>
                    <div class="phase-info">
                        <h3>Generar Diseño UX/UI Funcional</h3>
                        <p>Antigravity creará la sección de UX/UI con estructura, navegación y reglas.</p>
                    </div>
                    ${uxState.completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="output-info">
                        <strong>Archivo de salida:</strong> <code>05_UI_UX.md</code>
                    </div>
                    
                    <button id="generate-uxui-prompt" class="generate-sync-btn" ${uxState.completed ? 'disabled' : ''}>
                        📋 Generar Prompt UX/UI Funcional
                    </button>
                    
                    ${uxState.started && !uxState.completed ? `
                        <div class="phase-actions">
                            <button id="confirm-uxui-done" class="btn-success">
                                ✅ Confirmar que Antigravity completó el UX/UI
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Sync Modal -->
            <div id="uxui-sync-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3>📋 Prompt: UX/UI Funcional</h3>
                        <button id="close-uxui-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <div class="agent-reminder">
                            <span class="agent-icon">🚀</span>
                            <span><strong>Recuerda:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity para este prompt.</span>
                        </div>
                        <p>Copia este prompt y pégalo en tu nueva conversación de Antigravity:</p>
                        <pre id="uxui-sync-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-uxui-sync" class="btn-primary">📋 Copiar Prompt</button>
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
    const modal = document.getElementById('uxui-sync-modal');
    const closeBtn = document.getElementById('close-uxui-modal');
    const copyBtn = document.getElementById('copy-uxui-sync');
    const contentPre = document.getElementById('uxui-sync-content');

    // Generate prompt
    document.getElementById('generate-uxui-prompt')?.addEventListener('click', () => {
        const prompt = generateUXUIPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modal) modal.style.display = 'flex';

        // Mark as started
        State.setNestedValue('uxuiEvaluation.started', true);
        updatePhaseUI();
    });

    document.getElementById('confirm-uxui-done')?.addEventListener('click', () => {
        State.setNestedValue('uxuiEvaluation.completed', true);
        State.setState({ step5SyncCompleted: true });
        setTimeout(() => location.reload(), 100);
    });

    // Modal controls
    closeBtn?.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
        updatePhaseUI();
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            updatePhaseUI();
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
 * Update phase UI without full reload
 */
function updatePhaseUI() {
    const state = State.getState();
    const uxState = state.uxuiEvaluation || {};

    const phaseEl = document.querySelector('.uxui-phase');
    const phaseContent = phaseEl?.querySelector('.phase-content');

    if (uxState.started && !uxState.completed) {
        phaseEl?.classList.add('active');
        // Add confirm button if not exists
        if (phaseContent && !document.getElementById('confirm-uxui-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-uxui-done" class="btn-success">
                    ✅ Confirmar que Antigravity completó el UX/UI
                </button>
            `;
            phaseContent.appendChild(actionsDiv);

            // Re-attach listener
            document.getElementById('confirm-uxui-done')?.addEventListener('click', () => {
                State.setNestedValue('uxuiEvaluation.completed', true);
                State.setState({ step5SyncCompleted: true });
                setTimeout(() => location.reload(), 100);
            });
        }
    }
}

/**
 * Generate UX/UI Functional Prompt
 */
function generateUXUIPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_del_proyecto}';

    return `Actúa como Especialista Senior en UX/UI Funcional y Planeación de Software, con experiencia en ejecución asistida por IA y alineación a ISO 9001.

## Contexto:
Analiza el plan maestro del proyecto ${projectName}.
La ejecución será realizada por IA, por lo que la UX/UI debe definirse de forma explícita para evitar inferencias no controladas.

## Tarea:
Genera sección 'Diseño UX/UI Funcional' y agrégala al archivo 05_UI_UX.md.

## Alcance:
- NO realizar diseño gráfico
- NO definir colores finales
- NO crear wireframes visuales
- NO optimizar estética
- SÍ definir estructura, reglas y restricciones

## La sección debe incluir como mínimo:
1. **Principios de UX del sistema** (reglas obligatorias)
2. **Estructura de navegación:**
   - Pantalla inicial
   - Menú principal
   - Submenús
   - Flujo principal (happy path)
   - Flujo de error
3. **Componentes UI funcionales:**
   - Botones (primarios, secundarios, críticos)
   - Formularios
   - Modales
   - Alertas
4. **Reglas explícitas para ejecución con IA:**
   - Qué puede hacer la IA
   - Qué NO puede decidir la IA
   - Cuándo debe preguntar al usuario

## Restricciones:
- No asumir comportamientos del usuario
- No inferir flujos no descritos
- Toda ambigüedad debe marcarse como 'requiere decisión humana'

## Formato:
Integrar dentro del Plan Maestro con encabezados claros y consistentes.`;
}

/**
 * Validate step
 */
export function validate(config, state) {
    if (!state.step5SyncCompleted) {
        alert('Por favor, completa el diseño UX/UI Funcional antes de continuar.');
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
