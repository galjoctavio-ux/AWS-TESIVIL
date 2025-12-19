import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '@/constants/config';

interface ProjectCardProps {
    id: string;
    title: string;
    description?: string;
    images: string[];
    toolsUsed: string[];
    upvoteCount: number;
    viewCount: number;
    authorAlias?: string;
    isFeatured?: boolean;
    onPress: () => void;
    onVote: () => void;
}

export function ProjectCard({
    title,
    description,
    images,
    toolsUsed,
    upvoteCount,
    viewCount,
    authorAlias,
    isFeatured,
    onPress,
    onVote,
}: ProjectCardProps) {
    // Format numbers (1000 -> 1K)
    const formatNumber = (num: number): string => {
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    // Get tool emoji
    const getToolEmoji = (tool: string): string => {
        const emojis: Record<string, string> = {
            chatgpt: '🤖',
            claude: '🧠',
            midjourney: '🎨',
            dalle: '🖼️',
            'stable-diffusion': '✨',
            copilot: '👨‍💻',
            cursor: '⌨️',
            v0: '🌐',
            default: '🔧',
        };
        return emojis[tool.toLowerCase()] || emojis.default;
    };

    return (
        <TouchableOpacity
            style={[styles.container, isFeatured && styles.featuredContainer]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Featured badge */}
            {isFeatured && (
                <View style={styles.featuredBadge}>
                    <Text style={styles.featuredText}>⭐ DESTACADO</Text>
                </View>
            )}

            {/* Image */}
            <View style={styles.imageContainer}>
                {images.length > 0 ? (
                    <Image
                        source={{ uri: images[0] }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text style={styles.placeholderEmoji}>🚀</Text>
                    </View>
                )}
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                {/* Description */}
                {description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {description}
                    </Text>
                )}

                {/* Tools Used */}
                <View style={styles.toolsRow}>
                    {toolsUsed.slice(0, 3).map((tool, index) => (
                        <View key={index} style={styles.toolChip}>
                            <Text style={styles.toolEmoji}>{getToolEmoji(tool)}</Text>
                            <Text style={styles.toolName} numberOfLines={1}>
                                {tool}
                            </Text>
                        </View>
                    ))}
                    {toolsUsed.length > 3 && (
                        <Text style={styles.moreTools}>+{toolsUsed.length - 3}</Text>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    {/* Author */}
                    {authorAlias && (
                        <Text style={styles.author}>@{authorAlias}</Text>
                    )}

                    <View style={styles.stats}>
                        {/* Views */}
                        <View style={styles.statItem}>
                            <Text style={styles.statIcon}>👁️</Text>
                            <Text style={styles.statValue}>{formatNumber(viewCount)}</Text>
                        </View>

                        {/* Upvotes */}
                        <TouchableOpacity style={styles.upvoteButton} onPress={onVote}>
                            <Text style={styles.upvoteIcon}>🔥</Text>
                            <Text style={styles.upvoteValue}>{formatNumber(upvoteCount)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
    },
    featuredContainer: {
        borderColor: COLORS.showcase,
        borderWidth: 2,
    },
    featuredBadge: {
        position: 'absolute',
        top: SPACING.sm,
        left: SPACING.sm,
        backgroundColor: COLORS.showcase,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        zIndex: 10,
    },
    featuredText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    imageContainer: {
        height: 160,
        backgroundColor: COLORS.surfaceLight,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: `${COLORS.showcase}20`,
    },
    placeholderEmoji: {
        fontSize: 48,
    },
    content: {
        padding: SPACING.md,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textPrimary,
        lineHeight: 22,
    },
    description: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
        lineHeight: 18,
    },
    toolsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: SPACING.sm,
        gap: SPACING.xs,
    },
    toolChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surfaceLight,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: RADIUS.full,
    },
    toolEmoji: {
        fontSize: 10,
        marginRight: 4,
    },
    toolName: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    moreTools: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginLeft: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    author: {
        fontSize: 12,
        color: COLORS.showcase,
        fontWeight: '500',
    },
    stats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    statValue: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    upvoteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.showcase}20`,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: RADIUS.sm,
    },
    upvoteIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    upvoteValue: {
        fontSize: 12,
        color: COLORS.showcase,
        fontWeight: '600',
    },
});

export default ProjectCard;
