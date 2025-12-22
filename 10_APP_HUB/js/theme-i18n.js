// =============================================================================
// TESIVIL App Hub - Theme & Language Manager
// =============================================================================

const ThemeManager = {
    STORAGE_KEY: 'tesivil-theme',

    init() {
        // Check stored preference or system preference
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            this.setTheme(stored);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            this.setTheme('light');
        } else {
            this.setTheme('dark');
        }

        // Listen for system changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
        this.updateButton(theme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        this.setTheme(current === 'dark' ? 'light' : 'dark');
    },

    updateButton(theme) {
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.innerHTML = theme === 'dark'
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
            btn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
        }
    }
};

// =============================================================================
// Language Manager (i18n)
// =============================================================================

const i18n = {
    STORAGE_KEY: 'tesivil-lang',
    currentLang: 'es',

    translations: {
        es: {
            heroTitle: 'Ecosistema TESIVIL',
            heroSubtitle: 'Descubre todas nuestras aplicaciones. Soluciones Android, Web Apps y herramientas de desarrollo para potenciar tu productividad.',
            filterAll: 'Todas',
            filterAndroid: '📱 Android',
            filterWeb: '🌐 Web App',
            filterDesktop: '💻 Desktop',
            filterApi: '🔧 API/Servicio',
            viewDetails: 'Ver Detalles',
            backToCatalog: 'Volver al catálogo',
            description: 'Descripción',
            features: 'Funcionalidades',
            screenshots: 'Capturas de pantalla',
            downloadApk: 'Descargar APK',
            visitWebApp: 'Visitar Web App',
            noApps: 'No hay aplicaciones disponibles',
            noAppsDesc: 'Pronto agregaremos nuevas apps al catálogo.',
            errorLoading: 'Error al cargar las aplicaciones',
            errorDesc: 'Por favor, intenta recargar la página.',
            retry: 'Reintentar',
            appNotFound: 'Aplicación no encontrada',
            copyright: 'Todos los derechos reservados.'
        },
        en: {
            heroTitle: 'TESIVIL Ecosystem',
            heroSubtitle: 'Discover all our applications. Android solutions, Web Apps, and development tools to boost your productivity.',
            filterAll: 'All',
            filterAndroid: '📱 Android',
            filterWeb: '🌐 Web App',
            filterDesktop: '💻 Desktop',
            filterApi: '🔧 API/Service',
            viewDetails: 'View Details',
            backToCatalog: 'Back to catalog',
            description: 'Description',
            features: 'Features',
            screenshots: 'Screenshots',
            downloadApk: 'Download APK',
            visitWebApp: 'Visit Web App',
            noApps: 'No applications available',
            noAppsDesc: 'We will add new apps to the catalog soon.',
            errorLoading: 'Error loading applications',
            errorDesc: 'Please try reloading the page.',
            retry: 'Retry',
            appNotFound: 'Application not found',
            copyright: 'All rights reserved.'
        }
    },

    init() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        this.currentLang = stored || 'es';
        this.updateButton();
        this.applyTranslations();
    },

    t(key) {
        return this.translations[this.currentLang][key] || key;
    },

    toggle() {
        this.currentLang = this.currentLang === 'es' ? 'en' : 'es';
        localStorage.setItem(this.STORAGE_KEY, this.currentLang);
        this.updateButton();
        this.applyTranslations();

        // Reload apps to update card texts
        if (typeof loadApps === 'function') {
            loadApps();
        }
    },

    updateButton() {
        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.textContent = this.currentLang === 'es' ? 'EN' : 'ES';
            btn.setAttribute('aria-label', this.currentLang === 'es' ? 'Switch to English' : 'Cambiar a Español');
        }
    },

    applyTranslations() {
        // Update static elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[this.currentLang][key]) {
                el.textContent = this.translations[this.currentLang][key];
            }
        });
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    i18n.init();
});
