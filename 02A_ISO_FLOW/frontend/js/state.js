/**
 * IA-Flow - State Management Module
 * Manages wizard state with localStorage persistence
 */

// Initial state structure
const initialState = {
    currentStep: 0,
    projectName: '',
    flowType: null, // 'simple', 'medium', 'complex'
    totalFunciones: 0,

    // Step 0: Ideation - Iteration Flow
    step0: {
        isFirstIteration: true,
        antigravityProjectName: '',
        iterationCount: 0,
        chatLocked: false,
        awaitingSyncConfirm: false,
        syncCompleted: false
    },

    // Step 0: Ideas data
    ideas: {
        centralIdeas: [],
        characteristics: [],
        intention: '',
        summary: ''
    },

    // Step 1: Software Selection
    softwareType: null, // 'web_page', 'web_app', 'windows_program', 'mobile_app'
    step1SyncCompleted: false, // Track if Step 1 sync was confirmed

    // Step 3: Technical Context
    technicalContext: {
        level: 'intermedio', // 'basico', 'intermedio', 'avanzado'
        role: 'mixto', // 'programador', 'orquestador', 'mixto'
        budget: 0,
        hasVM: false,
        vmName: '',
        services: 'gratuitos', // 'gratuitos', 'pago'
        additionalNotes: '' // Free-form notes for preferences
    },
    step3SyncCompleted: false, // Track if Step 3 sync was confirmed

    // Step 4: Risk & CAME Evaluation
    riskEvaluation: {
        phase1Started: false,
        phase1Completed: false,
        phase2Started: false,
        phase2Completed: false
    },
    step4SyncCompleted: false, // Track if Step 4 both phases completed

    // Step 5: UX/UI Functional
    uxuiEvaluation: {
        started: false,
        completed: false
    },
    step5SyncCompleted: false, // Track if Step 5 completed

    // Step 6: Visual Identity Evaluation
    identityEvaluation: {
        pathSelected: null, // 'custom' or 'auto'
        colorPrefs: '',
        stylePrefs: '',
        references: '',
        avoid: '',
        promptGenerated: false,
        completed: false
    },
    step6SyncCompleted: false, // Track if Step 6 completed

    // Step 7: Plan Maestro Consolidation
    consolidationEvaluation: {
        started: false,
        completed: false
    },
    step7SyncCompleted: false, // Track if Step 7 completed

    // Step 8: Implementation
    implementationEvaluation: {
        phase1Started: false,
        phase1Completed: false,
        phase2Started: false,
        phase2Completed: false
    },
    step8SyncCompleted: false, // Track if Step 8 completed

    // Step 9: Verification
    verificationEvaluation: {
        phase1Started: false,
        phase1Completed: false,
        phase2Started: false,
        phase2Completed: false,
        phase3Started: false,
        phase3Completed: false
    },
    step9SyncCompleted: false, // Track if Step 9 completed

    // Step 10: Deployment
    deploymentEvaluation: {
        started: false,
        completed: false
    },
    step10SyncCompleted: false, // Track if Step 10 completed

    // Legacy: Visual Identity defaults (for reference)
    visualIdentity: {
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#a855f7',
        style: 'moderno',
        darkMode: true,
        fontFamily: 'Inter'
    },

    // Sync tracking
    syncHistory: [],
    lastSyncBlock: null,
    pendingAntigravityConfirmation: false,

    // Chat history per step
    chatHistory: {}
};

// State storage key
const STORAGE_KEY = 'ia-flow-wizard-state';

// Current state - load from localStorage or use initial
let state = loadState();

// Event listeners for state changes
const listeners = new Map();

/**
 * Load state from localStorage
 */
function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge with initialState to handle new properties
            return { ...initialState, ...parsed };
        }
    } catch (error) {
        console.warn('Failed to load state:', error);
    }
    return { ...initialState };
}

/**
 * Save state to localStorage
 */
function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn('Failed to save state:', error);
    }
}

/**
 * Get current state (read-only copy)
 */
export function getState() {
    return { ...state };
}

/**
 * Get specific state value
 */
export function getValue(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], state);
}

/**
 * Update state
 * @param {Object} updates - Partial state updates
 */
export function setState(updates) {
    const oldState = { ...state };
    state = { ...state, ...updates };
    saveState();
    notifyListeners(oldState, state);
}

/**
 * Update nested state value
 * @param {string} path - Dot-separated path (e.g., 'ideas.centralIdeas')
 * @param {*} value - New value
 */
export function setNestedValue(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
        if (!obj[key]) obj[key] = {};
        return obj[key];
    }, state);

    target[lastKey] = value;
    saveState();
    notifyListeners(state, state);
}

/**
 * Add to chat history for current step
 */
export function addToChatHistory(stepId, message, role = 'user') {
    if (!state.chatHistory[stepId]) {
        state.chatHistory[stepId] = [];
    }
    state.chatHistory[stepId].push({
        role,
        content: message,
        timestamp: Date.now()
    });
    saveState();
}

/**
 * Get chat history for a step
 */
export function getChatHistory(stepId) {
    return state.chatHistory[stepId] || [];
}

/**
 * Record a sync block generation
 */
export function recordSyncBlock(block, stepId) {
    state.lastSyncBlock = block;
    state.syncHistory.push({
        stepId,
        block,
        timestamp: Date.now(),
        copied: false
    });
    state.pendingAntigravityConfirmation = true;
    saveState();
}

/**
 * Mark last sync block as copied
 */
export function markSyncBlockCopied() {
    if (state.syncHistory.length > 0) {
        state.syncHistory[state.syncHistory.length - 1].copied = true;
        saveState();
    }
}

/**
 * Confirm Antigravity execution
 */
export function confirmAntigravityExecution() {
    state.pendingAntigravityConfirmation = false;
    saveState();
}

/**
 * Advance to next step
 */
export function nextStep() {
    setState({ currentStep: state.currentStep + 1 });
}

/**
 * Go to previous step
 */
export function prevStep() {
    if (state.currentStep > 0) {
        setState({ currentStep: state.currentStep - 1 });
    }
}

/**
 * Go to specific step
 */
export function goToStep(stepIndex) {
    setState({ currentStep: stepIndex });
}

/**
 * Subscribe to state changes
 * @param {string} id - Unique listener ID
 * @param {Function} callback - Function to call on state change
 */
export function subscribe(id, callback) {
    listeners.set(id, callback);
    return () => listeners.delete(id);
}

/**
 * Notify all listeners of state change
 */
function notifyListeners(oldState, newState) {
    listeners.forEach(callback => {
        try {
            callback(newState, oldState);
        } catch (error) {
            console.error('State listener error:', error);
        }
    });
}

/**
 * Reset state to initial
 */
export function resetState() {
    state = { ...initialState };
    saveState();
    notifyListeners({}, state);
}

/**
 * Export state for debugging
 */
export function exportState() {
    return JSON.stringify(state, null, 2);
}

// Export state object for direct access (use with caution)
export { state };
