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
        showError(i18n.t('appNotFound'));
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
        showError(i18n.t('appNotFound'));
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
            <p>${i18n.t('errorDesc')}</p>
            <a href="index.html" class="btn-primary">
                ${i18n.t('backToCatalog')}
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

    // Construir screenshots
    const screenshots = app.screenshots ?
        (typeof app.screenshots === 'string' ? JSON.parse(app.screenshots) : app.screenshots) :
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
            <h2 data-i18n="description">${i18n.t('description')}</h2>
            <div class="detail-description">
                ${formatDescription(app.descripcion_larga || app.descripcion_corta || 'Sin descripción disponible.')}
            </div>
        </section>
        
        <!-- Features -->
        ${features.length > 0 ? `
            <section class="detail-section">
                <h2 data-i18n="features">${i18n.t('features')}</h2>
                ${Components.featuresList(features)}
            </section>
        ` : ''}
        
        <!-- Screenshots Gallery -->
        ${screenshots.length > 0 ? `
            <section class="detail-section">
                <h2 data-i18n="screenshots">${i18n.t('screenshots')}</h2>
                <div class="screenshots-gallery">
                    ${screenshots.map((url, index) => `
                        <div class="screenshot-item" onclick="openLightbox('${url}')">
                            <img src="${url}" alt="Screenshot ${index + 1}" loading="lazy" />
                        </div>
                    `).join('')}
                </div>
            </section>
        ` : ''}
        
        <!-- Actions -->
        <div class="detail-actions">
            ${ctaButtons}
        </div>
    `;

    // Actualizar título de la página
    document.title = `${app.nombre} - TESIVIL App Hub`;

    // Actualizar links legales en el footer
    updateLegalLinks(app.slug);
}

/**
 * Construye los botones CTA según el tipo de app
 * @param {Object} app - Datos de la aplicación
 * @returns {string} HTML de los botones
 */
function buildCTAButtons(app) {
    const buttons = [];

    // Botón de descarga APK
    if (app.apk_filename || app.drive_id) {
        const filename = app.apk_filename || app.drive_id;
        const downloadUrl = AppAPI.buildDownloadUrl(filename);
        buttons.push(`
            <a href="${downloadUrl}" class="btn-primary" download>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span data-i18n="downloadApk">${i18n.t('downloadApk')}</span>
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
                <span data-i18n="visitWebApp">${i18n.t('visitWebApp')}</span>
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
            <span data-i18n="backToCatalog">${i18n.t('backToCatalog')}</span>
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

// =============================================================================
// Lightbox Functions
// =============================================================================

/**
 * Abre el lightbox con una imagen
 * @param {string} src - URL de la imagen
 */
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightbox-image');

    image.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Cerrar lightbox con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// =============================================================================
// Legal Links Functions
// =============================================================================

/**
 * Mapeo de slugs de apps a sus documentos legales
 */
const LEGAL_DOCS = {
    'synapse-ai': {
        terms: 'synapse-ai/terminos.html',
        privacy: 'synapse-ai/privacidad.html'
    }
    // Agregar más apps aquí según sea necesario
};

/**
 * Actualiza los links legales en el footer según la app
 * @param {string} slug - Slug de la aplicación
 */
function updateLegalLinks(slug) {
    const container = document.getElementById('legal-links');
    if (!container) return;

    const docs = LEGAL_DOCS[slug];

    if (docs) {
        const termsLabel = i18n.currentLang === 'es' ? 'Términos y Condiciones' : 'Terms & Conditions';
        const privacyLabel = i18n.currentLang === 'es' ? 'Política de Privacidad' : 'Privacy Policy';

        container.innerHTML = `
            <a href="${docs.terms}" target="_blank" rel="noopener">${termsLabel}</a>
            <span class="legal-separator">|</span>
            <a href="${docs.privacy}" target="_blank" rel="noopener">${privacyLabel}</a>
        `;
    } else {
        container.innerHTML = '';
    }
}
