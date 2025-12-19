import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Tab icons (using Unicode for now, replace with proper icons later)
function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
    return (
        <View style={styles.tabIconContainer}>
            <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
                {icon}
            </Text>
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
                {label}
            </Text>
        </View>
    );
}

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#16162A',
                    borderTopColor: '#2E1065',
                    borderTopWidth: 1,
                    height: 70 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#8B5CF6',
                tabBarInactiveTintColor: '#6B7280',
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="engine"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="✨" label="Engine" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="feed"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📰" label="Feed" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pulse"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="📊" label="Pulse" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="showcase"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="🚀" label="Showcase" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="👤" label="Perfil" focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    tabIcon: {
        fontSize: 22,
        opacity: 0.6,
    },
    tabIconFocused: {
        opacity: 1,
    },
    tabLabel: {
        fontSize: 10,
        color: '#6B7280',
        fontWeight: '500',
    },
    tabLabelFocused: {
        color: '#8B5CF6',
        fontWeight: '600',
    },
});
