/**
 * IA-Flow - Donation Popup Module
 * Non-blocking donation reminder popup
 */

let config = {
    onDonate: () => { },
    onContinue: () => { }
};

let isVisible = false;

// DOM Elements
let elements = {};

/**
 * Initialize donation popup
 */
function init(options) {
    config = { ...config, ...options };

    elements = {
        popup: document.getElementById('donation-popup'),
        closeButton: document.getElementById('close-popup'),
        donateButton: document.getElementById('popup-donate'),
        continueButton: document.getElementById('popup-continue')
    };

    setupEventListeners();

    console.log('💰 Donation popup initialized');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Close button
    elements.closeButton.addEventListener('click', hide);

    // Donate button
    elements.donateButton.addEventListener('click', () => {
        hide();
        config.onDonate();
    });

    // Continue button
    elements.continueButton.addEventListener('click', () => {
        hide();
        config.onContinue();
    });

    // Click outside to close
    elements.popup.addEventListener('click', (e) => {
        if (e.target === elements.popup) {
            hide();
            config.onContinue();
        }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isVisible) {
            hide();
            config.onContinue();
        }
    });
}

/**
 * Show the donation popup
 */
function show() {
    if (isVisible) return;

    isVisible = true;
    elements.popup.style.display = 'block';

    // Add entrance animation
    elements.popup.querySelector('.donation-popup-content').style.animation = 'slideInRight 0.4s ease';

    console.log('💡 Donation popup shown');
}

/**
 * Hide the donation popup
 */
function hide() {
    if (!isVisible) return;

    isVisible = false;
    elements.popup.style.display = 'none';
}

/**
 * Check if popup is visible
 */
function getIsVisible() {
    return isVisible;
}

// Export
export const DonationPopup = {
    init,
    show,
    hide,
    isVisible: getIsVisible
};
