/**
 * IA-Flow - Stripe Routes
 * Handles Stripe checkout and webhooks for donations
 */

import express from 'express';
import Stripe from 'stripe';
import { createDonorToken } from '../services/donorService.js';

const router = express.Router();

// Lazy initialization of Stripe (to ensure env vars are loaded)
let stripe = null;
function getStripe() {
    if (!stripe) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
            apiVersion: '2023-10-16'
        });
    }
    return stripe;
}

// Donation amounts (in cents)
const DONATION_AMOUNTS = {
    small: 500,    // $5 USD
    medium: 1000,  // $10 USD
    large: 2500    // $25 USD
};

/**
 * POST /api/stripe/create-checkout
 * Create a Stripe Checkout session (supports redirect and embedded modes)
 */
router.post('/create-checkout', async (req, res) => {
    try {
        const { amount, successUrl, cancelUrl, mode, returnUrl } = req.body;

        // Determine amount - minimum $1 (100 cents)
        let donationAmount = 500; // Default $5

        if (amount) {
            if (typeof amount === 'number') {
                // If amount is in dollars, convert to cents
                donationAmount = amount < 100 ? amount * 100 : amount;
                // Ensure minimum $1
                if (donationAmount < 100) donationAmount = 100;
            } else if (typeof amount === 'string' && DONATION_AMOUNTS[amount]) {
                donationAmount = DONATION_AMOUNTS[amount];
            }
        }

        // Check if embedded mode is requested
        const isEmbedded = mode === 'embedded';

        // Base session config
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Donación a IA-Flow',
                        description: 'Ayuda a mantener el servicio activo y aumenta tu límite de consultas'
                    },
                    unit_amount: donationAmount
                },
                quantity: 1
            }],
            mode: 'payment',
            metadata: {
                type: 'donation',
                source: 'ia-flow'
            }
        };

        if (isEmbedded) {
            // Embedded checkout mode
            sessionConfig.ui_mode = 'embedded';
            sessionConfig.return_url = returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}?donation=success&session_id={CHECKOUT_SESSION_ID}`;
        } else {
            // Redirect checkout mode
            sessionConfig.success_url = successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donation-success.html?session_id={CHECKOUT_SESSION_ID}`;
            sessionConfig.cancel_url = cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}?donation=canceled`;
        }

        // Create checkout session
        const session = await getStripe().checkout.sessions.create(sessionConfig);

        if (isEmbedded) {
            // Return client secret for embedded checkout
            res.json({
                clientSecret: session.client_secret,
                sessionId: session.id,
                publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
            });
        } else {
            // Return URL for redirect checkout
            res.json({
                url: session.url,
                sessionId: session.id
            });
        }

    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({
            error: 'Error al crear sesión de pago',
            details: error.message
        });
    }
});

/**
 * POST /api/stripe/verify-donation
 * Verify a completed donation and generate donor token
 */
router.post('/verify-donation', async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID requerido' });
        }

        // Retrieve the session from Stripe
        const session = await getStripe().checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return res.json({
                success: false,
                error: 'Pago no completado'
            });
        }

        // Create donor token
        const donorToken = createDonorToken({
            sessionId: session.id,
            amount: session.amount_total,
            currency: session.currency,
            email: session.customer_details?.email
        });

        res.json({
            success: true,
            donorToken,
            amount: session.amount_total / 100,
            currency: session.currency.toUpperCase()
        });

    } catch (error) {
        console.error('Donation verification error:', error);
        res.status(500).json({
            error: 'Error al verificar donación'
        });
    }
});

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.warn('⚠️ Stripe webhook secret not configured');
        return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
        event = getStripe().webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log(`✅ Payment completed: ${session.id}`);

            // Create donor token if not already created
            if (session.payment_status === 'paid' && session.metadata?.type === 'donation') {
                const donorToken = createDonorToken({
                    sessionId: session.id,
                    amount: session.amount_total,
                    currency: session.currency,
                    email: session.customer_details?.email
                });
                console.log(`🎁 Donor token created for session ${session.id}`);
            }
            break;

        case 'payment_intent.failed':
            const failedPayment = event.data.object;
            console.log(`❌ Payment failed: ${failedPayment.id}`);
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

/**
 * GET /api/stripe/donation-options
 * Get available donation amounts
 */
router.get('/donation-options', (req, res) => {
    res.json({
        options: [
            { id: 'small', amount: DONATION_AMOUNTS.small / 100, label: '$5 USD' },
            { id: 'medium', amount: DONATION_AMOUNTS.medium / 100, label: '$10 USD', recommended: true },
            { id: 'large', amount: DONATION_AMOUNTS.large / 100, label: '$25 USD' }
        ],
        currency: 'USD',
        benefits: [
            'Aumenta tu límite de consultas diarias de 20 a 50',
            'Sin popup de donación por 30 días',
            'Ayuda a mantener el servicio gratuito para todos'
        ]
    });
});

export default router;
