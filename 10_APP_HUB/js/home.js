// =============================================================================
// TESIVIL App Hub - Home Page Logic
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initHome();
});

/**
 * Inicializa la página principal
 */
async function initHome() {
    const appsContainer = document.getElementById('apps-container');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Mostrar skeletons mientras carga
    appsContainer.innerHTML = Components.skeletons();

    // Cargar aplicaciones
    await loadApps();

    // Setup filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilterClick(btn));
    });
}

/**
 * Carga y renderiza las aplicaciones
 * @param {string} categoria - Categoría para filtrar
 */
async function loadApps(categoria = null) {
    const appsContainer = document.getElementById('apps-container');

    try {
        const apps = await AppAPI.getApps(categoria);

        if (apps.length === 0) {
            appsContainer.innerHTML = Components.emptyState();
            return;
        }

        // Renderizar tarjetas
        const cardsHTML = apps.map(app => Components.appCard(app)).join('');
        appsContainer.innerHTML = cardsHTML;

        // Setup click handlers
        setupCardClicks();

    } catch (error) {
        console.error('Error loading apps:', error);
        appsContainer.innerHTML = Components.errorState();
    }
}

/**
 * Configura los click handlers en las tarjetas
 */
function setupCardClicks() {
    const cards = document.querySelectorAll('.app-card:not(.skeleton-card)');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Evitar navegación si se clickeó el botón CTA
            if (e.target.closest('.card-cta')) return;

            const slug = card.dataset.slug;
            if (slug) {
                navigateToApp(slug);
            }
        });
    });
}

/**
 * Navega a la página de detalle de la app
 * @param {string} slug - Slug de la aplicación
 */
function navigateToApp(slug) {
    window.location.href = `app.html?slug=${encodeURIComponent(slug)}`;
}

/**
 * Maneja el click en los botones de filtro
 * @param {HTMLElement} clickedBtn - Botón clickeado
 */
async function handleFilterClick(clickedBtn) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const appsContainer = document.getElementById('apps-container');

    // Actualizar estado activo
    filterButtons.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    // Obtener categoría
    const categoria = clickedBtn.dataset.category;

    // Mostrar skeletons
    appsContainer.innerHTML = Components.skeletons();

    // Recargar con filtro
    await loadApps(categoria);
}
