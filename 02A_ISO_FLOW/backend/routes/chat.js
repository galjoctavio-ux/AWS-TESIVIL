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
    const requestId = Date.now().toString(36);
    const timestamp = new Date().toISOString();

    console.log(`\n[${timestamp}] [INFO] [CHAT] ═══════════════════════════════════════════════════════`);
    console.log(`[${timestamp}] [INFO] [CHAT] 📩 NEW CHAT REQUEST [ID: ${requestId}]`);

    try {
        const { message, flowState: clientFlowState, confirmAdvance } = req.body;
        const sessionId = req.headers['x-session-id'] || 'default';

        console.log(`[${timestamp}] [INFO] [CHAT] 🔑 Session: ${sessionId}`);
        console.log(`[${timestamp}] [INFO] [CHAT] 📝 Message: ${message ? (message.length > 100 ? message.substring(0, 100) + '...' : message) : '[empty]'}`);
        console.log(`[${timestamp}] [DEBUG] [CHAT] 🔄 Confirm Advance: ${confirmAdvance || false}`);

        // Validation: check type
        if (!message || typeof message !== 'string') {
            console.log(`[${timestamp}] [WARN] [CHAT] ⚠️ Validation failed: Message required`);
            return res.status(400).json({ error: 'Mensaje requerido' });
        }

        // Validation: trim and check empty
        const trimmedMessage = message.trim();
        if (trimmedMessage.length === 0) {
            console.log(`[${timestamp}] [WARN] [CHAT] ⚠️ Validation failed: Empty message`);
            return res.status(400).json({ error: 'Mensaje no puede estar vacío' });
        }

        // Validation: check max length (prevent DoS)
        if (trimmedMessage.length > 2000) {
            console.log(`[${timestamp}] [WARN] [CHAT] ⚠️ Validation failed: Message too long (${trimmedMessage.length} chars)`);
            return res.status(400).json({ error: 'Mensaje demasiado largo (máx. 2000 caracteres)' });
        }

        // Get or initialize flow state
        let flowState = sessionFlows.get(sessionId) || initializeFlowState();

        // Merge with client state if provided
        if (clientFlowState) {
            flowState = { ...flowState, ...clientFlowState };
        }

        console.log(`[${timestamp}] [DEBUG] [CHAT] 📊 Flow State: node=${flowState.currentNode}, type=${flowState.flowType || 'null'}`);

        // Handle user confirmation to advance to next node
        if (confirmAdvance && flowState.pendingAdvance) {
            flowState.currentNode = flowState.pendingAdvance;
            flowState.pendingAdvance = null;
            sessionFlows.set(sessionId, flowState);

            const newNode = getCurrentNode(flowState);
            console.log(`[${timestamp}] [INFO] [CHAT] ✅ Advanced to node: ${newNode.name}`);

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
            console.log(`[${timestamp}] [ERROR] [CHAT] ❌ Flow not initialized: no current node`);
            return res.status(400).json({
                error: 'Flujo no inicializado correctamente'
            });
        }

        console.log(`[${timestamp}] [INFO] [CHAT] 📍 Current Node: ${currentNode.name} (${currentNode.id})`);

        // Check if this node requires Antigravity
        const needsAntigravity = requiresAntigravity(flowState);

        if (needsAntigravity) {
            console.log(`[${timestamp}] [INFO] [CHAT] 🔄 Node requires Antigravity`);
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
        console.log(`[${timestamp}] [INFO] [CHAT] 🤖 Calling AI service...`);
        const aiStartTime = Date.now();

        const aiResult = await sendMessage(
            currentNode.systemPrompt,
            message,
            { history: flowState.history }
        );

        const aiDuration = Date.now() - aiStartTime;
        console.log(`[${timestamp}] [INFO] [CHAT] ⏱️ AI responded in ${aiDuration}ms`);

        if (!aiResult.success) {
            console.log(`[${timestamp}] [ERROR] [CHAT] ❌ AI service failed: ${aiResult.error}`);
            return res.status(503).json({
                error: aiResult.error || 'Servicio de IA no disponible'
            });
        }

        console.log(`[${timestamp}] [INFO] [CHAT] ✅ AI Success (provider: ${aiResult.provider})`);

        // Extract data from response
        const extractedData = extractDataFromResponse(aiResult.response);
        if (Object.keys(extractedData).length > 0) {
            console.log(`[${timestamp}] [DEBUG] [CHAT] 📊 Extracted Data:`, JSON.stringify(extractedData));
        }

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
            console.log(`[${timestamp}] [INFO] [CHAT] 📊 Classified: ${extractedData.totalFunciones} functions, flow type: ${flowState.flowType}`);
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
            console.log(`[${timestamp}] [INFO] [CHAT] 🔜 Ready to advance to: ${nextNodeInfo.nextNode}`);

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

        console.log(`[${timestamp}] [INFO] [CHAT] 📤 Response sent (${displayResponse.length} chars)`);
        console.log(`[${timestamp}] [INFO] [CHAT] ═══════════════════════════════════════════════════════\n`);

        res.json(response);

    } catch (error) {
        console.error(`[${timestamp}] [ERROR] [CHAT] ❌ Chat error:`, error);
        console.log(`[${timestamp}] [INFO] [CHAT] ═══════════════════════════════════════════════════════\n`);
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
