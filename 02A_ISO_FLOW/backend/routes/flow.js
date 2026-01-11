/**
 * IA-Flow - Flow Routes
 * Handles flow status and navigation
 */

import express from 'express';
import {
    initializeFlow,
    getCurrentNode,
    getFlowRoute,
    getFlowSequence,
    calculateProgress
} from '../services/flowService.js';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * GET /api/flow/status
 * Get current flow status
 */
router.get('/status', (req, res) => {
    try {
        // In production, get from session/database
        const flowState = req.session?.flowState || initializeFlow();
        const currentNode = getCurrentNode(flowState);

        res.json({
            currentNode: currentNode ? {
                id: flowState.currentNode,
                name: currentNode.name,
                type: currentNode.type,
                executor: currentNode.executor,
                userInputRequired: currentNode.userInputRequired
            } : null,
            flowType: flowState.flowType,
            totalFunciones: flowState.totalFunciones,
            progress: calculateProgress(flowState)
        });
    } catch (error) {
        console.error('Flow status error:', error);
        res.status(500).json({ error: 'Error al obtener estado del flujo' });
    }
});

/**
 * GET /api/flow/schema
 * Get the flow schema (JSON structure)
 */
router.get('/schema', (req, res) => {
    try {
        const flowPath = path.join(__dirname, '../../flujo-iso.json');
        const rawData = readFileSync(flowPath, 'utf-8');
        const flowData = JSON.parse(rawData);

        res.json(flowData);
    } catch (error) {
        console.error('Flow schema error:', error);
        res.status(500).json({ error: 'Error al cargar esquema del flujo' });
    }
});

/**
 * GET /api/flow/nodes
 * Get list of all nodes
 */
router.get('/nodes', (req, res) => {
    try {
        const flowPath = path.join(__dirname, '../../flujo-iso.json');
        const rawData = readFileSync(flowPath, 'utf-8');
        const flowData = JSON.parse(rawData);

        const nodes = Object.entries(flowData.nodes).map(([id, node]) => ({
            id,
            name: node.name,
            type: node.type,
            executor: node.executor,
            description: node.description || null
        }));

        res.json(nodes);
    } catch (error) {
        console.error('Flow nodes error:', error);
        res.status(500).json({ error: 'Error al obtener nodos' });
    }
});

/**
 * GET /api/flow/routes
 * Get flow routes configuration
 */
router.get('/routes', (req, res) => {
    try {
        const simple = getFlowRoute('simple');
        const medium = getFlowRoute('medium');
        const complex = getFlowRoute('complex');

        res.json({
            simple: {
                name: simple?.name,
                condition: simple?.condition,
                sequence: simple?.flow_sequence
            },
            medium: {
                name: medium?.name,
                condition: medium?.condition,
                sequence: medium?.flow_sequence
            },
            complex: {
                name: complex?.name,
                condition: complex?.condition,
                sequence: complex?.flow_sequence
            }
        });
    } catch (error) {
        console.error('Flow routes error:', error);
        res.status(500).json({ error: 'Error al obtener rutas' });
    }
});

/**
 * POST /api/flow/reset
 * Reset the flow to initial state
 */
router.post('/reset', (req, res) => {
    try {
        const newFlowState = initializeFlow();

        // In production, save to session/database
        if (req.session) {
            req.session.flowState = newFlowState;
        }

        res.json({
            success: true,
            flowState: newFlowState,
            message: 'Flujo reiniciado correctamente'
        });
    } catch (error) {
        console.error('Flow reset error:', error);
        res.status(500).json({ error: 'Error al reiniciar flujo' });
    }
});

export default router;
