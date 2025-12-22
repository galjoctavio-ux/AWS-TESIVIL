import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS } from '@/constants/config';

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, isDark, toggleTheme, theme } = useTheme();

    const styles = createStyles(colors);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Configuración</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
            >
                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Apariencia</Text>

                    <View style={styles.settingCard}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingIcon}>🌙</Text>
                                <View>
                                    <Text style={styles.settingLabel}>Modo Oscuro</Text>
                                    <Text style={styles.settingDesc}>
                                        {isDark ? 'Activado' : 'Desactivado'}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{
                                    false: colors.surfaceBorder,
                                    true: colors.primary
                                }}
                                thumbColor={isDark ? colors.primaryLight : '#FFFFFF'}
                            />
                        </View>
                    </View>

                    {/* Theme Preview */}
                    <View style={styles.previewCard}>
                        <Text style={styles.previewTitle}>Vista previa</Text>
                        <View style={styles.previewContent}>
                            <View style={[styles.previewBox, { backgroundColor: colors.background }]}>
                                <View style={[styles.previewHeader, { backgroundColor: colors.surface }]} />
                                <View style={[styles.previewBar, { backgroundColor: colors.primary }]} />
                                <View style={[styles.previewText, { backgroundColor: colors.textMuted }]} />
                                <View style={[styles.previewText2, { backgroundColor: colors.textMuted }]} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* App Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Información</Text>

                    <View style={styles.settingCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Versión</Text>
                            <Text style={styles.infoValue}>1.0.0</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tema actual</Text>
                            <Text style={styles.infoValue}>
                                {theme === 'light' ? '☀️ Claro' : '🌙 Oscuro'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Credits */}
                <View style={styles.credits}>
                    <Text style={styles.creditsText}>© 2025 SYNAPSE AI</Text>
                    <Text style={styles.creditsSubtext}>Desarrollado con ❤️ y mucha IA</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 20,
        color: colors.textPrimary,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: SPACING.md,
    },
    settingCard: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    settingIcon: {
        fontSize: 24,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    settingDesc: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    previewCard: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        padding: SPACING.md,
        marginTop: SPACING.md,
    },
    previewTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.textMuted,
        marginBottom: SPACING.sm,
    },
    previewContent: {
        alignItems: 'center',
    },
    previewBox: {
        width: 120,
        height: 200,
        borderRadius: RADIUS.md,
        borderWidth: 2,
        borderColor: colors.surfaceBorder,
        padding: 8,
        gap: 8,
    },
    previewHeader: {
        height: 20,
        borderRadius: 4,
    },
    previewBar: {
        height: 12,
        width: '60%',
        borderRadius: 6,
    },
    previewText: {
        height: 8,
        width: '100%',
        borderRadius: 4,
    },
    previewText2: {
        height: 8,
        width: '80%',
        borderRadius: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    infoLabel: {
        fontSize: 15,
        color: colors.textSecondary,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.surfaceBorder,
        marginHorizontal: SPACING.md,
    },
    credits: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    creditsText: {
        fontSize: 13,
        color: colors.textMuted,
    },
    creditsSubtext: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 4,
    },
});
