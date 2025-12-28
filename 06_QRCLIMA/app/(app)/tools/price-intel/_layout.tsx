import { Stack } from 'expo-router';

export default function PriceIntelLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="trends" />
            <Stack.Screen name="search" />
            <Stack.Screen name="deals" />
            <Stack.Screen name="charts" />
        </Stack>
    );
}
