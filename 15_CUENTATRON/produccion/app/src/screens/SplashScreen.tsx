/**
 * Splash Screen Component
 * Cuentatron MVP
 * 
 * Displays for 2 seconds (no interaction) - modulo_01_auth_onboarding
 * Then redirects based on session state
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

// Splash duration: 2 seconds as per spec
const SPLASH_DURATION = 2000;

export default function SplashScreen() {
    const router = useRouter();
    const { session, profile, loading } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) return; // Wait for auth to finish loading

            if (session) {
                // User is logged in
                if (profile?.onboarding_completado) {
                    // Onboarding complete -> Dashboard
                    router.replace('/(tabs)');
                } else {
                    // Onboarding not complete -> Onboarding flow
                    router.replace('/onboarding');
                }
            } else {
                // No session -> Auth screen
                router.replace('/auth');
            }
        }, SPLASH_DURATION);

        return () => clearTimeout(timer);
    }, [session, profile, loading]);

    return (
        <View style={styles.container}>
            {/* Logo placeholder - replace with actual logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/splash.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Loading indicator */}
            <ActivityIndicator
                size="large"
                color="#4f46e5"
                style={styles.loader}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    loader: {
        position: 'absolute',
        bottom: 100,
    },
});
