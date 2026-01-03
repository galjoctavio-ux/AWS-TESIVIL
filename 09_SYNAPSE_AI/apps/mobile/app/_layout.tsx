import 'react-native-reanimated';
import '../global.css';

import { useEffect, useState, useRef } from 'react';
import { Stack, useRouter, useSegments, SplashScreen, useNavigationContainerRef } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, AppState, AppStateStatus } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { AliasProvider } from '@/contexts/AliasContext';
import { initSentry } from '@/services/errorReporting';
import { registerForPushNotificationsAsync, checkNotificationStatus } from '@/services/notificationService';
import { UpdateChecker } from '@/components/UpdateChecker';

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
    const [isUpdateCheckComplete, setIsUpdateCheckComplete] = useState(false);

    // AppState for notification check on foreground
    const appState = useRef(AppState.currentState);
    const hasCheckedNotificationsOnce = useRef(false);

    // Track when navigation is ready
    useEffect(() => {
        if (rootNavigation?.isReady()) {
            setIsNavigationReady(true);
        }
    }, [rootNavigation?.isReady()]);

    // Initial setup effect
    useEffect(() => {
        checkOnboardingStatus();
        registerForPushNotificationsAsync();

        // AppState listener for notification check when app comes to foreground
        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, []);

    // Handle app state changes for notification verification
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
        // Check when app comes to foreground from background
        if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            console.log('[App] Returned to foreground, checking notifications...');
            // Only show prompt if we've already checked once (avoid double-prompting on first launch)
            if (hasCheckedNotificationsOnce.current) {
                await checkNotificationStatus(true);
            }
        }
        appState.current = nextAppState;
    };

    // Mark that we've checked notifications once after initial registration
    useEffect(() => {
        if (isUpdateCheckComplete) {
            // Delay to ensure initial registration is complete
            const timer = setTimeout(() => {
                hasCheckedNotificationsOnce.current = true;
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isUpdateCheckComplete]);

    // Re-check onboarding status when navigating TO onboarding screen
    useEffect(() => {
        const inOnboarding = segments[0] === 'onboarding';
        if (inOnboarding && isNavigationReady) {
            checkOnboardingStatus();
        }
    }, [segments, isNavigationReady]);

    // Navigation effect
    useEffect(() => {
        if (hasCompletedOnboarding === null || !isNavigationReady || !isUpdateCheckComplete) return;

        SplashScreen.hideAsync();

        const inOnboarding = segments[0] === 'onboarding';

        const timer = setTimeout(async () => {
            try {
                const currentValue = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
                const currentlyCompleted = currentValue === 'true';

                if (!currentlyCompleted && !inOnboarding) {
                    router.replace('/onboarding');
                } else if (currentlyCompleted && inOnboarding) {
                    if (hasCompletedOnboarding) {
                        router.replace('/(tabs)/engine');
                    }
                }
            } catch (error) {
                console.error('Navigation error:', error);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [hasCompletedOnboarding, segments, isNavigationReady, isUpdateCheckComplete]);

    const checkOnboardingStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
            setHasCompletedOnboarding(value === 'true');
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setHasCompletedOnboarding(false);
        }
    };

    const handleUpdateComplete = () => {
        setIsUpdateCheckComplete(true);
    };

    // Show UpdateChecker screen until updates are checked
    if (!isUpdateCheckComplete) {
        return <UpdateChecker onComplete={handleUpdateComplete} />;
    }

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

