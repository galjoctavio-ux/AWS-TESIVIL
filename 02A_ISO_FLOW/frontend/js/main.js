/**
 * IA-Flow - Main Application Entry Point
 */

import { Chat } from './chat.js';
import { DonationPopup } from './donationPopup.js';
import { createAntigravityBlock } from './antigravityBlock.js';
import { initStripe } from './stripe.js';

// Configuration
const CONFIG = {
    API_URL: 'http://localhost:3000/api',
    RECAPTCHA_SITE_KEY: '', // Will be loaded from backend
    DONATION_POPUP_QUERIES: 3,
    DONATION_POPUP_WINDOW_MS: 300000 // 5 minutes
};

// Application State
const state = {
    captchaVerified: false,
    captchaToken: null,
    donorToken: localStorage.getItem('ia-flow-donor-token'),
    queryCount: 0,
    queryWindowStart: Date.now(),
    donationPopupShown: false
};

// DOM Elements
const elements = {
    captchaOverlay: document.getElementById('captcha-overlay'),
    chatContainer: document.getElementById('chat-container'),
    loadingOverlay: document.getElementById('loading-overlay'),
    recaptchaContainer: document.getElementById('recaptcha-container'),
    donateButton: document.getElementById('donate-button')
};

/**
 * Initialize the application
 */
async function init() {
    console.log('🚀 IA-Flow initializing...');

    try {
        // Load configuration from backend
        await loadConfig();

        // Initialize reCAPTCHA
        initRecaptcha();

        // Initialize Stripe
        initStripe(CONFIG.API_URL);

        // Initialize donation popup
        DonationPopup.init({
            onDonate: handleDonateClick,
            onContinue: () => console.log('User continued without donation')
        });

        // Setup event listeners
        setupEventListeners();

        // Check if user is a donor
        if (state.donorToken) {
            await verifyDonorStatus();
        }

        // DEV MODE: Initialize chat without captcha for testing
        // TODO: Remove this block when captcha is re-enabled
        if (!state.captchaVerified) {
            console.log('⚠️ DEV MODE: Initializing chat without CAPTCHA verification');
            state.captchaVerified = true;
            Chat.init({
                apiUrl: CONFIG.API_URL,
                captchaToken: 'dev-mode-token',
                donorToken: state.donorToken,
                onQuery: handleQuerySent
            });
        }

        console.log('✅ IA-Flow initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize IA-Flow:', error);
        showError('Error al inicializar la aplicación. Por favor, recarga la página.');
    }
}

/**
 * Load configuration from backend
 */
async function loadConfig() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/config`);
        if (response.ok) {
            const config = await response.json();
            CONFIG.RECAPTCHA_SITE_KEY = config.recaptchaSiteKey;
            CONFIG.STRIPE_PUBLISHABLE_KEY = config.stripePublishableKey;
        }
    } catch (error) {
        console.warn('Could not load config from backend, using defaults');
    }
}

/**
 * Initialize Google reCAPTCHA
 */
function initRecaptcha() {
    if (CONFIG.RECAPTCHA_SITE_KEY) {
        elements.recaptchaContainer.setAttribute('data-sitekey', CONFIG.RECAPTCHA_SITE_KEY);
    }

    // Expose callback to window for reCAPTCHA
    window.onCaptchaSuccess = handleCaptchaSuccess;
}

/**
 * Handle successful CAPTCHA verification
 */
async function handleCaptchaSuccess(token) {
    console.log('📋 CAPTCHA completed, verifying...');
    showLoading(true);

    try {
        const response = await fetch(`${CONFIG.API_URL}/captcha/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.success) {
            state.captchaVerified = true;
            state.captchaToken = token;

            // Hide CAPTCHA, show chat
            elements.captchaOverlay.style.display = 'none';
            elements.chatContainer.style.display = 'flex';

            // Initialize chat
            Chat.init({
                apiUrl: CONFIG.API_URL,
                captchaToken: state.captchaToken,
                donorToken: state.donorToken,
                onQuery: handleQuerySent
            });

            console.log('✅ CAPTCHA verified successfully');
        } else {
            showError('Error de verificación. Por favor, intenta de nuevo.');
            grecaptcha.reset();
        }
    } catch (error) {
        console.error('CAPTCHA verification failed:', error);
        showError('Error de conexión. Por favor, intenta de nuevo.');
        grecaptcha.reset();
    } finally {
        showLoading(false);
    }
}

/**
 * Handle query sent - track for donation popup
 */
function handleQuerySent() {
    const now = Date.now();

    // Reset window if expired
    if (now - state.queryWindowStart > CONFIG.DONATION_POPUP_WINDOW_MS) {
        state.queryCount = 0;
        state.queryWindowStart = now;
        state.donationPopupShown = false;
    }

    state.queryCount++;

    // Show donation popup if not a donor and threshold reached
    if (!state.donorToken &&
        !state.donationPopupShown &&
        state.queryCount >= CONFIG.DONATION_POPUP_QUERIES) {
        DonationPopup.show();
        state.donationPopupShown = true;
    }
}

/**
 * Handle donate button click
 */
async function handleDonateClick() {
    // Get the amount from the input field
    const amountInput = document.getElementById('donation-amount');
    let amount = 5; // Default $5

    if (amountInput) {
        const inputValue = parseInt(amountInput.value);
        if (inputValue && inputValue >= 1) {
            amount = inputValue;
        } else if (inputValue && inputValue < 1) {
            showError('El monto mínimo es $1 USD');
            return;
        }
    }

    showLoading(true);

    try {
        const response = await fetch(`${CONFIG.API_URL}/stripe/create-checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: amount * 100 }) // Convert to cents
        });

        const data = await response.json();

        if (data.url) {
            // Open Stripe Checkout in a popup window
            const width = 500;
            const height = 700;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;

            const popup = window.open(
                data.url,
                'stripe-checkout',
                `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
            );

            // Check if popup was blocked
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                // Fallback to redirect if popup blocked
                window.location.href = data.url;
            }
        } else {
            showError('Error al crear la sesión de pago.');
        }
    } catch (error) {
        console.error('Stripe checkout failed:', error);
        showError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
        showLoading(false);
    }
}

/**
 * Verify if user is a donor
 */
async function verifyDonorStatus() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/donor/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${state.donorToken}`
            }
        });

        const data = await response.json();

        if (!data.valid) {
            // Token is invalid, remove it
            localStorage.removeItem('ia-flow-donor-token');
            state.donorToken = null;
        } else {
            console.log('✅ Donor status verified');
        }
    } catch (error) {
        console.warn('Could not verify donor status:', error);
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Footer donate button - shows the popup first
    elements.donateButton.addEventListener('click', () => {
        DonationPopup.show();
    });

    // Listen for messages from donation popup
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'donation-success') {
            showSuccess('¡Gracias por tu donación! Tu límite de consultas ha sido aumentado.');
            // You could verify the session and create a donor token here
        }
    });

    // Check for donation success in URL params (fallback for direct navigation)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('donation') === 'success') {
        const donorToken = urlParams.get('token');
        if (donorToken) {
            localStorage.setItem('ia-flow-donor-token', donorToken);
            state.donorToken = donorToken;
        }
        showSuccess('¡Gracias por tu donación! Tu límite de consultas ha sido aumentado.');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

/**
 * Show error message
 */
function showError(message) {
    showToast({
        type: 'error',
        icon: '❌',
        title: 'Error',
        message: message
    });
}

/**
 * Show success message
 */
function showSuccess(message) {
    showToast({
        type: 'success',
        icon: '🎉',
        title: '¡Gracias!',
        message: message
    });
}

/**
 * Show toast notification
 */
function showToast({ type = 'info', icon = '💡', title, message, duration = 5000 }) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for global access
export { state, CONFIG, createAntigravityBlock };
