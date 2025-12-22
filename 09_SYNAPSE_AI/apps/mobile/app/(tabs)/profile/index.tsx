import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING, RADIUS } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { Icon, IconName } from '@/components/icons/Icon';
import { getUserStats, UserStats } from '@/lib/userStats';
import { useAuth } from '@/contexts/AuthContext';

const PROFILE_IMAGE_KEY = '@synapse_profile_image';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors } = useTheme();
    const { user, isAuthenticated, signOut, isLoading: authLoading } = useAuth();
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [stats, setStats] = useState<UserStats>({ promptsGenerated: 0, projectsViewed: 0, reviewsGiven: 0 });

    const styles = createStyles(colors);

    // Menu items - dynamic based on auth state
    const getMenuItems = (): { id: string; icon: IconName; label: string; route?: string; action?: () => void; hidden?: boolean }[] => {
        if (isAuthenticated) {
            return [
                { id: 'settings', icon: 'Settings', label: 'Configuración', route: '/settings' },
                { id: 'logout', icon: 'LogOut', label: 'Cerrar Sesión', action: handleLogout },
            ];
        }
        return [
            { id: 'login', icon: 'LogIn', label: 'Iniciar Sesión', route: '/auth/login' },
            { id: 'settings', icon: 'Settings', label: 'Configuración', route: '/settings' },
        ];
    };

    // Stats configuration - now dynamic
    const STATS_CONFIG = [
        { id: 'prompts', label: 'Prompts', value: stats.promptsGenerated, route: '/profile/prompts' },
        { id: 'projects', label: 'Proyectos', value: stats.projectsViewed, route: '/profile/projects' },
        { id: 'reviews', label: 'Reseñas', value: stats.reviewsGiven, route: '/profile/reviews' },
    ];

    useEffect(() => {
        loadProfileImage();
        loadStats();
    }, []);

    const loadStats = async () => {
        const userStats = await getUserStats();
        setStats(userStats);
    };

    const loadProfileImage = async () => {
        try {
            const savedImage = await AsyncStorage.getItem(PROFILE_IMAGE_KEY);
            if (savedImage) {
                setProfileImage(savedImage);
            }
        } catch (error) {
            console.error('Error loading profile image:', error);
        }
    };

    const saveProfileImage = async (uri: string) => {
        try {
            await AsyncStorage.setItem(PROFILE_IMAGE_KEY, uri);
        } catch (error) {
            console.error('Error saving profile image:', error);
        }
    };

    const pickImage = async () => {
        Haptics.selectionAsync();

        Alert.alert(
            'Cambiar foto de perfil',
            'Elige una opción',
            [
                {
                    text: 'Cámara',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara.');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled && result.assets[0]) {
                            setProfileImage(result.assets[0].uri);
                            saveProfileImage(result.assets[0].uri);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                    },
                },
                {
                    text: 'Galería',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería.');
                            return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled && result.assets[0]) {
                            setProfileImage(result.assets[0].uri);
                            saveProfileImage(result.assets[0].uri);
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                    },
                },
                { text: 'Cancelar', style: 'cancel' },
            ]
        );
    };

    const handleLogout = async () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas cerrar sesión?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Cerrar Sesión',
                    style: 'destructive',
                    onPress: async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        await signOut();
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    },
                },
            ]
        );
    };

    const handleMenuPress = (item: ReturnType<typeof getMenuItems>[0]) => {
        Haptics.selectionAsync();
        if (item.action) {
            item.action();
        } else if (item.route) {
            router.push(item.route as any);
        }
    };

    const handleStatPress = (stat: typeof STATS_CONFIG[0]) => {
        Haptics.selectionAsync();
        if (stat.route) {
            // router.push(stat.route);
            console.log('Navigate to:', stat.route);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitle}>
                        <Icon name="User" size={28} color={colors.primary} />
                        <Text style={styles.title}>Mi Perfil</Text>
                    </View>
                </View>

                {/* Avatar Section */}
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
                        <View style={styles.avatar}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                            ) : (
                                <Icon name="User" size={32} color={colors.textMuted} />
                            )}
                        </View>
                        <View style={styles.editBadge}>
                            <Icon name="Camera" size={14} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>
                        {isAuthenticated ? (user?.email?.split('@')[0] || 'Usuario') : 'Invitado'}
                    </Text>
                    {isAuthenticated && (
                        <Text style={styles.userEmail}>{user?.email}</Text>
                    )}
                    <View style={styles.planBadge}>
                        <Text style={styles.userPlan}>
                            {isAuthenticated ? 'Cuenta Activa' : 'Plan Free'}
                        </Text>
                    </View>
                </View>

                {/* Stats - Clickable */}
                <View style={styles.statsRow}>
                    {STATS_CONFIG.map((stat, index) => (
                        <Pressable
                            key={stat.id}
                            style={({ pressed }) => [
                                styles.statItem,
                                pressed && styles.statItemPressed,
                                index < STATS_CONFIG.length - 1 && styles.statItemBorder,
                            ]}
                            onPress={() => handleStatPress(stat)}
                        >
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                            <Icon name="ChevronRight" size={14} color={colors.textMuted} />
                        </Pressable>
                    ))}
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {getMenuItems().filter(item => !item.hidden).map((item) => (
                        <Pressable
                            key={item.id}
                            style={({ pressed }) => [
                                styles.menuItem,
                                pressed && styles.menuItemPressed,
                            ]}
                            onPress={() => handleMenuPress(item)}
                        >
                            <View style={styles.menuItemLeft}>
                                <View style={[
                                    styles.menuIconContainer,
                                    item.id === 'premium' && styles.menuIconPremium,
                                ]}>
                                    <Icon
                                        name={item.icon}
                                        size={20}
                                        color={item.id === 'premium' ? colors.warning : colors.textSecondary}
                                    />
                                </View>
                                <Text style={[
                                    styles.menuText,
                                    item.id === 'premium' && styles.menuTextPremium,
                                ]}>
                                    {item.label}
                                </Text>
                            </View>
                            <Icon name="ChevronRight" size={18} color={colors.textMuted} />
                        </Pressable>
                    ))}
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appVersion}>SYNAPSE AI v0.1.0</Text>
                    <Text style={styles.appCopyright}>© 2025 SYNAPSE AI</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: SPACING.xxl,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    avatarContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.surfaceBorder,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.background,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: SPACING.sm,
    },
    userEmail: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    planBadge: {
        marginTop: SPACING.xs,
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        backgroundColor: `${colors.primary}20`,
        borderRadius: RADIUS.lg,
    },
    userPlan: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        marginHorizontal: SPACING.lg,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        overflow: 'hidden',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.md,
        gap: 2,
    },
    statItemPressed: {
        backgroundColor: `${colors.primary}10`,
    },
    statItemBorder: {
        borderRightWidth: 1,
        borderRightColor: colors.surfaceBorder,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    menuSection: {
        marginTop: SPACING.lg,
        marginHorizontal: SPACING.lg,
        backgroundColor: colors.surface,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    menuItemPressed: {
        backgroundColor: `${colors.primary}10`,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: `${colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIconPremium: {
        backgroundColor: `${colors.warning}15`,
    },
    menuText: {
        fontSize: 15,
        color: colors.textPrimary,
        fontWeight: '500',
    },
    menuTextPremium: {
        color: colors.warning,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        gap: 4,
    },
    appVersion: {
        fontSize: 13,
        color: colors.textMuted,
    },
    appCopyright: {
        fontSize: 12,
        color: colors.textMuted,
    },
});
