/**
 * IA-Flow - Wizard Controller
 * Manages the step-by-step wizard interface
 */

import * as State from './state.js';
import { DonationPopup } from './donationPopup.js';
import { initStripe, createEmbeddedCheckout, destroyCheckout } from './stripe.js';

// Step definitions matching flujo-iso.json nodes
const WIZARD_STEPS = [
    {
        id: 0,
        nodeId: 'node_0_classifier',
        name: 'Ideación',
        title: '💡 Descarga tus Ideas',
        description: 'Describe todas tus ideas para tu proyecto de software. No te limites.',
        icon: '💡',
        requiresSync: false
    },
    {
        id: 1,
        nodeId: 'node_1a_single_idea_flow',
        name: 'Selección',
        title: '🎯 Tipo de Software',
        description: 'Selecciona el tipo de software que deseas construir.',
        icon: '🎯',
        requiresSync: true
    },
    {
        id: 2,
        nodeId: 'node_3_technical_context',
        name: 'Contexto Técnico',
        title: '⚙️ Contexto Técnico',
        description: 'Define tus recursos y limitaciones técnicas.',
        icon: '⚙️',
        requiresSync: true
    },
    {
        id: 3,
        nodeId: 'node_7a_uxui_functional',
        name: 'UX/UI Funcional',
        title: '📐 Diseño Funcional',
        description: 'Define la estructura y navegación.',
        icon: '📐',
        requiresSync: true
    },
    {
        id: 4,
        nodeId: 'node_7c_visual_identity',
        name: 'Identidad Visual',
        title: '🎨 Identidad Visual',
        description: 'Define colores, tipografía y estilo.',
        icon: '🎨',
        requiresSync: true
    },
    {
        id: 5,
        nodeId: 'node_4_risk_evaluation',
        name: 'Riesgos y CAME',
        title: '⚠️ Evaluación de Riesgos',
        description: 'Identifica riesgos, oportunidades y toma decisiones estratégicas con CAME.',
        icon: '⚠️',
        requiresSync: true,
        executor: 'antigravity'
    },
    {
        id: 6,
        nodeId: 'node_2_master_plan',
        name: 'Consolidación',
        title: '📋 Plan Maestro Definitivo',
        description: 'Consolida todos los documentos en uno solo.',
        icon: '📋',
        requiresSync: true,
        executor: 'antigravity'
    },
    {
        id: 7,
        nodeId: 'node_9_code_implementation',
        name: 'Implementación',
        title: '💻 Implementación',
        description: 'Fragmenta y ejecuta las tareas de desarrollo.',
        icon: '💻',
        requiresSync: true,
        executor: 'antigravity'
    },
    {
        id: 8,
        nodeId: 'node_10_verification',
        name: 'Verificación',
        title: '✅ Verificación',
        description: 'Ejecuta, prueba y verifica seguridad.',
        icon: '✅',
        requiresSync: true,
        executor: 'antigravity'
    },
    {
        id: 9,
        nodeId: 'node_12_deployment',
        name: 'Despliegue',
        title: '🚀 Despliegue',
        description: 'Publica tu proyecto al mundo.',
        icon: '🚀',
        requiresSync: true,
        executor: 'antigravity'
    }
];

// DOM Elements
let elements = {};

// Step modules (lazy loaded)
const stepModules = {};

/**
 * Initialize the Wizard
 */
export async function init() {
    console.log('🧙 Wizard initializing...');

    cacheElements();
    renderProgressBar();
    setupEventListeners();

    // Initialize donation popup
    DonationPopup.init({
        onDonate: handleDonateClick,
        onContinue: () => console.log('User continued without donating')
    });

    // Initialize Stripe with API URL
    try {
        initStripe('http://localhost:3000/api');
    } catch (error) {
        console.warn('Stripe initialization failed:', error);
    }

    // Subscribe to state changes
    State.subscribe('wizard', handleStateChange);

    // Render current step
    await renderCurrentStep();

    console.log('✅ Wizard initialized');
}

/**
 * Cache DOM elements
 */
function cacheElements() {
    elements = {
        progressBar: document.getElementById('wizard-progress'),
        progressBarFill: document.getElementById('wizard-progress-bar-fill'),
        stepContainer: document.getElementById('wizard-step-container'),
        stepTitle: document.getElementById('wizard-step-title'),
        stepDescription: document.getElementById('wizard-step-description'),
        prevButton: document.getElementById('wizard-prev'),
        nextButton: document.getElementById('wizard-next'),
        syncButton: document.getElementById('wizard-sync'),
        projectName: document.getElementById('project-name'),
        currentStepNumber: document.getElementById('current-step-number'),
        totalSteps: document.getElementById('total-steps'),
        // Reset modal elements
        resetBtn: document.getElementById('reset-progress-btn'),
        resetModal: document.getElementById('reset-modal'),
        cancelResetBtn: document.getElementById('cancel-reset'),
        confirmResetBtn: document.getElementById('confirm-reset'),
        // Donate button
        donateBtn: document.getElementById('donate-btn')
    };
}

/**
 * Render the progress bar
 */
function renderProgressBar() {
    if (!elements.progressBar) return;

    const state = State.getState();
    const currentStep = state.currentStep;

    elements.progressBar.innerHTML = WIZARD_STEPS.map((step, index) => {
        let status = 'pending';
        if (index < currentStep) status = 'completed';
        if (index === currentStep) status = 'active';

        return `
            <div class="progress-step ${status}" data-step="${index}">
                <div class="progress-step-icon">${step.icon}</div>
                <div class="progress-step-name">${step.name}</div>
                <div class="progress-step-connector"></div>
            </div>
        `;
    }).join('');

    // Update step counter
    if (elements.currentStepNumber) {
        elements.currentStepNumber.textContent = currentStep + 1;
    }
    if (elements.totalSteps) {
        elements.totalSteps.textContent = WIZARD_STEPS.length;
    }

    // Update project name from step0 state
    const projectNameFromStep0 = state.step0?.antigravityProjectName;
    if (elements.projectName && projectNameFromStep0) {
        elements.projectName.textContent = projectNameFromStep0;
    }

    // Update visual progress bar
    if (elements.progressBarFill) {
        const progressPercent = ((currentStep + 1) / WIZARD_STEPS.length) * 100;
        elements.progressBarFill.style.width = `${progressPercent}%`;
    }
}

/**
 * Render the current step content
 */
async function renderCurrentStep() {
    const state = State.getState();
    const currentStep = state.currentStep;
    const stepConfig = WIZARD_STEPS[currentStep];

    if (!stepConfig) {
        console.error('Invalid step:', currentStep);
        return;
    }

    // Update header
    if (elements.stepTitle) {
        elements.stepTitle.textContent = stepConfig.title;
    }
    if (elements.stepDescription) {
        elements.stepDescription.textContent = stepConfig.description;
    }

    // Update project name in header
    const projectName = state.step0?.antigravityProjectName || state.projectName;
    if (elements.projectName && projectName) {
        elements.projectName.textContent = projectName;
    }

    // Load and render step module
    try {
        const stepModule = await loadStepModule(currentStep);
        if (stepModule && stepModule.render) {
            elements.stepContainer.innerHTML = '';
            const stepContent = await stepModule.render(stepConfig, state);

            if (typeof stepContent === 'string') {
                elements.stepContainer.innerHTML = stepContent;
            } else if (stepContent instanceof HTMLElement) {
                elements.stepContainer.appendChild(stepContent);
            }

            // Initialize step if needed
            if (stepModule.init) {
                await stepModule.init(stepConfig, state);
            }
        }
    } catch (error) {
        console.error('Failed to render step:', error);
        elements.stepContainer.innerHTML = `
            <div class="step-error">
                <p>❌ Error al cargar el paso</p>
                <p>${error.message}</p>
            </div>
        `;
    }

    // Update navigation buttons
    updateNavigationButtons();

    // Update progress bar
    renderProgressBar();
}

/**
 * Load step module dynamically
 */
async function loadStepModule(stepIndex) {
    if (stepModules[stepIndex]) {
        return stepModules[stepIndex];
    }

    // Map step index to module
    const moduleMap = {
        0: './steps/step0-ideation.js',
        1: './steps/step1-selection.js',
        2: './steps/step3-context.js',    // Contexto Técnico
        3: './steps/step5-uxui.js',       // UX/UI Funcional
        4: './steps/step6-identity.js',   // Identidad Visual
        5: './steps/step4-risks.js',      // Riesgos y CAME
        6: './steps/step7-consolidation.js', // Consolidación Plan Maestro
        7: './steps/step8-implementation.js', // Implementación
        8: './steps/step9-verification.js', // Verificación
        9: './steps/step10-deployment.js' // Despliegue
    };

    const modulePath = moduleMap[stepIndex];

    if (modulePath) {
        try {
            stepModules[stepIndex] = await import(modulePath);
            return stepModules[stepIndex];
        } catch (error) {
            console.warn(`Step module not found for step ${stepIndex}:`, error);
        }
    }

    // Return default module for steps without custom UI
    return getDefaultStepModule(stepIndex);
}

/**
 * Get default step module for Antigravity-executed steps
 */
function getDefaultStepModule(stepIndex) {
    const stepConfig = WIZARD_STEPS[stepIndex];

    return {
        render: (config, state) => `
            <div class="step-default">
                <div class="step-icon-large">${config.icon}</div>
                <h3>${config.title}</h3>
                <p>${config.description}</p>
                
                ${config.executor === 'antigravity' ? `
                    <div class="antigravity-notice">
                        <div class="antigravity-notice-icon">🚀</div>
                        <p>Este paso será ejecutado por <strong>Antigravity</strong>.</p>
                        <p>Haz clic en "Generar Instrucción" para obtener el prompt que debes copiar.</p>
                    </div>
                ` : `
                    <div class="step-chat-container">
                        <div id="step-chat-messages" class="step-chat-messages"></div>
                        <div class="step-chat-input">
                            <textarea id="step-chat-input" placeholder="Escribe tu mensaje..."></textarea>
                            <button id="step-chat-send" class="btn-primary">Enviar</button>
                        </div>
                    </div>
                `}
            </div>
        `,
        init: async (config, state) => {
            // Setup chat if not an antigravity step
            if (config.executor !== 'antigravity') {
                setupStepChat(config, state);
            }
        }
    };
}

/**
 * Setup chat for a step
 */
function setupStepChat(config, state) {
    const sendButton = document.getElementById('step-chat-send');
    const inputField = document.getElementById('step-chat-input');

    if (sendButton && inputField) {
        sendButton.addEventListener('click', () => {
            const message = inputField.value.trim();
            if (message) {
                // TODO: Integrate with AI service
                console.log('Send message:', message);
                inputField.value = '';
            }
        });
    }
}

/**
 * Update navigation buttons state
 */
function updateNavigationButtons() {
    const state = State.getState();
    const currentStep = state.currentStep;
    const stepConfig = WIZARD_STEPS[currentStep];

    // Previous button
    if (elements.prevButton) {
        elements.prevButton.disabled = currentStep === 0;
    }

    // Next button
    if (elements.nextButton) {
        const isLastStep = currentStep === WIZARD_STEPS.length - 1;
        elements.nextButton.textContent = isLastStep ? '🎉 Finalizar' : 'Siguiente →';

        // Disable if pending Antigravity confirmation
        if (stepConfig.requiresSync && state.pendingAntigravityConfirmation) {
            elements.nextButton.disabled = true;
            elements.nextButton.title = 'Debes copiar la instrucción y confirmar la ejecución en Antigravity';
        } else {
            elements.nextButton.disabled = isLastStep;
            elements.nextButton.title = '';
        }
    }

    // Sync button visibility - hide for steps with their own sync
    if (elements.syncButton) {
        const hideGlobalSync = currentStep === 0 || currentStep === 1 || currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5 || currentStep === 6 || currentStep === 7 || currentStep === 8 || currentStep === 9;
        elements.syncButton.style.display = (stepConfig.requiresSync && !hideGlobalSync) ? 'flex' : 'none';
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Navigation buttons
    if (elements.prevButton) {
        elements.prevButton.addEventListener('click', handlePrevious);
    }

    if (elements.nextButton) {
        elements.nextButton.addEventListener('click', handleNext);
    }

    // Sync button
    if (elements.syncButton) {
        elements.syncButton.addEventListener('click', handleGenerateSync);
    }

    // Progress bar click navigation (only to completed steps)
    if (elements.progressBar) {
        elements.progressBar.addEventListener('click', (e) => {
            const stepEl = e.target.closest('.progress-step');
            if (stepEl && stepEl.classList.contains('completed')) {
                const stepIndex = parseInt(stepEl.dataset.step, 10);
                State.goToStep(stepIndex);
            }
        });
    }

    // Reset progress button
    if (elements.resetBtn) {
        elements.resetBtn.addEventListener('click', showResetModal);
    }

    // Reset modal buttons
    if (elements.cancelResetBtn) {
        elements.cancelResetBtn.addEventListener('click', hideResetModal);
    }

    if (elements.confirmResetBtn) {
        elements.confirmResetBtn.addEventListener('click', handleConfirmReset);
    }

    // Close reset modal on backdrop click
    if (elements.resetModal) {
        elements.resetModal.addEventListener('click', (e) => {
            if (e.target === elements.resetModal) hideResetModal();
        });
    }

    // Donate button
    if (elements.donateBtn) {
        elements.donateBtn.addEventListener('click', () => {
            DonationPopup.show();
        });
    }
}

/**
 * Show reset confirmation modal
 */
function showResetModal() {
    if (elements.resetModal) {
        elements.resetModal.style.display = 'flex';
    }
}

/**
 * Hide reset confirmation modal
 */
function hideResetModal() {
    if (elements.resetModal) {
        elements.resetModal.style.display = 'none';
    }
}

/**
 * Handle confirm reset
 */
function handleConfirmReset() {
    State.resetState();
    hideResetModal();

    // Reload page to get fresh start
    window.location.reload();
}

/**
 * Handle previous button click
 */
function handlePrevious() {
    State.prevStep();
}

/**
 * Handle next button click
 */
async function handleNext() {
    const state = State.getState();
    const currentStep = state.currentStep;
    const stepConfig = WIZARD_STEPS[currentStep];

    // Validate step before advancing
    const stepModule = await loadStepModule(currentStep);
    if (stepModule && stepModule.validate) {
        const isValid = await stepModule.validate(stepConfig, state);
        if (!isValid) {
            return;
        }
    }

    // Collect step data before advancing
    if (stepModule && stepModule.collectData) {
        const stepData = await stepModule.collectData(stepConfig, state);
        if (stepData) {
            State.setState(stepData);
        }
    }

    State.nextStep();

    // Show donation popup periodically (every 3 steps)
    const newStep = State.getState().currentStep;
    if (newStep > 0 && newStep % 3 === 0) {
        setTimeout(() => {
            DonationPopup.show();
        }, 1000);
    }
}

/**
 * Handle donate button click
 */
async function handleDonateClick() {
    // Get amount from input if exists
    const amountInput = document.getElementById('donation-amount');
    const amount = amountInput ? parseInt(amountInput.value, 10) : 5;

    // Validate amount
    if (!amount || amount < 1) {
        showToast({
            type: 'error',
            icon: '❌',
            title: 'Monto inválido',
            message: 'El monto mínimo de donación es $1 USD'
        });
        return;
    }

    console.log(`💳 Initiating Stripe embedded checkout for $${amount} USD`);

    // Hide donation popup if open
    DonationPopup.hide();

    // Show payment modal
    showPaymentModal(amount);
}

/**
 * Show payment modal with embedded Stripe checkout
 */
async function showPaymentModal(amount) {
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'payment-modal';
    modal.className = 'sync-modal';
    modal.innerHTML = `
        <div class="sync-modal-content payment-modal-content">
            <div class="sync-modal-header">
                <h3>💳 Donar $${amount} USD</h3>
                <button class="modal-close" id="close-payment-modal">×</button>
            </div>
            <div class="sync-modal-body">
                <div id="stripe-checkout-container" class="stripe-checkout-container">
                    <div class="loading-checkout">
                        <div class="loading-spinner"></div>
                        <p>Cargando formulario de pago...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Close button handler
    modal.querySelector('#close-payment-modal').addEventListener('click', () => {
        closePaymentModal();
    });

    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePaymentModal();
        }
    });

    // Create embedded checkout
    try {
        const result = await createEmbeddedCheckout(amount, (paymentResult) => {
            if (paymentResult.success) {
                showThankYouMessage();
            }
        });

        if (result.success && result.checkout) {
            // Clear container before mounting (Stripe requires empty element)
            const container = document.getElementById('stripe-checkout-container');
            if (container) {
                container.innerHTML = '';
            }
            // Mount checkout to container
            result.checkout.mount('#stripe-checkout-container');
        } else {
            // Show error
            const container = document.getElementById('stripe-checkout-container');
            if (container) {
                container.innerHTML = `
                    <div class="checkout-error">
                        <p>❌ No se pudo cargar el formulario de pago.</p>
                        <p>Por favor, inténtalo más tarde.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Embedded checkout error:', error);
        showToast({
            type: 'error',
            icon: '❌',
            title: 'Error',
            message: 'Ocurrió un error al cargar el pago'
        });
        closePaymentModal();
    }
}

/**
 * Close payment modal
 */
function closePaymentModal() {
    destroyCheckout();
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.remove();
    }
}

/**
 * Show thank you message after successful payment
 */
function showThankYouMessage() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        const content = modal.querySelector('.sync-modal-content');
        if (content) {
            content.innerHTML = `
                <div class="thank-you-content">
                    <div class="thank-you-icon">🎉</div>
                    <h2>¡Muchas Gracias!</h2>
                    <p>Tu donación ha sido procesada exitosamente.</p>
                    <p class="thank-you-note">Con tu apoyo, IA-Flow puede seguir creciendo.</p>
                    <button id="close-thank-you" class="btn-primary">✅ Continuar</button>
                </div>
            `;

            modal.querySelector('#close-thank-you').addEventListener('click', () => {
                closePaymentModal();
                showToast({
                    type: 'success',
                    icon: '💚',
                    title: '¡Gracias!',
                    message: 'Tu donación nos ayuda a mejorar IA-Flow'
                });
            });
        }
    }
}

/**
 * Show toast notification
 */
function showToast({ type = 'info', icon = '💡', title, message, duration = 5000 }) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">×</button>
    `;

    container.appendChild(toast);

    // Show animation
    requestAnimationFrame(() => toast.classList.add('show'));

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });

    // Auto-remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Handle sync button click
 */
async function handleGenerateSync() {
    const state = State.getState();
    const currentStep = state.currentStep;
    const stepConfig = WIZARD_STEPS[currentStep];

    // Generate sync block
    const syncBlock = generateSyncBlock(stepConfig, state);

    // Record in state
    State.recordSyncBlock(syncBlock, currentStep);

    // Show sync modal
    showSyncModal(syncBlock, stepConfig);
}

/**
 * Generate sync block for Antigravity
 */
function generateSyncBlock(stepConfig, state) {
    const date = new Date().toISOString().split('T')[0];

    let block = `Actúa como un Especialista en Documentación Técnica y planeación de proyectos de software. Tu misión es procesar los resultados de una sesión de ideación y estructurar la carpeta de planeación del proyecto.

Tus Reglas de Operación:

1. **No Duplicidad**: No crees archivos individuales por cada idea. Tu objetivo es mantener un archivo central de planeación y actualizarlo conforme la información madure.

2. **Análisis de Bloques**: Lee los bloques marcados como [ESTADO_SINC_ANTIGRAVITY] que te proporcionaré.

3. **Gestión de Archivos**:
   - Crea/Actualiza \`01_IDEAS_CONSOLIDADO.md\`: Aquí volcarás todas las ideas analizadas y su prioridad.
   - Crea/Actualiza \`02_MASTER_PLAN.md\`: Este es el archivo vivo. Debe contener el alcance, los objetivos del MVP y las fases de ejecución.
   - Crea cualquier otro archivo que consideres estrictamente necesario para la norma (ej. CONTEXTO.md, RIESGOS.md, ANEXOS.md), pero siempre priorizando la actualización de los existentes sobre la creación de nuevos.

4. **Estructura Interna**: Cada vez que actualices un archivo, mantén una sección de 'Control de Cambios' al inicio con la fecha y la versión del contexto.

**Tu primera tarea:**
> Crea una carpeta nueva independiente que respete la numeración del monorepo y asigna el nombre que creas más conveniente. Analiza el siguiente texto de ideas que te voy a pasar. Identifica cuáles son los pilares del software y genera la estructura base de la carpeta, concentrando la estrategia en el archivo de planeación principal.

[ESTADO_SINC_ANTIGRAVITY]

## INFORMACIÓN DEL PROYECTO
- Fecha: ${date}
- Paso Actual: ${stepConfig.name}
- Nombre del Proyecto: ${state.projectName || 'Por definir'}
- Tipo de Software: ${state.softwareType || 'Por definir'}
- Total de Ideas: ${state.totalFunciones}
- Tipo de Flujo: ${state.flowType || 'Por determinar'}

## IDEAS CENTRALES
${state.ideas.centralIdeas.map((idea, i) => `${i + 1}. ${idea}`).join('\n') || 'Por capturar'}

## CARACTERÍSTICAS/DETALLES
${state.ideas.characteristics.map((char, i) => `- ${char}`).join('\n') || 'Por capturar'}

## INTENCIÓN DEL PROYECTO
${state.ideas.intention || 'Por definir'}

## CONTEXTO TÉCNICO
- Nivel Técnico: ${state.technicalContext.level}
- Rol de Desarrollo: ${state.technicalContext.role}
- Presupuesto: $${state.technicalContext.budget} MXN
- Máquina Virtual: ${state.technicalContext.hasVM ? state.technicalContext.vmName : 'No'}
- Servicios: ${state.technicalContext.services}
${state.technicalContext.additionalNotes ? `
### Notas del Usuario (preferencias orientativas):
${state.technicalContext.additionalNotes}
` : ''}

## IDENTIDAD VISUAL
- Color Primario: ${state.visualIdentity.primaryColor}
- Color Secundario: ${state.visualIdentity.secondaryColor}
- Estilo: ${state.visualIdentity.style}
- Modo Oscuro: ${state.visualIdentity.darkMode ? 'Sí' : 'No'}

---
FIN DEL BLOQUE DE SINCRONIZACIÓN
`;

    return block;
}

/**
 * Show sync modal with copy button
 */
function showSyncModal(syncBlock, stepConfig) {
    // Remove existing modal if any
    const existingModal = document.getElementById('sync-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'sync-modal';
    modal.className = 'sync-modal';
    modal.innerHTML = `
        <div class="sync-modal-content">
            <div class="sync-modal-header">
                <h3>📋 Instrucción para Antigravity</h3>
                <button class="sync-modal-close">&times;</button>
            </div>
            <div class="sync-modal-body">
                <p>Copia el siguiente bloque y pégalo en Antigravity:</p>
                <div class="sync-block-container">
                    <pre class="sync-block-content">${escapeHtml(syncBlock)}</pre>
                </div>
            </div>
            <div class="sync-modal-footer">
                <button id="sync-copy-btn" class="btn-primary">
                    📋 Copiar Instrucción
                </button>
                <button id="sync-confirm-btn" class="btn-secondary" disabled>
                    ✅ Confirmar Ejecución
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('.sync-modal-close').addEventListener('click', () => {
        modal.remove();
    });

    const copyBtn = modal.querySelector('#sync-copy-btn');
    const confirmBtn = modal.querySelector('#sync-confirm-btn');

    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(syncBlock);
            copyBtn.innerHTML = '✅ ¡Copiado!';
            copyBtn.classList.add('copied');
            State.markSyncBlockCopied();
            confirmBtn.disabled = false;
        } catch (error) {
            console.error('Copy failed:', error);
            copyBtn.textContent = '❌ Error al copiar';
        }
    });

    confirmBtn.addEventListener('click', () => {
        State.confirmAntigravityExecution();
        modal.remove();
        updateNavigationButtons();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

/**
 * Escape HTML for display
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Handle state changes
 */
function handleStateChange(newState, oldState) {
    if (newState.currentStep !== oldState.currentStep) {
        renderCurrentStep();
    }

    if (newState.projectName !== oldState.projectName) {
        if (elements.projectName) {
            elements.projectName.textContent = newState.projectName || 'IA-Flow';
        }
    }
}

/**
 * Get step configuration by index
 */
export function getStepConfig(stepIndex) {
    return WIZARD_STEPS[stepIndex];
}

/**
 * Get all steps
 */
export function getAllSteps() {
    return WIZARD_STEPS;
}

// Export for external use
export { WIZARD_STEPS };
