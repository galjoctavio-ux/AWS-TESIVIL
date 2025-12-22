import Stripe from 'stripe';

// ═══════════════════════════════════════════════════════════════
// STRIPE SERVICE
// Integración con Stripe para pagos de Academia
// ═══════════════════════════════════════════════════════════════

// Lazy initialization to avoid errors on startup if key is not set
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
    if (!_stripe) {
        const apiKey = process.env.STRIPE_SECRET_KEY;
        if (!apiKey) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }
        _stripe = new Stripe(apiKey, {
            apiVersion: '2025-12-15.clover',
        });
    }
    return _stripe;
}

// Getter for compatibility with existing code
const stripe = new Proxy({} as Stripe, {
    get: (_, prop) => {
        const instance = getStripe();
        return (instance as any)[prop];
    },
});

export interface CreateCheckoutParams {
    sessionId: string;        // ID de academy_sessions
    sessionTitle: string;
    priceMxn: number;
    email: string;
    whatsapp?: string;
    waitlistId?: string;
    successUrl: string;
    cancelUrl: string;
}

export interface CheckoutSessionResult {
    checkoutUrl: string;
    checkoutSessionId: string;
}

/**
 * Crear una sesión de checkout de Stripe
 */
export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutSessionResult> {
    const { sessionId, sessionTitle, priceMxn, email, whatsapp, waitlistId, successUrl, cancelUrl } = params;

    // Crear o recuperar cliente de Stripe
    let customer: Stripe.Customer | undefined;
    const existingCustomers = await stripe.customers.list({ email, limit: 1 });

    if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
    } else {
        customer = await stripe.customers.create({
            email,
            metadata: {
                whatsapp: whatsapp || '',
                waitlist_id: waitlistId || '',
                source: 'synapse_academy',
            },
        });
    }

    // Convertir MXN a centavos
    const unitAmount = Math.round(priceMxn * 100);

    // Crear sesión de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'mxn',
                    unit_amount: unitAmount,
                    product_data: {
                        name: sessionTitle,
                        description: 'Acceso a capacitación SYNAPSE Academy',
                    },
                },
                quantity: 1,
            },
        ],
        metadata: {
            academy_session_id: sessionId,
            waitlist_id: waitlistId || '',
            whatsapp: whatsapp || '',
        },
        customer_email: email,
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${cancelUrl}?canceled=true`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expira en 30 minutos
    });

    return {
        checkoutUrl: checkoutSession.url!,
        checkoutSessionId: checkoutSession.id,
    };
}

/**
 * Verificar firma del webhook de Stripe
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Recuperar detalles de una sesión de checkout
 */
export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['customer', 'payment_intent'],
    });
}

/**
 * Obtener el email de un cliente de Stripe
 */
export async function getCustomerEmail(customerId: string): Promise<string | null> {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) return null;
    return customer.email;
}

export { stripe };
