import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { SPACING, RADIUS } from '@/constants/config';
import AcademyLeadCapture from '../../../components/AcademyLeadCapture';

export default function AcademyScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    const styles = createStyles(colors);

    const learningPoints = [
        { icon: 'bulb-outline', title: 'Arquitectura con IA', desc: 'Diseña sistemas antes de escribir código' },
        { icon: 'code-slash-outline', title: 'Prompts de Programación', desc: 'Genera código funcional con Cursor + Claude' },
        { icon: 'rocket-outline', title: 'Deploy en 24h*', desc: 'Del concepto a producción en un día' },
        { icon: 'git-branch-outline', title: 'Flujo de Trabajo', desc: 'El proceso completo que uso en cada proyecto' },
    ];

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
                        <Text style={styles.emoji}>🎓</Text>
                        <Text style={styles.title}>Academia</Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Aprende a construir apps con IA en tiempo récord
                    </Text>
                </View>

                {/* Banner principal de captación */}
                <AcademyLeadCapture source="direct" />

                {/* Sección: Qué aprenderás */}
                <View style={styles.learnSection}>
                    <Text style={styles.sectionTitle}>
                        ¿Qué aprenderás?
                    </Text>

                    {learningPoints.map((item, idx) => (
                        <View key={idx} style={styles.learnCard}>
                            <View style={styles.learnIconContainer}>
                                <Ionicons name={item.icon as any} size={20} color={colors.academy} />
                            </View>
                            <View style={styles.learnContent}>
                                <Text style={styles.learnTitle}>{item.title}</Text>
                                <Text style={styles.learnDesc}>{item.desc}</Text>
                            </View>
                        </View>
                    ))}
                    <View style={{ marginTop: 8, paddingHorizontal: 4 }}>
                        <Text style={[styles.learnDesc, { fontSize: 11, fontStyle: 'italic' }]}>
                            * Aplicaciones sencillas
                        </Text>
                        <Text style={[styles.learnDesc, { fontSize: 11, fontStyle: 'italic' }]}>
                            ** Horas de trabajo efectivas
                        </Text>
                    </View>
                </View>

                {/* Próximamente banner */}
                <View style={styles.comingSoonBanner}>
                    <Ionicons name="time-outline" size={24} color={colors.academy} />
                    <View style={styles.comingSoonContent}>
                        <Text style={styles.comingSoonTitle}>Capacitaciones próximamente</Text>
                        <Text style={styles.comingSoonDesc}>
                            Estamos preparando contenido exclusivo. ¡Únete a la lista de espera!
                        </Text>
                    </View>
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
        padding: SPACING.lg,
        paddingBottom: 100,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        marginBottom: SPACING.sm,
    },
    emoji: {
        fontSize: 28,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    learnSection: {
        marginTop: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: SPACING.md,
    },
    learnCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.md,
        marginBottom: SPACING.md,
        backgroundColor: colors.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    learnIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${colors.academy}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    learnContent: {
        flex: 1,
    },
    learnTitle: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 15,
    },
    learnDesc: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    comingSoonBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: SPACING.md,
        marginTop: SPACING.xl,
        backgroundColor: `${colors.academy}15`,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: `${colors.academy}40`,
    },
    comingSoonContent: {
        flex: 1,
    },
    comingSoonTitle: {
        color: colors.academy,
        fontWeight: '600',
        fontSize: 15,
    },
    comingSoonDesc: {
        color: colors.textSecondary,
        fontSize: 13,
        marginTop: 4,
    },
});
