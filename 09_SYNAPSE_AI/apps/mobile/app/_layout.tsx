import 'react-native-reanimated';
import '../global.css';

import { useEffect, useState, useCallback } from 'react';
import { Stack, useRouter, useSegments, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

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
    const { colors, isDark } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    useEffect(() => {
        if (hasCompletedOnboarding === null) return;

        // Hide splash screen once we know the onboarding status
        SplashScreen.hideAsync();

        const inOnboarding = segments[0] === 'onboarding';
        const inTabs = segments[0] === '(tabs)';

        if (!hasCompletedOnboarding && !inOnboarding) {
            // User hasn't completed onboarding, redirect to onboarding
            router.replace('/onboarding');
        } else if (hasCompletedOnboarding && inOnboarding) {
            // User has completed onboarding but is on onboarding screen, redirect to main app
            router.replace('/(tabs)/engine');
        }

        setIsLoading(false);
    }, [hasCompletedOnboarding, segments]);

    const checkOnboardingStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
            setHasCompletedOnboarding(value === 'true');
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setHasCompletedOnboarding(false);
        }
    };

    if (isLoading || hasCompletedOnboarding === null) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
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
        </>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ThemeProvider>
                <AuthProvider>
                    <QueryClientProvider client={queryClient}>
                        <SafeAreaProvider>
                            <RootLayoutNav />
                        </SafeAreaProvider>
                    </QueryClientProvider>
                </AuthProvider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
