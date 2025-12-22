import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SPACING, RADIUS } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';

interface ModelCardProps {
    id: string;
    rank: number;
    name: string;
    provider: string;
    category: string;
    scoreOverall: number;
    trend: 'up' | 'down' | 'stable';
    isNew?: boolean;
    isFeatured?: boolean;
    onPress: () => void;
}

export function ModelCard({
    rank,
    name,
    provider,
    category,
    scoreOverall,
    trend,
    isNew,
    isFeatured,
    onPress,
}: ModelCardProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    // Get trend icon
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return '📈';
            case 'down':
                return '📉';
            default:
                return '➖';
        }
    };

    // Get rank color
    const getRankColor = () => {
        if (rank === 1) return '#FFD700'; // Gold
        if (rank === 2) return '#C0C0C0'; // Silver
        if (rank === 3) return '#CD7F32'; // Bronze
        return colors.textMuted;
    };

    // Get category color
    const getCategoryColor = () => {
        switch (category) {
            case 'chat':
                return colors.primary;
            case 'code':
                return colors.showcase;
            case 'image':
                return colors.pulse;
            case 'audio':
                return colors.feed;
            default:
                return colors.textMuted;
        }
    };

    // Format score with fallback
    const displayScore = scoreOverall != null && !isNaN(scoreOverall)
        ? scoreOverall.toFixed(1)
        : 'N/A';

    return (
        <TouchableOpacity
            style={[styles.container, isFeatured && styles.featuredContainer]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Rank */}
            <View style={[styles.rankContainer, { borderColor: getRankColor() }]}>
                <Text style={[styles.rankText, { color: getRankColor() }]}>
                    #{rank}
                </Text>
            </View>

            {/* Model Info */}
            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name || 'Modelo sin nombre'}
                    </Text>
                    {isNew && (
                        <View style={styles.newBadge}>
                            <Text style={styles.newText}>NEW</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.provider}>{provider || 'Proveedor desconocido'}</Text>
                <View style={styles.categoryRow}>
                    <View style={[styles.categoryDot, { backgroundColor: getCategoryColor() }]} />
                    <Text style={styles.categoryText}>{category || 'General'}</Text>
                </View>
            </View>

            {/* Score & Trend */}
            <View style={styles.scoreContainer}>
                <Text style={styles.score}>{displayScore}</Text>
                <Text style={styles.trend}>{getTrendIcon()}</Text>
            </View>
        </TouchableOpacity>
    );
}

// Podium component for top 3
export function Podium({
    models,
    onModelPress,
}: {
    models: any[];
    onModelPress: (model: any) => void;
}) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    if (models.length < 3) return null;

    const [first, second, third] = models;

    const renderPodiumItem = (model: any, position: 1 | 2 | 3) => {
        const heights = { 1: 100, 2: 80, 3: 60 };
        const podiumColors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
        const emojis = { 1: '🥇', 2: '🥈', 3: '🥉' };

        return (
            <TouchableOpacity
                style={[styles.podiumItem, { height: heights[position] + 60 }]}
                onPress={() => onModelPress(model)}
            >
                <Text style={styles.podiumEmoji}>{emojis[position]}</Text>
                <Text style={styles.podiumName} numberOfLines={1}>
                    {model.name}
                </Text>
                <Text style={styles.podiumScore}>{model.score_overall?.toFixed(1) || 'N/A'}</Text>
                <View
                    style={[
                        styles.podiumBar,
                        { height: heights[position], backgroundColor: podiumColors[position] },
                    ]}
                >
                    <Text style={styles.podiumRank}>{position}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.podiumContainer}>
            {renderPodiumItem(second, 2)}
            {renderPodiumItem(first, 1)}
            {renderPodiumItem(third, 3)}
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    featuredContainer: {
        borderColor: colors.pulse,
        borderWidth: 2,
    },
    rankContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    rankText: {
        fontSize: 14,
        fontWeight: '700',
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
        flex: 1,
    },
    newBadge: {
        backgroundColor: colors.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    newText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
    },
    provider: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    categoryDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    categoryText: {
        fontSize: 11,
        color: colors.textSecondary,
        textTransform: 'capitalize',
    },
    scoreContainer: {
        alignItems: 'center',
    },
    score: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.pulse,
    },
    trend: {
        fontSize: 12,
        marginTop: 2,
    },
    // Podium styles
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.md,
    },
    podiumItem: {
        alignItems: 'center',
        width: 100,
        marginHorizontal: SPACING.xs,
    },
    podiumEmoji: {
        fontSize: 24,
        marginBottom: SPACING.xs,
    },
    podiumName: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 2,
    },
    podiumScore: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.pulse,
        marginBottom: SPACING.xs,
    },
    podiumBar: {
        width: '100%',
        borderTopLeftRadius: RADIUS.md,
        borderTopRightRadius: RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    podiumRank: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
});

export default ModelCard;
