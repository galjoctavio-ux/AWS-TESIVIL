/**
 * IA-Flow - Step 3: Technical Context
 * Switches and sliders for technical configuration
 */

import * as State from '../state.js';

/**
 * Render the technical context step
 */
export function render(config, state) {
    const ctx = state.technicalContext;

    return `
        <div class="step-context">
            <div class="context-sections">
                <!-- Technical Level -->
                <div class="context-section">
                    <h3>📊 Nivel Técnico</h3>
                    <p class="section-description">¿Cuál es tu experiencia con el desarrollo de software?</p>
                    
                    <div class="level-selector">
                        <button class="level-btn ${ctx.level === 'basico' ? 'active' : ''}" data-level="basico">
                            <div class="level-icon">🌱</div>
                            <div class="level-name">Básico</div>
                            <div class="level-desc">Principiante, necesito guía completa</div>
                        </button>
                        <button class="level-btn ${ctx.level === 'intermedio' ? 'active' : ''}" data-level="intermedio">
                            <div class="level-icon">🌿</div>
                            <div class="level-name">Intermedio</div>
                            <div class="level-desc">Conozco lo básico, puedo seguir instrucciones</div>
                        </button>
                        <button class="level-btn ${ctx.level === 'avanzado' ? 'active' : ''}" data-level="avanzado">
                            <div class="level-icon">🌳</div>
                            <div class="level-name">Avanzado</div>
                            <div class="level-desc">Desarrollador experimentado</div>
                        </button>
                    </div>
                </div>
                
                <!-- Development Role -->
                <div class="context-section">
                    <h3>👤 Rol en el Desarrollo</h3>
                    <p class="section-description">¿Cómo prefieres participar en el desarrollo?</p>
                    
                    <div class="role-selector">
                        <label class="role-option ${ctx.role === 'programador' ? 'active' : ''}">
                            <input type="radio" name="role" value="programador" ${ctx.role === 'programador' ? 'checked' : ''}>
                            <div class="role-icon">💻</div>
                            <div class="role-info">
                                <strong>Programador</strong>
                                <span>Escribiré código directamente</span>
                            </div>
                        </label>
                        <label class="role-option ${ctx.role === 'orquestador' ? 'active' : ''}">
                            <input type="radio" name="role" value="orquestador" ${ctx.role === 'orquestador' ? 'checked' : ''}>
                            <div class="role-icon">🎯</div>
                            <div class="role-info">
                                <strong>Orquestador de IA</strong>
                                <span>La IA escribirá el código, yo dirijo</span>
                            </div>
                        </label>
                        <label class="role-option ${ctx.role === 'mixto' ? 'active' : ''}">
                            <input type="radio" name="role" value="mixto" ${ctx.role === 'mixto' ? 'checked' : ''}>
                            <div class="role-icon">🔄</div>
                            <div class="role-info">
                                <strong>Mixto</strong>
                                <span>Combinaré ambos enfoques</span>
                            </div>
                        </label>
                    </div>
                </div>
                
                <!-- Budget -->
                <div class="context-section">
                    <h3>💰 Presupuesto</h3>
                    <p class="section-description">¿Cuánto puedes invertir en servicios externos?</p>
                    
                    <div class="budget-slider-container">
                        <input type="range" 
                               id="budget-slider" 
                               class="budget-slider" 
                               min="0" 
                               max="50000" 
                               step="1000" 
                               value="${ctx.budget}">
                        <div class="budget-display">
                            <span class="budget-label">$</span>
                            <span id="budget-value" class="budget-value">${ctx.budget.toLocaleString()}</span>
                            <span class="budget-currency">MXN</span>
                        </div>
                        <div class="budget-markers">
                            <span>$0 (Gratuito)</span>
                            <span>$25,000</span>
                            <span>$50,000+</span>
                        </div>
                    </div>
                </div>
                
                <!-- Infrastructure -->
                <div class="context-section">
                    <h3>🖥️ Infraestructura</h3>
                    <p class="section-description">¿Qué recursos de infraestructura tienes disponibles?</p>
                    
                    <div class="infra-options">
                        <label class="switch-option">
                            <div class="switch-label">
                                <strong>Máquina Virtual</strong>
                                <span>¿Tienes acceso a un servidor o VM?</span>
                            </div>
                            <div class="switch-control">
                                <input type="checkbox" id="has-vm" ${ctx.hasVM ? 'checked' : ''}>
                                <span class="switch-slider"></span>
                            </div>
                        </label>
                        
                        <div id="vm-name-container" class="vm-name-container" style="${ctx.hasVM ? '' : 'display: none;'}">
                            <input type="text" 
                                   id="vm-name" 
                                   class="text-input" 
                                   placeholder="Ej: AWS EC2, Azure VM, DigitalOcean..."
                                   value="${ctx.vmName || ''}">
                        </div>
                        
                        <div class="services-selector">
                            <strong>Servicios Preferidos:</strong>
                            <div class="services-options">
                                <label class="service-option ${ctx.services === 'gratuitos' ? 'active' : ''}">
                                    <input type="radio" name="services" value="gratuitos" ${ctx.services === 'gratuitos' ? 'checked' : ''}>
                                    <span class="service-icon">🆓</span>
                                    <span>Solo Gratuitos</span>
                                </label>
                                <label class="service-option ${ctx.services === 'pago' ? 'active' : ''}">
                                    <input type="radio" name="services" value="pago" ${ctx.services === 'pago' ? 'checked' : ''}>
                                    <span class="service-icon">💳</span>
                                    <span>De Pago OK</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Additional Context Notes -->
                <div class="context-section">
                    <h3>📝 Notas Adicionales <span style="font-size: 0.8em; color: #888; font-weight: normal;">(Opcional)</span></h3>
                    <p class="section-description">
                        Agrega cualquier dato técnico o preferencia personal de tu contexto. 
                        Por ejemplo: preferir cierta tecnología, servicio web, base de datos, etc.
                        <br><em>💡 Esta información es orientativa. La selección definitiva de tecnologías se hará más adelante en el wizard.</em>
                    </p>
                    
                    <textarea 
                        id="context-notes" 
                        class="context-notes-textarea" 
                        placeholder="Ej: Prefiero usar React, tengo experiencia con MongoDB, quiero usar Supabase para auth, etc..."
                        rows="4">${ctx.additionalNotes || ''}</textarea>
                </div>
                
                <!-- Sync Section -->
                <div class="context-section sync-section">
                    <h3>📋 Sincronización</h3>
                    <p class="section-description">Genera la instrucción para que Antigravity integre tu contexto técnico en el Plan Maestro.</p>
                    
                    <button id="generate-context-sync" class="generate-sync-btn">
                        📋 Sincronizar Contexto con Antigravity
                    </button>
                </div>
            </div>
            
            <!-- Sync Modal -->
            <div id="context-sync-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3>📋 Sincronización: Contexto Técnico</h3>
                        <button id="close-context-sync-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <p style="background: #f0f9ff; padding: 10px; border-left: 4px solid #007bff; margin-bottom: 15px; color: #0056b3;">
                            <strong>ℹ️ Instrucción:</strong> Abre un nuevo agente en Antigravity y copia esto.
                        </p>
                        <p>Copia este bloque en Antigravity para integrar tu contexto técnico al Plan Maestro:</p>
                        <pre id="context-sync-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-context-sync" class="btn-primary">📋 Copiar para Antigravity</button>
                        <button id="confirm-context-sync" class="btn-secondary" disabled>✅ Confirmar Copiado</button>
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
    setupLevelSelector();
    setupRoleSelector();
    setupBudgetSlider();
    setupInfraControls();
    setupAdditionalNotes();
    setupSyncListeners();
}

/**
 * Setup level selector
 */
function setupLevelSelector() {
    const buttons = document.querySelectorAll('.level-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            State.setNestedValue('technicalContext.level', btn.dataset.level);
        });
    });
}

/**
 * Setup role selector
 */
function setupRoleSelector() {
    const options = document.querySelectorAll('.role-option input');

    options.forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('.role-option').forEach(opt => {
                opt.classList.toggle('active', opt.querySelector('input').checked);
            });

            State.setNestedValue('technicalContext.role', input.value);
        });
    });
}

/**
 * Setup budget slider
 */
function setupBudgetSlider() {
    const slider = document.getElementById('budget-slider');
    const valueDisplay = document.getElementById('budget-value');

    if (slider && valueDisplay) {
        slider.addEventListener('input', () => {
            const value = parseInt(slider.value, 10);
            valueDisplay.textContent = value.toLocaleString();
            State.setNestedValue('technicalContext.budget', value);
        });
    }
}

/**
 * Setup infrastructure controls
 */
function setupInfraControls() {
    // VM toggle
    const vmCheckbox = document.getElementById('has-vm');
    const vmNameContainer = document.getElementById('vm-name-container');
    const vmNameInput = document.getElementById('vm-name');

    if (vmCheckbox && vmNameContainer) {
        vmCheckbox.addEventListener('change', () => {
            vmNameContainer.style.display = vmCheckbox.checked ? 'block' : 'none';
            State.setNestedValue('technicalContext.hasVM', vmCheckbox.checked);
        });
    }

    if (vmNameInput) {
        vmNameInput.addEventListener('input', () => {
            State.setNestedValue('technicalContext.vmName', vmNameInput.value);
        });
    }

    // Services selector
    const servicesOptions = document.querySelectorAll('.service-option input');

    servicesOptions.forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('.service-option').forEach(opt => {
                opt.classList.toggle('active', opt.querySelector('input').checked);
            });

            State.setNestedValue('technicalContext.services', input.value);
        });
    });
}

/**
 * Setup additional notes textarea
 */
function setupAdditionalNotes() {
    const notesTextarea = document.getElementById('context-notes');

    if (notesTextarea) {
        notesTextarea.addEventListener('input', () => {
            State.setNestedValue('technicalContext.additionalNotes', notesTextarea.value);
        });
    }
}

/**
 * Validate step
 */
export function validate(config, state) {
    // Check if Step 3 sync was confirmed
    if (!state.step3SyncCompleted) {
        alert('Por favor, sincroniza el contexto técnico con Antigravity antes de continuar.');
        return false;
    }
    return true;
}

/**
 * Collect step data
 */
export function collectData(config, state) {
    // Data is collected in real-time
    return null;
}

/**
 * Setup sync modal listeners
 */
function setupSyncListeners() {
    const generateBtn = document.getElementById('generate-context-sync');
    const modal = document.getElementById('context-sync-modal');
    const closeBtn = document.getElementById('close-context-sync-modal');
    const copyBtn = document.getElementById('copy-context-sync');
    const confirmBtn = document.getElementById('confirm-context-sync');
    const contentPre = document.getElementById('context-sync-content');

    generateBtn?.addEventListener('click', () => {
        const syncBlock = generateContextSyncBlock();
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
        State.setState({ step3SyncCompleted: true });
        if (modal) modal.style.display = 'none';
    });
}

/**
 * Generate sync block specific for Technical Context
 */
function generateContextSyncBlock() {
    const state = State.getState();
    const ctx = state.technicalContext;
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_del_proyecto}';

    // Map level to readable text
    const levelMap = {
        'basico': 'Básico - Principiante, necesita guía completa',
        'intermedio': 'Intermedio - Conoce lo básico, puede seguir instrucciones',
        'avanzado': 'Avanzado - Desarrollador experimentado'
    };

    // Map role to readable text
    const roleMap = {
        'programador': 'Programador - Escribirá código directamente',
        'orquestador': 'Orquestador de IA - La IA escribe el código, el usuario dirige',
        'mixto': 'Mixto - Combinará ambos enfoques'
    };

    return `Actúa como un Integrador de Contexto Técnico dentro de un Plan Maestro de desarrollo de software ubicado en la carpeta ${projectName}.

## Contexto:
Existe un documento llamado 'Plan Maestro' (02_MASTER_PLAN.md) que define la planeación general del MVP.
Recibirás respuestas del usuario sobre su contexto técnico personal y recursos disponibles.

## Objetivo:
INCORPORAR el contexto técnico del usuario dentro del Plan Maestro mediante anotaciones claras, estructuradas y reutilizables.

## Reglas Estrictas:
1. NO elimines ni modifiques contenido existente del Plan Maestro
2. NO interpretes ni evalúes la calidad de las respuestas del usuario
3. NO tomes decisiones técnicas ni estratégicas
4. NO conviertas las anotaciones en requerimientos
5. Limítate a documentar el contexto tal como se proporciona
6. Usa lenguaje técnico, neutral y descriptivo
7. Mantén el enfoque en un MVP

## Estructura Obligatoria:
Crea sección 'Contexto Técnico del Usuario' con subsecciones:

a) **Nivel técnico del usuario:** ${levelMap[ctx.level] || ctx.level}
b) **Rol en el desarrollo:** ${roleMap[ctx.role] || ctx.role}

### Recursos técnicos:
- **Presupuesto:** $${ctx.budget.toLocaleString()} MXN
- **Máquina virtual:** ${ctx.hasVM ? ctx.vmName || 'Sí (sin especificar)' : 'No disponible'}
- **Servicios preferidos:** ${ctx.services === 'gratuitos' ? 'Solo gratuitos' : 'De pago OK'}
${ctx.additionalNotes ? `
### Notas adicionales del usuario:
El usuario prefiere ${ctx.additionalNotes}
` : ''}
## Formato de Anotaciones:
- Usa listas claras
- Indica que es CONTEXTO, no decisiones
- Evita lenguaje prescriptivo ('debe', 'se hará')
- IMPORTANTE: Agrega anotaciones dispersas en TODO el Plan Maestro donde sean relevantes para decisiones futuras de tecnología, recursos e infraestructura

## Salida Esperada:
El Plan Maestro actualizado con:
- Sección 'Contexto Técnico del Usuario' integrada
- Anotaciones dispersas en secciones relevantes
- Sin alterar contenido de otras secciones`;
}
