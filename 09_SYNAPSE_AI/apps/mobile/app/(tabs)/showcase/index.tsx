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
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, API_URL } from '@/constants/config';
import { ProjectCard } from '@/components/ProjectCard';

// Fetch projects from API
async function fetchProjects({ pageParam = 0, tool }: { pageParam?: number; tool?: string }): Promise<{
    projects: any[];
    nextOffset: number | null;
}> {
    const limit = 10;
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(pageParam));
    params.set('sort', 'hot');
    if (tool && tool !== 'all') {
        params.set('tool', tool);
    }

    const response = await fetch(`${API_URL}/api/projects?${params.toString()}`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Failed to fetch projects');
    }

    return {
        projects: data.data || [],
        nextOffset: data.data?.length === limit ? pageParam + limit : null,
    };
}

// Tools filter
const TOOLS = [
    { id: 'all', label: 'Todos', icon: '🚀' },
    { id: 'chatgpt', label: 'ChatGPT', icon: '🤖' },
    { id: 'claude', label: 'Claude', icon: '🧠' },
    { id: 'midjourney', label: 'Midjourney', icon: '🎨' },
    { id: 'cursor', label: 'Cursor', icon: '⌨️' },
    { id: 'v0', label: 'v0', icon: '🌐' },
];

// Sort options
const SORTS = [
    { id: 'hot', label: '🔥 Hot' },
    { id: 'recent', label: '🕐 Reciente' },
    { id: 'top', label: '⬆️ Top' },
];

export default function ShowcaseScreen() {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [selectedTool, setSelectedTool] = useState('all');
    const [selectedSort, setSelectedSort] = useState('hot');

    // Infinite query for projects
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
        queryKey: ['projects', selectedTool, selectedSort],
        queryFn: ({ pageParam }) => fetchProjects({ pageParam, tool: selectedTool }),
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        initialPageParam: 0,
    });

    // Vote mutation
    const voteMutation = useMutation({
        mutationFn: async (projectId: string) => {
            const response = await fetch(`${API_URL}/api/projects/${projectId}/vote`, {
                method: 'POST',
                headers: {
                    'x-user-id': 'demo-user', // TODO: Replace with real user
                },
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
    });

    // Flatten pages into single array
    const projects = data?.pages.flatMap((page) => page.projects) || [];

    // Handle project press
    const handleProjectPress = useCallback((project: any) => {
        // TODO: Navigate to project detail
        console.log('Project pressed:', project.title);
    }, []);

    // Handle vote
    const handleVote = useCallback((projectId: string) => {
        voteMutation.mutate(projectId);
    }, [voteMutation]);

    // Handle load more
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    // Render project card
    const renderProject = ({ item }: { item: any }) => (
        <ProjectCard
            id={item.id}
            title={item.title}
            description={item.description}
            images={item.images || []}
            toolsUsed={item.tools_used || []}
            upvoteCount={item.upvote_count || 0}
            viewCount={item.view_count || 0}
            authorAlias={item.profiles?.alias}
            isFeatured={item.is_featured}
            onPress={() => handleProjectPress(item)}
            onVote={() => handleVote(item.id)}
        />
    );

    // Header with filters
    const renderHeader = () => (
        <View style={styles.sortRow}>
            {SORTS.map((sort) => (
                <TouchableOpacity
                    key={sort.id}
                    style={[
                        styles.sortChip,
                        selectedSort === sort.id && styles.sortChipSelected,
                    ]}
                    onPress={() => setSelectedSort(sort.id)}
                >
                    <Text
                        style={[
                            styles.sortLabel,
                            selectedSort === sort.id && styles.sortLabelSelected,
                        ]}
                    >
                        {sort.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // Footer loading indicator
    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color={COLORS.showcase} />
            </View>
        );
    };

    // Empty state
    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No hay proyectos</Text>
                <Text style={styles.emptySubtitle}>
                    Sé el primero en publicar un proyecto.
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>🚀 Showcase</Text>
                <Text style={styles.subtitle}>Proyectos de la comunidad</Text>
            </View>

            {/* Tools Filter */}
            <View style={styles.toolsContainer}>
                <FlatList
                    horizontal
                    data={TOOLS}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.toolsList}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.toolChip,
                                selectedTool === item.id && styles.toolChipSelected,
                            ]}
                            onPress={() => setSelectedTool(item.id)}
                        >
                            <Text style={styles.toolIcon}>{item.icon}</Text>
                            <Text
                                style={[
                                    styles.toolLabel,
                                    selectedTool === item.id && styles.toolLabelSelected,
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
                    <ActivityIndicator size="large" color={COLORS.showcase} />
                    <Text style={styles.loadingText}>Cargando proyectos...</Text>
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

            {/* Projects List */}
            {!isLoading && !isError && (
                <FlatList
                    data={projects}
                    keyExtractor={(item) => item.id}
                    renderItem={renderProject}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={refetch}
                            tintColor={COLORS.showcase}
                            colors={[COLORS.showcase]}
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
    toolsContainer: {
        marginBottom: SPACING.sm,
    },
    toolsList: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    toolChip: {
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
    toolChipSelected: {
        backgroundColor: `${COLORS.showcase}20`,
        borderColor: COLORS.showcase,
    },
    toolIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    toolLabel: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    toolLabelSelected: {
        color: COLORS.showcase,
    },
    sortRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    sortChip: {
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.sm,
        backgroundColor: COLORS.surface,
    },
    sortChipSelected: {
        backgroundColor: `${COLORS.showcase}20`,
    },
    sortLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    sortLabelSelected: {
        color: COLORS.showcase,
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
        backgroundColor: COLORS.showcase,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
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
    footer: {
        paddingVertical: SPACING.lg,
        alignItems: 'center',
    },
});
