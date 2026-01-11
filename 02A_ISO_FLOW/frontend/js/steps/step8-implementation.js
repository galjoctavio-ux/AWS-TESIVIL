/**
 * IA-Flow - Step 8: Implementation
 * Two phases: Project fragmentation and task execution
 */

import * as State from '../state.js';

/**
 * Render the implementation step
 */
export function render(config, state) {
    const implState = state.implementationEvaluation || {};

    return `
        <div class="step-implementation">
            <div class="implementation-intro">
                <div class="intro-card">
                    <div class="intro-icon">💻</div>
                    <div class="intro-content">
                        <h3>Implementación del Proyecto</h3>
                        <p>Antigravity fragmentará el proyecto en tareas ejecutables y luego implementará el código.</p>
                    </div>
                </div>
                
                <div class="intro-card info">
                    <div class="intro-icon">📋</div>
                    <div class="intro-content">
                        <h3>Este paso requiere 2 interacciones con Antigravity</h3>
                        <p>Primero se crea el plan de ejecución, luego se implementa tarea por tarea.</p>
                    </div>
                </div>
                
                <div class="agent-notice">
                    <span class="notice-icon">💡</span>
                    <span class="notice-text">
                        <strong>Importante:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity para cada fase.
                    </span>
                </div>
            </div>
            
            <!-- Phase 1: Fragmentation -->
            <div class="impl-phase ${implState.phase1Completed ? 'completed' : implState.phase1Started ? 'active' : ''}">
                <div class="phase-header">
                    <div class="phase-number">1</div>
                    <div class="phase-info">
                        <h3>Fragmentación del Proyecto</h3>
                        <p>Antigravity dividirá el proyecto en tareas independientes y ejecutables.</p>
                    </div>
                    ${implState.phase1Completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="output-info">
                        <strong>Archivo de salida:</strong> <code>07_PLAN_EJECUCION.md</code>
                    </div>
                    
                    <div class="phase-details">
                        <p><strong>Incluirá:</strong></p>
                        <ul>
                            <li>Estructura de carpetas del proyecto</li>
                            <li>Lista ordenada de tareas con IDs</li>
                            <li>Dependencias entre tareas</li>
                            <li>Criterios de completitud</li>
                        </ul>
                    </div>
                    
                    <button id="generate-fragmentation-prompt" class="generate-sync-btn" ${implState.phase1Completed ? 'disabled' : ''}>
                        📋 Generar Prompt de Fragmentación
                    </button>
                    
                    ${implState.phase1Started && !implState.phase1Completed ? `
                        <div class="phase-actions">
                            <button id="confirm-fragmentation-done" class="btn-success">
                                ✅ Confirmar que Antigravity creó el Plan de Ejecución
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Phase 2: Implementation -->
            <div class="impl-phase ${implState.phase2Completed ? 'completed' : implState.phase2Started ? 'active' : ''} ${!implState.phase1Completed ? 'disabled' : ''}">
                <div class="phase-header">
                    <div class="phase-number">2</div>
                    <div class="phase-info">
                        <h3>Ejecución de Tareas</h3>
                        <p>Antigravity implementará el código siguiendo el plan de ejecución.</p>
                    </div>
                    ${implState.phase2Completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="interaction-notice">
                        <span class="notice-icon">💬</span>
                        <span>Este proceso puede tomar múltiples interacciones. Antigravity ejecutará las tareas una por una.</span>
                    </div>
                    
                    <div class="phase-details">
                        <p><strong>Proceso por tarea:</strong></p>
                        <ul>
                            <li>Verificar dependencias completas</li>
                            <li>Implementar código</li>
                            <li>Documentar componente</li>
                            <li>Marcar tarea como completada</li>
                        </ul>
                    </div>
                    
                    <button id="generate-implementation-prompt" class="generate-sync-btn" ${!implState.phase1Completed || implState.phase2Completed ? 'disabled' : ''}>
                        📋 Generar Prompt de Implementación
                    </button>
                    
                    ${implState.phase2Started && !implState.phase2Completed ? `
                        <div class="phase-actions">
                            <button id="confirm-implementation-done" class="btn-success">
                                ✅ Confirmar que Antigravity completó la implementación
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Completed state -->
            ${implState.phase2Completed ? `
                <div class="implementation-completed">
                    <div class="completed-icon">🎉</div>
                    <h3>¡Implementación Completada!</h3>
                    <p>El código ha sido generado siguiendo el Plan de Ejecución.</p>
                </div>
            ` : ''}
            
            <!-- Sync Modal -->
            <div id="impl-sync-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3 id="impl-modal-title">📋 Prompt</h3>
                        <button id="close-impl-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <div class="agent-reminder">
                            <span class="agent-icon">🚀</span>
                            <span><strong>Recuerda:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity.</span>
                        </div>
                        <p>Copia este prompt y pégalo en Antigravity:</p>
                        <pre id="impl-sync-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-impl-sync" class="btn-primary">📋 Copiar Prompt</button>
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
    const modal = document.getElementById('impl-sync-modal');
    const closeBtn = document.getElementById('close-impl-modal');
    const copyBtn = document.getElementById('copy-impl-sync');
    const contentPre = document.getElementById('impl-sync-content');
    const modalTitle = document.getElementById('impl-modal-title');

    // Phase 1: Fragmentation
    document.getElementById('generate-fragmentation-prompt')?.addEventListener('click', () => {
        const prompt = generateFragmentationPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modalTitle) modalTitle.textContent = '📋 Prompt: Fragmentación del Proyecto';

        // Save state first
        State.setNestedValue('implementationEvaluation.phase1Started', true);

        // Show modal
        if (modal) modal.style.display = 'flex';

        // Update UI to show confirm button
        updatePhaseUI();
    });

    document.getElementById('confirm-fragmentation-done')?.addEventListener('click', () => {
        State.setNestedValue('implementationEvaluation.phase1Completed', true);
        setTimeout(() => location.reload(), 100);
    });

    // Phase 2: Implementation
    document.getElementById('generate-implementation-prompt')?.addEventListener('click', () => {
        const prompt = generateImplementationPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modalTitle) modalTitle.textContent = '📋 Prompt: Ejecución de Tareas';

        // Save state first
        State.setNestedValue('implementationEvaluation.phase2Started', true);

        // Show modal
        if (modal) modal.style.display = 'flex';

        // Update UI to show confirm button
        updatePhaseUI();
    });

    document.getElementById('confirm-implementation-done')?.addEventListener('click', () => {
        State.setNestedValue('implementationEvaluation.phase2Completed', true);
        State.setState({ step8SyncCompleted: true });
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
    const implState = state.implementationEvaluation || {};

    // Get all impl-phase elements
    const phases = document.querySelectorAll('.impl-phase');
    const phase1El = phases[0];
    const phase2El = phases[1];
    const phase1Content = phase1El?.querySelector('.phase-content');
    const phase2Content = phase2El?.querySelector('.phase-content');
    const phase2Btn = document.getElementById('generate-implementation-prompt');

    // Phase 1 confirm button
    if (implState.phase1Started && !implState.phase1Completed) {
        phase1El?.classList.add('active');
        if (phase1Content && !document.getElementById('confirm-fragmentation-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-fragmentation-done" class="btn-success">
                    ✅ Confirmar que Antigravity creó el Plan de Ejecución
                </button>
            `;
            phase1Content.appendChild(actionsDiv);

            document.getElementById('confirm-fragmentation-done')?.addEventListener('click', () => {
                State.setNestedValue('implementationEvaluation.phase1Completed', true);
                setTimeout(() => location.reload(), 100);
            });
        }
    }

    // Enable phase 2 if phase 1 completed
    if (implState.phase1Completed && phase2Btn) {
        phase2Btn.disabled = false;
        phase2El?.classList.remove('disabled');
    }

    // Phase 2 confirm button
    if (implState.phase2Started && !implState.phase2Completed) {
        phase2El?.classList.add('active');
        if (phase2Content && !document.getElementById('confirm-implementation-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-implementation-done" class="btn-success">
                    ✅ Confirmar que Antigravity completó la implementación
                </button>
            `;
            phase2Content.appendChild(actionsDiv);

            document.getElementById('confirm-implementation-done')?.addEventListener('click', () => {
                State.setNestedValue('implementationEvaluation.phase2Completed', true);
                State.setState({ step8SyncCompleted: true });
                setTimeout(() => location.reload(), 100);
            });
        }
    }
}

/**
 * Generate Fragmentation Prompt
 */
function generateFragmentationPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';

    return `Actúa como un Arquitecto de Software especializado en fragmentación de proyectos para ejecución con IA.

## Contexto:
El proyecto está ubicado en la carpeta **${projectName}**.
Tienes acceso al Plan Maestro Definitivo (\`Plan_Maestro_Definitivo.md\`) con toda la planeación, UX/UI e identidad visual definidas.

## Objetivo:
Fragmentar el proyecto en tareas de desarrollo autónomas y ejecutables.

## Reglas Estrictas:
1. Cada tarea debe ser independiente o tener dependencias claras
2. Las tareas deben ser ejecutables sin intervención humana
3. Respetar el orden lógico de dependencias
4. No modificar decisiones del Plan Maestro

## Proceso:

### 1. Análisis de Componentes
- Identificar todos los componentes del software
- Mapear dependencias entre componentes

### 2. Estructura de Carpetas
- Crear estructura de directorios del proyecto
- Definir convenciones de nombrado

### 3. Índice de Tareas
Por cada tarea:
- ID único (ej: T001, T002...)
- Descripción clara
- Archivos a crear/modificar
- Dependencias (IDs de tareas previas)
- Criterios de completitud

### 4. Orden de Ejecución
- Secuencia óptima de tareas
- Tareas que pueden ejecutarse en paralelo

## Salida:
Documento \`07_PLAN_EJECUCION.md\` con:
- Estructura de carpetas
- Lista ordenada de tareas
- Dependencias mapeadas
- Estimación de complejidad por tarea`;
}

/**
 * Generate Implementation Prompt
 */
function generateImplementationPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';

    return `Actúa como un Desarrollador de Software Senior ejecutando tareas de implementación.

## Contexto:
El proyecto está ubicado en la carpeta **${projectName}**.
Tienes acceso a:
- Plan Maestro Definitivo (\`Plan_Maestro_Definitivo.md\`)
- Plan de Ejecución (\`07_PLAN_EJECUCION.md\`)
- Definiciones de UX/UI
- Identidad Visual

## Objetivo:
Implementar el software siguiendo el plan de ejecución tarea por tarea.

## Reglas de Implementación:
1. Seguir EXACTAMENTE el orden del Plan de Ejecución
2. Respetar TODAS las restricciones de UX/UI
3. Aplicar la identidad visual definida
4. NO tomar decisiones de diseño no documentadas
5. Si hay ambigüedad, marcar como pendiente

## Por cada tarea:
1. Leer descripción y dependencias
2. Verificar que dependencias estén completas
3. Implementar código
4. Documentar componente creado
5. Marcar tarea como completada

## Estándares de Código:
- Código limpio y documentado
- Nombres descriptivos
- Separación de responsabilidades
- Sin código duplicado

## Protocolo de Progreso:
Después de cada tarea, reporta:
\`\`\`
[IMPLEMENTACION V{N}]
- Tarea: {ID}
- Estado: Completada/En progreso/Bloqueada
- Archivos creados/modificados
- Notas relevantes
\`\`\`

Comienza ejecutando las tareas del Plan de Ejecución en orden.`;
}

/**
 * Validate step
 */
export function validate(config, state) {
    if (!state.step8SyncCompleted) {
        alert('Por favor, completa ambas fases de implementación antes de continuar.');
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
