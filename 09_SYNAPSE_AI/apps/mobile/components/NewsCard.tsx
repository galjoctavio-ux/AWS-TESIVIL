import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SPACING, RADIUS } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { Icon } from '@/components/icons/Icon';

interface NewsCardProps {
    id: string;
    title: string;
    bullets: string[];
    source: string;
    publishedAt: string;
    importance: number;
    isBreaking?: boolean;
    likeCount?: number;
    commentCount?: number;
    onPress: () => void;
}

export function NewsCard({
    title,
    bullets,
    source,
    publishedAt,
    importance,
    isBreaking,
    likeCount = 0,
    commentCount = 0,
    onPress,
}: NewsCardProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    // Format relative time
    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `hace ${diffMins}m`;
        if (diffHours < 24) return `hace ${diffHours}h`;
        return `hace ${diffDays}d`;
    };

    // Get importance color and icon
    const getImportanceConfig = () => {
        if (importance >= 9) return { color: colors.error, icon: 'AlertTriangle' as const };
        if (importance >= 7) return { color: colors.warning, icon: 'TrendingUp' as const };
        return { color: colors.feed, icon: 'Newspaper' as const };
    };

    const importanceConfig = getImportanceConfig();

    return (
        <TouchableOpacity
            style={[styles.container, isBreaking && styles.breakingContainer]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Breaking badge */}
            {isBreaking && (
                <View style={styles.breakingBadge}>
                    <Text style={styles.breakingText}>🚨 BREAKING</Text>
                </View>
            )}

            {/* Logo area at top */}
            <View style={styles.iconArea}>
                <View style={[styles.iconCircle, { borderColor: importanceConfig.color, borderWidth: 2 }]}>
                    <Image
                        source={require('@/assets/images/placeholder-logo.png')}
                        style={styles.logoImage}
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.importanceDot, { backgroundColor: importanceConfig.color }]} />
                <Text style={styles.source}>{source || 'AI News'}</Text>
                <Text style={styles.time}>• {getRelativeTime(publishedAt)}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
                {title || 'Sin título disponible'}
            </Text>

            {/* Bullets */}
            {bullets && bullets.length > 0 ? (
                <View style={styles.bullets}>
                    {bullets.slice(0, 2).map((bullet, index) => (
                        <View key={index} style={styles.bulletRow}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.bulletText} numberOfLines={2}>
                                {bullet}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={styles.noContent}>
                    Toca para leer la noticia completa
                </Text>
            )}

            {/* Footer with stats and read more */}
            <View style={styles.footer}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Icon name="Heart" size={14} color={colors.textMuted} />
                        <Text style={styles.statText}>{likeCount}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Icon name="MessageCircle" size={14} color={colors.textMuted} />
                        <Text style={styles.statText}>{commentCount}</Text>
                    </View>
                </View>
                <View style={styles.readMoreRow}>
                    <Text style={styles.readMore}>Leer más</Text>
                    <Icon name="ArrowRight" size={14} color={colors.feed} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        minHeight: 180,
    },
    breakingContainer: {
        borderColor: colors.error,
        borderWidth: 2,
    },
    breakingBadge: {
        position: 'absolute',
        top: -8,
        right: SPACING.md,
        backgroundColor: colors.error,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        zIndex: 10,
    },
    breakingText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    iconArea: {
        marginBottom: SPACING.sm,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    logoImage: {
        width: 32,
        height: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    importanceDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: SPACING.xs,
    },
    source: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.feed,
    },
    time: {
        fontSize: 12,
        color: colors.textMuted,
        marginLeft: SPACING.xs,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.textPrimary,
        lineHeight: 24,
        marginBottom: SPACING.sm,
    },
    bullets: {
        gap: 6,
        marginBottom: SPACING.sm,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletDot: {
        fontSize: 14,
        color: colors.feed,
        marginRight: SPACING.xs,
        lineHeight: 20,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    noContent: {
        fontSize: 14,
        color: colors.textMuted,
        fontStyle: 'italic',
        marginBottom: SPACING.sm,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
        color: colors.textMuted,
    },
    readMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    readMore: {
        fontSize: 13,
        color: colors.feed,
        fontWeight: '600',
    },
});

export default NewsCard;
