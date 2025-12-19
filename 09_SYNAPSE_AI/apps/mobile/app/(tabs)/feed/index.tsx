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
import { useInfiniteQuery } from '@tanstack/react-query';
import { COLORS, SPACING, RADIUS, API_URL } from '@/constants/config';
import { NewsCard } from '@/components/NewsCard';

// Fetch news from API
async function fetchNews({ pageParam = 0 }): Promise<{
    articles: any[];
    nextOffset: number | null;
}> {
    const limit = 10;
    const response = await fetch(
        `${API_URL}/api/news?limit=${limit}&offset=${pageParam}`
    );
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to fetch news');
    }

    return {
        articles: data.data || [],
        nextOffset: data.data?.length === limit ? pageParam + limit : null,
    };
}

// Topics filter
const TOPICS = [
    { id: 'all', label: 'Todo', icon: '📰' },
    { id: 'models', label: 'Modelos', icon: '🤖' },
    { id: 'research', label: 'Research', icon: '🔬' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'business', label: 'Business', icon: '💼' },
];

export default function FeedScreen() {
    const insets = useSafeAreaInsets();
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [selectedArticle, setSelectedArticle] = useState<any>(null);

    // Infinite query for news
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
    } = useInfiniteQuery({
        queryKey: ['news', selectedTopic],
        queryFn: fetchNews,
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        initialPageParam: 0,
    });

    // Flatten pages into single array
    const articles = data?.pages.flatMap((page) => page.articles) || [];

    // Handle article press
    const handleArticlePress = useCallback((article: any) => {
        setSelectedArticle(article);
        // TODO: Open bottom sheet with full article
    }, []);

    // Handle load more
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    // Render article card
    const renderArticle = ({ item }: { item: any }) => (
        <NewsCard
            id={item.id}
            title={item.processed_title || item.original_title}
            bullets={item.bullets || []}
            source={item.source_name}
            publishedAt={item.published_at || item.created_at}
            importance={item.importance || 5}
            isBreaking={item.is_breaking}
            onPress={() => handleArticlePress(item)}
        />
    );

    // Footer loading indicator
    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color={COLORS.feed} />
            </View>
        );
    };

    // Empty state
    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>No hay noticias</Text>
                <Text style={styles.emptySubtitle}>
                    Aún no hay noticias disponibles. Vuelve más tarde.
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>📰 Feed</Text>
                <Text style={styles.subtitle}>Noticias de IA en 30 segundos</Text>
            </View>

            {/* Topics Filter */}
            <View style={styles.topicsContainer}>
                <FlatList
                    horizontal
                    data={TOPICS}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.topicsList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.topicChip,
                                selectedTopic === item.id && styles.topicChipSelected,
                            ]}
                            onPress={() => setSelectedTopic(item.id)}
                        >
                            <Text style={styles.topicIcon}>{item.icon}</Text>
                            <Text
                                style={[
                                    styles.topicLabel,
                                    selectedTopic === item.id && styles.topicLabelSelected,
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
                    <ActivityIndicator size="large" color={COLORS.feed} />
                    <Text style={styles.loadingText}>Cargando noticias...</Text>
                </View>
            )}

            {/* Error State */}
            {isError && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorTitle}>Error al cargar</Text>
                    <Text style={styles.errorMessage}>
                        {error instanceof Error ? error.message : 'Error desconocido'}
                    </Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                        <Text style={styles.retryText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* News List */}
            {!isLoading && !isError && (
                <FlatList
                    data={articles}
                    keyExtractor={(item) => item.id}
                    renderItem={renderArticle}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={COLORS.feed}
                            colors={[COLORS.feed]}
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
    topicsContainer: {
        marginBottom: SPACING.md,
    },
    topicsList: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    topicChip: {
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
    topicChipSelected: {
        backgroundColor: `${COLORS.feed}20`,
        borderColor: COLORS.feed,
    },
    topicIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    topicLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    topicLabelSelected: {
        color: COLORS.feed,
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textPrimary,
    },
    errorMessage: {
        fontSize: 14,
        color: COLORS.textMuted,
        textAlign: 'center',
        marginTop: SPACING.sm,
    },
    retryButton: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.feed,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        marginTop: SPACING.xxl,
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
    footer: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
    },
});
