/**
 * IA-Flow - Antigravity Block Generator
 * Creates visual sync blocks for Antigravity integration
 */

/**
 * Create an Antigravity sync block element
 * @param {Object} options - Block configuration
 * @returns {HTMLElement} - The block element
 */
export function createAntigravityBlock(options) {
    const {
        nodeName = 'Nodo Desconocido',
        nodeId = 'unknown',
        softwareType = 'No definido',
        centralIdea = 'No definida',
        characteristics = [],
        systemPrompt = ''
    } = options;

    // Format characteristics as list
    const characteristicsList = Array.isArray(characteristics)
        ? characteristics.map((c, i) => `  ${i + 1}. ${c}`).join('\n')
        : characteristics;

    // Build the sync block content
    const syncContent = `[ESTADO_SINC_ANTIGRAVITY]
Nodo: ${nodeId}
Nombre: ${nodeName}
Tipo de Software: ${softwareType}
Idea Central: ${centralIdea}
Características:
${characteristicsList}

========================================
INSTRUCCIONES PARA ANTIGRAVITY:
========================================

${systemPrompt}

========================================
FIN DE INSTRUCCIONES
========================================

NOTA: Copie este bloque completo y péguelo en Antigravity.
Cuando Antigravity complete esta tarea, copie su respuesta
y péguela aquí para continuar con el flujo.`;

    // Create the block element
    const block = document.createElement('div');
    block.className = 'message system-message';

    block.innerHTML = `
        <div class="message-content" style="max-width: 100%;">
            <div class="antigravity-block">
                <div class="antigravity-block-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        <path d="M9 12l2 2 4-4"/>
                    </svg>
                    <span>SINCRONIZACIÓN CON ANTIGRAVITY</span>
                </div>
                <p style="margin-bottom: 12px; color: var(--text-secondary); font-size: 0.875rem;">
                    Copie las siguientes instrucciones y péguelas en 
                    <a href="https://antigravity.google/" target="_blank" rel="noopener" style="color: var(--accent-primary);">Antigravity</a>:
                </p>
                <div class="antigravity-instructions">${escapeHtml(syncContent)}</div>
                <button class="copy-button" onclick="copyAntigravityBlock(this)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copiar</span>
                </button>
            </div>
        </div>
    `;

    // Store the content for copying
    block.dataset.copyContent = syncContent;

    return block;
}

/**
 * Copy Antigravity block content to clipboard
 * @param {HTMLElement} button - The clicked button
 */
window.copyAntigravityBlock = async function (button) {
    const block = button.closest('.antigravity-block');
    const content = block.querySelector('.antigravity-instructions').textContent;

    try {
        await navigator.clipboard.writeText(content);

        // Update button state
        button.classList.add('copied');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>¡Copiado!</span>
        `;

        // Reset after 2 seconds
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copiar</span>
            `;
        }, 2000);
    } catch (error) {
        console.error('Failed to copy:', error);

        // Fallback: select text
        const instructions = block.querySelector('.antigravity-instructions');
        const range = document.createRange();
        range.selectNodeContents(instructions);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        button.innerHTML = `<span>Selecciona y copia manualmente</span>`;
    }
};

/**
 * Escape HTML characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Parse response from Antigravity and extract relevant data
 * @param {string} response - The response from Antigravity
 * @returns {Object} - Parsed data
 */
export function parseAntigravityResponse(response) {
    const data = {
        raw: response,
        completed: false,
        nextAction: null,
        files: [],
        errors: []
    };

    // Check for completion markers
    if (response.includes('[IMPLEMENTACION') ||
        response.includes('[COMPLETADO]') ||
        response.includes('Tarea completada')) {
        data.completed = true;
    }

    // Extract file references
    const fileMatches = response.matchAll(/(?:creado?|modificado?|actualizado?)[:\s]+[`"]?([^\s`"]+\.[a-z]+)[`"]?/gi);
    for (const match of fileMatches) {
        data.files.push(match[1]);
    }

    // Check for errors
    if (response.includes('Error') || response.includes('error')) {
        const errorMatches = response.matchAll(/(?:Error|error)[:\s]+([^\n]+)/g);
        for (const match of errorMatches) {
            data.errors.push(match[1]);
        }
    }

    return data;
}
