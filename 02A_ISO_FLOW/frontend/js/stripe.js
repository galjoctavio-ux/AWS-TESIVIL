/**
 * IA-Flow - Stripe Integration
 * Handles Stripe embedded checkout for donations
 */

let stripe = null;
let apiUrl = '';
let checkoutInstance = null;

/**
 * Initialize Stripe
 */
export function initStripe(baseApiUrl) {
    apiUrl = baseApiUrl;
    console.log('💳 Stripe module initialized');
}

/**
 * Load Stripe.js dynamically
 */
async function loadStripeJs() {
    if (stripe) return stripe;

    // Check if already loaded
    if (window.Stripe) {
        stripe = window.Stripe;
        return stripe;
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://js.stripe.com/v3/';
        script.async = true;
        script.onload = () => {
            stripe = window.Stripe;
            resolve(stripe);
        };
        script.onerror = () => reject(new Error('Failed to load Stripe.js'));
        document.head.appendChild(script);
    });
}

/**
 * Create embedded checkout session
 */
export async function createEmbeddedCheckout(amount, onComplete) {
    try {
        // Get checkout session from backend
        const response = await fetch(`${apiUrl}/stripe/create-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                mode: 'embedded',
                returnUrl: window.location.origin + '/donation-success.html?session_id={CHECKOUT_SESSION_ID}'
            })
        });

        const data = await response.json();

        if (!data.clientSecret) {
            console.error('No client secret received');
            return { success: false, error: 'No client secret' };
        }

        // Load Stripe.js
        await loadStripeJs();

        // Get publishable key from backend or use default
        const stripeKey = data.publishableKey || 'pk_test_placeholder';
        const stripeInstance = window.Stripe(stripeKey);

        // Initialize embedded checkout
        const checkout = await stripeInstance.initEmbeddedCheckout({
            clientSecret: data.clientSecret,
            onComplete: async () => {
                // Payment completed
                console.log('💳 Payment completed successfully!');
                if (onComplete) {
                    onComplete({ success: true, sessionId: data.sessionId });
                }
            }
        });

        checkoutInstance = checkout;
        return { success: true, checkout, sessionId: data.sessionId };

    } catch (error) {
        console.error('Stripe embedded checkout error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Mount embedded checkout to a DOM element
 */
export function mountCheckout(elementId) {
    if (checkoutInstance) {
        checkoutInstance.mount(`#${elementId}`);
    }
}

/**
 * Destroy checkout instance
 */
export function destroyCheckout() {
    if (checkoutInstance) {
        checkoutInstance.destroy();
        checkoutInstance = null;
    }
}

/**
 * Create a checkout session and redirect to Stripe (legacy)
 */
export async function createCheckoutSession(amount = null) {
    try {
        const response = await fetch(`${apiUrl}/stripe/create-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount,
                successUrl: window.location.origin + '?donation=success&token={CHECKOUT_SESSION_ID}',
                cancelUrl: window.location.origin + '?donation=canceled'
            })
        });

        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
            return true;
        } else {
            console.error('No checkout URL received');
            return false;
        }
    } catch (error) {
        console.error('Stripe checkout error:', error);
        return false;
    }
}

/**
 * Verify a donation and get donor token
 */
export async function verifyDonation(sessionId) {
    try {
        const response = await fetch(`${apiUrl}/stripe/verify-donation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
        });

        const data = await response.json();

        if (data.success && data.donorToken) {
            localStorage.setItem('ia-flow-donor-token', data.donorToken);
            return {
                success: true,
                token: data.donorToken,
                amount: data.amount
            };
        }

        return { success: false };
    } catch (error) {
        console.error('Donation verification error:', error);
        return { success: false };
    }
}

// Export
export default {
    initStripe,
    createEmbeddedCheckout,
    mountCheckout,
    destroyCheckout,
    createCheckoutSession,
    verifyDonation
};
