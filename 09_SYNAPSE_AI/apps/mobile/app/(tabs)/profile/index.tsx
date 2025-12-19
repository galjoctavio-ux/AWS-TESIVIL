import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS } from '@/constants/config';

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>👤 Mi Perfil</Text>
            </View>

            <View style={styles.content}>
                {/* Avatar Placeholder */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>?</Text>
                    </View>
                    <Text style={styles.userName}>Invitado</Text>
                    <Text style={styles.userPlan}>Plan Free</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Prompts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Proyectos</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>0</Text>
                        <Text style={styles.statLabel}>Reseñas</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>🔑</Text>
                        <Text style={styles.menuText}>Iniciar Sesión</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>⭐</Text>
                        <Text style={styles.menuText}>Actualizar a Premium</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>📚</Text>
                        <Text style={styles.menuText}>Historial de Prompts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>⚙️</Text>
                        <Text style={styles.menuText}>Configuración</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Text style={styles.menuIcon}>📜</Text>
                        <Text style={styles.menuText}>Términos y Privacidad</Text>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appVersion}>SYNAPSE AI v0.1.0</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    avatarContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    avatarText: {
        fontSize: 32,
        color: COLORS.textMuted,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    userPlan: {
        fontSize: 14,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    menuSection: {
        gap: SPACING.xs,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        gap: SPACING.md,
    },
    menuIcon: {
        fontSize: 20,
    },
    menuText: {
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    appInfo: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    appVersion: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
});
