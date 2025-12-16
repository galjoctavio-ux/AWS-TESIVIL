import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { loadDatabase } from '../services/database-service';
import { AuthProvider, useAuth } from '../context/AuthContext';
import "../global.css";

// Mantener el Splash Screen visible hasta que terminemos de cargar
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
    const { user, loading: authLoading } = useAuth();
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

    // 2. Control de Navegación (Auth Flow)
    useEffect(() => {
        if (!dbLoaded || authLoading) return;

        // Ocultar Splash una vez que Auth y DB están listos
        SplashScreen.hideAsync();

        const inAuthGroup = segments[0] === '(auth)';

        if (user && !inAuthGroup) {
            // Usuario logueado, redirigir a dashboard si no está en (app)
            // (Por defecto app/(app)/dashboard se mapea pero validamos)
            router.replace('/(app)/dashboard');
        } else if (!user && inAuthGroup !== true) {
            // Usuario no logueado, redirigir a login
            router.replace('/(auth)/login');
        }
    }, [user, authLoading, dbLoaded, segments]);

    if (dbError) {
        return (
            <View className="flex-1 justify-center items-center bg-red-100">
                <Text className="text-red-600 font-bold">Error cargando DB: {dbError}</Text>
            </View>
        );
    }

    if (!dbLoaded || authLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-blue-500">
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return <Slot />;
}

export default function Layout() {
    return (
        <AuthProvider>
            <InitialLayout />
        </AuthProvider>
    );
}
