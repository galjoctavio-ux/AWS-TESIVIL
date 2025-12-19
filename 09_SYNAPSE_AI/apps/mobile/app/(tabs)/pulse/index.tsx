import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { COLORS, SPACING, RADIUS, API_URL } from '@/constants/config';
import { ModelCard, Podium } from '@/components/ModelCard';

// Fetch models from API
async function fetchModels(category?: string): Promise<any[]> {
    const params = new URLSearchParams();
    params.set('limit', '50');
    params.set('sort', 'score');
    if (category && category !== 'all') {
        params.set('category', category);
    }

    const response = await fetch(`${API_URL}/api/models?${params.toString()}`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to fetch models');
    }

    return data.data || [];
}

// Fetch top 3 models
async function fetchTopModels(): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/models/top`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to fetch top models');
    }

    return data.data || [];
}

// Categories filter
const CATEGORIES = [
    { id: 'all', label: 'Todos', icon: '🏆' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'code', label: 'Código', icon: '👨‍💻' },
    { id: 'image', label: 'Imagen', icon: '🎨' },
    { id: 'audio', label: 'Audio', icon: '🎵' },
];

export default function PulseScreen() {
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Query for top 3 models
    const topModelsQuery = useQuery({
        queryKey: ['models', 'top'],
        queryFn: fetchTopModels,
    });

    // Query for all models
    const modelsQuery = useQuery({
        queryKey: ['models', selectedCategory],
        queryFn: () => fetchModels(selectedCategory),
    });

    const topModels = topModelsQuery.data || [];
    const models = modelsQuery.data || [];

    // Handle model press
    const handleModelPress = useCallback((model: any) => {
        // TODO: Navigate to model detail
        console.log('Model pressed:', model.name);
    }, []);

    // Handle refresh
    const handleRefresh = () => {
        topModelsQuery.refetch();
        modelsQuery.refetch();
    };

    // Render model card
    const renderModel = ({ item, index }: { item: any; index: number }) => (
        <ModelCard
            id={item.id}
            rank={index + 4} // +4 because top 3 are in podium
            name={item.name}
            provider={item.provider_id}
            category={item.category}
            scoreOverall={item.score_overall || 0}
            trend={item.trend || 'stable'}
            isNew={item.is_new}
            isFeatured={item.is_featured}
            onPress={() => handleModelPress(item)}
        />
    );

    // Header with podium
    const renderHeader = () => (
        <View>
            {/* Podium */}
            {topModels.length >= 3 && (
                <Podium models={topModels} onModelPress={handleModelPress} />
            )}

            {/* Rankings title */}
            <View style={styles.rankingsHeader}>
                <Text style={styles.rankingsTitle}>Rankings</Text>
                <Text style={styles.rankingsSubtitle}>
                    {models.length} modelos
                </Text>
            </View>
        </View>
    );

    // Empty state
    const renderEmpty = () => {
        if (modelsQuery.isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🤖</Text>
                <Text style={styles.emptyTitle}>No hay modelos</Text>
                <Text style={styles.emptySubtitle}>
                    No se encontraron modelos en esta categoría.
                </Text>
            </View>
        );
    };

    const isLoading = topModelsQuery.isLoading || modelsQuery.isLoading;
    const isRefetching = topModelsQuery.isRefetching || modelsQuery.isRefetching;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>📊 Pulse</Text>
                <Text style={styles.subtitle}>Rankings de modelos de IA</Text>
            </View>

            {/* Categories Filter */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    horizontal
                    data={CATEGORIES}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                selectedCategory === item.id && styles.categoryChipSelected,
                            ]}
                            onPress={() => setSelectedCategory(item.id)}
                        >
                            <Text style={styles.categoryIcon}>{item.icon}</Text>
                            <Text
                                style={[
                                    styles.categoryLabel,
                                    selectedCategory === item.id && styles.categoryLabelSelected,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {/* Loading State */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.pulse} />
                    <Text style={styles.loadingText}>Cargando rankings...</Text>
                </View>
            )}

            {/* Models List */}
            {!isLoading && (
                <FlatList
                    data={models.slice(3)} // Skip top 3 (shown in podium)
                    keyExtractor={(item) => item.id}
                    renderItem={renderModel}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={handleRefresh}
                            tintColor={COLORS.pulse}
                            colors={[COLORS.pulse]}
                        />
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    categoriesContainer: {
        marginBottom: SPACING.sm,
    },
    categoriesList: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: COLORS.surfaceBorder,
        marginRight: SPACING.sm,
    },
    categoryChipSelected: {
        backgroundColor: `${COLORS.pulse}20`,
        borderColor: COLORS.pulse,
    },
    categoryIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    categoryLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    categoryLabelSelected: {
        color: COLORS.pulse,
    },
    rankingsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    rankingsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    rankingsSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: SPACING.md,
        color: COLORS.textMuted,
        fontSize: 14,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        marginTop: SPACING.xl,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    emptySubtitle: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
});
