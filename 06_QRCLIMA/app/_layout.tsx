import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Updates from 'expo-updates';
import { loadDatabase } from '../services/database-service';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { SettingsProvider } from '../context/SettingsContext';
import { StripePaymentProvider } from '../components/StripePaymentProvider';
import AppLoadingScreen from '../components/AppLoadingScreen';
import "../global.css";

// Mantener el Splash Screen visible hasta que terminemos de cargar
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
    const { user, loading: authLoading, emailVerified, isOnboarded, checkingOnboarding } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const [dbLoaded, setDbLoaded] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState('Iniciando...');
    const [checkingUpdates, setCheckingUpdates] = useState(true);

    // 0. Check for OTA updates on app launch
    useEffect(() => {
        async function checkForUpdates() {
            if (__DEV__) {
                // Skip update check in development
                setCheckingUpdates(false);
                return;
            }

            try {
                setLoadingStatus('Verificando actualizaciones...');
                const update = await Updates.checkForUpdateAsync();

                if (update.isAvailable) {
                    setLoadingStatus('Descargando actualización...');
                    await Updates.fetchUpdateAsync();
                    setLoadingStatus('Reiniciando con nueva versión...');
                    await Updates.reloadAsync();
                } else {
                    setCheckingUpdates(false);
                }
            } catch (error) {
                console.log('Update check error (non-critical):', error);
                setCheckingUpdates(false);
            }
        }
        checkForUpdates();
    }, []);

    // 1. Carga de Base de Datos
    useEffect(() => {
        if (checkingUpdates) return; // Wait for update check to complete

        setLoadingStatus('Cargando base de datos...');
        loadDatabase()
            .then(() => {
                setLoadingStatus('Verificando sesión...');
                setDbLoaded(true);
            })
            .catch((err) => setDbError(err.message));
    }, [checkingUpdates]);

    // 2. Control de Navegación (Auth Flow + Email Verification + Onboarding)
    useEffect(() => {
        if (!dbLoaded || authLoading || checkingOnboarding || checkingUpdates) {
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

        if (user) {
            // Usuario logueado
            if (!emailVerified) {
                // Email no verificado - ir a pantalla de verificación
                if (!inVerifyEmail) {
                    router.replace('/(auth)/verify-email');
                }
            } else if (isOnboarded === false) {
                // Usuario nuevo - necesita completar onboarding
                if (!inOnboardingGroup) {
                    router.replace('/(onboarding)/welcome');
                }
            } else {
                // Usuario onboarded - ir a inicio (tabs)
                if (!inAppGroup) {
                    router.replace('/(app)/');
                }
            }
        } else {
            // Usuario no logueado - ir a login
            if (!inAuthGroup) {
                router.replace('/(auth)/login');
            }
        }
    }, [user, authLoading, dbLoaded, segments, emailVerified, isOnboarded, checkingOnboarding, checkingUpdates]);

    if (dbError) {
        return (
            <View className="flex-1 justify-center items-center bg-red-100">
                <Text className="text-red-600 font-bold">Error cargando DB: {dbError}</Text>
            </View>
        );
    }

    if (!dbLoaded || authLoading || checkingOnboarding || checkingUpdates || (user && isOnboarded === null)) {
        return <AppLoadingScreen status={loadingStatus} />;
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

