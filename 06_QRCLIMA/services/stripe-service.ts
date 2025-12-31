/**
 * Stripe Payment Service
 * 
 * Native payment processing using Stripe SDK.
 * Requires a development/production build (not Expo Go).
 */

import { Alert } from 'react-native';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Stripe Price IDs - Creados en el dashboard de Stripe
export const STRIPE_PRICES = {
    PRO_MONTHLY: 'price_pro_monthly_99',
    PRO_YEARLY: 'price_pro_yearly_999',
};

export const STRIPE_AMOUNTS = {
    PRO_MONTHLY: 9900,  // $99.00 MXN
    PRO_YEARLY: 99900,  // $999.00 MXN
};

export const TOKEN_PACK = {
    tokens: 50,
    priceMxn: 19,
    priceInCents: 1900,
};

export interface StripePaymentParams {
    userId: string;
    userEmail: string;
    planType: 'monthly' | 'yearly';
}

export interface PaymentSheetParams {
    paymentIntent: string;
    ephemeralKey: string;
    customer: string;
}

export interface StripePaymentResult {
    success: boolean;
    error?: string;
}

/**
 * Initiate a native payment using Stripe Payment Sheet
 */
export const initiateNativePayment = async (
    params: StripePaymentParams
): Promise<StripePaymentResult> => {
    try {
        const functions = getFunctions();
        const createPaymentSheetParams = httpsCallable(functions, 'createPaymentSheetParams');

        // 1. Create PaymentIntent on backend
        const result = await createPaymentSheetParams({
            userId: params.userId,
            userEmail: params.userEmail,
            planType: params.planType,
            amount: params.planType === 'monthly' ? STRIPE_AMOUNTS.PRO_MONTHLY : STRIPE_AMOUNTS.PRO_YEARLY,
        });

        const data = result.data as PaymentSheetParams;

        if (!data.paymentIntent || !data.ephemeralKey || !data.customer) {
            throw new Error('Invalid payment sheet parameters from server');
        }

        // 2. Initialize Payment Sheet
        const { error: initError } = await initPaymentSheet({
            paymentIntentClientSecret: data.paymentIntent,
            customerEphemeralKeySecret: data.ephemeralKey,
            customerId: data.customer,
            merchantDisplayName: 'QRclima',
            googlePay: {
                merchantCountryCode: 'MX',
                testEnv: __DEV__,
            },
            defaultBillingDetails: {
                email: params.userEmail,
            },
        });

        if (initError) {
            console.error('Payment Sheet init error:', initError);
            throw new Error(initError.message);
        }

        // 3. Present Payment Sheet
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
            if (presentError.code === 'Canceled') {
                console.log('User canceled payment');
                return { success: false, error: 'Pago cancelado' };
            }
            console.error('Payment Sheet present error:', presentError);
            throw new Error(presentError.message);
        }

        // 4. Payment successful
        console.log('Payment successful!');
        return { success: true };

    } catch (error: any) {
        console.error('Payment error:', error);
        Alert.alert('Error de pago', error.message || 'No se pudo procesar el pago');
        return { success: false, error: error.message };
    }
};

/**
 * Wrapper function for initiating Stripe payment
 */
export const initiateStripePayment = async (
    params: StripePaymentParams
): Promise<boolean> => {
    const result = await initiateNativePayment(params);
    return result.success;
};

/**
 * Verify if user has active PRO subscription
 */
export const verifyPaymentStatus = async (userId: string): Promise<boolean> => {
    try {
        const { getUserProfile, isUserPro } = await import('./user-service');
        const profile = await getUserProfile(userId);
        return isUserPro(profile);
    } catch (error) {
        console.error('Error verifying payment status:', error);
        return false;
    }
};

// ============================================
// COMPRA DE TOKENS (MICROPAGOS)
// ============================================

export interface TokenPurchaseParams {
    userId: string;
    userEmail: string;
}

/**
 * Purchase token pack using native Payment Sheet
 */
export const purchaseTokens = async (
    params: TokenPurchaseParams
): Promise<{ success: boolean; tokensAdded?: number; error?: string }> => {
    try {
        console.log('🛒 [TokenPurchase] Starting purchase flow...');
        console.log('🛒 [TokenPurchase] User:', params.userId);
        console.log('🛒 [TokenPurchase] Amount:', TOKEN_PACK.priceInCents, 'cents');
        console.log('🛒 [TokenPurchase] Tokens:', TOKEN_PACK.tokens);

        const functions = getFunctions();
        const createTokenPurchaseIntent = httpsCallable(functions, 'createTokenPurchaseIntent');

        // 1. Create PaymentIntent for tokens
        console.log('🛒 [TokenPurchase] Calling Cloud Function...');
        const result = await createTokenPurchaseIntent({
            userId: params.userId,
            userEmail: params.userEmail,
            amount: TOKEN_PACK.priceInCents,
            tokensAmount: TOKEN_PACK.tokens,
        });

        console.log('🛒 [TokenPurchase] Cloud Function response:', JSON.stringify(result.data));
        const data = result.data as PaymentSheetParams;

        if (!data.paymentIntent) {
            console.error('🛒 [TokenPurchase] No paymentIntent in response!');
            throw new Error('No se recibió respuesta del servidor');
        }

        // 2. Initialize Payment Sheet
        console.log('🛒 [TokenPurchase] Initializing Payment Sheet...');
        const { error: initError } = await initPaymentSheet({
            paymentIntentClientSecret: data.paymentIntent,
            customerEphemeralKeySecret: data.ephemeralKey,
            customerId: data.customer,
            merchantDisplayName: 'QRclima',
            googlePay: {
                merchantCountryCode: 'MX',
                testEnv: __DEV__,
            },
        });

        if (initError) {
            console.error('🛒 [TokenPurchase] Init error:', initError);
            throw new Error(initError.message);
        }

        // 3. Present Payment Sheet
        console.log('🛒 [TokenPurchase] Presenting Payment Sheet...');
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
            if (presentError.code === 'Canceled') {
                console.log('🛒 [TokenPurchase] User canceled');
                return { success: false, error: 'Compra cancelada' };
            }
            console.error('🛒 [TokenPurchase] Present error:', presentError);
            throw new Error(presentError.message);
        }

        // 4. Success - tokens will be added via webhook
        console.log('🛒 [TokenPurchase] ✅ Payment successful! Tokens will be added via webhook.');

        Alert.alert(
            '✅ ¡Compra exitosa!',
            `Tus ${TOKEN_PACK.tokens} tokens se agregarán a tu wallet en unos segundos.\n\nDesliza hacia abajo para refrescar tu balance.`
        );

        return { success: true, tokensAdded: TOKEN_PACK.tokens };

    } catch (error: any) {
        console.error('🛒 [TokenPurchase] ERROR:', error);
        Alert.alert('Error', error.message || 'No se pudo completar la compra');
        return { success: false, error: error.message };
    }
};

// ============================================
// COMPRA DE PRODUCTOS MXN
// ============================================

export interface ProductPurchaseParams {
    userId: string;
    userEmail: string;
    productId: string;
    productName: string;
    amountMxn: number; // Precio en pesos (no centavos)
    shippingAddress?: {
        fullName: string;
        phone: string;
        street: string;
        neighborhood?: string;
        city: string;
        state: string;
        postalCode: string;
        references?: string;
    };
}

/**
 * Purchase a product using native Payment Sheet (Stripe)
 */
export const purchaseProduct = async (
    params: ProductPurchaseParams
): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    try {
        console.log('🛍️ [ProductPurchase] Starting purchase flow...');
        console.log('🛍️ [ProductPurchase] Product:', params.productName);
        console.log('🛍️ [ProductPurchase] Amount:', params.amountMxn, 'MXN');

        const functions = getFunctions();
        const createProductPurchaseIntent = httpsCallable(functions, 'createProductPurchaseIntent');

        // 1. Create PaymentIntent for product
        console.log('🛍️ [ProductPurchase] Calling Cloud Function...');
        const result = await createProductPurchaseIntent({
            userId: params.userId,
            userEmail: params.userEmail,
            productId: params.productId,
            productName: params.productName,
            amount: params.amountMxn * 100, // Convert to cents
            shippingAddress: params.shippingAddress,
        });

        console.log('🛍️ [ProductPurchase] Cloud Function response received');
        const data = result.data as PaymentSheetParams & { orderId?: string };

        if (!data.paymentIntent) {
            console.error('🛍️ [ProductPurchase] No paymentIntent in response!');
            throw new Error('No se recibió respuesta del servidor');
        }

        // 2. Initialize Payment Sheet
        console.log('🛍️ [ProductPurchase] Initializing Payment Sheet...');
        const { error: initError } = await initPaymentSheet({
            paymentIntentClientSecret: data.paymentIntent,
            customerEphemeralKeySecret: data.ephemeralKey,
            customerId: data.customer,
            merchantDisplayName: 'QRclima Tienda',
            googlePay: {
                merchantCountryCode: 'MX',
                testEnv: __DEV__,
            },
            defaultBillingDetails: {
                email: params.userEmail,
            },
        });

        if (initError) {
            console.error('🛍️ [ProductPurchase] Init error:', initError);
            throw new Error(initError.message);
        }

        // 3. Present Payment Sheet
        console.log('🛍️ [ProductPurchase] Presenting Payment Sheet...');
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
            if (presentError.code === 'Canceled') {
                console.log('🛍️ [ProductPurchase] User canceled');
                return { success: false, error: 'Compra cancelada' };
            }
            console.error('🛍️ [ProductPurchase] Present error:', presentError);
            throw new Error(presentError.message);
        }

        // 4. Success - order will be created via webhook
        console.log('🛍️ [ProductPurchase] ✅ Payment successful!');

        Alert.alert(
            '✅ ¡Compra exitosa!',
            `Tu pedido de "${params.productName}" ha sido procesado.\n\nRecibirás un correo con los detalles de tu compra.`
        );

        return { success: true, orderId: data.orderId };

    } catch (error: any) {
        console.error('🛍️ [ProductPurchase] ERROR:', error);
        Alert.alert('Error', error.message || 'No se pudo completar la compra');
        return { success: false, error: error.message };
    }
};
