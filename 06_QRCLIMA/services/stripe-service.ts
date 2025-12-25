/**
 * Stripe Payment Service
 * 
 * TEMPORARILY DISABLED: Stripe SDK native modules not available in Expo Go.
 * Re-enable when using a custom dev build.
 */

import { Alert } from 'react-native';
// COMMENTED OUT - causes TurboModule crash in Expo Go
// import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Stripe Price IDs - Creados en el dashboard de Stripe
export const STRIPE_PRICES = {
    PRO_MONTHLY: 'price_pro_monthly_99',
    PRO_YEARLY: 'price_pro_yearly_999',
};

export const STRIPE_AMOUNTS = {
    PRO_MONTHLY: 9900,
    PRO_YEARLY: 99900,
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
 * TEMPORARILY DISABLED - Stripe not available in Expo Go
 */
export const initiateNativePayment = async (
    params: StripePaymentParams
): Promise<StripePaymentResult> => {
    console.warn('⚠️ Stripe payments temporarily disabled (requires native build)');
    Alert.alert(
        'Pagos no disponibles',
        'La función de pagos requiere una versión nativa de la app. Disponible próximamente.'
    );
    return { success: false, error: 'Stripe no disponible en Expo Go' };
};

export const initiateStripePayment = async (
    params: StripePaymentParams
): Promise<boolean> => {
    await initiateNativePayment(params);
    return false;
};

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
// COMPRA DE TOKENS (MICROPAGOS) - DISABLED
// ============================================

export interface TokenPurchaseParams {
    userId: string;
    userEmail: string;
}

export const purchaseTokens = async (
    params: TokenPurchaseParams
): Promise<{ success: boolean; tokensAdded?: number; error?: string }> => {
    console.warn('⚠️ Token purchase temporarily disabled (requires native build)');
    Alert.alert(
        'Compra no disponible',
        'La compra de tokens requiere una versión nativa de la app. Disponible próximamente.'
    );
    return { success: false, error: 'Stripe no disponible en Expo Go' };
};

// ============================================
// LEGACY CONFIG (kept for reference)
// ============================================

const STRIPE_CONFIG = {
    publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    checkoutEndpoint: 'https://us-central1-mr-frio.cloudfunctions.net/createStripeCheckout',
};

export interface StripeCheckoutParams {
    userId: string;
    userEmail: string;
    priceId: string;
    planType: 'monthly' | 'yearly';
}

export interface StripeCheckoutResult {
    success: boolean;
    sessionId?: string;
    checkoutUrl?: string;
    error?: string;
}

/**
 * @deprecated - Also disabled
 */
export const createCheckoutSession = async (
    params: StripeCheckoutParams
): Promise<StripeCheckoutResult> => {
    console.warn('⚠️ Checkout session disabled (requires native build)');
    return { success: false, error: 'Stripe no disponible' };
};
