import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, IconName } from '@/components/icons/Icon';
import { SPACING, RADIUS } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';

interface EmptyStateProps {
    icon: IconName;
    iconColor?: string;
    title: string;
    subtitle?: string;
    actionLabel: string;
    onAction: () => void;
    secondaryLabel?: string;
    onSecondaryAction?: () => void;
}

export function EmptyState({
    icon,
    iconColor,
    title,
    subtitle,
    actionLabel,
    onAction,
    secondaryLabel,
    onSecondaryAction,
}: EmptyStateProps) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const effectiveIconColor = iconColor || colors.textMuted;

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Icon
                    name={icon}
                    size={64}
                    color={effectiveIconColor}
                    strokeWidth={1.25}
                />
            </View>

            <Text style={styles.title}>{title}</Text>

            {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
            )}

            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: effectiveIconColor }]}
                onPress={onAction}
                activeOpacity={0.8}
            >
                <Text style={styles.actionText}>{actionLabel}</Text>
            </TouchableOpacity>

            {secondaryLabel && onSecondaryAction && (
                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={onSecondaryAction}
                    activeOpacity={0.7}
                >
                    <Text style={styles.secondaryText}>{secondaryLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        marginTop: SPACING.xl,
    },
    iconContainer: {
        marginBottom: SPACING.lg,
        opacity: 0.8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: SPACING.sm,
        lineHeight: 20,
    },
    actionButton: {
        marginTop: SPACING.lg,
        paddingVertical: SPACING.sm + 2,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.full,
    },
    actionText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButton: {
        marginTop: SPACING.md,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
    },
    secondaryText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default EmptyState;
