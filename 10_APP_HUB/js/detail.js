// =============================================================================
// TESIVIL App Hub - Detail Page Logic
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initDetailPage();
});

/**
 * Inicializa la página de detalle
 */
async function initDetailPage() {
    // Obtener slug de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    const id = urlParams.get('id');

    if (!slug && !id) {
        showError('No se especificó una aplicación');
        return;
    }

    // Mostrar loading
    showLoading();

    // Cargar datos de la app
    let app;
    if (slug) {
        app = await AppAPI.getAppBySlug(slug);
    } else {
        app = await AppAPI.getAppById(id);
    }

    if (!app) {
        showError('Aplicación no encontrada');
        return;
    }

    // Renderizar detalle
    renderAppDetail(app);
}

/**
 * Muestra el estado de carga
 */
function showLoading() {
    const container = document.getElementById('detail-container');
    container.innerHTML = `
        <div class="loading-state" style="text-align: center; padding: 4rem;">
            <div class="skeleton-shimmer" style="width: 100px; height: 100px; border-radius: 1.5rem; margin: 0 auto 1.5rem;"></div>
            <div class="skeleton-shimmer" style="width: 200px; height: 32px; border-radius: 0.5rem; margin: 0 auto 1rem;"></div>
            <div class="skeleton-shimmer" style="width: 100px; height: 24px; border-radius: 9999px; margin: 0 auto;"></div>
        </div>
    `;
}

/**
 * Muestra mensaje de error
 * @param {string} message - Mensaje de error
 */
function showError(message) {
    const container = document.getElementById('detail-container');
    container.innerHTML = `
        <div class="error-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3>${message}</h3>
            <p>Verifica el enlace e intenta de nuevo.</p>
            <a href="index.html" class="btn-primary">
                Volver al catálogo
            </a>
        </div>
    `;
}

/**
 * Renderiza los detalles de la aplicación
 * @param {Object} app - Datos de la aplicación
 */
function renderAppDetail(app) {
    const container = document.getElementById('detail-container');
    const categoryClass = Components.getCategoryClass(app.categoria);

    // Construir features
    const features = app.features ?
        (typeof app.features === 'string' ? JSON.parse(app.features) : app.features) :
        [];

    // Construir CTAs
    const ctaButtons = buildCTAButtons(app);

    container.innerHTML = `
        <!-- Header -->
        <div class="detail-header">
            <img 
                src="${app.icono_url || 'assets/placeholder.svg'}" 
                alt="${app.nombre} icon" 
                class="detail-icon"
                onerror="this.src='assets/placeholder.svg'"
            />
            <div class="detail-info">
                <h1 class="detail-title">${app.nombre}</h1>
                <span class="detail-category ${categoryClass}">${app.categoria || 'Aplicación'}</span>
            </div>
        </div>
        
        <!-- Preview Image -->
        ${app.preview_url ? `
            <img 
                src="${app.preview_url}" 
                alt="${app.nombre} preview" 
                class="detail-preview"
                onerror="this.style.display='none'"
            />
        ` : ''}
        
        <!-- Description -->
        <section class="detail-section">
            <h2>Descripción</h2>
            <div class="detail-description">
                ${formatDescription(app.descripcion_larga || app.descripcion_corta || 'Sin descripción disponible.')}
            </div>
        </section>
        
        <!-- Features -->
        ${features.length > 0 ? `
            <section class="detail-section">
                <h2>Funcionalidades</h2>
                ${Components.featuresList(features)}
            </section>
        ` : ''}
        
        <!-- Actions -->
        <div class="detail-actions">
            ${ctaButtons}
        </div>
    `;

    // Actualizar título de la página
    document.title = `${app.nombre} - TESIVIL App Hub`;
}

/**
 * Construye los botones CTA según el tipo de app
 * @param {Object} app - Datos de la aplicación
 * @returns {string} HTML de los botones
 */
function buildCTAButtons(app) {
    const buttons = [];

    // Botón de descarga APK
    if (app.drive_id) {
        const downloadUrl = AppAPI.buildDriveDownloadUrl(app.drive_id);
        buttons.push(`
            <a href="${downloadUrl}" class="btn-primary" target="_blank" rel="noopener">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Descargar APK
            </a>
        `);
    }

    // Botón de Web App
    if (app.url_web) {
        buttons.push(`
            <a href="${app.url_web}" class="btn-primary" target="_blank" rel="noopener">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Visitar Web App
            </a>
        `);
    }

    // Botón de volver
    buttons.push(`
        <a href="index.html" class="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver al catálogo
        </a>
    `);

    return buttons.join('');
}

/**
 * Formatea la descripción (soporta markdown básico)
 * @param {string} text - Texto a formatear
 * @returns {string} HTML formateado
 */
function formatDescription(text) {
    // Convertir saltos de línea
    let formatted = text.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br>');

    // Envolver en párrafos si no está ya
    if (!formatted.startsWith('<p>')) {
        formatted = '<p>' + formatted + '</p>';
    }

    return formatted;
}
