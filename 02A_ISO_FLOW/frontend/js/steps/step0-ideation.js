/**
 * IA-Flow - Step 0: Interactive Ideation
 * JSON-based responses with toggleable ideas and characteristics
 */

import * as State from '../state.js';

// API configuration
const API_URL = 'http://localhost:3000/api';

// Collected ideas and characteristics with toggle state
let collectedIdeas = [];
let collectedCharacteristics = [];

// Chat elements
let elements = {};

/**
 * Render the ideation step
 */
export function render(config, state) {
    // Load previously collected ideas from state
    collectedIdeas = state.ideas.centralIdeas || [];
    collectedCharacteristics = state.ideas.characteristics || [];

    const step0State = state.step0 || {};
    const isFirstIteration = step0State.isFirstIteration !== false;
    const iterationCount = step0State.iterationCount || 0;
    const chatLocked = step0State.chatLocked || false;
    const projectName = step0State.antigravityProjectName || '';

    return `
        <div class="step-ideation-interactive">
            <!-- Iteration Indicator -->
            ${!isFirstIteration ? `
                <div class="iteration-indicator">
                    <span class="iteration-badge">Iteración #${iterationCount}</span>
                    <span class="project-badge">📁 ${projectName}</span>
                </div>
            ` : ''}
            
            <div class="ideation-layout">
                <!-- Left: Chat Area -->
                <div class="ideation-chat-panel">
                    <div class="panel-header">
                        <h3>💬 Conversación</h3>
                        <span class="panel-hint">${chatLocked ? '🔒 Esperando sincronización' : 'Describe tus ideas libremente'}</span>
                    </div>
                    
                    <div id="ideation-chat-messages" class="chat-messages-container">
                        ${renderWelcomeMessage(isFirstIteration, projectName)}
                    </div>
                    
                    <div class="chat-input-area ${chatLocked ? 'locked' : ''}">
                        ${chatLocked ? `
                            <div class="chat-locked-overlay">
                                <span>🔒</span>
                                <p>Genera y confirma el bloque de sincronización para continuar</p>
                            </div>
                        ` : ''}
                        <div class="chat-input-wrapper">
                            <textarea 
                                id="ideation-input" 
                                class="chat-input" 
                                placeholder="${chatLocked ? 'Chat bloqueado...' : 'Describe tu proyecto, funcionalidades, características...'}"
                                rows="3"
                                ${chatLocked ? 'disabled' : ''}
                            ></textarea>
                            <button id="ideation-send" class="send-button" ${chatLocked ? 'disabled' : ''}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                        <div class="input-hints">
                            <span id="char-count">0/2000</span>
                            <span>💡 Cuantas más ideas compartas, mejor</span>
                        </div>
                    </div>
                </div>
                
                <!-- Right: Ideas Collector -->
                <div class="ideation-collector-panel">
                    <div class="panel-header">
                        <h3>📋 Ideas Detectadas</h3>
                        <div class="collector-actions">
                            <button id="select-all" class="action-btn" title="Seleccionar todas">✓ Todas</button>
                            <button id="deselect-all" class="action-btn" title="Deseleccionar todas">✗ Ninguna</button>
                        </div>
                    </div>
                    
                    <div class="collector-content">
                        <!-- Ideas Section -->
                        <div class="collector-section" data-section="ideas">
                            <div class="section-header">
                                <span class="section-icon">💡</span>
                                <span class="section-title">Ideas Centrales</span>
                                <button class="info-btn" data-info="ideas" title="¿Qué son las Ideas Centrales?">ⓘ</button>
                                <span id="ideas-count" class="section-count">${collectedIdeas.length}</span>
                            </div>
                            <div id="ideas-list" class="items-list drop-zone" data-drop-type="idea">
                                ${renderIdeasList()}
                            </div>
                        </div>
                        
                        <!-- Characteristics Section -->
                        <div class="collector-section" data-section="chars">
                            <div class="section-header">
                                <span class="section-icon">✨</span>
                                <span class="section-title">Características</span>
                                <button class="info-btn" data-info="chars" title="¿Qué son las Características?">ⓘ</button>
                                <span id="chars-count" class="section-count">${collectedCharacteristics.length}</span>
                            </div>
                            <div id="chars-list" class="items-list drop-zone" data-drop-type="char">
                                ${renderCharacteristicsList()}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Project Name Section (only on first iteration) -->
                    ${isFirstIteration ? `
                    <div class="project-name-section">
                        <div class="project-name-header">
                            <span class="section-icon">📁</span>
                            <span class="section-title">Nombre del Proyecto</span>
                            <button class="info-btn" data-info="project-name" title="¿Por qué necesito un nombre?">ⓘ</button>
                        </div>
                        <div class="project-name-options">
                            <label class="name-option">
                                <input type="radio" name="name-choice" value="custom" checked>
                                <span class="option-label">Yo defino el nombre</span>
                            </label>
                            <label class="name-option">
                                <input type="radio" name="name-choice" value="ai">
                                <span class="option-label">La IA sugiere un nombre</span>
                            </label>
                        </div>
                        <div id="custom-name-input" class="custom-name-input-wrapper">
                            <input type="text" id="project-name-field" class="project-name-field" 
                                   placeholder="Ej: 02_MI_PROYECTO_WEB, 03_TIENDA_ONLINE..." maxlength="50">
                            <span class="name-hint">Usa el formato que asignó Antigravity (número + guión bajo + nombre)</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    <!-- Summary Footer -->
                    <div class="collector-footer">
                        <div class="selection-summary">
                            <span id="selected-ideas-count">0</span> ideas y 
                            <span id="selected-chars-count">0</span> características seleccionadas
                        </div>
                        <button id="generate-sync-block" class="generate-sync-btn" disabled>
                            📋 Sincronizar con Antigravity
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Sync Block Modal -->
            <div id="sync-block-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3>📋 Bloque de Sincronización para Antigravity</h3>
                        <button id="close-sync-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <p>Este bloque contiene solo las ideas y características que seleccionaste:</p>
                        <pre id="sync-block-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-sync-block" class="btn-primary">📋 Copiar para Antigravity</button>
                        <button id="confirm-sync" class="btn-secondary" disabled>✅ Confirmar Copiado</button>
                    </div>
                </div>
            </div>
            
            <!-- Project Name Modal (first iteration only) -->
            <div id="project-name-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content project-name-modal">
                    <div class="sync-modal-header">
                        <h3>📁 Nombre del Proyecto Antigravity</h3>
                    </div>
                    <div class="sync-modal-body">
                        <p>¿Qué nombre le asigno a tu carpeta de proyecto en Antigravity?</p>
                        <div class="project-name-input-wrapper">
                            <input 
                                type="text" 
                                id="project-name-input" 
                                class="project-name-input" 
                                placeholder="Ej: 02_MI_PROYECTO_WEB"
                                maxlength="50"
                            >
                            <div class="input-suggestion">Se usará esta carpeta: <span class="folder-name">${'{nombre}'}</span>/</div>
                        </div>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="confirm-project-name" class="btn-primary" disabled>✓ Continuar</button>
                    </div>
                </div>
            </div>
            
            <!-- Info Modal -->
            <div id="info-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content info-modal-content">
                    <div class="sync-modal-header">
                        <h3 id="info-modal-title">ℹ️ Información</h3>
                        <button id="close-info-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <div id="info-modal-body"></div>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="close-info-modal-btn" class="btn-primary">Entendido</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render welcome message based on iteration
 */
function renderWelcomeMessage(isFirstIteration = true, projectName = '') {
    if (isFirstIteration) {
        return `
            <div class="chat-message system">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p><strong>¡Hola! Listo para capturar tus ideas.</strong></p>
                    <p class="message-hint">💡 ¿Qué software te gustaría crear?</p>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="chat-message system">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <p><strong>🔄 ${projectName}</strong> — Ya tienes <strong>${collectedIdeas.length} ideas</strong> y <strong>${collectedCharacteristics.length} características</strong>.</p>
                    <p class="message-hint">¿Deseas agregar más?</p>
                </div>
            </div>
        `;
    }
}

/**
 * Render ideas list with toggles (draggable)
 */
function renderIdeasList() {
    if (collectedIdeas.length === 0) {
        return '<div class="empty-list drop-placeholder">Espera a que la IA detecte ideas...</div>';
    }

    return collectedIdeas.map(idea => `
        <div class="collector-item ${idea.selected ? 'selected' : ''}" 
             data-id="${idea.id}" 
             data-type="idea"
             draggable="true">
            <div class="drag-handle" title="Arrastra para mover">⋮⋮</div>
            <div class="item-content">
                <div class="item-title">${idea.title}</div>
                <div class="item-description">${idea.description || ''}</div>
                <div class="item-meta">
                    <span class="item-type">${idea.type || 'funcionalidad'}</span>
                    <span class="item-priority priority-${idea.priority || 'media'}">${idea.priority || 'media'}</span>
                </div>
            </div>
            <label class="toggle-switch">
                <input type="checkbox" ${idea.selected ? 'checked' : ''} data-id="${idea.id}" data-type="idea">
                <span class="toggle-slider"></span>
            </label>
        </div>
    `).join('');
}

/**
 * Render characteristics list with toggles (draggable)
 */
function renderCharacteristicsList() {
    if (collectedCharacteristics.length === 0) {
        return '<div class="empty-list drop-placeholder">Arrastra elementos aquí o espera a que la IA detecte características...</div>';
    }

    return collectedCharacteristics.map(char => `
        <div class="collector-item ${char.selected ? 'selected' : ''}" 
             data-id="${char.id}" 
             data-type="char"
             draggable="true">
            <div class="drag-handle" title="Arrastra para mover">⋮⋮</div>
            <div class="item-content">
                <div class="item-title">${char.title}</div>
                <div class="item-description">${char.description || ''}</div>
                ${char.relatedTo ? `<div class="item-related">→ ${char.relatedTo}</div>` : ''}
            </div>
            <label class="toggle-switch">
                <input type="checkbox" ${char.selected ? 'checked' : ''} data-id="${char.id}" data-type="char">
                <span class="toggle-slider"></span>
            </label>
        </div>
    `).join('');
}

/**
 * Initialize the step
 */
export async function init(config, state) {
    cacheElements();
    setupEventListeners();
    setupDragAndDrop();
    updateSelectionCounts();
}

/**
 * Cache DOM elements
 */
function cacheElements() {
    elements = {
        messagesContainer: document.getElementById('ideation-chat-messages'),
        input: document.getElementById('ideation-input'),
        sendButton: document.getElementById('ideation-send'),
        charCount: document.getElementById('char-count'),
        ideasList: document.getElementById('ideas-list'),
        charsList: document.getElementById('chars-list'),
        ideasCount: document.getElementById('ideas-count'),
        charsCount: document.getElementById('chars-count'),
        selectedIdeasCount: document.getElementById('selected-ideas-count'),
        selectedCharsCount: document.getElementById('selected-chars-count'),
        generateSyncBtn: document.getElementById('generate-sync-block'),
        syncModal: document.getElementById('sync-block-modal'),
        syncBlockContent: document.getElementById('sync-block-content'),
        copySyncBtn: document.getElementById('copy-sync-block'),
        confirmSyncBtn: document.getElementById('confirm-sync'),
        closeSyncModal: document.getElementById('close-sync-modal'),
        selectAllBtn: document.getElementById('select-all'),
        deselectAllBtn: document.getElementById('deselect-all'),
        // Project name modal elements
        projectNameModal: document.getElementById('project-name-modal'),
        projectNameInput: document.getElementById('project-name-input'),
        confirmProjectNameBtn: document.getElementById('confirm-project-name'),
        chatInputArea: document.querySelector('.chat-input-area'),
        // Info modal elements
        infoModal: document.getElementById('info-modal'),
        infoModalTitle: document.getElementById('info-modal-title'),
        infoModalBody: document.getElementById('info-modal-body'),
        closeInfoModalBtn: document.getElementById('close-info-modal'),
        closeInfoModalFooterBtn: document.getElementById('close-info-modal-btn'),
        infoBtns: document.querySelectorAll('.info-btn'),
        // Project name section elements
        customNameInputWrapper: document.getElementById('custom-name-input'),
        projectNameField: document.getElementById('project-name-field'),
        nameChoiceRadios: document.querySelectorAll('input[name="name-choice"]')
    };
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Send button
    elements.sendButton?.addEventListener('click', handleSend);

    // Enter to send
    elements.input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    // Character count with dynamic feedback
    elements.input?.addEventListener('input', () => {
        const length = elements.input.value.length;
        elements.charCount.textContent = `${length}/2000`;

        // Dynamic color feedback
        elements.charCount.classList.remove('active', 'warning', 'limit');
        if (length > 0 && length < 1500) {
            elements.charCount.classList.add('active');
        } else if (length >= 1500 && length < 1900) {
            elements.charCount.classList.add('warning');
        } else if (length >= 1900) {
            elements.charCount.classList.add('limit');
        }
    });

    // Toggle listeners (delegated)
    elements.ideasList?.addEventListener('change', handleToggleChange);
    elements.charsList?.addEventListener('change', handleToggleChange);

    // Select/Deselect all
    elements.selectAllBtn?.addEventListener('click', () => toggleAll(true));
    elements.deselectAllBtn?.addEventListener('click', () => toggleAll(false));

    // Generate sync block
    elements.generateSyncBtn?.addEventListener('click', showSyncModal);

    // Modal controls
    elements.closeSyncModal?.addEventListener('click', hideSyncModal);
    elements.copySyncBtn?.addEventListener('click', copySyncBlock);
    elements.confirmSyncBtn?.addEventListener('click', confirmSync);

    // Close modal on backdrop click
    elements.syncModal?.addEventListener('click', (e) => {
        if (e.target === elements.syncModal) hideSyncModal();
    });

    // Project name modal
    elements.projectNameInput?.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        if (elements.confirmProjectNameBtn) {
            elements.confirmProjectNameBtn.disabled = value.length < 2;
        }
        // Update suggestion preview
        const suggestionEl = document.querySelector('.input-suggestion');
        if (suggestionEl && value) {
            suggestionEl.textContent = `Se usará esta carpeta: ${value.toUpperCase().replace(/\s+/g, '_')}/`;
        }
    });

    elements.confirmProjectNameBtn?.addEventListener('click', handleProjectNameConfirm);

    // Info modal buttons
    elements.infoBtns?.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const infoType = e.target.dataset.info;
            showInfoModal(infoType);
        });
    });

    // Close info modal
    elements.closeInfoModalBtn?.addEventListener('click', hideInfoModal);
    elements.closeInfoModalFooterBtn?.addEventListener('click', hideInfoModal);
    elements.infoModal?.addEventListener('click', (e) => {
        if (e.target === elements.infoModal) hideInfoModal();
    });

    // Project name radio buttons
    elements.nameChoiceRadios?.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const isCustom = e.target.value === 'custom';
            if (elements.customNameInputWrapper) {
                elements.customNameInputWrapper.style.display = isCustom ? 'block' : 'none';
            }
        });
    });
}

/**
 * Setup drag and drop functionality
 */
function setupDragAndDrop() {
    // Setup for both drop zones
    const dropZones = document.querySelectorAll('.drop-zone');

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    // Setup draggable items
    setupDraggableItems();
}

/**
 * Setup draggable items
 */
function setupDraggableItems() {
    const items = document.querySelectorAll('.collector-item[draggable="true"]');

    items.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });
}

// Currently dragged item
let draggedItem = null;
let draggedItemData = null;

/**
 * Handle drag start
 */
function handleDragStart(e) {
    draggedItem = e.target.closest('.collector-item');
    if (!draggedItem) return;

    const id = draggedItem.dataset.id;
    const type = draggedItem.dataset.type;

    console.log('[DragStart] id:', id, 'type:', type);

    // Store item data - make a COPY to avoid reference issues
    if (type === 'idea') {
        const found = collectedIdeas.find(i => i.id === id);
        draggedItemData = found ? { type: 'idea', item: { ...found }, originalId: id } : null;
    } else {
        const found = collectedCharacteristics.find(c => c.id === id);
        draggedItemData = found ? { type: 'char', item: { ...found }, originalId: id } : null;
    }

    console.log('[DragStart] draggedItemData:', draggedItemData);

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, type }));

    // Visual feedback
    setTimeout(() => {
        draggedItem.classList.add('dragging');
    }, 0);
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
    }

    // Remove all drop zone highlights
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('drag-over');
    });

    draggedItem = null;
    draggedItemData = null;
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

/**
 * Handle drag enter
 */
function handleDragEnter(e) {
    e.preventDefault();
    const zone = e.target.closest('.drop-zone');
    if (zone) {
        zone.classList.add('drag-over');
    }
}

/**
 * Handle drag leave
 */
function handleDragLeave(e) {
    const zone = e.target.closest('.drop-zone');
    if (zone && !zone.contains(e.relatedTarget)) {
        zone.classList.remove('drag-over');
    }
}

/**
 * Handle drop
 */
function handleDrop(e) {
    e.preventDefault();

    const zone = e.target.closest('.drop-zone');

    console.log('[Drop] zone:', zone?.dataset.dropType);
    console.log('[Drop] draggedItemData:', draggedItemData);

    if (!zone || !draggedItemData) {
        console.warn('[Drop] Missing zone or draggedItemData');
        return;
    }

    zone.classList.remove('drag-over');

    const targetType = zone.dataset.dropType; // 'idea' or 'char'
    const sourceType = draggedItemData.type;

    console.log('[Drop] sourceType:', sourceType, '-> targetType:', targetType);

    // Only process if moving to different section
    if (targetType === sourceType) {
        console.log('[Drop] Same section, ignoring');
        return;
    }

    const item = draggedItemData.item;
    if (!item) {
        console.warn('[Drop] No item in draggedItemData');
        return;
    }

    console.log('[Drop] Moving item:', item.title);

    // Convert and move the item
    if (sourceType === 'idea' && targetType === 'char') {
        moveIdeaToCharacteristic(item);
    } else if (sourceType === 'char' && targetType === 'idea') {
        moveCharacteristicToIdea(item);
    }
}

/**
 * Move an idea to characteristics
 */
function moveIdeaToCharacteristic(idea) {
    // Remove from ideas
    const index = collectedIdeas.findIndex(i => i.id === idea.id);
    if (index > -1) {
        collectedIdeas.splice(index, 1);
    }

    // Add to characteristics with converted properties
    const newChar = {
        id: 'char_' + Date.now(),
        title: idea.title,
        description: idea.description,
        relatedTo: 'general',
        priority: idea.priority || 'media',
        selected: idea.selected
    };

    collectedCharacteristics.push(newChar);

    // Update UI
    renderCollectorLists();
    setupDraggableItems();
    updateSelectionCounts();
    saveToState();

    // Show toast feedback
    showMoveFeedback('Idea movida a Características');
}

/**
 * Move a characteristic to ideas
 */
function moveCharacteristicToIdea(char) {
    // Remove from characteristics
    const index = collectedCharacteristics.findIndex(c => c.id === char.id);
    if (index > -1) {
        collectedCharacteristics.splice(index, 1);
    }

    // Add to ideas with converted properties
    const newIdea = {
        id: 'idea_' + Date.now(),
        title: char.title,
        description: char.description,
        type: 'funcionalidad',
        priority: char.priority || 'media',
        selected: char.selected
    };

    collectedIdeas.push(newIdea);

    // Update UI
    renderCollectorLists();
    setupDraggableItems();
    updateSelectionCounts();
    saveToState();

    // Show toast feedback
    showMoveFeedback('Característica movida a Ideas');
}

/**
 * Show move feedback toast
 */
function showMoveFeedback(message) {
    const toast = document.createElement('div');
    toast.className = 'move-toast';
    toast.textContent = '✓ ' + message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

/**
 * Info content for modals
 */
const INFO_CONTENT = {
    ideas: {
        title: '💡 ¿Qué son las Ideas Centrales?',
        content: `
            <p><strong>Las Ideas Centrales son las funcionalidades principales de tu software.</strong></p>
            <p>Son los módulos, pantallas o capacidades core que definirán qué hace tu aplicación.</p>
            
            <div class="info-examples">
                <h4>Ejemplos de Ideas Centrales:</h4>
                <ul>
                    <li>🔐 Sistema de login y registro de usuarios</li>
                    <li>📊 Dashboard con estadísticas en tiempo real</li>
                    <li>🛒 Carrito de compras con pagos en línea</li>
                    <li>📅 Calendario de citas con notificaciones</li>
                    <li>💬 Chat en vivo con soporte al cliente</li>
                </ul>
            </div>
            
            <p class="info-tip">💡 <strong>Tip:</strong> Piensa en "¿Qué podrá HACER el usuario con mi software?"</p>
        `
    },
    chars: {
        title: '✨ ¿Qué son las Características?',
        content: `
            <p><strong>Las Características son detalles específicos, aspectos visuales o requisitos técnicos.</strong></p>
            <p>Son propiedades que complementan las ideas centrales pero no son funcionalidades en sí.</p>
            
            <div class="info-examples">
                <h4>Ejemplos de Características:</h4>
                <ul>
                    <li>🎨 Tema oscuro y claro</li>
                    <li>📱 Diseño responsive para móviles</li>
                    <li>🌐 Soporte multi-idioma (español/inglés)</li>
                    <li>⚡ Tiempo de carga menor a 3 segundos</li>
                    <li>🔒 Encriptación de datos sensibles</li>
                </ul>
            </div>
            
            <p class="info-tip">💡 <strong>Tip:</strong> Piensa en "¿CÓMO quiero que se vea o se comporte mi software?"</p>
        `
    },
    'project-name': {
        title: '📁 ¿Por qué necesito un nombre?',
        content: `
            <p><strong>El nombre del proyecto será el nombre de la carpeta donde Antigravity guardará todos tus archivos.</strong></p>
            <p>Tienes dos opciones:</p>
            
            <div class="info-examples">
                <h4>Opciones disponibles:</h4>
                <ul>
                    <li><strong>Yo defino el nombre:</strong> Escribe el nombre que quieras. Usa CamelCase (MiProyecto) o guiones (mi-proyecto).</li>
                    <li><strong>La IA sugiere:</strong> Antigravity analizará tus ideas y sugerirá un nombre apropiado.</li>
                </ul>
            </div>
            
            <p class="info-tip">💡 <strong>Tip:</strong> Un buen nombre es corto, descriptivo y fácil de recordar.</p>
        `
    }
};

/**
 * Show info modal
 */
function showInfoModal(infoType) {
    const info = INFO_CONTENT[infoType];
    if (!info || !elements.infoModal) return;

    if (elements.infoModalTitle) {
        elements.infoModalTitle.textContent = info.title;
    }
    if (elements.infoModalBody) {
        elements.infoModalBody.innerHTML = info.content;
    }

    elements.infoModal.style.display = 'flex';
}

/**
 * Hide info modal
 */
function hideInfoModal() {
    if (elements.infoModal) {
        elements.infoModal.style.display = 'none';
    }
}

/**
 * Handle toggle change
 */
function handleToggleChange(e) {
    const checkbox = e.target;
    if (checkbox.type !== 'checkbox') return;

    const id = checkbox.dataset.id;
    const type = checkbox.dataset.type;
    const checked = checkbox.checked;

    // Update item state
    if (type === 'idea') {
        const idea = collectedIdeas.find(i => i.id === id);
        if (idea) idea.selected = checked;
    } else {
        const char = collectedCharacteristics.find(c => c.id === id);
        if (char) char.selected = checked;
    }

    // Update item visual state
    const itemEl = checkbox.closest('.collector-item');
    if (itemEl) {
        itemEl.classList.toggle('selected', checked);
    }

    updateSelectionCounts();
    saveToState();
}

/**
 * Toggle all items
 */
function toggleAll(selected) {
    collectedIdeas.forEach(i => i.selected = selected);
    collectedCharacteristics.forEach(c => c.selected = selected);

    // Update checkboxes
    document.querySelectorAll('.collector-item input[type="checkbox"]').forEach(cb => {
        cb.checked = selected;
        cb.closest('.collector-item')?.classList.toggle('selected', selected);
    });

    updateSelectionCounts();
    saveToState();
}

/**
 * Update selection counts
 */
function updateSelectionCounts() {
    const selectedIdeas = collectedIdeas.filter(i => i.selected).length;
    const selectedChars = collectedCharacteristics.filter(c => c.selected).length;

    if (elements.selectedIdeasCount) {
        elements.selectedIdeasCount.textContent = selectedIdeas;
    }
    if (elements.selectedCharsCount) {
        elements.selectedCharsCount.textContent = selectedChars;
    }

    // Enable/disable generate button
    if (elements.generateSyncBtn) {
        elements.generateSyncBtn.disabled = (selectedIdeas + selectedChars) === 0;
    }
}

/**
 * Handle send message
 */
async function handleSend() {
    const message = elements.input.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessageToUI(message, 'user');

    // Clear input
    elements.input.value = '';
    elements.charCount.textContent = '0/2000';

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await sendToAI(message);
        hideTypingIndicator();

        if (response.success && response.data) {
            // Add AI message
            if (response.data.message) {
                addMessageToUI(response.data.message, 'system');
            }

            // Process extracted ideas and characteristics
            processAIResponse(response.data);

            // Show suggested questions if any
            if (response.data.suggestedQuestions?.length > 0) {
                showSuggestedQuestions(response.data.suggestedQuestions);
            }
        } else {
            addMessageToUI('❌ ' + (response.error || 'Error al procesar'), 'system');
        }
    } catch (error) {
        hideTypingIndicator();
        console.error('Send error:', error);
        addMessageToUI('❌ Error de conexión. Intenta de nuevo.', 'system');
    }
}

/**
 * Send message to AI
 */
async function sendToAI(message) {
    try {
        const response = await fetch(`${API_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': getSessionId()
            },
            body: JSON.stringify({
                message,
                expectJsonResponse: true,
                flowState: {
                    currentNode: 'node_0_classifier',
                    context: { ideas: collectedIdeas, characteristics: collectedCharacteristics }
                }
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Try to parse JSON from response
            let parsedData = null;
            try {
                // Check if response is already parsed or needs extraction
                if (typeof data.response === 'object') {
                    parsedData = data.response;
                } else {
                    // Try to extract JSON from markdown code block
                    const jsonMatch = data.response.match(/```json\s*([\s\S]*?)\s*```/);
                    if (jsonMatch) {
                        parsedData = JSON.parse(jsonMatch[1]);
                    } else {
                        // Try direct parse
                        parsedData = JSON.parse(data.response);
                    }
                }
            } catch (e) {
                console.warn('Failed to parse JSON response, using as text:', e);
                return {
                    success: true,
                    data: { message: data.response }
                };
            }

            return { success: true, data: parsedData };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Process AI response data
 */
function processAIResponse(data) {
    let hasNewItems = false;

    // Add new ideas
    if (data.ideas?.length > 0) {
        data.ideas.forEach(idea => {
            // Check if idea already exists
            const exists = collectedIdeas.some(i => i.id === idea.id || i.title === idea.title);
            if (!exists) {
                collectedIdeas.push({
                    ...idea,
                    selected: true // Auto-select new ideas
                });
                hasNewItems = true;
            }
        });
    }

    // Add new characteristics
    if (data.characteristics?.length > 0) {
        data.characteristics.forEach(char => {
            const exists = collectedCharacteristics.some(c => c.id === char.id || c.title === char.title);
            if (!exists) {
                collectedCharacteristics.push({
                    ...char,
                    selected: true // Auto-select new characteristics
                });
                hasNewItems = true;
            }
        });
    }

    // Update intention
    if (data.intention) {
        State.setNestedValue('ideas.intention', data.intention);
    }

    // Update UI
    if (hasNewItems) {
        renderCollectorLists();
        setupDraggableItems(); // IMPORTANT: Register drag events on new items
        updateSelectionCounts();
        saveToState();

        // Highlight new items
        highlightNewItems();

        // Lock chat until user completes sync
        lockChat();
    }
}

/**
 * Render collector lists
 */
function renderCollectorLists() {
    if (elements.ideasList) {
        elements.ideasList.innerHTML = renderIdeasList();
    }
    if (elements.charsList) {
        elements.charsList.innerHTML = renderCharacteristicsList();
    }
    if (elements.ideasCount) {
        elements.ideasCount.textContent = collectedIdeas.length;
    }
    if (elements.charsCount) {
        elements.charsCount.textContent = collectedCharacteristics.length;
    }

    // Re-attach toggle listeners
    elements.ideasList?.addEventListener('change', handleToggleChange);
    elements.charsList?.addEventListener('change', handleToggleChange);
}

/**
 * Highlight new items briefly
 */
function highlightNewItems() {
    document.querySelectorAll('.collector-item').forEach(item => {
        item.classList.add('new-item');
        setTimeout(() => item.classList.remove('new-item'), 1500);
    });
}

/**
 * Show suggested questions
 */
function showSuggestedQuestions(questions) {
    if (!elements.messagesContainer || questions.length === 0) return;

    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'suggested-questions';
    suggestionsDiv.innerHTML = `
        <div class="suggestions-label">💡 Preguntas sugeridas:</div>
        <div class="suggestions-list">
            ${questions.map(q => `<button class="suggestion-btn">${q}</button>`).join('')}
        </div>
    `;

    elements.messagesContainer.appendChild(suggestionsDiv);
    scrollToBottom();

    // Add click handlers
    suggestionsDiv.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.input.value = btn.textContent;
            suggestionsDiv.remove();
            handleSend();
        });
    });
}

/**
 * Show sync modal
 */
function showSyncModal() {
    const selectedIdeas = collectedIdeas.filter(i => i.selected);
    const selectedChars = collectedCharacteristics.filter(c => c.selected);

    const syncBlock = generateSyncBlock(selectedIdeas, selectedChars);

    if (elements.syncBlockContent) {
        elements.syncBlockContent.textContent = syncBlock;
    }

    if (elements.syncModal) {
        elements.syncModal.style.display = 'flex';
    }

    // Reset buttons
    if (elements.copySyncBtn) {
        elements.copySyncBtn.textContent = '📋 Copiar para Antigravity';
        elements.copySyncBtn.classList.remove('copied');
    }
    if (elements.confirmSyncBtn) {
        elements.confirmSyncBtn.disabled = true;
    }

    // Mark sync as pending (blocks next button until confirmed)
    State.setState({ pendingAntigravityConfirmation: true });
}

/**
 * Hide sync modal
 */
function hideSyncModal() {
    if (elements.syncModal) {
        elements.syncModal.style.display = 'none';
    }
}

/**
 * Generate sync block from selected items
 * Uses full prompt on first iteration, simplified on subsequent
 */
function generateSyncBlock(ideas, characteristics) {
    const state = State.getState();
    const step0State = state.step0 || {};
    const isFirstIteration = step0State.isFirstIteration !== false;
    const date = new Date().toISOString().split('T')[0];
    const projectName = step0State.antigravityProjectName || 'Proyecto';

    // Check if user defined a custom project name
    const nameChoice = document.querySelector('input[name="name-choice"]:checked')?.value || 'custom';
    const customNameField = document.getElementById('project-name-field');
    const customName = customNameField?.value?.trim() || '';
    const hasCustomName = nameChoice === 'custom' && customName.length > 0;

    // Build project name section for the prompt
    let projectNameSection = '';
    if (hasCustomName) {
        projectNameSection = `
## NOMBRE_PROYECTO_DEFINIDO
El usuario ha definido el nombre del proyecto: **${customName}**
> Usa exactamente este nombre para crear la carpeta del proyecto.

`;
    }

    if (isFirstIteration) {
        // First iteration - full prompt with instructions
        return `Actúa como un Especialista en Documentación Técnica y planeación de proyectos de software. Tu misión es procesar los resultados de una sesión de ideación y estructurar la carpeta de planeación del proyecto.

Tus Reglas de Operación:

1. **No Duplicidad**: No crees archivos individuales por cada idea. Mantén un archivo central de planeación.

2. **Análisis de Bloques**: Lee los bloques de sincronización [ESTADO_SINC_ANTIGRAVITY] que te proporcione.

3. **Gestión de Archivos**:
   - Crea/Actualiza \`01_IDEAS_CONSOLIDADO.md\`: Ideas y características seleccionadas.
   - Crea/Actualiza \`02_MASTER_PLAN.md\`: Alcance, objetivos del MVP y fases de ejecución.

4. **Estructura Interna**: Mantén una sección de 'Control de Cambios' en cada archivo.

5. **Sincronización Continua**: Espera el envío de bloques de sincronización [ESTADO_SINC_ANTIGRAVITY], analízalos y agrégalos a los archivos que les corresponda.

**Tu primera tarea:**
> Crea una carpeta nueva que respete la numeración del monorepo y genera la estructura base. Si no existe, créalo desde la carpeta raíz.

[ESTADO_SINC_ANTIGRAVITY]
${projectNameSection}
## INFORMACIÓN DEL PROYECTO
- Fecha: ${date}
- Total Ideas Seleccionadas: ${ideas.length}
- Total Características Seleccionadas: ${characteristics.length}
- Intención: ${state.ideas.intention || 'Por definir'}

## IDEAS CENTRALES SELECCIONADAS
${ideas.map((idea, i) => `${i + 1}. **${idea.title}**
   - Descripción: ${idea.description || 'N/A'}
   - Tipo: ${idea.type || 'funcionalidad'}
   - Prioridad: ${idea.priority || 'media'}`).join('\n\n') || 'Ninguna seleccionada'}

## CARACTERÍSTICAS SELECCIONADAS
${characteristics.map((char, i) => `${i + 1}. **${char.title}**
   - Descripción: ${char.description || 'N/A'}
   - Relacionada con: ${char.relatedTo || 'general'}
   - Prioridad: ${char.priority || 'media'}`).join('\n\n') || 'Ninguna seleccionada'}

---
FIN DEL BLOQUE DE SINCRONIZACIÓN`;
    } else {
        // Subsequent iterations - simplified sync block
        const iterationCount = step0State.iterationCount || 1;
        return `[ESTADO_SINC_ANTIGRAVITY] - Iteración #${iterationCount}

## PROYECTO: ${projectName}
- Fecha: ${date}
- Iteración: ${iterationCount}

## IDEAS
${ideas.map((idea, i) => `${i + 1}. **${idea.title}**: ${idea.description || 'Sin descripción'}`).join('\n') || 'Ninguna nueva'}

## CARACTERÍSTICAS
${characteristics.map((char, i) => `${i + 1}. **${char.title}**: ${char.description || 'Sin descripción'}`).join('\n') || 'Ninguna nueva'}

---
> ⚠️ Algunas ideas pueden estar duplicadas, analiza y agrega solo las que hagan falta.
> Actualiza \`01_IDEAS_CONSOLIDADO.md\` con estos nuevos elementos.
> Actualiza \`02_MASTER_PLAN.md\` con los cambios relevantes.`;
    }
}

/**
 * Copy sync block to clipboard
 */
async function copySyncBlock() {
    const content = elements.syncBlockContent?.textContent || '';

    try {
        await navigator.clipboard.writeText(content);

        if (elements.copySyncBtn) {
            elements.copySyncBtn.textContent = '✅ ¡Copiado!';
            elements.copySyncBtn.classList.add('copied');
        }
        if (elements.confirmSyncBtn) {
            elements.confirmSyncBtn.disabled = false;
        }

        // Show recommendation note
        showModelRecommendation();

        State.markSyncBlockCopied();
    } catch (error) {
        console.error('Copy failed:', error);
        if (elements.copySyncBtn) {
            elements.copySyncBtn.textContent = '❌ Error al copiar';
        }
    }
}

/**
 * Show model recommendation after copying
 */
function showModelRecommendation() {
    // Check if note already exists
    if (document.querySelector('.model-recommendation')) return;

    const noteEl = document.createElement('div');
    noteEl.className = 'model-recommendation';
    noteEl.innerHTML = `
        <div class="recommendation-icon">💡</div>
        <div class="recommendation-text">
            <strong>Recomendación:</strong> Para mejores resultados, usa <strong>Claude Opus 4.5</strong> en Antigravity.
        </div>
    `;

    // Insert at the beginning of the modal footer (before buttons)
    const modalFooter = document.querySelector('#sync-block-modal .sync-modal-footer');
    if (modalFooter) {
        modalFooter.insertBefore(noteEl, modalFooter.firstChild);
    }
}

/**
 * Confirm sync and handle iteration flow
 */
function confirmSync() {
    State.confirmAntigravityExecution();
    hideSyncModal();

    const state = State.getState();
    const step0State = state.step0 || {};
    const isFirstIteration = step0State.isFirstIteration !== false;

    if (isFirstIteration) {
        // First iteration: show project name modal
        showProjectNameModal();
    } else {
        // Subsequent iterations: increment count and prepare for more ideas
        incrementIteration();
        clearChatForNewIteration();
    }
}

/**
 * Show project name modal
 */
function showProjectNameModal() {
    if (elements.projectNameModal) {
        elements.projectNameModal.style.display = 'flex';
    }
    if (elements.projectNameInput) {
        elements.projectNameInput.value = '';
        elements.projectNameInput.focus();
    }
    if (elements.confirmProjectNameBtn) {
        elements.confirmProjectNameBtn.disabled = true;
    }
}

/**
 * Handle project name confirmation
 */
function handleProjectNameConfirm() {
    const name = elements.projectNameInput?.value.trim();
    if (!name || name.length < 2) return;

    // Save project name
    State.setNestedValue('step0.antigravityProjectName', name);
    State.setNestedValue('step0.isFirstIteration', false);
    State.setNestedValue('step0.iterationCount', 1);
    State.setNestedValue('step0.syncCompleted', true);

    // Hide modal
    if (elements.projectNameModal) {
        elements.projectNameModal.style.display = 'none';
    }

    // Clear chat and prepare for new iteration
    clearChatForNewIteration();

    // Show toast
    showMoveFeedback(`Proyecto "${name}" configurado`);
}

/**
 * Increment iteration count
 */
function incrementIteration() {
    const state = State.getState();
    const currentCount = state.step0?.iterationCount || 1;
    State.setNestedValue('step0.iterationCount', currentCount + 1);
}

/**
 * Clear chat and prepare for new iteration
 */
function clearChatForNewIteration() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || 'Proyecto';

    // Clear chat messages
    if (elements.messagesContainer) {
        elements.messagesContainer.innerHTML = renderWelcomeMessage(false, projectName);
    }

    // Unlock chat
    unlockChat();

    // Update iteration indicator in UI
    updateIterationIndicator();
}

/**
 * Lock chat input
 */
function lockChat() {
    State.setNestedValue('step0.chatLocked', true);

    if (elements.input) {
        elements.input.disabled = true;
        elements.input.placeholder = 'Chat bloqueado...';
    }
    if (elements.sendButton) {
        elements.sendButton.disabled = true;
    }
    if (elements.chatInputArea) {
        elements.chatInputArea.classList.add('locked');
    }
}

/**
 * Unlock chat input
 */
function unlockChat() {
    State.setNestedValue('step0.chatLocked', false);

    if (elements.input) {
        elements.input.disabled = false;
        elements.input.placeholder = 'Describe tu proyecto, funcionalidades, características...';
    }
    if (elements.sendButton) {
        elements.sendButton.disabled = false;
    }
    if (elements.chatInputArea) {
        elements.chatInputArea.classList.remove('locked');
    }
}

/**
 * Update iteration indicator in DOM
 */
function updateIterationIndicator() {
    const state = State.getState();
    const step0State = state.step0 || {};
    const iterationCount = step0State.iterationCount || 0;
    const projectName = step0State.antigravityProjectName || '';

    // Check if indicator exists, if not create it
    let indicator = document.querySelector('.iteration-indicator');

    if (!indicator && !step0State.isFirstIteration) {
        indicator = document.createElement('div');
        indicator.className = 'iteration-indicator';
        const container = document.querySelector('.step-ideation-interactive');
        if (container) {
            container.insertBefore(indicator, container.firstChild);
        }
    }

    if (indicator) {
        indicator.innerHTML = `
            <span class="iteration-badge">Iteración #${iterationCount}</span>
            <span class="project-badge">📁 ${projectName}</span>
        `;
    }
}

/**
 * Add message to UI
 */
function addMessageToUI(content, role) {
    if (!elements.messagesContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    messageDiv.innerHTML = `
        <div class="message-avatar">${role === 'user' ? '👤' : '🤖'}</div>
        <div class="message-content">
            <p>${formatMessage(content)}</p>
        </div>
    `;

    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * Format message text
 */
function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

/**
 * Show/hide typing indicator
 */
function showTypingIndicator() {
    if (!elements.messagesContainer) return;

    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'chat-message system typing';
    indicator.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
    `;
    elements.messagesContainer.appendChild(indicator);
    scrollToBottom();
}

function hideTypingIndicator() {
    document.getElementById('typing-indicator')?.remove();
}

/**
 * Scroll to bottom
 */
function scrollToBottom() {
    if (elements.messagesContainer) {
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    }
}

/**
 * Save to state
 */
function saveToState() {
    State.setNestedValue('ideas.centralIdeas', collectedIdeas);
    State.setNestedValue('ideas.characteristics', collectedCharacteristics);
    State.setState({ totalFunciones: collectedIdeas.filter(i => i.selected).length });
}

/**
 * Get session ID
 */
function getSessionId() {
    let id = sessionStorage.getItem('ia-flow-session');
    if (!id) {
        id = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('ia-flow-session', id);
    }
    return id;
}

/**
 * Validate step
 */
export function validate(config, state) {
    const selectedIdeas = collectedIdeas.filter(i => i.selected);

    // Check for at least one selected idea
    if (selectedIdeas.length === 0) {
        alert('Por favor, describe al menos una idea y asegúrate de que esté seleccionada.');
        return false;
    }

    // Check for Antigravity project name (required to proceed)
    const projectName = State.getValue('step0.antigravityProjectName');
    if (!projectName || projectName.trim().length < 2) {
        alert('Por favor, completa la sincronización inicial con Antigravity e introduce el nombre del proyecto.');
        return false;
    }

    // Check if sync block has been confirmed for current iteration
    const pendingConfirmation = State.getValue('pendingAntigravityConfirmation');
    if (pendingConfirmation) {
        alert('Por favor, confirma el copiado del bloque de sincronización antes de continuar.');
        return false;
    }

    return true;
}

/**
 * Collect data
 */
export function collectData(config, state) {
    return {
        totalFunciones: collectedIdeas.filter(i => i.selected).length
    };
}
