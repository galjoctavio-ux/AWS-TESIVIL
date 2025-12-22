// =============================================================================
// TESIVIL App Hub - UI Components
// =============================================================================

const Components = {
    /**
     * Genera el HTML de una tarjeta de aplicación
     * @param {Object} app - Datos de la aplicación
     * @returns {string} HTML de la tarjeta
     */
    appCard(app) {
        const categoryClass = this.getCategoryClass(app.categoria);
        const previewUrl = app.preview_url || 'assets/placeholder.svg';
        const iconUrl = app.icono_url || 'assets/placeholder.svg';

        return `
            <article class="app-card group" data-slug="${app.slug}">
                <div class="card-preview">
                    <img 
                        src="${previewUrl}" 
                        alt="${app.nombre} preview"
                        loading="lazy"
                        onerror="this.src='assets/placeholder.svg'"
                    />
                    <div class="card-overlay">
                        <span class="view-details">Ver Detalles →</span>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="card-header">
                        <img 
                            src="${iconUrl}" 
                            alt="${app.nombre} icon" 
                            class="card-icon"
                            onerror="this.src='assets/placeholder.svg'"
                        />
                        <div class="card-title-group">
                            <h3 class="card-title">${app.nombre}</h3>
                            <span class="card-category ${categoryClass}">${app.categoria || 'App'}</span>
                        </div>
                    </div>
                    
                    <p class="card-description">${app.descripcion_corta || 'Sin descripción disponible.'}</p>
                    
                    <button class="card-cta" onclick="navigateToApp('${app.slug}')">
                        Ver Detalles
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            </article>
        `;
    },

    /**
     * Genera el HTML de un skeleton loader
     * @returns {string} HTML del skeleton
     */
    skeletonCard() {
        return `
            <article class="app-card skeleton-card">
                <div class="card-preview skeleton-preview">
                    <div class="skeleton-shimmer"></div>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <div class="skeleton-icon skeleton-shimmer"></div>
                        <div class="card-title-group">
                            <div class="skeleton-title skeleton-shimmer"></div>
                            <div class="skeleton-category skeleton-shimmer"></div>
                        </div>
                    </div>
                    <div class="skeleton-description skeleton-shimmer"></div>
                    <div class="skeleton-description short skeleton-shimmer"></div>
                    <div class="skeleton-button skeleton-shimmer"></div>
                </div>
            </article>
        `;
    },

    /**
     * Genera múltiples skeleton loaders
     * @param {number} count - Número de skeletons
     * @returns {string} HTML de los skeletons
     */
    skeletons(count = CONFIG.SKELETON_COUNT) {
        return Array(count).fill(this.skeletonCard()).join('');
    },

    /**
     * Obtiene la clase CSS para la categoría
     * @param {string} categoria - Nombre de la categoría
     * @returns {string} Clase CSS
     */
    getCategoryClass(categoria) {
        if (!categoria) return 'category-default';
        const cat = categoria.toLowerCase();
        if (cat.includes('android')) return 'category-android';
        if (cat.includes('web')) return 'category-web';
        if (cat.includes('desktop')) return 'category-desktop';
        if (cat.includes('api')) return 'category-api';
        return 'category-default';
    },

    /**
     * Genera el HTML de estado vacío
     * @returns {string} HTML del estado vacío
     */
    emptyState() {
        return `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                <h3>No hay aplicaciones disponibles</h3>
                <p>Pronto agregaremos nuevas apps al catálogo.</p>
            </div>
        `;
    },

    /**
     * Genera el HTML de error
     * @param {string} message - Mensaje de error
     * @returns {string} HTML del error
     */
    errorState(message = 'Error al cargar las aplicaciones') {
        return `
            <div class="error-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <h3>${message}</h3>
                <p>Por favor, intenta recargar la página.</p>
                <button onclick="location.reload()" class="btn-primary">
                    Reintentar
                </button>
            </div>
        `;
    },

    /**
     * Genera el HTML de la lista de features
     * @param {Array} features - Lista de features
     * @returns {string} HTML de la lista
     */
    featuresList(features) {
        if (!features || !Array.isArray(features) || features.length === 0) {
            return '<p class="no-features">No hay funcionalidades listadas.</p>';
        }

        return `
            <ul class="features-list">
                ${features.map(feature => `
                    <li class="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span>${feature}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }
};
