import { Stack } from 'expo-router';

export default function CotizadorLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="concepts" />
            <Stack.Screen name="add-concept" />
            <Stack.Screen name="new-quote" />
            <Stack.Screen name="select-concepts" />
            <Stack.Screen name="quote-summary" />
        </Stack>
    );
}
