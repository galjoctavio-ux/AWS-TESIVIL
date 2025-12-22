import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { SPACING, RADIUS } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonCardProps {
    variant?: 'news' | 'model' | 'project';
}

export function SkeletonCard({ variant = 'news' }: SkeletonCardProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
    });

    if (variant === 'news') {
        return (
            <Animated.View style={[styles.newsCard, { opacity }]}>
                <View style={styles.newsHeader}>
                    <View style={styles.newsBadge} />
                    <View style={styles.newsTime} />
                </View>
                <View style={styles.newsTitle} />
                <View style={styles.newsTitleShort} />
                <View style={styles.newsBullets}>
                    <View style={styles.bullet} />
                    <View style={styles.bullet} />
                    <View style={styles.bulletShort} />
                </View>
            </Animated.View>
        );
    }

    if (variant === 'model') {
        return (
            <Animated.View style={[styles.modelCard, { opacity }]}>
                <View style={styles.modelRank} />
                <View style={styles.modelInfo}>
                    <View style={styles.modelName} />
                    <View style={styles.modelProvider} />
                </View>
                <View style={styles.modelScore} />
            </Animated.View>
        );
    }

    if (variant === 'project') {
        return (
            <Animated.View style={[styles.projectCard, { opacity }]}>
                <View style={styles.projectImage} />
                <View style={styles.projectContent}>
                    <View style={styles.projectTitle} />
                    <View style={styles.projectDesc} />
                    <View style={styles.projectTags}>
                        <View style={styles.tag} />
                        <View style={styles.tag} />
                    </View>
                </View>
            </Animated.View>
        );
    }

    return null;
}

export function SkeletonList({
    count = 3,
    variant = 'news'
}: {
    count?: number;
    variant?: 'news' | 'model' | 'project';
}) {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <View style={styles.list}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} variant={variant} />
            ))}
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    list: {
        gap: SPACING.md,
    },
    // News card skeleton
    newsCard: {
        backgroundColor: colors.skeletonBase,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    newsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    newsBadge: {
        width: 60,
        height: 16,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
    },
    newsTime: {
        width: 40,
        height: 12,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
    },
    newsTitle: {
        width: '90%',
        height: 18,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.xs,
    },
    newsTitleShort: {
        width: '60%',
        height: 18,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.md,
    },
    newsBullets: {
        gap: SPACING.xs,
    },
    bullet: {
        width: '100%',
        height: 12,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
    },
    bulletShort: {
        width: '70%',
        height: 12,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
    },
    // Model card skeleton
    modelCard: {
        backgroundColor: colors.skeletonBase,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    modelRank: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.skeletonHighlight,
        marginRight: SPACING.md,
    },
    modelInfo: {
        flex: 1,
        gap: SPACING.xs,
    },
    modelName: {
        width: '70%',
        height: 16,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
    },
    modelProvider: {
        width: '40%',
        height: 12,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
    },
    modelScore: {
        width: 48,
        height: 24,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
    },
    // Project card skeleton
    projectCard: {
        backgroundColor: colors.skeletonBase,
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        marginBottom: SPACING.md,
    },
    projectImage: {
        width: '100%',
        height: 180,
        backgroundColor: colors.skeletonHighlight,
    },
    projectContent: {
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    projectTitle: {
        width: '80%',
        height: 18,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
    },
    projectDesc: {
        width: '100%',
        height: 12,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.sm,
    },
    projectTags: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },
    tag: {
        width: 60,
        height: 20,
        backgroundColor: colors.skeletonHighlight,
        borderRadius: RADIUS.full,
    },
});

export default SkeletonCard;
