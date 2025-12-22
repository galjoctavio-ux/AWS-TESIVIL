import { Stack } from 'expo-router';

export default function AppLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="agenda" />
            <Stack.Screen name="tools" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="services" />
            <Stack.Screen name="clients" />
            <Stack.Screen name="quotes" />
            <Stack.Screen name="cotizador" />
            <Stack.Screen name="equipment" />
            <Stack.Screen name="scanner" />
            <Stack.Screen name="community" />
            <Stack.Screen name="store" />
            <Stack.Screen name="wallet" />
            <Stack.Screen name="training" />
            <Stack.Screen name="library" />
            <Stack.Screen name="admin" />
        </Stack>
    );
}
