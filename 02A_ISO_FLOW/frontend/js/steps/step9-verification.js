/**
 * IA-Flow - Step 9: Verification
 * Four phases: Execution, Testing, Security Audit, Security Implementation
 */

import * as State from '../state.js';

/**
 * Render the verification step
 */
export function render(config, state) {
    const verifyState = state.verificationEvaluation || {};

    return `
        <div class="step-verification">
            <div class="verification-intro">
                <div class="intro-card">
                    <div class="intro-icon">🔍</div>
                    <div class="intro-content">
                        <h3>Verificación del Proyecto</h3>
                        <p>Ejecuta, prueba y verifica la calidad del software antes del despliegue.</p>
                    </div>
                </div>
                
                <div class="intro-card info">
                    <div class="intro-icon">📋</div>
                    <div class="intro-content">
                        <h3>Este paso tiene 4 fases</h3>
                        <p>Ejecución → Pruebas iterativas → Auditoría de seguridad → Implementar correcciones</p>
                    </div>
                </div>
            </div>
            
            <!-- Phase 1: Execution -->
            <div class="verify-phase ${verifyState.phase1Completed ? 'completed' : verifyState.phase1Started ? 'active' : ''}">
                <div class="phase-header">
                    <div class="phase-number">1</div>
                    <div class="phase-info">
                        <h3>🚀 Ejecución de la Aplicación</h3>
                        <p>Antigravity te ayudará a ejecutar la aplicación por primera vez.</p>
                    </div>
                    ${verifyState.phase1Completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="phase-details">
                        <p><strong>Antigravity te ayudará a:</strong></p>
                        <ul>
                            <li>Instalar dependencias necesarias</li>
                            <li>Configurar el entorno de desarrollo</li>
                            <li>Ejecutar la aplicación localmente</li>
                            <li>Resolver errores de ejecución inicial</li>
                        </ul>
                    </div>
                    
                    <button id="generate-execution-prompt" class="generate-sync-btn" ${verifyState.phase1Completed ? 'disabled' : ''}>
                        📋 Generar Prompt de Ejecución
                    </button>
                    
                    ${verifyState.phase1Started && !verifyState.phase1Completed ? `
                        <div class="phase-actions">
                            <button id="confirm-execution-done" class="btn-success">
                                ✅ Confirmar que la aplicación ejecuta correctamente
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Phase 2: Testing -->
            <div class="verify-phase ${verifyState.phase2Completed ? 'completed' : verifyState.phase2Started ? 'active' : ''} ${!verifyState.phase1Completed ? 'disabled' : ''}">
                <div class="phase-header">
                    <div class="phase-number">2</div>
                    <div class="phase-info">
                        <h3>🧪 Pruebas y Corrección de Errores</h3>
                        <p>Prueba cada función y corrige errores de forma iterativa.</p>
                    </div>
                    ${verifyState.phase2Completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="agent-notice warning">
                        <span class="notice-icon">💡</span>
                        <span class="notice-text">
                            <strong>Recomendación:</strong> Crea <strong>nuevos agentes periódicamente</strong> para no perder contexto o acumular errores.
                        </span>
                    </div>
                    
                    <div class="phase-details">
                        <p><strong>Proceso iterativo:</strong></p>
                        <ol>
                            <li>Prueba cada función de la aplicación</li>
                            <li>Documenta bugs, errores y mejoras</li>
                            <li>Usa el prompt de reparación con Antigravity</li>
                            <li>Repite hasta que el producto sea estable</li>
                        </ol>
                    </div>
                    
                    <div class="testing-prompt-box">
                        <h4>📋 Prompt de Reparación (copia y usa cuando encuentres errores):</h4>
                        <pre id="repair-prompt-template" class="repair-prompt"></pre>
                    </div>
                    
                    <button id="copy-repair-prompt" class="btn-secondary" ${!verifyState.phase1Completed ? 'disabled' : ''}>
                        📋 Copiar Prompt de Reparación
                    </button>
                    
                    ${verifyState.phase1Completed && !verifyState.phase2Completed ? `
                        <div class="phase-actions">
                            <button id="confirm-testing-done" class="btn-success">
                                ✅ Confirmar que la aplicación está estable y lista
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Phase 3: Security -->
            <div class="verify-phase ${verifyState.phase3Completed ? 'completed' : verifyState.phase3Started ? 'active' : ''} ${!verifyState.phase2Completed ? 'disabled' : ''}">
                <div class="phase-header">
                    <div class="phase-number">3</div>
                    <div class="phase-info">
                        <h3>🔒 Auditoría de Seguridad</h3>
                        <p>Antigravity identificará vulnerabilidades y te las explicará.</p>
                    </div>
                    ${verifyState.phase3Completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="phase-details">
                        <p><strong>Antigravity verificará:</strong></p>
                        <ul>
                            <li>Vulnerabilidades de seguridad comunes</li>
                            <li>Exposición de datos sensibles</li>
                            <li>Validación de inputs</li>
                            <li>Autenticación y autorización</li>
                            <li>Protección contra ataques (XSS, CSRF, SQL Injection)</li>
                        </ul>
                    </div>
                    
                    <button id="generate-security-prompt" class="generate-sync-btn" ${!verifyState.phase2Completed || verifyState.phase3Completed ? 'disabled' : ''}>
                        📋 Generar Prompt de Seguridad
                    </button>
                    
                    ${verifyState.phase3Started && !verifyState.phase3Completed ? `
                        <div class="phase-actions">
                            <button id="confirm-security-done" class="btn-success">
                                ✅ Confirmar verificación de seguridad completada
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Phase 4: Security Implementation -->
            <div class="verify-phase ${verifyState.phase4Completed ? 'completed' : verifyState.phase4Started ? 'active' : ''} ${!verifyState.phase3Completed ? 'disabled' : ''}">
                <div class="phase-header">
                    <div class="phase-number">4</div>
                    <div class="phase-info">
                        <h3>🛠️ Implementar Correcciones de Seguridad</h3>
                        <p>Decide qué vulnerabilidades corregir y Antigravity las implementará.</p>
                    </div>
                    ${verifyState.phase4Completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="phase-details">
                        <p><strong>Proceso:</strong></p>
                        <ol>
                            <li>Revisa las vulnerabilidades identificadas en la fase anterior</li>
                            <li>Decide cuáles deseas corregir</li>
                            <li>Antigravity implementará las correcciones seleccionadas</li>
                        </ol>
                    </div>
                    
                    <button id="generate-security-fix-prompt" class="generate-sync-btn" ${!verifyState.phase3Completed || verifyState.phase4Completed ? 'disabled' : ''}>
                        📋 Generar Prompt de Implementación de Seguridad
                    </button>
                    
                    ${verifyState.phase4Started && !verifyState.phase4Completed ? `
                        <div class="phase-actions">
                            <button id="confirm-security-fix-done" class="btn-success">
                                ✅ Confirmar correcciones de seguridad implementadas
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Completed state -->
            ${verifyState.phase4Completed ? `
                <div class="verification-completed">
                    <div class="completed-icon">🎉</div>
                    <h3>¡Verificación Completada!</h3>
                    <p>La aplicación ha sido probada, auditada y asegurada. Lista para producción.</p>
                </div>
            ` : ''}
            
            <!-- Sync Modal -->
            <div id="verify-sync-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3 id="verify-modal-title">📋 Prompt</h3>
                        <button id="close-verify-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <div class="agent-reminder">
                            <span class="agent-icon">🚀</span>
                            <span><strong>Recuerda:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity.</span>
                        </div>
                        <p>Copia este prompt y pégalo en Antigravity:</p>
                        <pre id="verify-sync-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-verify-sync" class="btn-primary">📋 Copiar Prompt</button>
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
    populateRepairPrompt();
}

/**
 * Populate the repair prompt template
 */
function populateRepairPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';
    const softwareType = state.softwareType || 'aplicación';

    const typeMap = {
        'web_page': 'página web',
        'web_app': 'aplicación web',
        'mobile_app': 'aplicación móvil',
        'windows_program': 'programa de escritorio'
    };

    const repairPrompt = `Trabajamos en la ${typeMap[softwareType] || softwareType} ubicada en la carpeta **${projectName}**.

Ayúdame a reparar los siguientes bugs, errores e implementar mejoras:

## Bugs/Errores encontrados:
1. [Describe el primer error]
2. [Describe el segundo error]
...

## Mejoras a implementar:
1. [Describe la primera mejora]
...

Por favor, revisa cada punto y realiza las correcciones necesarias.`;

    const templateEl = document.getElementById('repair-prompt-template');
    if (templateEl) {
        templateEl.textContent = repairPrompt;
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const modal = document.getElementById('verify-sync-modal');
    const closeBtn = document.getElementById('close-verify-modal');
    const copyBtn = document.getElementById('copy-verify-sync');
    const contentPre = document.getElementById('verify-sync-content');
    const modalTitle = document.getElementById('verify-modal-title');

    // Phase 1: Execution
    document.getElementById('generate-execution-prompt')?.addEventListener('click', () => {
        const prompt = generateExecutionPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modalTitle) modalTitle.textContent = '📋 Prompt: Ejecución de la Aplicación';

        State.setNestedValue('verificationEvaluation.phase1Started', true);
        if (modal) modal.style.display = 'flex';
        updatePhaseUI();
    });

    document.getElementById('confirm-execution-done')?.addEventListener('click', () => {
        State.setNestedValue('verificationEvaluation.phase1Completed', true);
        State.setNestedValue('verificationEvaluation.phase2Started', true); // Auto-start phase 2
        setTimeout(() => location.reload(), 100);
    });

    // Phase 2: Testing - Copy repair prompt
    document.getElementById('copy-repair-prompt')?.addEventListener('click', async () => {
        const repairPrompt = document.getElementById('repair-prompt-template')?.textContent || '';
        try {
            await navigator.clipboard.writeText(repairPrompt);
            const btn = document.getElementById('copy-repair-prompt');
            if (btn) {
                btn.textContent = '✅ ¡Copiado!';
                setTimeout(() => btn.textContent = '📋 Copiar Prompt de Reparación', 2000);
            }
        } catch (error) {
            console.error('Copy failed:', error);
        }
    });

    document.getElementById('confirm-testing-done')?.addEventListener('click', () => {
        State.setNestedValue('verificationEvaluation.phase2Completed', true);
        setTimeout(() => location.reload(), 100);
    });

    // Phase 3: Security
    document.getElementById('generate-security-prompt')?.addEventListener('click', () => {
        const prompt = generateSecurityPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modalTitle) modalTitle.textContent = '📋 Prompt: Verificación de Seguridad';

        State.setNestedValue('verificationEvaluation.phase3Started', true);
        if (modal) modal.style.display = 'flex';
        updatePhaseUI();
    });

    document.getElementById('confirm-security-done')?.addEventListener('click', () => {
        State.setNestedValue('verificationEvaluation.phase3Completed', true);
        setTimeout(() => location.reload(), 100);
    });

    // Phase 4: Security Implementation
    document.getElementById('generate-security-fix-prompt')?.addEventListener('click', () => {
        const prompt = generateSecurityFixPrompt();
        if (contentPre) contentPre.textContent = prompt;
        if (modalTitle) modalTitle.textContent = '📋 Prompt: Implementación de Correcciones de Seguridad';

        State.setNestedValue('verificationEvaluation.phase4Started', true);
        if (modal) modal.style.display = 'flex';
        updatePhaseUI();
    });

    document.getElementById('confirm-security-fix-done')?.addEventListener('click', () => {
        State.setNestedValue('verificationEvaluation.phase4Completed', true);
        State.setState({ step9SyncCompleted: true });
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
    const verifyState = state.verificationEvaluation || {};

    const phases = document.querySelectorAll('.verify-phase');
    const phase1El = phases[0];
    const phase2El = phases[1];
    const phase3El = phases[2];
    const phase1Content = phase1El?.querySelector('.phase-content');
    const phase2Content = phase2El?.querySelector('.phase-content');
    const phase3Content = phase3El?.querySelector('.phase-content');

    // Phase 1 confirm button
    if (verifyState.phase1Started && !verifyState.phase1Completed) {
        phase1El?.classList.add('active');
        if (phase1Content && !document.getElementById('confirm-execution-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-execution-done" class="btn-success">
                    ✅ Confirmar que la aplicación ejecuta correctamente
                </button>
            `;
            phase1Content.appendChild(actionsDiv);

            document.getElementById('confirm-execution-done')?.addEventListener('click', () => {
                State.setNestedValue('verificationEvaluation.phase1Completed', true);
                State.setNestedValue('verificationEvaluation.phase2Started', true);
                setTimeout(() => location.reload(), 100);
            });
        }
    }

    // Enable phase 2 if phase 1 completed
    if (verifyState.phase1Completed) {
        phase2El?.classList.remove('disabled');
        document.getElementById('copy-repair-prompt')?.removeAttribute('disabled');
    }

    // Enable phase 3 if phase 2 completed
    if (verifyState.phase2Completed) {
        phase3El?.classList.remove('disabled');
        const securityBtn = document.getElementById('generate-security-prompt');
        if (securityBtn) securityBtn.disabled = false;
    }

    // Phase 3 confirm button
    if (verifyState.phase3Started && !verifyState.phase3Completed) {
        phase3El?.classList.add('active');
        if (phase3Content && !document.getElementById('confirm-security-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-security-done" class="btn-success">
                    ✅ Confirmar auditoría de seguridad completada
                </button>
            `;
            phase3Content.appendChild(actionsDiv);

            document.getElementById('confirm-security-done')?.addEventListener('click', () => {
                State.setNestedValue('verificationEvaluation.phase3Completed', true);
                setTimeout(() => location.reload(), 100);
            });
        }
    }

    // Enable phase 4 if phase 3 completed
    const phase4El = phases[3];
    const phase4Content = phase4El?.querySelector('.phase-content');
    if (verifyState.phase3Completed) {
        phase4El?.classList.remove('disabled');
        const securityFixBtn = document.getElementById('generate-security-fix-prompt');
        if (securityFixBtn) securityFixBtn.disabled = false;
    }

    // Phase 4 confirm button
    if (verifyState.phase4Started && !verifyState.phase4Completed) {
        phase4El?.classList.add('active');
        if (phase4Content && !document.getElementById('confirm-security-fix-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-security-fix-done" class="btn-success">
                    ✅ Confirmar correcciones de seguridad implementadas
                </button>
            `;
            phase4Content.appendChild(actionsDiv);

            document.getElementById('confirm-security-fix-done')?.addEventListener('click', () => {
                State.setNestedValue('verificationEvaluation.phase4Completed', true);
                State.setState({ step9SyncCompleted: true });
                setTimeout(() => location.reload(), 100);
            });
        }
    }
}

/**
 * Generate Execution Prompt
 */
function generateExecutionPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';
    const softwareType = state.softwareType || 'aplicación';

    const typeMap = {
        'web_page': 'página web',
        'web_app': 'aplicación web',
        'mobile_app': 'aplicación móvil',
        'windows_program': 'programa de escritorio'
    };

    return `Actúa como un Ingeniero DevOps especializado en configuración y ejecución de proyectos.

## Contexto:
El proyecto está ubicado en la carpeta **${projectName}**.
Es una ${typeMap[softwareType] || softwareType}.

## Objetivo:
Ayudar al usuario a ejecutar la aplicación por primera vez en su entorno local.

## Tareas a realizar:

### 1. Verificar Requisitos
- Revisar que están instaladas las dependencias del sistema
- Verificar versiones de herramientas (Node, Python, etc. según aplique)

### 2. Instalar Dependencias
- Ejecutar el comando de instalación apropiado (npm install, pip install, etc.)
- Resolver cualquier conflicto de dependencias

### 3. Configurar Entorno
- Crear archivos de configuración si son necesarios (.env, etc.)
- Configurar variables de entorno requeridas

### 4. Ejecutar la Aplicación
- Ejecutar el comando de inicio apropiado
- Verificar que la aplicación arranca sin errores
- Proporcionar la URL o forma de acceder a la aplicación

### 5. Solucionar Problemas
- Si hay errores, analizar y proponer soluciones
- Guiar paso a paso hasta que funcione

## Instrucciones:
Guía al usuario paso a paso. Después de cada comando, espera confirmación antes de continuar.`;
}

/**
 * Generate Security Prompt
 */
function generateSecurityPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';

    return `Actúa como un Auditor de Seguridad especializado en aplicaciones de software.

## Contexto:
El proyecto está ubicado en la carpeta **${projectName}**.
La aplicación ha sido desarrollada y probada funcionalmente. Ahora requiere una revisión de seguridad.

## Objetivo:
Realizar una auditoría de seguridad del código y la arquitectura.

## Áreas a Revisar:

### 1. Exposición de Datos Sensibles
- Buscar credenciales hardcodeadas
- Verificar que no hay API keys expuestas
- Revisar archivos .env y configuración

### 2. Validación de Inputs
- Verificar sanitización de entradas de usuario
- Revisar parámetros de URL y formularios

### 3. Autenticación y Autorización
- Revisar implementación de login (si aplica)
- Verificar protección de rutas sensibles
- Revisar manejo de sesiones

### 4. Protección contra Ataques Comunes
- XSS (Cross-Site Scripting)
- CSRF (Cross-Site Request Forgery)
- SQL Injection
- Path Traversal

### 5. Configuración de Seguridad
- Headers de seguridad HTTP
- CORS configuración
- HTTPS/TLS

### 6. Dependencias
- Buscar vulnerabilidades conocidas en dependencias
- Recomendar actualizaciones críticas

## Formato de Salida:
Para cada hallazgo:
- **Severidad**: Crítica / Alta / Media / Baja
- **Ubicación**: Archivo y línea
- **Descripción**: Qué problema es
- **Remediación**: Cómo solucionarlo

## Instrucciones:
1. Revisa el código del proyecto
2. Documenta todos los hallazgos
3. Prioriza por severidad
4. Proporciona código de corrección cuando sea posible`;
}

/**
 * Generate Security Fix Prompt
 */
function generateSecurityFixPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';

    return `Actúa como un Ingeniero de Seguridad especializado en remediación de vulnerabilidades.

## Contexto:
El proyecto está ubicado en la carpeta **${projectName}**.
Se ha realizado una auditoría de seguridad previa que identificó vulnerabilidades.

## Objetivo:
Explicar las vulnerabilidades encontradas al usuario y, tras su decisión, implementar las correcciones seleccionadas.

## Proceso:

### Paso 1: Resumen de Vulnerabilidades
Primero, presenta un resumen ejecutivo de las vulnerabilidades encontradas:
- Lista cada vulnerabilidad con su severidad (Crítica/Alta/Media/Baja)
- Explica en lenguaje simple qué riesgo representa cada una
- Indica el esfuerzo estimado de corrección (bajo/medio/alto)

### Paso 2: Consulta al Usuario
Pregunta al usuario:
"\u00bfCu\u00e1les de estas vulnerabilidades deseas que corrija? Puedes elegir:
- Todas
- Solo las cr\u00edticas y altas
- Vulnerabilidades espec\u00edficas (indica los n\u00fameros)
- Ninguna por ahora"

### Paso 3: Implementación
Una vez el usuario decida, implementa las correcciones:
- Modifica el código necesario
- Documenta cada cambio realizado
- Verifica que las correcciones no rompen funcionalidad existente

## Formato de Presentación:
\`\`\`
⚠️ RESUMEN DE VULNERABILIDADES ENCONTRADAS

| # | Severidad | Vulnerabilidad | Riesgo | Esfuerzo |
|---|-----------|----------------|--------|----------|
| 1 | Crítica   | [nombre]       | [desc] | [bajo/medio/alto] |
...

\u00bfCu\u00e1les deseas corregir?
\`\`\`

## Reglas:
- NO implementes correcciones sin confirmación del usuario
- Prioriza por severidad en la presentación
- Explica los riesgos de NO corregir vulnerabilidades críticas
- Después de cada corrección, confirma que fue exitosa`;
}

/**
 * Validate step
 */
export function validate(config, state) {
    if (!state.step9SyncCompleted) {
        alert('Por favor, completa las cuatro fases de verificación antes de continuar.');
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
