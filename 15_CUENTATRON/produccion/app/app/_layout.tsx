/**
 * Root Layout
 * Cuentatron MVP
 * 
 * App entry point with Expo Router
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../src/contexts/AuthContext';

// Prevent auto-hide of splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    useEffect(() => {
        // Hide splash after our custom splash screen takes over
        SplashScreen.hideAsync();
    }, []);

    return (
        <AuthProvider>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                    contentStyle: { backgroundColor: '#1a1a2e' },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="onboarding" />
                <Stack.Screen name="vincular" />
                <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
            </Stack>
        </AuthProvider>
    );
}
