/**
 * Tab Layout
 * Cuentatron MVP
 * 
 * Main app navigation with 4 sections (UXUI-001)
 * NO "Reportes" section (14-NO-01)
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1a1a2e',
                    borderTopColor: '#333',
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: '#4f46e5',
                tabBarInactiveTintColor: '#666',
                tabBarLabelStyle: {
                    fontSize: 12,
                },
            }}
        >
            {/* Inicio / Dashboard - Section 1 */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />

            {/* Alertas - Section 2 */}
            <Tabs.Screen
                name="alertas"
                options={{
                    title: 'Alertas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="notifications" size={size} color={color} />
                    ),
                }}
            />

            {/* Gráficas - Section 3 */}
            <Tabs.Screen
                name="graficas"
                options={{
                    title: 'Gráficas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="stats-chart" size={size} color={color} />
                    ),
                }}
            />

            {/* Cuenta - Section 4 */}
            <Tabs.Screen
                name="cuenta"
                options={{
                    title: 'Cuenta',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
