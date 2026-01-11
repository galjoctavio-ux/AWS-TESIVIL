/**
 * IA-Flow - Step 7: Plan Maestro Consolidation
 * Consolidates all planning documents into a single definitive plan
 */

import * as State from '../state.js';

/**
 * Render the consolidation step
 */
export function render(config, state) {
    const consolidationState = state.consolidationEvaluation || {};

    return `
        <div class="step-consolidation">
            <div class="consolidation-intro">
                <div class="intro-card">
                    <div class="intro-icon">📋</div>
                    <div class="intro-content">
                        <h3>Consolidación del Plan Maestro</h3>
                        <p>Antigravity unificará todos los documentos de planeación en un único documento definitivo.</p>
                    </div>
                </div>
                
                <div class="agent-notice">
                    <span class="notice-icon">💡</span>
                    <span class="notice-text">
                        <strong>Importante:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity para este prompt.
                    </span>
                </div>
            </div>
            
            <!-- Documents to Consolidate -->
            <div class="docs-overview">
                <h3>📁 Documentos a Consolidar:</h3>
                <div class="docs-grid">
                    <div class="doc-item">
                        <span class="doc-icon">📝</span>
                        <span class="doc-name">01_IDEAS_CONSOLIDADO.md</span>
                    </div>
                    <div class="doc-item">
                        <span class="doc-icon">📋</span>
                        <span class="doc-name">02_MASTER_PLAN.md</span>
                    </div>
                    <div class="doc-item">
                        <span class="doc-icon">⚠️</span>
                        <span class="doc-name">03_RIESGOS_OPORTUNIDADES.md</span>
                    </div>
                    <div class="doc-item">
                        <span class="doc-icon">🎯</span>
                        <span class="doc-name">04_DECISIONES_CAME.md</span>
                    </div>
                    <div class="doc-item">
                        <span class="doc-icon">📐</span>
                        <span class="doc-name">05_UI_UX.md</span>
                    </div>
                    <div class="doc-item">
                        <span class="doc-icon">🎨</span>
                        <span class="doc-name">06_IDENTIDAD_VISUAL.md</span>
                    </div>
                </div>
            </div>
            
            <!-- Output Info -->
            <div class="output-card">
                <div class="output-icon">📦</div>
                <div class="output-content">
                    <h4>Archivo de Salida:</h4>
                    <code>Plan_Maestro_Definitivo.md</code>
                    <p class="output-note">Los documentos originales se moverán a <code>_Planeacion_Archivos_Origen/</code></p>
                </div>
            </div>
            
            <!-- Consolidation Phase -->
            <div class="consolidation-phase ${consolidationState.completed ? 'completed' : consolidationState.started ? 'active' : ''}">
                <div class="phase-header">
                    <div class="phase-number">📋</div>
                    <div class="phase-info">
                        <h3>Generar Plan Maestro Definitivo</h3>
                        <p>Antigravity consolidará todos los documentos en uno solo, sin perder información.</p>
                    </div>
                    ${consolidationState.completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="interaction-notice">
                        <span class="notice-icon">⏱️</span>
                        <span>Este proceso puede tomar varias interacciones. Antigravity generará primero el índice y luego las secciones.</span>
                    </div>
                    
                    <button id="generate-consolidation-prompt" class="generate-sync-btn" ${consolidationState.completed ? 'disabled' : ''}>
                        📋 Generar Prompt de Consolidación
                    </button>
                    
                    ${consolidationState.started && !consolidationState.completed ? `
                        <div class="phase-actions">
                            <button id="confirm-consolidation-done" class="btn-success">
                                ✅ Confirmar que Antigravity generó el Plan Maestro Definitivo
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Completed state -->
            ${consolidationState.completed ? `
                <div class="consolidation-completed">
                    <div class="completed-icon">✅</div>
                    <h3>Plan Maestro Definitivo Generado</h3>
                    <p>El documento <code>Plan_Maestro_Definitivo.md</code> ha sido creado.</p>
                </div>
            ` : ''}
            
            <!-- Sync Modal -->
            <div id="consolidation-sync-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3>📋 Prompt: Consolidación del Plan Maestro</h3>
                        <button id="close-consolidation-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <div class="agent-reminder">
                            <span class="agent-icon">🚀</span>
                            <span><strong>Recuerda:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity.</span>
                        </div>
                        <p>Copia este prompt y pégalo en Antigravity:</p>
                        <pre id="consolidation-sync-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-consolidation-sync" class="btn-primary">📋 Copiar Prompt</button>
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
    const modal = document.getElementById('consolidation-sync-modal');
    const closeBtn = document.getElementById('close-consolidation-modal');
    const copyBtn = document.getElementById('copy-consolidation-sync');
    const contentPre = document.getElementById('consolidation-sync-content');

    // Generate prompt
    document.getElementById('generate-consolidation-prompt')?.addEventListener('click', () => {
        const prompt = generateConsolidationPrompt();
        if (contentPre) contentPre.textContent = prompt;

        // Mark as started and save state first
        State.setNestedValue('consolidationEvaluation.started', true);

        // Show modal
        if (modal) modal.style.display = 'flex';

        // Update UI to show confirm button
        updatePhaseUI();
    });

    document.getElementById('confirm-consolidation-done')?.addEventListener('click', () => {
        State.setNestedValue('consolidationEvaluation.completed', true);
        State.setState({ step7SyncCompleted: true });
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
    const consolidationState = state.consolidationEvaluation || {};

    const phaseEl = document.querySelector('.consolidation-phase');
    const phaseContent = phaseEl?.querySelector('.phase-content');

    if (consolidationState.started && !consolidationState.completed) {
        phaseEl?.classList.add('active');
        // Add confirm button if not exists
        if (phaseContent && !document.getElementById('confirm-consolidation-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-consolidation-done" class="btn-success">
                    ✅ Confirmar que Antigravity generó el Plan Maestro Definitivo
                </button>
            `;
            phaseContent.appendChild(actionsDiv);

            // Re-attach listener
            document.getElementById('confirm-consolidation-done')?.addEventListener('click', () => {
                State.setNestedValue('consolidationEvaluation.completed', true);
                State.setState({ step7SyncCompleted: true });
                setTimeout(() => location.reload(), 100);
            });
        }
    }
}

/**
 * Generate Consolidation Prompt
 */
function generateConsolidationPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';

    return `Actúa como un Consolidador de Documentación de Planeación para un proyecto de software MVP.

## Contexto:
El proyecto está ubicado en la carpeta **${projectName}**.
Durante la planeación se han generado los siguientes documentos:
- 01_IDEAS_CONSOLIDADO.md (Ideas y características del proyecto)
- 02_MASTER_PLAN.md (Plan inicial con contexto técnico integrado)
- 03_RIESGOS_OPORTUNIDADES.md (Análisis de riesgos y oportunidades)
- 04_DECISIONES_CAME.md (Decisiones estratégicas y selección tecnológica)
- 05_UI_UX.md (Diseño UX/UI funcional)
- 06_IDENTIDAD_VISUAL.md (Paleta de colores, tipografía y estilo)

Todos estos documentos son válidos y contienen información relevante que debe conservarse.

## Objetivo:
CONSOLIDAR toda la información en UN SOLO documento: \`Plan_Maestro_Definitivo.md\`
Debe contener TODA la información, correctamente estructurada, sin perder contenido.

## Reglas Estrictas:
1. NO elimines información de ningún documento
2. NO resumas de forma que se pierda detalle relevante
3. NO modifiques decisiones ya tomadas
4. NO agregues nuevas decisiones, análisis u opiniones
5. NO avances a ejecución ni implementación
6. Lenguaje técnico, claro y neutral
7. Enfoque en MVP
8. NO crees el plan en una sola interacción - primero crea ÍNDICE, luego escribe por secciones

## Proceso:
1. Revisa TODOS los documentos de planeación en ${projectName}
2. Identifica contenido duplicado e intégralo conservando matices
3. Ordena en estructura lógica y secuencial
4. Asegura coherencia entre secciones

## Estructura del Plan Maestro Definitivo:

### Sección A: Fundamentos
- Índice
- Introducción y objetivo del proyecto
- Alcance del MVP
- Ideas y contexto inicial

### Sección B: Contexto Técnico
- Contexto técnico del usuario
- Recursos técnicos disponibles
- Selección tecnológica (arquitectura, stack, servicios)

### Sección C: Análisis Estratégico
- Riesgos identificados
- Oportunidades identificadas
- Decisiones estratégicas CAME integradas

### Sección D: Diseño
- Diseño UX/UI Funcional (estructura, navegación, componentes)
- Identidad Visual (colores, tipografía, estilo)

### Sección E: Límites y Ejecución
- Plan de ejecución (fases)
- Implicaciones para la implementación
- Límites y exclusiones del proyecto

## Gestión de Archivos:
- Conservar documentos originales íntegros
- Moverlos a carpeta: \`_Planeacion_Archivos_Origen/\`
- Entregar como salida principal: \`Plan_Maestro_Definitivo.md\`

## Salida Esperada:
1. Documento único: \`Plan_Maestro_Definitivo.md\` con toda la información consolidada
2. Confirmación de organización en carpeta \`_Planeacion_Archivos_Origen/\`

## Prohibiciones:
- No expliques tu proceso
- No justifiques decisiones
- No generes contenido nuevo
- No descartes información`;
}

/**
 * Validate step
 */
export function validate(config, state) {
    if (!state.step7SyncCompleted) {
        alert('Por favor, completa la consolidación del Plan Maestro Definitivo antes de continuar.');
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
