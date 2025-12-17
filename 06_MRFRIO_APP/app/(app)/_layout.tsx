import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';

export default function AppLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                },
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#94A3B8',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            {/* Tab 1: Home */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={focused ? 'bg-blue-100 p-1.5 rounded-xl' : ''}>
                            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />

            {/* Tab 2: Agenda/Services */}
            <Tabs.Screen
                name="agenda"
                options={{
                    title: 'Agenda',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={focused ? 'bg-blue-100 p-1.5 rounded-xl' : ''}>
                            <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />

            {/* Tab 3: Tools */}
            <Tabs.Screen
                name="tools"
                options={{
                    title: 'Herramientas',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={focused ? 'bg-blue-100 p-1.5 rounded-xl' : ''}>
                            <Ionicons name={focused ? 'construct' : 'construct-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />

            {/* Tab 4: Profile/Community */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size, focused }) => (
                        <View className={focused ? 'bg-blue-100 p-1.5 rounded-xl' : ''}>
                            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
                        </View>
                    ),
                }}
            />

            {/* Hidden screens - accessible via navigation but not in tab bar */}
            <Tabs.Screen name="dashboard" options={{ href: null }} />
            <Tabs.Screen name="services" options={{ href: null }} />
            <Tabs.Screen name="clients" options={{ href: null }} />
            <Tabs.Screen name="quotes" options={{ href: null }} />
            <Tabs.Screen name="equipment" options={{ href: null }} />
            <Tabs.Screen name="scanner" options={{ href: null }} />
            <Tabs.Screen name="community" options={{ href: null }} />
            <Tabs.Screen name="store" options={{ href: null }} />
            <Tabs.Screen name="wallet" options={{ href: null }} />
            <Tabs.Screen name="training" options={{ href: null }} />
            <Tabs.Screen name="library" options={{ href: null }} />
            <Tabs.Screen name="admin" options={{ href: null }} />
        </Tabs>
    );
}
