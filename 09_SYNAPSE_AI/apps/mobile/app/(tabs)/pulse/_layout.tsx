import { Stack } from 'expo-router';

export default function PulseLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#0B0E14' },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: { fontWeight: '600' },
                contentStyle: { backgroundColor: '#0B0E14' },
            }}
        >
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    headerShown: true,
                    title: 'Detalle del Modelo',
                }}
            />
        </Stack>
    );
}
