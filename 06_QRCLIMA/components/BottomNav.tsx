import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabItem {
    name: string;
    route: string;
    icon: string;
    iconActive: string;
}

const TABS: TabItem[] = [
    { name: 'Inicio', route: '/(app)/', icon: 'home-outline', iconActive: 'home' },
    { name: 'Agenda', route: '/(app)/agenda', icon: 'calendar-outline', iconActive: 'calendar' },
    { name: 'Herramientas', route: '/(app)/tools', icon: 'construct-outline', iconActive: 'construct' },
    { name: 'Perfil', route: '/(app)/profile', icon: 'person-outline', iconActive: 'person' },
];

export default function BottomNav() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (route: string) => {
        if (route === '/(app)/') {
            return pathname === '/' || pathname === '';
        }
        return pathname.startsWith(route.replace('/(app)', ''));
    };

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#E2E8F0',
                paddingTop: 12,
                paddingBottom: Math.max(insets.bottom, 12) + 12,
                paddingHorizontal: 20,
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            }}
        >
            {TABS.map((tab) => {
                const active = isActive(tab.route);
                return (
                    <TouchableOpacity
                        key={tab.name}
                        onPress={() => router.push(tab.route as any)}
                        style={{
                            alignItems: 'center',
                            flex: 1,
                        }}
                    >
                        <View
                            style={{
                                backgroundColor: active ? '#EFF6FF' : 'transparent',
                                padding: 8,
                                borderRadius: 12,
                                marginBottom: 2,
                            }}
                        >
                            <Ionicons
                                name={(active ? tab.iconActive : tab.icon) as any}
                                size={24}
                                color={active ? '#2563EB' : '#94A3B8'}
                            />
                        </View>
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: active ? '700' : '500',
                                color: active ? '#2563EB' : '#94A3B8',
                            }}
                        >
                            {tab.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
