/**
 * IA-Flow - Step 4: Risk & CAME Evaluation
 * Identifies risks/opportunities and CAME strategic decisions
 */

import * as State from '../state.js';

/**
 * Render the risk evaluation step
 */
export function render(config, state) {
    const riskState = state.riskEvaluation || {};

    return `
        <div class="step-risks">
            <div class="risk-intro">
                <div class="intro-card">
                    <div class="intro-icon">📋</div>
                    <div class="intro-content">
                        <h3>Este paso requiere 2 interacciones con Antigravity</h3>
                        <p>Primero identificaremos riesgos y oportunidades, luego aplicaremos la matriz CAME para tomar decisiones estratégicas.</p>
                    </div>
                </div>
                
                <div class="agent-notice">
                    <span class="notice-icon">💡</span>
                    <span class="notice-text">
                        <strong>Importante:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity para cada prompt de este wizard.
                        Esto asegura que cada agente tenga un contexto limpio y especializado.
                    </span>
                </div>
            </div>
            
            <!-- Phase 1: Risk Identification -->
            <div class="risk-phase ${riskState.phase1Completed ? 'completed' : riskState.phase1Started ? 'active' : ''}">
                <div class="phase-header">
                    <div class="phase-number">1</div>
                    <div class="phase-info">
                        <h3>Identificación de Riesgos y Oportunidades</h3>
                        <p>Antigravity analizará el Plan Maestro para detectar riesgos y oportunidades.</p>
                    </div>
                    ${riskState.phase1Completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="output-info">
                        <strong>Archivo de salida:</strong> <code>03_RIESGOS_OPORTUNIDADES.md</code>
                    </div>
                    
                    <button id="generate-risk-prompt" class="generate-sync-btn" ${riskState.phase1Completed ? 'disabled' : ''}>
                        📋 Generar Prompt de Identificación
                    </button>
                    
                    ${riskState.phase1Started && !riskState.phase1Completed ? `
                        <div class="phase-actions">
                            <button id="confirm-risk-done" class="btn-success">
                                ✅ Confirmar que Antigravity completó la identificación
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Phase 2: CAME Matrix -->
            <div class="risk-phase ${riskState.phase2Completed ? 'completed' : riskState.phase2Started ? 'active' : ''} ${!riskState.phase1Completed ? 'disabled' : ''}">
                <div class="phase-header">
                    <div class="phase-number">2</div>
                    <div class="phase-info">
                        <h3>Matriz CAME y Decisiones Estratégicas</h3>
                        <p>Antigravity aplicará CAME y te hará preguntas para tomar decisiones estratégicas.</p>
                    </div>
                    ${riskState.phase2Completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="output-info">
                        <strong>Archivo de salida:</strong> <code>04_DECISIONES_CAME.md</code>
                    </div>
                    
                    <div class="interaction-notice">
                        <span class="notice-icon">💬</span>
                        <span>Este prompt iniciará un diálogo. Responde las preguntas de Antigravity en la conversación hasta que genere el documento final.</span>
                    </div>
                    
                    <button id="generate-came-prompt" class="generate-sync-btn" ${!riskState.phase1Completed || riskState.phase2Completed ? 'disabled' : ''}>
                        📋 Generar Prompt CAME
                    </button>
                    
                    ${riskState.phase2Started && !riskState.phase2Completed ? `
                        <div class="phase-actions">
                            <button id="confirm-came-done" class="btn-success">
                                ✅ Confirmar que Antigravity completó CAME y decisiones
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Sync Modal -->
            <div id="risk-sync-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3 id="risk-modal-title">📋 Prompt para Antigravity</h3>
                        <button id="close-risk-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <div class="agent-reminder">
                            <span class="agent-icon">🚀</span>
                            <span><strong>Recuerda:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity para este prompt.</span>
                        </div>
                        <p>Copia este prompt y pégalo en tu nueva conversación de Antigravity:</p>
                        <pre id="risk-sync-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-risk-sync" class="btn-primary">📋 Copiar Prompt</button>
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
    const modal = document.getElementById('risk-sync-modal');
    const closeBtn = document.getElementById('close-risk-modal');
    const copyBtn = document.getElementById('copy-risk-sync');
    const contentPre = document.getElementById('risk-sync-content');
    const modalTitle = document.getElementById('risk-modal-title');

    // Phase 1: Risk Identification
    document.getElementById('generate-risk-prompt')?.addEventListener('click', () => {
        const prompt = generateRiskIdentificationPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modalTitle) modalTitle.textContent = '📋 Prompt: Identificación de Riesgos';
        if (modal) modal.style.display = 'flex';

        // Mark phase 1 as started and re-render
        State.setNestedValue('riskEvaluation.phase1Started', true);
        updatePhaseUI();
    });

    document.getElementById('confirm-risk-done')?.addEventListener('click', () => {
        State.setNestedValue('riskEvaluation.phase1Completed', true);
        // Re-render to show updated state
        setTimeout(() => location.reload(), 100);
    });

    // Phase 2: CAME Matrix
    document.getElementById('generate-came-prompt')?.addEventListener('click', () => {
        const prompt = generateCAMEPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modalTitle) modalTitle.textContent = '📋 Prompt: Matriz CAME';
        if (modal) modal.style.display = 'flex';

        // Mark phase 2 as started
        State.setNestedValue('riskEvaluation.phase2Started', true);
        updatePhaseUI();
    });

    document.getElementById('confirm-came-done')?.addEventListener('click', () => {
        State.setNestedValue('riskEvaluation.phase2Completed', true);
        State.setState({ step4SyncCompleted: true });
        // Re-render to show updated state
        setTimeout(() => location.reload(), 100);
    });

    // Modal controls
    closeBtn?.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
        updatePhaseUI(); // Update UI after closing modal
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
    const riskState = state.riskEvaluation || {};

    // Update phase 1
    const phase1El = document.querySelector('.risk-phase:first-of-type');
    const phase2El = document.querySelector('.risk-phase:last-of-type');
    const phase1Content = phase1El?.querySelector('.phase-content');
    const phase2Content = phase2El?.querySelector('.phase-content');
    const phase2Btn = document.getElementById('generate-came-prompt');

    if (riskState.phase1Started && !riskState.phase1Completed) {
        phase1El?.classList.add('active');
        // Add confirm button if not exists
        if (phase1Content && !document.getElementById('confirm-risk-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-risk-done" class="btn-success">
                    ✅ Confirmar que Antigravity completó la identificación
                </button>
            `;
            phase1Content.appendChild(actionsDiv);

            // Re-attach listener
            document.getElementById('confirm-risk-done')?.addEventListener('click', () => {
                State.setNestedValue('riskEvaluation.phase1Completed', true);
                setTimeout(() => location.reload(), 100);
            });
        }
    }

    // Enable phase 2 button if phase 1 is completed
    if (riskState.phase1Completed && phase2Btn) {
        phase2Btn.disabled = false;
        phase2El?.classList.remove('disabled');
    }

    // Add phase 2 confirm button if phase 2 started
    if (riskState.phase2Started && !riskState.phase2Completed) {
        phase2El?.classList.add('active');
        // Add confirm button if not exists
        if (phase2Content && !document.getElementById('confirm-came-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-came-done" class="btn-success">
                    ✅ Confirmar que Antigravity completó CAME y decisiones
                </button>
            `;
            phase2Content.appendChild(actionsDiv);

            // Re-attach listener
            document.getElementById('confirm-came-done')?.addEventListener('click', () => {
                State.setNestedValue('riskEvaluation.phase2Completed', true);
                State.setState({ step4SyncCompleted: true });
                setTimeout(() => location.reload(), 100);
            });
        }
    }
}

/**
 * Generate Risk Identification Prompt
 */
function generateRiskIdentificationPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';

    return `Actúa como un Analista Técnico de Riesgos y Oportunidades bajo el enfoque de la norma ISO 9001:2015, específicamente el punto 6.1.

## Contexto:
Analizarás el documento 'Plan Maestro' (02_MASTER_PLAN.md) que describe la planeación completa del MVP ubicado en ${projectName}. Este documento es la única fuente válida de información.

## Objetivo:
IDENTIFICAR riesgos y oportunidades derivados del contenido del Plan Maestro.
Debe limitarte a DETECTAR y DESCRIBIR; no proponer soluciones ni tomar decisiones estratégicas.

## Reglas Estrictas:
1. NO propongas acciones correctivas, preventivas ni estratégicas
2. NO priorices ni clasifiques por impacto o probabilidad
3. NO modifiques el Plan Maestro
4. NO inventes riesgos u oportunidades que no se desprendan lógicamente del documento
5. NO combines riesgos y oportunidades: deben estar claramente separados
6. Usa lenguaje técnico, claro y objetivo
7. Mantén el enfoque en un MVP

## Manejo de Documentos Extensos:
- Si el Plan Maestro es largo, analízalo por bloques
- Asegúrate de procesar la totalidad del documento antes de generar el resultado
- No omitas secciones por limitaciones de contexto

## Salida Esperada:
Genera documento Markdown \`03_RIESGOS_OPORTUNIDADES.md\` con:

1. **Referencia al Plan Maestro**
   - Nombre del documento analizado
   - Alcance del análisis

2. **Lista de Riesgos Identificados**
   - Enumera cada riesgo
   - Describe: Qué es el riesgo + De qué parte del Plan Maestro se origina
   - NO incluyas soluciones

3. **Lista de Oportunidades Identificadas**
   - Enumera cada oportunidad
   - Describe: Qué es la oportunidad + De qué parte del Plan Maestro se origina
   - NO incluyas estrategias ni planes de explotación

No expliques tu razonamiento. No hagas recomendaciones. Entrega únicamente el documento.`;
}

/**
 * Generate CAME Matrix Prompt
 */
function generateCAMEPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';

    return `Actúa como un Consultor Estratégico Senior especializado en análisis CAME (Corregir, Afrontar, Mantener, Explotar), aplicado a proyectos de software MVP.

## Contexto:
Analizarás el documento '03_RIESGOS_OPORTUNIDADES.md' generado a partir del Plan Maestro ubicado en ${projectName}. Este documento es la única fuente válida para el análisis.

## Objetivo:
CONSTRUIR una matriz CAME cruzada a partir de los riesgos y oportunidades, con el objetivo de TOMAR DECISIONES ESTRATÉGICAS CLARAS en el menor número posible de interacciones.

**NOTA IMPORTANTE:** Entre las decisiones estratégicas, debes incluir la SELECCIÓN DE TECNOLOGÍAS a utilizar en el proyecto (frameworks, lenguajes, bases de datos, servicios cloud, etc.) basándote en:
- El contexto técnico del usuario documentado en el Plan Maestro
- Los riesgos y oportunidades identificados
- La viabilidad para un MVP

## Reglas de Interacción:
1. Meta: llegar a decisiones en máximo 3-4 interacciones
2. Pregunta SOLO cuando una decisión no pueda tomarse con información existente
3. Cada pregunta debe destrabar varias decisiones, no solo una
4. Evita debates largos o explicaciones académicas
5. Mantén enfoque en MVP

## Proceso:
1. Analiza listado completo de Riesgos y Oportunidades
2. Construye internamente el cruce CAME:
   - Riesgos → Corregir o Afrontar
   - Oportunidades → Mantener o Explotar
3. Identifica:
   - Decisiones evidentes (no requieren validación)
   - Decisiones ambiguas (requieren input del usuario)

## Interacción con Usuario:
- Si necesitas información, formula BLOQUE ÚNICO de preguntas
- Máximo 3 preguntas cerradas o de elección
- Indica que las respuestas cerrarán decisiones estratégicas

## Salida Final Esperada:
Genera documento \`04_DECISIONES_CAME.md\` con:

1. **Decisiones Estratégicas Derivadas del CAME**
   - Lista numerada
   - Cada decisión indica: Qué se decidió + Riesgo/oportunidad que responde + Tipo CAME

2. **Stack Tecnológico Seleccionado**
   - Frameworks y lenguajes
   - Base de datos
   - Servicios cloud/hosting
   - Justificación breve de cada elección

3. **Alcance de las Decisiones**
   - Qué afectan dentro del Plan Maestro
   - Qué NO están decidiendo todavía

## Prohibiciones:
- No redactes el Plan Maestro
- No propongas implementación técnica detallada
- No avances a ejecución
- No reabras decisiones cerradas

Prioridad: CLARIDAD > VELOCIDAD > PROFUNDIDAD`;
}

/**
 * Validate step
 */
export function validate(config, state) {
    if (!state.step4SyncCompleted) {
        alert('Por favor, completa ambas fases (Riesgos y CAME) antes de continuar.');
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
