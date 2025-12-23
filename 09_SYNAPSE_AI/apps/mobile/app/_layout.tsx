import 'react-native-reanimated';
import '../global.css';

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, SplashScreen, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AliasProvider } from '@/contexts/AliasContext';
import { initSentry } from '@/services/errorReporting';
import { registerForPushNotificationsAsync } from '@/services/notificationService';

// Initialize Sentry
initSentry();

const ONBOARDING_COMPLETE_KEY = '@synapse_onboarding_complete';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

function RootLayoutNav() {
    const router = useRouter();
    const segments = useSegments();
    const rootNavigation = useNavigationContainerRef();
    const { colors, isDark } = useTheme();
    const [isNavigationReady, setIsNavigationReady] = useState(false);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

    // Track when navigation is ready
    useEffect(() => {
        if (rootNavigation?.isReady()) {
            setIsNavigationReady(true);
        }
    }, [rootNavigation?.isReady()]);

    useEffect(() => {
        checkOnboardingStatus();
        registerForPushNotificationsAsync();

        // NETWORK DIAGNOSTICS
        const checkConnections = async () => {
            console.log('--- START NETWORK DIAGNOSTICS (GLOBAL) ---');
            try {
                console.log('Testing HTTPS (Google)...');
                const r1 = await fetch('https://www.google.com', { method: 'HEAD' });
                console.log('HTTPS Test: SUCCESS', r1.status);
            } catch (e: any) {
                console.error('HTTPS Test: FAILED', e.message);
            }

            try {
                console.log('Testing HTTP API (13.59.28.73:3001)...');
                const r2 = await fetch('http://13.59.28.73:3001/health', {
                    method: 'GET',
                    headers: { 'Cache-Control': 'no-cache' }
                });
                console.log('HTTP API Test: SUCCESS', r2.status);
            } catch (e: any) {
                console.error('HTTP API Test: FAILED', e.message);
                console.log('Error details:', JSON.stringify(e));
            }
            console.log('--- END NETWORK DIAGNOSTICS (GLOBAL) ---');
        };
        setTimeout(checkConnections, 3000);
    }, []);

    // Re-check onboarding status when navigating TO onboarding screen
    // This handles the case when user clicks "Ver Onboarding" from profile
    useEffect(() => {
        const inOnboarding = segments[0] === 'onboarding';
        if (inOnboarding && isNavigationReady) {
            // Re-read from AsyncStorage to get the latest state
            checkOnboardingStatus();
        }
    }, [segments, isNavigationReady]);

    useEffect(() => {
        // Wait for both: onboarding status checked AND navigation ready
        if (hasCompletedOnboarding === null || !isNavigationReady) return;

        // Hide splash screen once we know the onboarding status
        SplashScreen.hideAsync();

        const inOnboarding = segments[0] === 'onboarding';

        // Defer navigation to next tick to ensure layout is fully mounted
        const timer = setTimeout(async () => {
            try {
                // Re-read from AsyncStorage to get the LATEST state before redirecting
                const currentValue = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
                const currentlyCompleted = currentValue === 'true';

                if (!currentlyCompleted && !inOnboarding) {
                    // User hasn't completed onboarding, redirect to onboarding
                    router.replace('/onboarding');
                } else if (currentlyCompleted && inOnboarding) {
                    // User has completed onboarding but is on onboarding screen
                    // ONLY redirect if this was a fresh app launch, not intentional navigation
                    // Check if the value was JUST removed (user wants to see onboarding again)
                    // If AsyncStorage says complete but state says not, user just reset it - don't redirect
                    if (hasCompletedOnboarding) {
                        router.replace('/(tabs)/engine');
                    }
                }
            } catch (error) {
                console.error('Navigation error:', error);
            }
        }, 100); // Increased delay to ensure navigation is ready

        return () => clearTimeout(timer);
    }, [hasCompletedOnboarding, segments, isNavigationReady]);

    const checkOnboardingStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
            setHasCompletedOnboarding(value === 'true');
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setHasCompletedOnboarding(false);
        }
    };

    // Always render the Stack to ensure the navigator is mounted
    // Show loading state inside the Stack content
    return (
        <>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth/login" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
            </Stack>
            {/* Show loading overlay while checking onboarding status */}
            {hasCompletedOnboarding === null && (
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: colors.background,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}
        </>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <AuthProvider>
                    <AliasProvider>
                        <QueryClientProvider client={queryClient}>
                            <SafeAreaProvider>
                                <RootLayoutNav />
                            </SafeAreaProvider>
                        </QueryClientProvider>
                    </AliasProvider>
                </AuthProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
