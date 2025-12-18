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
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="btu-calculator"
                options={{
                    title: 'Calculadora BTU',
                    headerBackTitle: 'Atrás'
                }}
            />
            <Stack.Screen
                name="cable-guide"
                options={{
                    title: 'Guía de Cables',
                    headerBackTitle: 'Atrás'
                }}
            />
            <Stack.Screen
                name="pt-table"
                options={{
                    title: 'Tabla P-T',
                    headerBackTitle: 'Atrás'
                }}
            />
            <Stack.Screen
                name="qr-labels"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
