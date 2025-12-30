/**
 * Stripe Payment Provider
 * 
 * Provides Stripe context for native payment processing.
 * Requires a native build (not Expo Go) to function.
 */

import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

interface StripePaymentProviderProps {
    children: React.ReactNode;
}

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export const StripePaymentProvider: React.FC<StripePaymentProviderProps> = ({ children }) => {
    if (!STRIPE_PUBLISHABLE_KEY) {
        console.warn('⚠️ Stripe publishable key not configured');
        return <>{children}</>;
    }

    return (
        <StripeProvider
            publishableKey={STRIPE_PUBLISHABLE_KEY}
            merchantIdentifier="merchant.com.bitavo.qrclima"
        >
            <>{children}</>
        </StripeProvider>
    );
};

export default StripePaymentProvider;
