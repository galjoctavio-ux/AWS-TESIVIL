import { Stack } from 'expo-router';

export default function EngineLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0F0F23' },
            }}
        >
            <Stack.Screen name="index" />
        </Stack>
    );
}
