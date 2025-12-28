import { Stack } from 'expo-router';

export default function CotizadorProLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="new" />
            <Stack.Screen name="add-concepts" />
            <Stack.Screen name="summary" />
        </Stack>
    );
}
