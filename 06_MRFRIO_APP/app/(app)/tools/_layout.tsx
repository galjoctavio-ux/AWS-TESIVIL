import { Stack } from 'expo-router';

export default function ToolsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#1E40AF' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="btu-calculator"
                options={{
                    title: 'Calculadora BTU',
                    headerBackTitle: 'Atrás'
                }}
            />
        </Stack>
    );
}
