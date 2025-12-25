/**
 * Stripe Payment Provider
 * 
 * TEMPORARILY DISABLED: Stripe SDK requires native modules not available in Expo Go.
 * Re-enable when using a custom dev build.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StripePaymentProviderProps {
    children: React.ReactNode;
}

export const StripePaymentProvider: React.FC<StripePaymentProviderProps> = ({ children }) => {
    // STRIPE DISABLED - just pass through children
    console.log('ℹ️ Stripe temporarily disabled (requires native build)');
    return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default StripePaymentProvider;
