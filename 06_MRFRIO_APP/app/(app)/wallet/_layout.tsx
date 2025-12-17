import { Stack } from 'expo-router';

export default function WalletLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#F59E0B' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'Mi Billetera',
                    headerBackTitle: 'Atrás'
                }}
            />
        </Stack>
    );
}
