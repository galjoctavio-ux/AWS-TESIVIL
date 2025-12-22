import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Linking,
    RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SPACING, RADIUS, API_URL } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { RadarChart } from '@/components/RadarChart';
import { ReviewForm } from '@/components/ReviewForm';

// Fetch model details
async function fetchModel(id: string) {
    const response = await fetch(`${API_URL}/api/models/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

// Fetch model stats
async function fetchModelStats(id: string) {
    const response = await fetch(`${API_URL}/api/models/${id}/stats`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

// Fetch model reviews
async function fetchModelReviews(id: string) {
    const response = await fetch(`${API_URL}/api/models/${id}/reviews`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

export default function ModelDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const { colors } = useTheme();
    const [showReviewForm, setShowReviewForm] = useState(false);

    const styles = createStyles(colors);

    // Queries
    const modelQuery = useQuery({
        queryKey: ['models', id],
        queryFn: () => fetchModel(id!),
        enabled: !!id,
    });

    const statsQuery = useQuery({
        queryKey: ['models', id, 'stats'],
        queryFn: () => fetchModelStats(id!),
        enabled: !!id,
    });

    const reviewsQuery = useQuery({
        queryKey: ['models', id, 'reviews'],
        queryFn: () => fetchModelReviews(id!),
        enabled: !!id,
    });

    const model = modelQuery.data;
    const stats = statsQuery.data;
    const reviews = reviewsQuery.data || [];

    // Vote mutation
    const voteMutation = useMutation({
        mutationFn: async ({ reviewId, voteType }: { reviewId: string; voteType: 'upvote' | 'downvote' }) => {
            const response = await fetch(`${API_URL}/api/models/reviews/${reviewId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': 'demo-user', // TODO: Replace with real auth
                },
                body: JSON.stringify({ voteType }),
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['models', id, 'reviews'] });
        },
    });

    // Handle external link
    const handleTryModel = () => {
        // Open provider's website
        const urls: Record<string, string> = {
            openai: 'https://chat.openai.com',
            anthropic: 'https://claude.ai',
            google: 'https://gemini.google.com',
            meta: 'https://llama.meta.com',
        };
        const url = urls[model?.provider_id?.toLowerCase()] || 'https://openrouter.ai';
        Linking.openURL(url);
    };

    // Handle create prompt
    const handleCreatePrompt = () => {
        router.push('/engine');
    };

    // Refresh all data
    const handleRefresh = () => {
        modelQuery.refetch();
        statsQuery.refetch();
        reviewsQuery.refetch();
    };

    const isLoading = modelQuery.isLoading;
    const isRefreshing = modelQuery.isRefetching || statsQuery.isRefetching || reviewsQuery.isRefetching;

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" color={colors.pulse} />
                <Text style={styles.loadingText}>Cargando modelo...</Text>
            </View>
        );
    }

    if (!model) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.errorIcon}>🤖</Text>
                <Text style={styles.errorTitle}>Modelo no encontrado</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: model.name,
                    headerStyle: { backgroundColor: colors.background },
                    headerTintColor: colors.textPrimary,
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.pulse}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.providerBadge}>
                        <Text style={styles.providerText}>{model.provider_id}</Text>
                    </View>
                    <Text style={styles.modelName}>{model.name}</Text>
                    {model.category && (
                        <Text style={styles.category}>{model.category}</Text>
                    )}
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>Score General</Text>
                        <Text style={styles.scoreValue}>{model.score_overall?.toFixed(1) || 'N/A'}</Text>
                    </View>
                </View>

                {/* Radar Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Métricas de la Comunidad</Text>
                    <RadarChart
                        data={{
                            speed: stats?.avgSpeed || 3,
                            precision: stats?.avgAccuracy || 3,
                            hallucination: stats?.avgCreativity || 3, // Maps from current naming
                        }}
                        size={220}
                    />
                </View>

                {/* Pricing */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Precios (por 1M tokens)</Text>
                    <View style={styles.pricingContainer}>
                        <View style={styles.pricingItem}>
                            <Text style={styles.pricingLabel}>Input</Text>
                            <Text style={styles.pricingValue}>
                                ${model.pricing_input?.toFixed(2) || '0.00'}
                            </Text>
                        </View>
                        <View style={styles.pricingDivider} />
                        <View style={styles.pricingItem}>
                            <Text style={styles.pricingLabel}>Output</Text>
                            <Text style={styles.pricingValue}>
                                ${model.pricing_output?.toFixed(2) || '0.00'}
                            </Text>
                        </View>
                        <View style={styles.pricingDivider} />
                        <View style={styles.pricingItem}>
                            <Text style={styles.pricingLabel}>Contexto</Text>
                            <Text style={styles.pricingValue}>
                                {model.context_length ? `${Math.round(model.context_length / 1000)}K` : 'N/A'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CTAs */}
                <View style={styles.ctaContainer}>
                    <TouchableOpacity style={styles.ctaButton} onPress={handleTryModel}>
                        <Text style={styles.ctaIcon}>🔗</Text>
                        <Text style={styles.ctaText}>Probar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.ctaButtonSecondary} onPress={handleCreatePrompt}>
                        <Text style={styles.ctaIcon}>✨</Text>
                        <Text style={styles.ctaTextSecondary}>Crear Prompt</Text>
                    </TouchableOpacity>
                </View>

                {/* Review Form Toggle */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>⭐ Calificar este modelo</Text>
                    </View>
                    {showReviewForm ? (
                        <ReviewForm
                            modelId={id!}
                            modelName={model.name}
                            onSuccess={() => setShowReviewForm(false)}
                            onCancel={() => setShowReviewForm(false)}
                        />
                    ) : (
                        <TouchableOpacity
                            style={styles.addReviewButton}
                            onPress={() => setShowReviewForm(true)}
                        >
                            <Text style={styles.addReviewIcon}>➕</Text>
                            <Text style={styles.addReviewText}>Agregar mi reseña</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Reviews List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        💬 Reseñas ({stats?.reviewCount || 0})
                    </Text>
                    {reviews.length === 0 ? (
                        <View style={styles.emptyReviews}>
                            <Text style={styles.emptyIcon}>📝</Text>
                            <Text style={styles.emptyText}>
                                Sé el primero en calificar este modelo
                            </Text>
                        </View>
                    ) : (
                        reviews.map((review: any) => (
                            <View key={review.id} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <Text style={styles.reviewAuthor}>
                                        @{review.profiles?.alias || 'usuario'}
                                    </Text>
                                    {review.tag && (
                                        <View style={styles.reviewTag}>
                                            <Text style={styles.reviewTagText}>#{review.tag}</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.reviewStars}>
                                    <Text style={styles.reviewStarsText}>
                                        ⚡ {review.speed}/5 • 🎯 {review.accuracy}/5 • ✨ {review.creativity}/5
                                    </Text>
                                </View>
                                {review.comment && (
                                    <Text style={styles.reviewComment}>"{review.comment}"</Text>
                                )}
                                <View style={styles.reviewActions}>
                                    <TouchableOpacity
                                        style={styles.voteButton}
                                        onPress={() => voteMutation.mutate({ reviewId: review.id, voteType: 'upvote' })}
                                    >
                                        <Text style={styles.voteIcon}>👍</Text>
                                        <Text style={styles.voteCount}>{review.is_helpful_count || 0}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
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
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    loadingText: {
        marginTop: SPACING.md,
        color: colors.textMuted,
    },
    errorIcon: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    errorTitle: {
        fontSize: 18,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    backButton: {
        marginTop: SPACING.lg,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        backgroundColor: colors.pulse,
        borderRadius: RADIUS.md,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '500',
    },
    header: {
        padding: SPACING.lg,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    providerBadge: {
        backgroundColor: colors.surface,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full,
        marginBottom: SPACING.sm,
    },
    providerText: {
        color: colors.textSecondary,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    modelName: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    category: {
        fontSize: 14,
        color: colors.pulse,
        marginTop: SPACING.xs,
        textTransform: 'capitalize',
    },
    scoreContainer: {
        marginTop: SPACING.md,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 12,
        color: colors.textMuted,
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: '700',
        color: colors.pulse,
    },
    section: {
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: SPACING.md,
    },
    pricingContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
    },
    pricingItem: {
        flex: 1,
        alignItems: 'center',
    },
    pricingDivider: {
        width: 1,
        backgroundColor: colors.surfaceBorder,
    },
    pricingLabel: {
        fontSize: 11,
        color: colors.textMuted,
        marginBottom: 4,
    },
    pricingValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    ctaContainer: {
        flexDirection: 'row',
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    ctaButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.pulse,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        gap: SPACING.xs,
    },
    ctaIcon: {
        fontSize: 16,
    },
    ctaText: {
        color: '#fff',
        fontWeight: '600',
    },
    ctaButtonSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: colors.pulse,
        gap: SPACING.xs,
    },
    ctaTextSecondary: {
        color: colors.pulse,
        fontWeight: '600',
    },
    addReviewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        paddingVertical: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        borderStyle: 'dashed',
        gap: SPACING.sm,
    },
    addReviewIcon: {
        fontSize: 20,
    },
    addReviewText: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
    emptyReviews: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: SPACING.sm,
    },
    emptyText: {
        color: colors.textMuted,
        textAlign: 'center',
    },
    reviewCard: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    reviewAuthor: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 14,
    },
    reviewTag: {
        backgroundColor: `${colors.pulse}20`,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
    },
    reviewTagText: {
        color: colors.pulse,
        fontSize: 11,
    },
    reviewStars: {
        marginBottom: SPACING.xs,
    },
    reviewStarsText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    reviewComment: {
        color: colors.textSecondary,
        fontSize: 13,
        fontStyle: 'italic',
        marginTop: SPACING.xs,
    },
    reviewActions: {
        flexDirection: 'row',
        marginTop: SPACING.sm,
    },
    voteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: SPACING.sm,
        borderRadius: RADIUS.sm,
        backgroundColor: colors.background,
    },
    voteIcon: {
        fontSize: 14,
    },
    voteCount: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});
