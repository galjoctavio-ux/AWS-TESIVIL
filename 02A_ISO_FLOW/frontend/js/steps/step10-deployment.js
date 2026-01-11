/**
 * IA-Flow - Step 10: Deployment
 * Guide user to publish their project
 */

import * as State from '../state.js';

/**
 * Render the deployment step
 */
export function render(config, state) {
    const deployState = state.deploymentEvaluation || {};

    return `
        <div class="step-deployment">
            <div class="deployment-intro">
                <div class="intro-card success">
                    <div class="intro-icon">🎉</div>
                    <div class="intro-content">
                        <h3>¡Felicidades! Tu proyecto está listo</h3>
                        <p>Has completado todas las fases de desarrollo. Es hora de publicar tu proyecto al mundo.</p>
                    </div>
                </div>
                
                <div class="agent-notice">
                    <span class="notice-icon">💡</span>
                    <span class="notice-text">
                        <strong>Importante:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity para el despliegue.
                    </span>
                </div>
            </div>
            
            <!-- Deployment Phase -->
            <div class="deploy-phase ${deployState.completed ? 'completed' : deployState.started ? 'active' : ''}">
                <div class="phase-header">
                    <div class="phase-number">🚀</div>
                    <div class="phase-info">
                        <h3>Publicar el Proyecto</h3>
                        <p>Antigravity te guiará paso a paso para desplegar tu aplicación.</p>
                    </div>
                    ${deployState.completed ? '<span class="phase-check">✅</span>' : ''}
                </div>
                
                <div class="phase-content">
                    <div class="phase-details">
                        <p><strong>Antigravity te ayudará con:</strong></p>
                        <ul>
                            <li>Seleccionar la plataforma de hosting adecuada</li>
                            <li>Configurar el entorno de producción</li>
                            <li>Preparar el build de producción</li>
                            <li>Configurar dominio y SSL</li>
                            <li>Realizar el despliegue paso a paso</li>
                            <li>Verificar que todo funcione en producción</li>
                        </ul>
                    </div>
                    
                    <div class="hosting-options">
                        <h4>📦 Plataformas populares según tu tipo de proyecto:</h4>
                        <div class="hosting-grid">
                            <div class="hosting-card">
                                <span class="hosting-icon">🌐</span>
                                <span class="hosting-name">Vercel / Netlify</span>
                                <span class="hosting-desc">Páginas web, Next.js, React</span>
                            </div>
                            <div class="hosting-card">
                                <span class="hosting-icon">☁️</span>
                                <span class="hosting-name">AWS / Azure / GCP</span>
                                <span class="hosting-desc">Apps empresariales</span>
                            </div>
                            <div class="hosting-card">
                                <span class="hosting-icon">🐳</span>
                                <span class="hosting-name">Docker / Railway</span>
                                <span class="hosting-desc">Apps con backend</span>
                            </div>
                            <div class="hosting-card">
                                <span class="hosting-icon">📱</span>
                                <span class="hosting-name">App Store / Play Store</span>
                                <span class="hosting-desc">Apps móviles</span>
                            </div>
                        </div>
                    </div>
                    
                    <button id="generate-deployment-prompt" class="generate-sync-btn" ${deployState.completed ? 'disabled' : ''}>
                        📋 Generar Prompt de Despliegue
                    </button>
                    
                    ${deployState.started && !deployState.completed ? `
                        <div class="phase-actions">
                            <button id="confirm-deployment-done" class="btn-success">
                                ✅ ¡Proyecto desplegado exitosamente!
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Completed state -->
            ${deployState.completed ? `
                <div class="deployment-completed">
                    <div class="completed-icon">🎊</div>
                    <h3>¡Proyecto Publicado!</h3>
                    <p>Tu aplicación está ahora disponible para el mundo.</p>
                    <div class="completion-actions">
                        <p class="completion-note">Has completado exitosamente todo el flujo de desarrollo con IA-Flow.</p>
                    </div>
                </div>
            ` : ''}
            
            <!-- Sync Modal -->
            <div id="deploy-sync-modal" class="sync-modal" style="display: none;">
                <div class="sync-modal-content">
                    <div class="sync-modal-header">
                        <h3>📋 Prompt: Despliegue del Proyecto</h3>
                        <button id="close-deploy-modal" class="modal-close">&times;</button>
                    </div>
                    <div class="sync-modal-body">
                        <div class="agent-reminder">
                            <span class="agent-icon">🚀</span>
                            <span><strong>Recuerda:</strong> Crea un <strong>nuevo agente/conversación</strong> en Antigravity.</span>
                        </div>
                        <p>Copia este prompt y pégalo en Antigravity:</p>
                        <pre id="deploy-sync-content" class="sync-block-pre"></pre>
                    </div>
                    <div class="sync-modal-footer">
                        <button id="copy-deploy-sync" class="btn-primary">📋 Copiar Prompt</button>
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
    setupEventListeners();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const modal = document.getElementById('deploy-sync-modal');
    const closeBtn = document.getElementById('close-deploy-modal');
    const copyBtn = document.getElementById('copy-deploy-sync');
    const contentPre = document.getElementById('deploy-sync-content');

    // Generate deployment prompt
    document.getElementById('generate-deployment-prompt')?.addEventListener('click', () => {
        const prompt = generateDeploymentPrompt();
        if (contentPre) contentPre.textContent = prompt;

        State.setNestedValue('deploymentEvaluation.started', true);
        if (modal) modal.style.display = 'flex';
        updatePhaseUI();
    });

    document.getElementById('confirm-deployment-done')?.addEventListener('click', () => {
        State.setNestedValue('deploymentEvaluation.completed', true);
        State.setState({ step10SyncCompleted: true });
        setTimeout(() => location.reload(), 100);
    });

    // Modal controls
    closeBtn?.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
        updatePhaseUI();
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            updatePhaseUI();
        }
    });

    copyBtn?.addEventListener('click', async () => {
        const content = contentPre?.textContent || '';
        try {
            await navigator.clipboard.writeText(content);
            if (copyBtn) {
                copyBtn.textContent = '✅ ¡Copiado!';
                copyBtn.classList.add('copied');
            }
        } catch (error) {
            console.error('Copy failed:', error);
        }
    });
}

/**
 * Update phase UI without full reload
 */
function updatePhaseUI() {
    const state = State.getState();
    const deployState = state.deploymentEvaluation || {};

    const phaseEl = document.querySelector('.deploy-phase');
    const phaseContent = phaseEl?.querySelector('.phase-content');

    if (deployState.started && !deployState.completed) {
        phaseEl?.classList.add('active');
        if (phaseContent && !document.getElementById('confirm-deployment-done')) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'phase-actions';
            actionsDiv.innerHTML = `
                <button id="confirm-deployment-done" class="btn-success">
                    ✅ ¡Proyecto desplegado exitosamente!
                </button>
            `;
            phaseContent.appendChild(actionsDiv);

            document.getElementById('confirm-deployment-done')?.addEventListener('click', () => {
                State.setNestedValue('deploymentEvaluation.completed', true);
                State.setState({ step10SyncCompleted: true });
                setTimeout(() => location.reload(), 100);
            });
        }
    }
}

/**
 * Generate Deployment Prompt
 */
function generateDeploymentPrompt() {
    const state = State.getState();
    const projectName = state.step0?.antigravityProjectName || state.projectName || '{nombre_carpeta}';
    const softwareType = state.softwareType || 'aplicación';

    const typeMap = {
        'web_page': 'página web',
        'web_app': 'aplicación web',
        'mobile_app': 'aplicación móvil',
        'windows_program': 'programa de escritorio'
    };

    return `Actúa como un Ingeniero DevOps Senior especializado en despliegue de aplicaciones.

## Contexto:
El proyecto está ubicado en la carpeta **${projectName}**.
Es una ${typeMap[softwareType] || softwareType} que ha sido desarrollada, probada y verificada.
Ahora necesita ser desplegada a producción.

## Objetivo:
Guiar al usuario paso a paso para publicar su proyecto de forma segura y profesional.

## Proceso de Despliegue:

### 1. Análisis del Proyecto
- Revisar la estructura y tecnologías utilizadas
- Identificar la plataforma de hosting más adecuada
- Determinar requisitos de infraestructura

### 2. Preparación para Producción
- Crear build de producción optimizado
- Configurar variables de entorno de producción
- Verificar que no hay datos sensibles expuestos
- Optimizar assets (imágenes, CSS, JS)

### 3. Configuración del Hosting
Opciones según el tipo de proyecto:
- **Páginas estáticas**: Vercel, Netlify, GitHub Pages
- **Apps con backend**: Railway, Render, Heroku, DigitalOcean
- **Empresarial**: AWS, Azure, Google Cloud
- **Apps móviles**: App Store Connect, Google Play Console

### 4. Proceso de Despliegue
- Crear cuenta en la plataforma seleccionada (si no existe)
- Conectar repositorio o subir archivos
- Configurar dominio personalizado (si aplica)
- Configurar SSL/HTTPS
- Ejecutar despliegue

### 5. Verificación Post-Despliegue
- Verificar que la aplicación carga correctamente
- Probar funcionalidades críticas
- Verificar rendimiento y tiempos de carga
- Configurar monitoreo (opcional)

### 6. Documentación
- Proporcionar URL de producción
- Documentar credenciales de acceso al hosting
- Instrucciones para futuros despliegues

## Instrucciones:
1. Primero, analiza el proyecto y recomienda la mejor opción de hosting
2. Guía paso a paso, esperando confirmación del usuario
3. Resuelve cualquier error que surja durante el proceso
4. Al finalizar, confirma que el proyecto está en línea

## Importante:
- Prioriza opciones gratuitas o de bajo costo cuando sea posible
- Asegura que el despliegue sea reproducible
- Documenta todo para referencia futura`;
}

/**
 * Validate step
 */
export function validate(config, state) {
    // Deployment is the final step, always valid
    return true;
}

/**
 * Collect step data
 */
export function collectData(config, state) {
    return null;
}
