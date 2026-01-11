/**
 * IA-Flow - Chat Module
 * Handles chat interface, message sending, and AI responses
 * With manual node advancement
 */

import { createAntigravityBlock } from './antigravityBlock.js';
import { sanitizeHTML, escapeAttr } from './security.js';

// Chat state
let config = {
    apiUrl: '',
    captchaToken: null,
    donorToken: null,
    onQuery: () => { }
};

let flowState = {
    currentNode: 'node_0_classifier',
    flowType: null,
    context: {},
    totalFunciones: 0,
    pendingAdvance: false
};

// Session ID for backend
const sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

// DOM Elements
let elements = {};

/**
 * Initialize chat module
 */
function init(options) {
    config = { ...config, ...options };

    elements = {
        messagesContainer: document.getElementById('chat-messages'),
        input: document.getElementById('chat-input'),
        sendButton: document.getElementById('send-button'),
        charCount: document.getElementById('char-count'),
        flowStatus: document.getElementById('flow-status')
    };

    setupEventListeners();
    loadFlowData();

    console.log('💬 Chat module initialized');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Send button
    elements.sendButton.addEventListener('click', sendMessage);

    // Enter key to send (Shift+Enter for new line)
    elements.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Input validation and character count
    elements.input.addEventListener('input', () => {
        const value = elements.input.value;
        const length = value.length;

        elements.charCount.textContent = `${length}/2000`;
        elements.sendButton.disabled = length === 0 || length > 2000;

        // Auto-resize textarea
        elements.input.style.height = 'auto';
        elements.input.style.height = Math.min(elements.input.scrollHeight, 150) + 'px';
    });
}

/**
 * Load flow data from JSON
 */
async function loadFlowData() {
    try {
        const response = await fetch('/flujo-iso.json');
        if (response.ok) {
            flowState.flowData = await response.json();
            console.log('📄 Flow data loaded');
        }
    } catch (error) {
        console.warn('Could not load local flow data:', error);
    }
}

/**
 * Check if message is an advance command
 */
function isAdvanceCommand(message) {
    const advanceKeywords = [
        'continuar', 'siguiente', 'avanzar', 'adelante',
        'continue', 'next', 'si', 'sí', 'ok', 'listo',
        'ya', 'vamos', 'dale'
    ];
    const lowerMessage = message.toLowerCase().trim();
    return advanceKeywords.some(keyword => lowerMessage === keyword || lowerMessage.startsWith(keyword + ' '));
}

/**
 * Advance to next node
 */
async function advanceToNextNode() {
    const typingId = showTypingIndicator();

    try {
        const response = await fetch(`${config.apiUrl}/chat/advance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': sessionId,
                'X-Captcha-Token': config.captchaToken,
                ...(config.donorToken ? { 'Authorization': `Bearer ${config.donorToken}` } : {})
            }
        });

        const data = await response.json();
        removeTypingIndicator(typingId);

        if (data.success) {
            // Update flow state
            if (data.flowState) {
                flowState = { ...flowState, ...data.flowState };
                flowState.pendingAdvance = false;
                updateFlowStatus(data.currentNodeName);
            }

            // Add response message
            if (data.response) {
                addMessage(data.response, 'system');
            }

            // Check if new node requires Antigravity
            if (data.requiresAntigravity) {
                showAntigravityBlock(data);
            }
        } else {
            addMessage(data.message || 'No hay un siguiente paso disponible.', 'system');
        }
    } catch (error) {
        console.error('Advance error:', error);
        removeTypingIndicator(typingId);
        handleError('Error al avanzar al siguiente paso.');
    }
}

/**
 * Send a message
 */
async function sendMessage() {
    const message = elements.input.value.trim();
    if (!message) return;

    // Check if this is an advance command and we have a pending advance
    if (flowState.pendingAdvance && isAdvanceCommand(message)) {
        // Clear input
        elements.input.value = '';
        elements.charCount.textContent = '0/2000';
        elements.input.style.height = 'auto';

        // Add user message
        addMessage(message, 'user');

        // Advance to next node
        await advanceToNextNode();

        elements.input.focus();
        return;
    }

    // Disable input while sending
    elements.input.disabled = true;
    elements.sendButton.disabled = true;

    // Add user message to chat
    addMessage(message, 'user');

    // Clear input
    elements.input.value = '';
    elements.charCount.textContent = '0/2000';
    elements.input.style.height = 'auto';

    // Track query for donation popup
    config.onQuery();

    // Show typing indicator
    const typingId = showTypingIndicator();

    try {
        // Send to API
        const response = await fetch(`${config.apiUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Id': sessionId,
                'X-Captcha-Token': config.captchaToken,
                ...(config.donorToken ? { 'Authorization': `Bearer ${config.donorToken}` } : {})
            },
            body: JSON.stringify({
                message,
                flowState: {
                    currentNode: flowState.currentNode,
                    flowType: flowState.flowType,
                    context: flowState.context,
                    totalFunciones: flowState.totalFunciones
                }
            })
        });

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator(typingId);

        if (response.ok) {
            handleAIResponse(data);
        } else {
            handleError(data.error || 'Error al procesar tu mensaje');
        }
    } catch (error) {
        console.error('Chat error:', error);
        removeTypingIndicator(typingId);
        handleError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
        // Re-enable input
        elements.input.disabled = false;
        elements.sendButton.disabled = false;
        elements.input.focus();
    }
}

/**
 * Handle AI response
 */
function handleAIResponse(data) {
    // Update flow state
    if (data.flowState) {
        flowState = { ...flowState, ...data.flowState };
    }

    // Track pending advance
    flowState.pendingAdvance = data.pendingAdvance || false;

    // Update status display
    if (data.currentNodeName) {
        updateFlowStatus(data.currentNodeName);
    }

    // Add AI response
    if (data.response) {
        addMessage(data.response, 'system');
    }

    // Check if we need to show Antigravity sync block
    if (data.requiresAntigravity) {
        showAntigravityBlock(data);
    }
}

/**
 * Show Antigravity block
 */
function showAntigravityBlock(data) {
    const block = createAntigravityBlock({
        nodeName: data.nodeName,
        nodeId: data.nodeId,
        softwareType: flowState.context.softwareType,
        centralIdea: flowState.context.centralIdea,
        characteristics: flowState.context.characteristics,
        systemPrompt: data.systemPrompt
    });

    elements.messagesContainer.appendChild(block);
    scrollToBottom();
}

/**
 * Handle error
 */
function handleError(message) {
    addMessage(`❌ ${message}`, 'system', true);
}

/**
 * Add message to chat
 */
function addMessage(content, type = 'system', isError = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    const icon = type === 'user' ? '👤' : (isError ? '❌' : '🤖');

    // Parse markdown-like content (basic support)
    const formattedContent = formatMessage(content);

    // Check if content contains a sync block [CONTEXTO V{N}] or [ESTADO_SINC_ANTIGRAVITY]
    const hasSyncBlock = /\[CONTEXTO V\d+\]|\[ESTADO_SINC_ANTIGRAVITY\]/i.test(content);

    // Extract sync block content for copying
    let syncBlockContent = '';
    if (hasSyncBlock) {
        const contextMatch = content.match(/---[\s\S]*?\[CONTEXTO V\d+\][\s\S]*?---/i) ||
            content.match(/\[CONTEXTO V\d+\][\s\S]*?(?=\n\n[A-Z]|\n\n¿|$)/i);
        const estadoMatch = content.match(/\[ESTADO_SINC_ANTIGRAVITY\][\s\S]*?(?=FIN DE INSTRUCCIONES|$)/i);
        syncBlockContent = contextMatch ? contextMatch[0] : (estadoMatch ? estadoMatch[0] : '');
    }

    let copyButtonHtml = '';
    if (hasSyncBlock && type === 'system') {
        copyButtonHtml = `
            <div class="sync-copy-container">
                <button class="sync-copy-button" data-sync-content="${escapeAttr(syncBlockContent || content)}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    📋 Copiar para Antigravity
                </button>
            </div>
        `;
    }

    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-icon">${icon}</div>
            <div class="message-text">${formattedContent}${copyButtonHtml}</div>
        </div>
    `;

    // Add click handler for sync copy button
    const copyBtn = messageDiv.querySelector('.sync-copy-button');
    if (copyBtn) {
        copyBtn.addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const contentToCopy = btn.dataset.syncContent;
            try {
                await navigator.clipboard.writeText(contentToCopy);
                btn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    ✅ ¡Copiado!
                `;
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        📋 Copiar para Antigravity
                    `;
                    btn.classList.remove('copied');
                }, 2000);
            } catch (err) {
                console.error('Copy failed:', err);
                btn.textContent = '❌ Error al copiar';
            }
        });
    }

    elements.messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

// escapeAttr is now imported from security.js

/**
 * Format message content (basic markdown)
 */
function formatMessage(content) {
    // Handle line breaks within paragraphs
    let lines = content.split('\n');
    let result = [];
    let currentParagraph = [];
    let inList = false;
    let listItems = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Check for horizontal rule
        if (trimmedLine === '---' || trimmedLine === '***') {
            if (currentParagraph.length > 0) {
                result.push(`<p>${currentParagraph.join('<br>')}</p>`);
                currentParagraph = [];
            }
            if (inList && listItems.length > 0) {
                result.push(`<ul>${listItems.map(l => `<li>${l}</li>`).join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            result.push('<hr>');
            continue;
        }

        // Check for list item
        if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            if (currentParagraph.length > 0) {
                result.push(`<p>${currentParagraph.join('<br>')}</p>`);
                currentParagraph = [];
            }
            inList = true;
            listItems.push(formatInlineMarkdown(trimmedLine.substring(2)));
            continue;
        }

        // If we were in a list, close it
        if (inList && listItems.length > 0 && trimmedLine !== '') {
            result.push(`<ul>${listItems.map(l => `<li>${l}</li>`).join('')}</ul>`);
            listItems = [];
            inList = false;
        }

        // Empty line = paragraph break
        if (trimmedLine === '') {
            if (currentParagraph.length > 0) {
                result.push(`<p>${currentParagraph.join('<br>')}</p>`);
                currentParagraph = [];
            }
            if (inList && listItems.length > 0) {
                result.push(`<ul>${listItems.map(l => `<li>${l}</li>`).join('')}</ul>`);
                listItems = [];
                inList = false;
            }
            continue;
        }

        // Regular text
        currentParagraph.push(formatInlineMarkdown(trimmedLine));
    }

    // Handle remaining content
    if (currentParagraph.length > 0) {
        result.push(`<p>${currentParagraph.join('<br>')}</p>`);
    }
    if (inList && listItems.length > 0) {
        result.push(`<ul>${listItems.map(l => `<li>${l}</li>`).join('')}</ul>`);
    }

    return result.join('');
}

/**
 * Format inline markdown (bold, italic, etc.)
 */
function formatInlineMarkdown(text) {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Code
    text = text.replace(/`(.*?)`/g, '<code>$1</code>');

    return text;
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'message system-message typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="message-icon">🤖</div>
            <div class="message-text">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;

    elements.messagesContainer.appendChild(typingDiv);
    scrollToBottom();

    return id;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Update flow status display
 */
function updateFlowStatus(nodeName) {
    if (nodeName) {
        elements.flowStatus.textContent = `Paso: ${nodeName}`;
    }
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// Export
export const Chat = {
    init,
    addMessage,
    flowState
};
