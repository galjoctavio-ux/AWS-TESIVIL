import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Pressable,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS, API_URL } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { ModelCard, Podium } from '@/components/ModelCard';
import { Icon } from '@/components/icons/Icon';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonList } from '@/components/SkeletonCard';

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
        throw new Error(data.error || 'Error al cargar modelos');
    }

    return data.data || [];
}

// Fetch top 3 models
async function fetchTopModels(): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/models/top`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Error al cargar top modelos');
    }

    return data.data || [];
}

// Categories filter with Lucide icons
const CATEGORIES = [
    { id: 'all', label: 'Todos', icon: 'Trophy' as const },
    { id: 'chat', label: 'Chat', icon: 'MessageSquare' as const },
    { id: 'code', label: 'Código', icon: 'Terminal' as const },
    { id: 'image', label: 'Imagen', icon: 'Palette' as const },
    { id: 'audio', label: 'Audio', icon: 'Music' as const },
];

export default function PulseScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colors } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const styles = createStyles(colors);

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

    // Filter models by search
    const filteredModels = searchQuery
        ? models.filter((m: any) =>
            m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.provider_id?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : models;

    // Handle model press
    const handleModelPress = useCallback((model: any) => {
        router.push(`/pulse/${model.id}`);
    }, [router]);

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
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Icon name="Search" size={18} color={colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar modelo..."
                    placeholderTextColor={colors.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                        <Icon name="X" size={18} color={colors.textMuted} />
                    </Pressable>
                )}
            </View>

            {/* Podium */}
            {topModels.length >= 3 && !searchQuery && (
                <Podium models={topModels} onModelPress={handleModelPress} />
            )}

            {/* Rankings title */}
            <View style={styles.rankingsHeader}>
                <Text style={styles.rankingsTitle}>Rankings</Text>
                <Text style={styles.rankingsSubtitle}>
                    {filteredModels.length} modelos
                </Text>
            </View>
        </View>
    );

    // Empty state with action button
    const renderEmpty = () => {
        if (modelsQuery.isLoading) return null;
        return (
            <EmptyState
                icon="Brain"
                iconColor={colors.pulse}
                title="No hay modelos"
                subtitle={searchQuery
                    ? `No se encontraron modelos que coincidan con "${searchQuery}"`
                    : "No se encontraron modelos en esta categoría."
                }
                actionLabel={searchQuery ? "Limpiar búsqueda" : "Explorar todas las categorías"}
                onAction={() => {
                    if (searchQuery) {
                        setSearchQuery('');
                    } else {
                        setSelectedCategory('all');
                    }
                }}
            />
        );
    };

    const isLoading = topModelsQuery.isLoading || modelsQuery.isLoading;
    const isRefetching = topModelsQuery.isRefetching || modelsQuery.isRefetching;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Icon name="BarChart3" size={28} color={colors.pulse} />
                    <Text style={styles.title}>Ranking</Text>
                </View>
                <Text style={styles.subtitle}>Rankings de modelos de IA</Text>
            </View>

            {/* Categories Filter with fade edges */}
            <View style={styles.categoriesWrapper}>
                <FlatList
                    horizontal
                    data={CATEGORIES}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.categoryChip,
                                selectedCategory === item.id && styles.categoryChipSelected,
                                pressed && styles.chipPressed,
                            ]}
                            onPress={() => setSelectedCategory(item.id)}
                        >
                            <Icon
                                name={item.icon}
                                size={16}
                                color={selectedCategory === item.id ? colors.pulse : colors.textSecondary}
                                strokeWidth={selectedCategory === item.id ? 2 : 1.5}
                            />
                            <Text
                                style={[
                                    styles.categoryLabel,
                                    selectedCategory === item.id && styles.categoryLabelSelected,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </Pressable>
                    )}
                />
                {/* Fade edges */}
                <LinearGradient
                    colors={[colors.background, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fadeLeft}
                    pointerEvents="none"
                />
                <LinearGradient
                    colors={['transparent', colors.background]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.fadeRight}
                    pointerEvents="none"
                />
            </View>

            {/* Loading State */}
            {isLoading && (
                <View style={styles.loadingContainer}>
                    <SkeletonList count={5} variant="model" />
                </View>
            )}

            {/* Models List */}
            {!isLoading && (
                <FlatList
                    data={filteredModels.slice(searchQuery ? 0 : 3)} // Skip top 3 if not searching
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
                            tintColor={colors.pulse}
                            colors={[colors.pulse]}
                        />
                    }
                />
            )}
        </View>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
        marginLeft: SPACING.sm + 28,
    },
    categoriesWrapper: {
        position: 'relative',
        marginBottom: SPACING.sm,
    },
    categoriesList: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingVertical: SPACING.sm + 2,
        paddingHorizontal: SPACING.md + 4,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        marginRight: SPACING.sm,
        gap: 8,
        minWidth: 90,
        justifyContent: 'center',
    },
    categoryChipSelected: {
        backgroundColor: `${colors.pulse}20`,
        borderColor: colors.pulse,
    },
    chipPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.97 }],
    },
    categoryLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    categoryLabelSelected: {
        color: colors.pulse,
    },
    fadeLeft: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 20,
    },
    fadeRight: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        marginBottom: SPACING.md,
        marginHorizontal: SPACING.lg,
        gap: SPACING.sm,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: colors.textPrimary,
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
        color: colors.textPrimary,
    },
    rankingsSubtitle: {
        fontSize: 12,
        color: colors.textMuted,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    loadingContainer: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
});
