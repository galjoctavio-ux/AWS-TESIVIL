import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING, RADIUS, API_URL } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { NewsCard } from '@/components/NewsCard';
import NewsDetailSheet from '@/components/NewsDetailSheet';
import { Icon } from '@/components/icons/Icon';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonList } from '@/components/SkeletonCard';

// Fetch news from API
async function fetchNews({ pageParam = 0, queryKey }: { pageParam?: number; queryKey: string[] }): Promise<{
    articles: any[];
    nextOffset: number | null;
}> {
    const limit = 10;
    const topic = queryKey[1] || 'all'; // Get topic from queryKey ['news', selectedTopic]

    let url = `${API_URL}/api/news?limit=${limit}&offset=${pageParam}`;

    // Add topic filter (skip for 'all' and 'top')
    if (topic && topic !== 'all' && topic !== 'top') {
        url += `&topic=${topic}`;
    }

    // Add sort parameter for 'top' filter
    if (topic === 'top') {
        url += '&sort=top';
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Error al cargar noticias');
    }

    return {
        articles: data.data || [],
        nextOffset: data.data?.length === limit ? pageParam + limit : null,
    };
}

// Topics filter with Lucide icons
const TOPICS = [
    { id: 'all', label: 'Todo', icon: 'LayoutGrid' as const, sort: 'recent' },
    { id: 'top', label: 'Top', icon: 'TrendingUp' as const, sort: 'top' },
    { id: 'models', label: 'Modelos', icon: 'Cpu' as const, sort: 'recent' },
    { id: 'research', label: 'Research', icon: 'FlaskConical' as const, sort: 'recent' },
    { id: 'tools', label: 'Tools', icon: 'Wrench' as const, sort: 'recent' },
    { id: 'business', label: 'Business', icon: 'Briefcase' as const, sort: 'recent' },
];

export default function FeedScreen() {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const styles = createStyles(colors);

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

    // Handle article press - open bottom sheet
    const handleArticlePress = useCallback((article: any) => {
        setSelectedArticleId(article.id);
        bottomSheetRef.current?.snapToIndex(0);
    }, []);

    // Handle close bottom sheet
    const handleCloseSheet = useCallback(() => {
        setSelectedArticleId(null);
    }, []);

    // Handle load more
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    // Handle retry with loading state
    const handleRetry = async () => {
        setIsRetrying(true);
        await refetch();
        setIsRetrying(false);
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
            likeCount={item.like_count || 0}
            commentCount={item.comment_count || 0}
            onPress={() => handleArticlePress(item)}
        />
    );

    // Footer loading indicator
    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color={colors.feed} />
            </View>
        );
    };

    // Empty state with action button
    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <EmptyState
                icon="Search"
                iconColor={colors.feed}
                title="No hay noticias"
                subtitle="Aún no hay noticias disponibles en esta categoría."
                actionLabel="Actualizar Feed"
                onAction={() => refetch()}
                secondaryLabel="Explorar todas"
                onSecondaryAction={() => setSelectedTopic('all')}
            />
        );
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTitle}>
                        <Icon name="Newspaper" size={28} color={colors.feed} />
                        <Text style={styles.title}>Noticias</Text>
                    </View>
                    <Text style={styles.subtitle}>Noticias de IA en 30 segundos</Text>
                </View>

                {/* Topics Filter with fade edges */}
                <View style={styles.topicsWrapper}>
                    <FlatList
                        horizontal
                        data={TOPICS}
                        keyExtractor={(item) => item.id}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.topicsList}
                        renderItem={({ item }) => (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.topicChip,
                                    selectedTopic === item.id && styles.topicChipSelected,
                                    pressed && styles.chipPressed,
                                ]}
                                onPress={() => setSelectedTopic(item.id)}
                            >
                                <Icon
                                    name={item.icon}
                                    size={16}
                                    color={selectedTopic === item.id ? colors.feed : colors.textSecondary}
                                    strokeWidth={selectedTopic === item.id ? 2 : 1.5}
                                />
                                <Text
                                    style={[
                                        styles.topicLabel,
                                        selectedTopic === item.id && styles.topicLabelSelected,
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

                {/* Loading State with Skeletons */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <SkeletonList count={4} variant="news" />
                    </View>
                )}

                {/* Error State */}
                {isError && (
                    <View style={styles.errorContainer}>
                        <Icon name="AlertTriangle" size={48} color={colors.error} />
                        <Text style={styles.errorTitle}>Error al cargar</Text>
                        <Text style={styles.errorMessage}>
                            {error instanceof Error ? error.message : 'Error desconocido'}
                        </Text>
                        <Pressable
                            style={({ pressed }) => [
                                styles.retryButton,
                                pressed && styles.retryButtonPressed,
                            ]}
                            onPress={handleRetry}
                            disabled={isRetrying}
                        >
                            {isRetrying ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Icon name="RefreshCw" size={16} color="#fff" />
                                    <Text style={styles.retryText}>Reintentar</Text>
                                </>
                            )}
                        </Pressable>
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
                                tintColor={colors.feed}
                                colors={[colors.feed]}
                            />
                        }
                    />
                )}
            </View>

            {/* News Detail Bottom Sheet */}
            <NewsDetailSheet
                ref={bottomSheetRef}
                articleId={selectedArticleId}
                onClose={handleCloseSheet}
            />
        </GestureHandlerRootView>
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
    topicsWrapper: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    topicsList: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    topicChip: {
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
    topicChipSelected: {
        backgroundColor: `${colors.feed}20`,
        borderColor: colors.feed,
    },
    chipPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.97 }],
    },
    topicLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    topicLabelSelected: {
        color: colors.feed,
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
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    loadingContainer: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        gap: SPACING.sm,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginTop: SPACING.sm,
    },
    errorMessage: {
        fontSize: 14,
        color: colors.textMuted,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: SPACING.md,
        backgroundColor: colors.feed,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        minWidth: 120,
        justifyContent: 'center',
    },
    retryButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.97 }],
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
    },
});
