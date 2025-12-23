import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { SPACING, RADIUS, API_URL } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { incrementStat } from '@/lib/userStats';
import { useAlias } from '@/contexts/AliasContext';

interface ReviewFormProps {
    modelId: string;
    modelName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const TAGS = [
    { id: 'codigo', label: '#Código', icon: '💻' },
    { id: 'analisis', label: '#Análisis', icon: '📊' },
    { id: 'creatividad', label: '#Creatividad', icon: '🎨' },
    { id: 'resumen', label: '#Resumen', icon: '📝' },
    { id: 'chat', label: '#Chat', icon: '💬' },
];

// Star rating component
function StarRating({
    value,
    onChange,
    label,
    colors,
}: {
    value: number;
    onChange: (val: number) => void;
    label: string;
    colors: ThemeColors;
}) {
    return (
        <View style={createStyles(colors).ratingRow}>
            <Text style={createStyles(colors).ratingLabel}>{label}</Text>
            <View style={createStyles(colors).stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onChange(star)}
                        style={createStyles(colors).starButton}
                    >
                        <Text style={[createStyles(colors).star, star <= value && createStyles(colors).starActive]}>
                            ★
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

export function ReviewForm({ modelId, modelName, onSuccess, onCancel }: ReviewFormProps) {
    const { colors } = useTheme();
    const { alias } = useAlias();
    const queryClient = useQueryClient();
    const [speed, setSpeed] = useState(3);
    const [precision, setPrecision] = useState(3);
    const [hallucination, setHallucination] = useState(3);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [comment, setComment] = useState('');

    const styles = createStyles(colors);

    const submitMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${API_URL}/api/models/${modelId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': 'demo-user', // TODO: Replace with real auth
                },
                body: JSON.stringify({
                    speed,
                    accuracy: precision,
                    creativity: hallucination, // Maps to hallucination in our UI
                    tag: selectedTag,
                    comment: comment.trim() || undefined,
                    authorAlias: alias,
                }),
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to submit review');
            }
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['models', modelId, 'reviews'] });
            queryClient.invalidateQueries({ queryKey: ['models', modelId, 'stats'] });
            incrementStat('reviewsGiven');
            onSuccess?.();
        },
    });

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Calificar {modelName}</Text>

            {/* Star Ratings */}
            <View style={styles.ratingsContainer}>
                <StarRating value={speed} onChange={setSpeed} label="⚡ Velocidad" colors={colors} />
                <StarRating value={precision} onChange={setPrecision} label="🎯 Precisión" colors={colors} />
                <StarRating value={hallucination} onChange={setHallucination} label="✨ No alucina" colors={colors} />
            </View>

            {/* Tag Selection */}
            <Text style={styles.sectionLabel}>Lo usé para:</Text>
            <View style={styles.tagsContainer}>
                {TAGS.map((tag) => (
                    <TouchableOpacity
                        key={tag.id}
                        style={[
                            styles.tagChip,
                            selectedTag === tag.id && styles.tagChipSelected,
                        ]}
                        onPress={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                    >
                        <Text style={styles.tagIcon}>{tag.icon}</Text>
                        <Text
                            style={[
                                styles.tagLabel,
                                selectedTag === tag.id && styles.tagLabelSelected,
                            ]}
                        >
                            {tag.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Comment */}
            <Text style={styles.sectionLabel}>Comentario (opcional)</Text>
            <TextInput
                style={styles.commentInput}
                placeholder="Comparte tu experiencia..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={500}
                value={comment}
                onChangeText={setComment}
            />
            <Text style={styles.charCount}>{comment.length}/500</Text>

            {/* Error message */}
            {submitMutation.isError && (
                <Text style={styles.errorText}>
                    {submitMutation.error?.message || 'Error al enviar'}
                </Text>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.submitButton, submitMutation.isPending && styles.submitButtonDisabled]}
                    onPress={() => submitMutation.mutate()}
                    disabled={submitMutation.isPending}
                >
                    {submitMutation.isPending ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Publicar Reseña</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: SPACING.md,
    },
    ratingsContainer: {
        marginBottom: SPACING.lg,
    },
    ratingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    ratingLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    stars: {
        flexDirection: 'row',
    },
    starButton: {
        padding: 4,
    },
    star: {
        fontSize: 24,
        color: colors.surfaceBorder,
    },
    starActive: {
        color: '#FFD700',
    },
    sectionLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: SPACING.sm,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    tagChipSelected: {
        backgroundColor: `${colors.pulse}20`,
        borderColor: colors.pulse,
    },
    tagIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    tagLabel: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    tagLabelSelected: {
        color: colors.pulse,
    },
    commentInput: {
        backgroundColor: colors.background,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        color: colors.textPrimary,
        fontSize: 14,
        minHeight: 80,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    charCount: {
        fontSize: 11,
        color: colors.textMuted,
        textAlign: 'right',
        marginTop: 4,
        marginBottom: SPACING.md,
    },
    errorText: {
        color: colors.error,
        fontSize: 13,
        marginBottom: SPACING.md,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
    submitButton: {
        flex: 2,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        backgroundColor: colors.pulse,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default ReviewForm;
