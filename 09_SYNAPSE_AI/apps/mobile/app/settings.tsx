import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Switch,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { SPACING, RADIUS } from '@/constants/config';
import { getNotificationPreferences, updateNotificationPreferences, NotificationPreferences } from '@/lib/api';

// News notification level options
const NEWS_LEVELS = [
    { id: 'breaking' as const, label: '🔴 Solo Breaking News', desc: 'Noticias de alta importancia' },
    { id: 'all' as const, label: '📰 Todas las noticias', desc: 'Todas las noticias nuevas' },
    { id: 'none' as const, label: '🔕 Desactivado', desc: 'Sin notificaciones de noticias' },
];

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors, isDark, toggleTheme, theme } = useTheme();

    // Notification preferences state
    const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>({
        newsLevel: 'breaking',
        commentsEnabled: true,
    });
    const [loadingPrefs, setLoadingPrefs] = useState(true);
    const [savingPrefs, setSavingPrefs] = useState(false);

    // Load notification preferences
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = useCallback(async () => {
        try {
            setLoadingPrefs(true);
            const result = await getNotificationPreferences();
            if (result.success && result.data) {
                setNotifPrefs(result.data);
            }
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
        } finally {
            setLoadingPrefs(false);
        }
    }, []);

    const handleNewsLevelChange = async (level: 'all' | 'breaking' | 'none') => {
        if (savingPrefs) return;

        const oldLevel = notifPrefs.newsLevel;
        setNotifPrefs(prev => ({ ...prev, newsLevel: level }));

        try {
            setSavingPrefs(true);
            const result = await updateNotificationPreferences({ newsLevel: level });
            if (!result.success) {
                // Revert on error
                setNotifPrefs(prev => ({ ...prev, newsLevel: oldLevel }));
            }
        } catch (error) {
            setNotifPrefs(prev => ({ ...prev, newsLevel: oldLevel }));
        } finally {
            setSavingPrefs(false);
        }
    };

    const handleCommentsToggle = async (enabled: boolean) => {
        if (savingPrefs) return;

        const oldValue = notifPrefs.commentsEnabled;
        setNotifPrefs(prev => ({ ...prev, commentsEnabled: enabled }));

        try {
            setSavingPrefs(true);
            const result = await updateNotificationPreferences({ commentsEnabled: enabled });
            if (!result.success) {
                setNotifPrefs(prev => ({ ...prev, commentsEnabled: oldValue }));
            }
        } catch (error) {
            setNotifPrefs(prev => ({ ...prev, commentsEnabled: oldValue }));
        } finally {
            setSavingPrefs(false);
        }
    };

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
                {/* Notifications Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notificaciones</Text>

                    {loadingPrefs ? (
                        <View style={[styles.settingCard, styles.loadingCard]}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        <>
                            {/* News Notification Level */}
                            <View style={styles.settingCard}>
                                <View style={styles.settingHeader}>
                                    <Text style={styles.settingIcon}>📰</Text>
                                    <Text style={styles.settingLabel}>Noticias de IA</Text>
                                </View>
                                {NEWS_LEVELS.map((level, index) => (
                                    <TouchableOpacity
                                        key={level.id}
                                        style={[
                                            styles.optionRow,
                                            index > 0 && styles.optionRowBorder,
                                            notifPrefs.newsLevel === level.id && styles.optionRowSelected,
                                        ]}
                                        onPress={() => handleNewsLevelChange(level.id)}
                                        disabled={savingPrefs}
                                    >
                                        <View style={styles.optionInfo}>
                                            <Text style={[
                                                styles.optionLabel,
                                                notifPrefs.newsLevel === level.id && styles.optionLabelSelected,
                                            ]}>
                                                {level.label}
                                            </Text>
                                            <Text style={styles.optionDesc}>{level.desc}</Text>
                                        </View>
                                        <View style={[
                                            styles.radioOuter,
                                            notifPrefs.newsLevel === level.id && styles.radioOuterSelected,
                                        ]}>
                                            {notifPrefs.newsLevel === level.id && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Comments Notification Toggle */}
                            <View style={[styles.settingCard, { marginTop: SPACING.md }]}>
                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingIcon}>💬</Text>
                                        <View>
                                            <Text style={styles.settingLabel}>Comentarios en mis proyectos</Text>
                                            <Text style={styles.settingDesc}>
                                                Recibe notificaciones cuando alguien comente
                                            </Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={notifPrefs.commentsEnabled}
                                        onValueChange={handleCommentsToggle}
                                        disabled={savingPrefs}
                                        trackColor={{
                                            false: colors.surfaceBorder,
                                            true: colors.primary
                                        }}
                                        thumbColor={notifPrefs.commentsEnabled ? colors.primaryLight : '#FFFFFF'}
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </View>

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
    loadingCard: {
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
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
        flex: 1,
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
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    optionRowBorder: {
        borderTopWidth: 1,
        borderTopColor: colors.surfaceBorder,
    },
    optionRowSelected: {
        backgroundColor: colors.primaryLight + '10',
    },
    optionInfo: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 15,
        color: colors.textPrimary,
    },
    optionLabelSelected: {
        fontWeight: '600',
        color: colors.primary,
    },
    optionDesc: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: colors.surfaceBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primary,
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
