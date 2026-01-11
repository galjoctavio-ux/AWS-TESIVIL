/**
 * IA-Flow - Chat Routes
 * Handles chat messages and AI responses with manual node advancement
 */

import express from 'express';
import { sendMessage, extractDataFromResponse } from '../services/aiService.js';
import {
    getCurrentNode,
    getNextNode,
    determineFlowType,
    requiresAntigravity,
    calculateProgress
} from '../services/flowService.js';

const router = express.Router();

// Store flow states per session
const sessionFlows = new Map();

/**
 * Filter technical content from AI responses
 * NOTE: We now PRESERVE sync blocks [CONTEXTO V{N}] and [ESTADO_SINC_ANTIGRAVITY]
 * because users need to copy them to Antigravity
 */
function filterResponse(response) {
    if (!response) return response;

    let filtered = response;

    // Remove only the end marker if present (internal control only)
    filtered = filtered.replace(/\[FIN DE INSTRUCCIONES\]/g, '');

    // Remove excessive equals signs
    filtered = filtered.replace(/========+/g, '---');

    // Clean up extra whitespace
    filtered = filtered.replace(/\n{3,}/g, '\n\n').trim();

    return filtered;
}

/**
 * POST /api/chat
 * Send a message and receive AI response
 */
router.post('/', async (req, res) => {
    try {
        const { message, flowState: clientFlowState, confirmAdvance } = req.body;

        // Validation: check type
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Mensaje requerido' });
        }

        // Validation: trim and check empty
        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0) {
            return res.status(400).json({ error: 'Mensaje no puede estar vacío' });
        }

        // Validation: check max length (prevent DoS)
        if (trimmedMessage.length > 2000) {
            return res.status(400).json({ error: 'Mensaje demasiado largo (máx. 2000 caracteres)' });
        }

        // Get or initialize flow state
        const sessionId = req.headers['x-session-id'] || 'default';
        let flowState = sessionFlows.get(sessionId) || initializeFlowState();

        // Merge with client state if provided
        if (clientFlowState) {
            flowState = { ...flowState, ...clientFlowState };
        }

        // Handle user confirmation to advance to next node
        if (confirmAdvance && flowState.pendingAdvance) {
            flowState.currentNode = flowState.pendingAdvance;
            flowState.pendingAdvance = null;
            sessionFlows.set(sessionId, flowState);

            const newNode = getCurrentNode(flowState);
            return res.json({
                response: `✅ Avanzando al siguiente paso: **${newNode.name}**\n\n¿En qué puedo ayudarte en esta etapa?`,
                nodeAdvanced: true,
                flowState: {
                    currentNode: flowState.currentNode,
                    flowType: flowState.flowType,
                    context: flowState.context,
                    totalFunciones: flowState.totalFunciones
                },
                progress: calculateProgress(flowState)
            });
        }

        // Get current node
        const currentNode = getCurrentNode(flowState);

        if (!currentNode) {
            return res.status(400).json({
                error: 'Flujo no inicializado correctamente'
            });
        }

        // Check if this node requires Antigravity
        const needsAntigravity = requiresAntigravity(flowState);

        if (needsAntigravity) {
            return res.json({
                requiresAntigravity: true,
                response: `🔄 Este paso requiere **Antigravity** para continuar.\n\nPor favor, copia las instrucciones y pégalas en Antigravity. Cuando termine, pega aquí la respuesta.`,
                nodeName: currentNode.name,
                nodeId: currentNode.id,
                flowState: {
                    currentNode: flowState.currentNode,
                    flowType: flowState.flowType,
                    context: flowState.context
                },
                progress: calculateProgress(flowState)
            });
        }

        // Call AI service
        const aiResult = await sendMessage(
            currentNode.systemPrompt,
            message,
            { history: flowState.history }
        );

        if (!aiResult.success) {
            return res.status(503).json({
                error: aiResult.error || 'Servicio de IA no disponible'
            });
        }

        // Extract data from response
        const extractedData = extractDataFromResponse(aiResult.response);

        // Update flow state based on extracted data
        updateFlowState(flowState, extractedData);

        // Add to history (store original, not filtered)
        flowState.history.push(
            { role: 'user', content: message },
            { role: 'assistant', content: aiResult.response }
        );

        // Limit history size
        if (flowState.history.length > 20) {
            flowState.history = flowState.history.slice(-20);
        }

        // Check if this node's work is complete and we should ask about advancing
        let readyToAdvance = false;
        let nextNodeInfo = null;

        // Node-specific completion detection
        if (currentNode.id === 'node_0_classifier' && extractedData.totalFunciones) {
            flowState.totalFunciones = extractedData.totalFunciones;
            flowState.flowType = determineFlowType(extractedData.totalFunciones);
            readyToAdvance = true;
            nextNodeInfo = getNextNode(flowState, extractedData);
        }

        if (currentNode.id === 'node_1a_single_idea_flow' && extractedData.softwareType) {
            flowState.context.softwareType = extractedData.softwareType;
            readyToAdvance = true;
            nextNodeInfo = getNextNode(flowState, extractedData);
        }

        if (currentNode.id === 'node_1_software_selector' && extractedData.softwareType) {
            flowState.context.softwareType = extractedData.softwareType;
            readyToAdvance = true;
            nextNodeInfo = getNextNode(flowState, extractedData);
        }

        // Filter the response for display
        let displayResponse = filterResponse(aiResult.response);

        // If ready to advance, store pending advance and ask for confirmation
        if (readyToAdvance && nextNodeInfo && !nextNodeInfo.completed && nextNodeInfo.nextNode) {
            flowState.pendingAdvance = nextNodeInfo.nextNode;

            // Add confirmation prompt to response
            displayResponse += `\n\n---\n\n✨ **He completado este paso.** ¿Deseas continuar al siguiente paso o quieres agregar algo más?\n\nEscribe "**continuar**" o "**siguiente**" para avanzar, o sigue conversando si necesitas ajustar algo.`;
        }

        // Save flow state
        sessionFlows.set(sessionId, flowState);

        // Prepare response
        const response = {
            response: displayResponse,
            provider: aiResult.provider,
            flowState: {
                currentNode: flowState.currentNode,
                flowType: flowState.flowType,
                context: flowState.context,
                totalFunciones: flowState.totalFunciones
            },
            currentNodeName: currentNode.name,
            pendingAdvance: !!flowState.pendingAdvance,
            progress: calculateProgress(flowState)
        };

        res.json(response);

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Error al procesar el mensaje'
        });
    }
});

/**
 * POST /api/chat/advance
 * Manually advance to the next node
 */
router.post('/advance', async (req, res) => {
    try {
        const sessionId = req.headers['x-session-id'] || 'default';
        let flowState = sessionFlows.get(sessionId);

        if (!flowState) {
            return res.status(400).json({ error: 'Sesión no encontrada' });
        }

        if (!flowState.pendingAdvance) {
            return res.json({
                success: false,
                message: 'No hay un siguiente paso pendiente. Continúa con la conversación actual.'
            });
        }

        // Advance to pending node
        flowState.currentNode = flowState.pendingAdvance;
        flowState.pendingAdvance = null;
        sessionFlows.set(sessionId, flowState);

        const newNode = getCurrentNode(flowState);
        const needsAntigravity = requiresAntigravity(flowState);

        res.json({
            success: true,
            response: `✅ **Avanzando a:** ${newNode.name}\n\n${needsAntigravity ? '🔄 Este paso requiere Antigravity.' : '¿En qué puedo ayudarte en esta etapa?'}`,
            flowState: {
                currentNode: flowState.currentNode,
                flowType: flowState.flowType,
                context: flowState.context
            },
            currentNodeName: newNode.name,
            requiresAntigravity: needsAntigravity,
            progress: calculateProgress(flowState)
        });

    } catch (error) {
        console.error('Advance error:', error);
        res.status(500).json({ error: 'Error al avanzar' });
    }
});

/**
 * POST /api/chat/antigravity-response
 * Handle response from Antigravity
 */
router.post('/antigravity-response', async (req, res) => {
    try {
        const { response: antigravityResponse } = req.body;
        const sessionId = req.headers['x-session-id'] || 'default';

        let flowState = sessionFlows.get(sessionId);

        if (!flowState) {
            return res.status(400).json({
                error: 'Sesión no encontrada'
            });
        }

        // Add Antigravity response to history
        flowState.history.push({
            role: 'assistant',
            content: `[RESPUESTA DE ANTIGRAVITY]\n${antigravityResponse}`
        });

        // Get next node info but DON'T auto-advance
        const nextNodeInfo = getNextNode(flowState, {});

        if (!nextNodeInfo.completed && nextNodeInfo.nextNode) {
            // Store as pending, don't auto-advance
            flowState.pendingAdvance = nextNodeInfo.nextNode;
        }

        // Save updated flow state
        sessionFlows.set(sessionId, flowState);

        const currentNode = getCurrentNode(flowState);

        res.json({
            success: true,
            response: '✅ Respuesta de Antigravity recibida.\n\n¿Deseas continuar al siguiente paso? Escribe "**continuar**" para avanzar.',
            flowState: {
                currentNode: flowState.currentNode,
                flowType: flowState.flowType,
                context: flowState.context
            },
            currentNodeName: currentNode.name,
            pendingAdvance: !!flowState.pendingAdvance,
            progress: calculateProgress(flowState),
            completed: nextNodeInfo.completed
        });

    } catch (error) {
        console.error('Antigravity response error:', error);
        res.status(500).json({
            error: 'Error al procesar la respuesta de Antigravity'
        });
    }
});

/**
 * GET /api/chat/status
 * Get current chat session status
 */
router.get('/status', (req, res) => {
    const sessionId = req.headers['x-session-id'] || 'default';
    const flowState = sessionFlows.get(sessionId);

    if (!flowState) {
        return res.json({ initialized: false });
    }

    const currentNode = getCurrentNode(flowState);

    res.json({
        initialized: true,
        currentNode: flowState.currentNode,
        currentNodeName: currentNode?.name,
        flowType: flowState.flowType,
        pendingAdvance: !!flowState.pendingAdvance,
        progress: calculateProgress(flowState)
    });
});

/**
 * Initialize a new flow state
 */
function initializeFlowState() {
    return {
        currentNode: 'node_0_classifier',
        flowType: null,
        context: {},
        history: [],
        totalFunciones: 0,
        pendingAdvance: null
    };
}

/**
 * Update flow state based on extracted data
 */
function updateFlowState(flowState, extractedData) {
    if (extractedData.ideasCentrales) {
        flowState.context.centralIdea = extractedData.ideasCentrales;
    }

    if (extractedData.totalFunciones) {
        flowState.totalFunciones = extractedData.totalFunciones;
    }

    if (extractedData.softwareType) {
        flowState.context.softwareType = extractedData.softwareType;
    }

    if (extractedData.contexto) {
        flowState.context.lastContexto = extractedData.contexto;
    }
}

export default router;
