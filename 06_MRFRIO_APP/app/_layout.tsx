import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { loadDatabase } from '../services/database-service';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import "../global.css";

// Mantener el Splash Screen visible hasta que terminemos de cargar
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
    const { user, loading: authLoading, isOnboarded, checkingOnboarding } = useAuth();
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

    // 2. Control de Navegación (Auth Flow + Onboarding)
    useEffect(() => {
        if (!dbLoaded || authLoading || checkingOnboarding) {
            console.log('Still loading - dbLoaded:', dbLoaded, 'authLoading:', authLoading, 'checkingOnboarding:', checkingOnboarding);
            return;
        }

        // Esperar a que isOnboarded tenga un valor si hay usuario
        if (user && isOnboarded === null) {
            return;
        }

        // Ocultar Splash una vez que Auth, DB y Onboarding check están listos
        SplashScreen.hideAsync();

        const inAuthGroup = segments[0] === '(auth)';
        const inAppGroup = segments[0] === '(app)';
        const inOnboardingGroup = segments[0] === '(onboarding)';

        console.log('Navigation check - user:', !!user, 'isOnboarded:', isOnboarded, 'segments:', segments);

        if (user) {
            // Usuario logueado
            if (isOnboarded === false) {
                // Usuario nuevo - necesita completar onboarding
                if (!inOnboardingGroup) {
                    console.log('User needs onboarding, redirecting to welcome');
                    router.replace('/(onboarding)/welcome');
                }
            } else {
                // Usuario onboarded - ir a dashboard
                if (!inAppGroup) {
                    console.log('User onboarded, redirecting to dashboard');
                    router.replace('/(app)/dashboard');
                }
            }
        } else {
            // Usuario no logueado - ir a login
            if (!inAuthGroup) {
                console.log('User not logged in, redirecting to login');
                router.replace('/(auth)/login');
            }
        }
    }, [user, authLoading, dbLoaded, segments, isOnboarded, checkingOnboarding]);

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
                <Text className="text-white mt-4">Cargando Mr. Frío...</Text>
            </View>
        );
    }

    return <Slot />;
}

export default function Layout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <InitialLayout />
            </AuthProvider>
        </ThemeProvider>
    );
}

