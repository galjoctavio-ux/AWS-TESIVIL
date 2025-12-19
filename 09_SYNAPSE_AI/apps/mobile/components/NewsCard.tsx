import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '@/constants/config';

interface NewsCardProps {
    id: string;
    title: string;
    bullets: string[];
    source: string;
    publishedAt: string;
    importance: number;
    isBreaking?: boolean;
    onPress: () => void;
}

export function NewsCard({
    title,
    bullets,
    source,
    publishedAt,
    importance,
    isBreaking,
    onPress,
}: NewsCardProps) {
    // Format relative time
    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return `${diffDays}d`;
    };

    // Get importance color
    const getImportanceColor = () => {
        if (importance >= 9) return COLORS.error;
        if (importance >= 7) return COLORS.warning;
        return COLORS.feed;
    };

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

            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.importanceDot, { backgroundColor: getImportanceColor() }]} />
                <Text style={styles.source}>{source}</Text>
                <Text style={styles.time}>• {getRelativeTime(publishedAt)}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
                {title}
            </Text>

            {/* Bullets */}
            <View style={styles.bullets}>
                {bullets.slice(0, 2).map((bullet, index) => (
                    <View key={index} style={styles.bulletRow}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText} numberOfLines={1}>
                            {bullet}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Read more indicator */}
            <Text style={styles.readMore}>Leer más →</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
    },
    breakingContainer: {
        borderColor: COLORS.error,
        borderWidth: 2,
    },
    breakingBadge: {
        position: 'absolute',
        top: -8,
        right: SPACING.md,
        backgroundColor: COLORS.error,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    breakingText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    importanceDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: SPACING.xs,
    },
    source: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.feed,
    },
    time: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: SPACING.xs,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        lineHeight: 22,
        marginBottom: SPACING.sm,
    },
    bullets: {
        gap: 4,
        marginBottom: SPACING.sm,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletDot: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginRight: SPACING.xs,
        lineHeight: 18,
    },
    bulletText: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    readMore: {
        fontSize: 12,
        color: COLORS.feed,
        fontWeight: '500',
    },
});

export default NewsCard;
