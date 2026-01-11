/**
 * IA-Flow - Flow Service
 * Manages the flow logic based on flujo-iso.json
 */

import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load flow data
let flowData = null;

function loadFlowData() {
    if (!flowData) {
        const flowPath = path.join(__dirname, '../../flujo-iso.json');
        const rawData = readFileSync(flowPath, 'utf-8');
        flowData = JSON.parse(rawData);
    }
    return flowData;
}

/**
 * Initialize a new flow session
 */
export function initializeFlow() {
    const flow = loadFlowData();

    return {
        currentNode: flow.flow_start,
        flowType: null,
        context: {},
        history: [],
        totalFunciones: 0,
        completed: false
    };
}

/**
 * Get current node information
 */
export function getCurrentNode(flowState) {
    const flow = loadFlowData();
    const node = flow.nodes[flowState.currentNode];

    if (!node) {
        return null;
    }

    return {
        id: flowState.currentNode,
        name: node.name,
        type: node.type,
        executor: node.executor,
        systemPrompt: node.system_prompt,
        userInputRequired: node.user_input_required || false,
        userInputTemplate: node.user_input_template || null
    };
}

/**
 * Determine flow type based on total functions
 */
export function determineFlowType(totalFunciones) {
    if (totalFunciones === 1) return 'simple';
    if (totalFunciones <= 8) return 'medium';
    return 'complex';
}

/**
 * Get the next node based on current state and conditions
 */
export function getNextNode(flowState, extractedData = {}) {
    const flow = loadFlowData();
    const currentNode = flow.nodes[flowState.currentNode];

    if (!currentNode || !currentNode.next) {
        return { completed: true, nextNode: null };
    }

    // Simple next (string)
    if (typeof currentNode.next === 'string') {
        return {
            completed: false,
            nextNode: currentNode.next
        };
    }

    // Conditional next (object with branches)
    if (currentNode.next.condition) {
        const condition = currentNode.next.condition;
        const branches = currentNode.next.branches || [];

        let conditionValue;

        // Determine condition value
        if (condition === 'total_funciones') {
            conditionValue = extractedData.totalFunciones || flowState.totalFunciones;
        } else if (condition === 'flow_type') {
            conditionValue = flowState.flowType;
        } else if (condition === 'errors_resolved') {
            conditionValue = extractedData.errorsResolved ? 'true' : 'false';
        } else {
            conditionValue = extractedData[condition] || flowState.context[condition];
        }

        // Evaluate branches
        for (const branch of branches) {
            if (evaluateCondition(branch.when, conditionValue)) {
                // Set flow type if specified
                if (branch.set_flow_type) {
                    flowState.flowType = branch.set_flow_type;
                }
                return {
                    completed: false,
                    nextNode: branch.goto,
                    description: branch.description
                };
            }
        }
    }

    return { completed: true, nextNode: null };
}

/**
 * Evaluate a condition
 */
function evaluateCondition(condition, value) {
    if (condition === 'simple' || condition === 'medium' || condition === 'complex') {
        return value === condition;
    }

    if (condition === 'true' || condition === 'false') {
        return String(value) === condition;
    }

    // Numeric conditions
    const numValue = parseInt(value);

    if (condition.startsWith('== ')) {
        return numValue === parseInt(condition.substring(3));
    }
    if (condition.startsWith('<= ')) {
        return numValue <= parseInt(condition.substring(3));
    }
    if (condition.startsWith('>= ')) {
        return numValue >= parseInt(condition.substring(3));
    }
    if (condition.startsWith('< ')) {
        return numValue < parseInt(condition.substring(2));
    }
    if (condition.startsWith('> ')) {
        return numValue > parseInt(condition.substring(2));
    }

    return false;
}

/**
 * Check if current node requires Antigravity
 */
export function requiresAntigravity(flowState) {
    const node = getCurrentNode(flowState);
    return node && node.executor === 'antigravity';
}

/**
 * Get flow route configuration
 */
export function getFlowRoute(flowType) {
    const flow = loadFlowData();
    return flow.flow_routes[flowType] || null;
}

/**
 * Check if a node should be executed, skipped, or simplified
 */
export function getNodeExecutionMode(flowState, nodeId) {
    const route = getFlowRoute(flowState.flowType);
    if (!route || !route.nodes_config) {
        return 'execute';
    }
    return route.nodes_config[nodeId] || 'execute';
}

/**
 * Get the flow sequence for current flow type
 */
export function getFlowSequence(flowType) {
    const route = getFlowRoute(flowType);
    return route ? route.flow_sequence : null;
}

/**
 * Calculate progress in the flow
 */
export function calculateProgress(flowState) {
    const sequence = getFlowSequence(flowState.flowType);
    if (!sequence) {
        return { current: 0, total: 0, percentage: 0 };
    }

    const currentIndex = sequence.indexOf(flowState.currentNode);
    const total = sequence.length;

    return {
        current: currentIndex + 1,
        total,
        percentage: Math.round(((currentIndex + 1) / total) * 100)
    };
}

export default {
    initializeFlow,
    getCurrentNode,
    determineFlowType,
    getNextNode,
    requiresAntigravity,
    getFlowRoute,
    getNodeExecutionMode,
    getFlowSequence,
    calculateProgress
};
