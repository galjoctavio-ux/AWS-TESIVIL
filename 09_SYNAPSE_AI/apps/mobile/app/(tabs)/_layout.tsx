import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '@/components/icons/Icon';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';

// Tab configuration with Lucide icons (colors will be dynamic)
const getTabConfig = (colors: ThemeColors): Record<string, { icon: IconName; label: string; color: string }> => ({
    engine: { icon: 'Sparkles', label: 'Prompt+', color: colors.engine },
    feed: { icon: 'Newspaper', label: 'Noticias', color: colors.feed },
    pulse: { icon: 'BarChart3', label: 'Ranking', color: colors.pulse },
    showcase: { icon: 'Rocket', label: 'Showcase', color: colors.showcase },
    academy: { icon: 'GraduationCap', label: 'Academia', color: colors.academy },
    profile: { icon: 'User', label: 'Perfil', color: colors.primary },
});

// Tab icon component with glow effect for active state
function TabIcon({
    tabName,
    focused,
    colors,
}: {
    tabName: string;
    focused: boolean;
    colors: ThemeColors;
}) {
    const tabConfig = getTabConfig(colors);
    const config = tabConfig[tabName];
    if (!config) return null;

    const color = focused ? config.color : colors.textMuted;
    const styles = createStyles(colors);

    return (
        <View style={styles.tabIconContainer}>
            <Icon
                name={config.icon}
                size={24}
                color={color}
                strokeWidth={focused ? 2 : 1.5}
                glow={focused}
                glowColor={config.color}
            />
            <Text style={[
                styles.tabLabel,
                focused && { color: config.color, fontWeight: '600' }
            ]}>
                {config.label}
            </Text>
        </View>
    );
}

export default function TabsLayout() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.surfaceBorder,
                    borderTopWidth: 1,
                    height: 80 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 14,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="engine"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon tabName="engine" focused={focused} colors={colors} />
                    ),
                }}
            />
            <Tabs.Screen
                name="feed"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon tabName="feed" focused={focused} colors={colors} />
                    ),
                }}
            />
            <Tabs.Screen
                name="pulse"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon tabName="pulse" focused={focused} colors={colors} />
                    ),
                }}
            />
            <Tabs.Screen
                name="showcase"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon tabName="showcase" focused={focused} colors={colors} />
                    ),
                }}
            />
            <Tabs.Screen
                name="academy"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon tabName="academy" focused={focused} colors={colors} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ focused }) => (
                        <TabIcon tabName="profile" focused={focused} colors={colors} />
                    ),
                }}
            />
        </Tabs>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    tabLabel: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '500',
    },
});
