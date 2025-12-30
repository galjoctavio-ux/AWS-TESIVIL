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
        const functions = getFunctions();
        const createTokenPurchaseIntent = httpsCallable(functions, 'createTokenPurchaseIntent');

        // 1. Create PaymentIntent for tokens
        const result = await createTokenPurchaseIntent({
            userId: params.userId,
            userEmail: params.userEmail,
            amount: TOKEN_PACK.priceInCents,
            tokens: TOKEN_PACK.tokens,
        });

        const data = result.data as PaymentSheetParams;

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
        });

        if (initError) {
            throw new Error(initError.message);
        }

        // 3. Present Payment Sheet
        const { error: presentError } = await presentPaymentSheet();

        if (presentError) {
            if (presentError.code === 'Canceled') {
                return { success: false, error: 'Compra cancelada' };
            }
            throw new Error(presentError.message);
        }

        // 4. Success - tokens will be added via webhook
        return { success: true, tokensAdded: TOKEN_PACK.tokens };

    } catch (error: any) {
        console.error('Token purchase error:', error);
        Alert.alert('Error', error.message || 'No se pudo completar la compra');
        return { success: false, error: error.message };
    }
};
