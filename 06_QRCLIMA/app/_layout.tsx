import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadDatabase } from '../services/database-service';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SettingsProvider } from '../context/SettingsContext';
import { StripePaymentProvider } from '../components/StripePaymentProvider';
import "../global.css";

// Mantener el Splash Screen visible hasta que terminemos de cargar
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
    const { user, loading: authLoading, emailVerified, isOnboarded, checkingOnboarding } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const [dbLoaded, setDbLoaded] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);

    // 1. Carga de Base de Datos
    useEffect(() => {
        loadDatabase()
            .then(() => setDbLoaded(true))
            .catch((err) => setDbError(err.message));
    }, []);

    // 2. Control de Navegación (Auth Flow + Email Verification + Onboarding)
    useEffect(() => {
        if (!dbLoaded || authLoading || checkingOnboarding) {
            console.log('Still loading - dbLoaded:', dbLoaded, 'authLoading:', authLoading, 'checkingOnboarding:', checkingOnboarding);
            return;
        }

        // Esperar a que emailVerified y isOnboarded tengan un valor si hay usuario
        if (user && (emailVerified === null || isOnboarded === null)) {
            return;
        }

        // Ocultar Splash una vez que Auth, DB y profile check están listos
        SplashScreen.hideAsync();

        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';
        const inOnboardingGroup = segments[0] === '(onboarding)';
        const inVerifyEmail = segments[0] === '(auth)' && segments.length > 1 && (segments as string[])[1] === 'verify-email';

        console.log('Navigation check - user:', !!user, 'emailVerified:', emailVerified, 'isOnboarded:', isOnboarded, 'segments:', segments);

        if (user) {
            // Usuario logueado
            if (!emailVerified) {
                // Email no verificado - ir a pantalla de verificación
                if (!inVerifyEmail) {
                    console.log('Email not verified, redirecting to verify-email');
                    router.replace('/(auth)/verify-email');
                }
            } else if (isOnboarded === false) {
                // Usuario nuevo - necesita completar onboarding
                if (!inOnboardingGroup) {
                    console.log('User needs onboarding, redirecting to welcome');
                    router.replace('/(onboarding)/welcome');
                }
            } else {
                // Usuario onboarded - ir a inicio (tabs)
                if (!inAppGroup) {
                    console.log('User onboarded, redirecting to home');
                    router.replace('/(app)/');
                }
            }
        } else {
            // Usuario no logueado - ir a login
            if (!inAuthGroup) {
                console.log('User not logged in, redirecting to login');
                router.replace('/(auth)/login');
            }
        }
    }, [user, authLoading, dbLoaded, segments, emailVerified, isOnboarded, checkingOnboarding]);

    if (dbError) {
        return (
            <View className="flex-1 justify-center items-center bg-red-100">
                <Text className="text-red-600 font-bold">Error cargando DB: {dbError}</Text>
            </View>
        );
    }

    if (!dbLoaded || authLoading || checkingOnboarding || (user && isOnboarded === null)) {
        return (
            <View className="flex-1 justify-center items-center bg-blue-500">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white mt-4">Cargando QRclima...</Text>
            </View>
        );
    }

    return <Slot />;
}

export default function Layout() {
    return (
        <SafeAreaProvider>
            <StripePaymentProvider>
                <ThemeProvider>
                    <SettingsProvider>
                        <AuthProvider>
                            <InitialLayout />
                        </AuthProvider>
                    </SettingsProvider>
                </ThemeProvider>
            </StripePaymentProvider>
        </SafeAreaProvider>
    );
}

