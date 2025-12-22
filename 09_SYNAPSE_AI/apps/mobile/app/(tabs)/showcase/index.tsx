import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Pressable,
    Modal,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING, RADIUS, API_URL } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectDetailSheet } from '@/components/ProjectDetailSheet';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { Icon } from '@/components/icons/Icon';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonList } from '@/components/SkeletonCard';

const VOTED_PROJECTS_KEY = '@synapse_voted_projects';

// Fetch projects from API
async function fetchProjects({ pageParam = 0, tool, sort = 'hot' }: { pageParam?: number; tool?: string; sort?: string }): Promise<{
    projects: any[];
    nextOffset: number | null;
}> {
    const limit = 10;
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(pageParam));
    params.set('sort', sort);
    if (tool && tool !== 'all') {
        params.set('tool', tool);
    }

    const response = await fetch(`${API_URL}/api/projects?${params.toString()}`);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Error al cargar proyectos');
    }

    return {
        projects: data.data || [],
        nextOffset: data.data?.length === limit ? pageParam + limit : null,
    };
}

// Category tabs
const CATEGORIES = [
    { id: 'programming', label: 'Programación', active: true },
    { id: 'art', label: 'Arte IA', active: false },
    { id: 'video', label: 'Video IA', active: false },
    { id: 'agents', label: 'Agentes', active: false },
];

// Tools filter with Lucide icons (simplified)
const TOOLS = [
    { id: 'all', label: 'Todos', icon: 'Rocket' as const },
    { id: 'gemini', label: 'Gemini', icon: 'Sparkles' as const },
    { id: 'chatgpt', label: 'ChatGPT', icon: 'Bot' as const },
    { id: 'claude', label: 'Claude', icon: 'Brain' as const },
];

// Sort options
const SORTS = [
    { id: 'hot', label: 'Hot', icon: 'Zap' as const },
    { id: 'recent', label: 'Reciente', icon: 'History' as const },
    { id: 'top', label: 'Top', icon: 'Trophy' as const },
];

export default function ShowcaseScreen() {
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const { colors } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState('programming');
    const [selectedTool, setSelectedTool] = useState('all');
    const [selectedSort, setSelectedSort] = useState('hot');
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);
    const [votedProjects, setVotedProjects] = useState<Set<string>>(new Set());

    const styles = createStyles(colors);

    // Load voted projects from AsyncStorage
    useEffect(() => {
        loadVotedProjects();
    }, []);

    const loadVotedProjects = async () => {
        try {
            const stored = await AsyncStorage.getItem(VOTED_PROJECTS_KEY);
            if (stored) {
                setVotedProjects(new Set(JSON.parse(stored)));
            }
        } catch (e) {
            console.error('Error loading voted projects:', e);
        }
    };

    const saveVotedProject = async (projectId: string) => {
        try {
            const newVoted = new Set(votedProjects);
            newVoted.add(projectId);
            setVotedProjects(newVoted);
            await AsyncStorage.setItem(VOTED_PROJECTS_KEY, JSON.stringify([...newVoted]));
        } catch (e) {
            console.error('Error saving voted project:', e);
        }
    };

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
        queryFn: ({ pageParam }) => fetchProjects({ pageParam, tool: selectedTool, sort: selectedSort }),
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        initialPageParam: 0,
    });

    // Vote mutation with Optimistic Update
    const voteMutation = useMutation({
        mutationFn: async (projectId: string) => {
            const response = await fetch(`${API_URL}/api/projects/${projectId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}), // Empty body to satisfy Fastify
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Vote failed');
            return data;
        },
        onMutate: async (projectId) => {
            // Use the correct query key with filters
            const queryKey = ['projects', selectedTool, selectedSort];

            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot previous value
            const previousData = queryClient.getQueryData(queryKey);

            // Optimistically update query data
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        projects: page.projects.map((p: any) => {
                            if (p.id === projectId) {
                                return {
                                    ...p,
                                    upvotes_count: (p.upvotes_count || 0) + 1,
                                };
                            }
                            return p;
                        }),
                    })),
                };
            });

            // Optimistically update local voted state
            const newVoted = new Set(votedProjects);
            newVoted.add(projectId);
            setVotedProjects(newVoted);

            // Haptic feedback immediately
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            return { previousData, queryKey };
        },
        onError: (err, projectId, context: any) => {
            // Rollback query data
            if (context?.previousData && context?.queryKey) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }

            // Rollback local state
            const newVoted = new Set(votedProjects);
            newVoted.delete(projectId);
            setVotedProjects(newVoted);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'No se pudo registrar el voto');
        },
        onSettled: () => {
            // Invalidate all project queries to sync with server
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onSuccess: (_, projectId) => {
            // Persist valid vote
            saveVotedProject(projectId);
        },
    });

    // Flatten pages into single array
    const projects = data?.pages.flatMap((page) => page.projects) || [];

    // Handle project press - open detail sheet
    const handleProjectPress = useCallback((project: any) => {
        setSelectedProject(project);
        // Register view
        fetch(`${API_URL}/api/projects/${project.id}/view`, { method: 'POST' });
    }, []);

    // Handle vote - check if already voted
    const handleVote = useCallback((projectId: string) => {
        if (votedProjects.has(projectId)) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Ya votaste', 'Solo puedes votar una vez por proyecto.');
            return;
        }
        voteMutation.mutate(projectId);
    }, [voteMutation, votedProjects]);

    // Handle load more
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    // Handle category press
    const handleCategoryPress = (category: typeof CATEGORIES[0]) => {
        if (category.active) {
            setSelectedCategory(category.id);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    };

    // Handle retry with loading state
    const handleRetry = async () => {
        setIsRetrying(true);
        await refetch();
        setIsRetrying(false);
    };

    // Render project card with trending badge support
    const renderProject = ({ item }: { item: any }) => (
        <View>
            {/* Trending badge */}
            {item.is_trending && (
                <View style={styles.trendingBadge}>
                    <Icon name="Zap" size={10} color="#fff" />
                    <Text style={styles.trendingText}>Trending</Text>
                </View>
            )}
            <ProjectCard
                id={item.id}
                title={item.title}
                description={item.description}
                images={item.image_urls || []}
                toolsUsed={item.tools_array || []}
                upvoteCount={item.upvotes_count || 0}
                viewCount={item.views_count || 0}
                authorAlias={item.profiles?.alias}
                isFeatured={!!item.is_featured_until}
                onPress={() => handleProjectPress(item)}
                onVote={() => handleVote(item.id)}
            />
        </View>
    );

    // Header with sort options
    const renderHeader = () => (
        <View style={styles.sortRow}>
            {SORTS.map((sort) => (
                <Pressable
                    key={sort.id}
                    style={({ pressed }) => [
                        styles.sortChip,
                        selectedSort === sort.id && styles.sortChipSelected,
                        pressed && styles.chipPressed,
                    ]}
                    onPress={() => setSelectedSort(sort.id)}
                >
                    <Icon
                        name={sort.icon}
                        size={14}
                        color={selectedSort === sort.id ? colors.showcase : colors.textMuted}
                    />
                    <Text
                        style={[
                            styles.sortLabel,
                            selectedSort === sort.id && styles.sortLabelSelected,
                        ]}
                    >
                        {sort.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );

    // Footer loading indicator
    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator color={colors.showcase} />
            </View>
        );
    };

    // Empty state with action button
    const renderEmpty = () => {
        if (isLoading) return null;
        return (
            <EmptyState
                icon="Search"
                iconColor={colors.showcase}
                title="No hay proyectos"
                subtitle="Sé el primero en compartir tu proyecto con la comunidad."
                actionLabel="Publicar mi proyecto"
                onAction={() => setShowCreateModal(true)}
                secondaryLabel="Explorar otras herramientas"
                onSecondaryAction={() => setSelectedTool('all')}
            />
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTitle}>
                    <Icon name="Rocket" size={28} color={colors.showcase} />
                    <Text style={styles.title}>Showcase</Text>
                </View>
                <Text style={styles.subtitle}>Proyectos de la comunidad</Text>
            </View>

            {/* Category Tabs */}
            <View style={styles.categoryContainer}>
                <FlatList
                    horizontal
                    data={CATEGORIES}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.categoryTab,
                                selectedCategory === item.id && styles.categoryTabSelected,
                                !item.active && styles.categoryTabDisabled,
                                pressed && item.active && styles.chipPressed,
                            ]}
                            onPress={() => handleCategoryPress(item)}
                        >
                            <Text
                                style={[
                                    styles.categoryLabel,
                                    selectedCategory === item.id && styles.categoryLabelSelected,
                                    !item.active && styles.categoryLabelDisabled,
                                ]}
                            >
                                {item.label}
                            </Text>
                            {!item.active && (
                                <View style={styles.comingSoonBadge}>
                                    <Text style={styles.comingSoonText}>Pronto</Text>
                                </View>
                            )}
                        </Pressable>
                    )}
                />
            </View>

            {/* Tools Filter with fade edges */}
            <View style={styles.toolsWrapper}>
                <FlatList
                    horizontal
                    data={TOOLS}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.toolsList}
                    renderItem={({ item }) => (
                        <Pressable
                            style={({ pressed }) => [
                                styles.toolChip,
                                selectedTool === item.id && styles.toolChipSelected,
                                pressed && styles.chipPressed,
                            ]}
                            onPress={() => setSelectedTool(item.id)}
                        >
                            <Icon
                                name={item.icon}
                                size={16}
                                color={selectedTool === item.id ? colors.showcase : colors.textSecondary}
                                strokeWidth={selectedTool === item.id ? 2 : 1.5}
                            />
                            <Text
                                style={[
                                    styles.toolLabel,
                                    selectedTool === item.id && styles.toolLabelSelected,
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
                    <SkeletonList count={3} variant="project" />
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

            {/* Projects List */}
            {!isLoading && !isError && (
                <FlatList
                    data={projects}
                    extraData={data}  // Force re-render on query data changes
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
                            tintColor={colors.showcase}
                            colors={[colors.showcase]}
                        />
                    }
                />
            )}

            {/* FAB Container - Only show when modal is NOT open */}
            {!showCreateModal && (
                <View
                    style={{
                        position: 'absolute',
                        bottom: insets.bottom + 80,
                        left: 0,
                        right: 0,
                        alignItems: 'flex-end', // Esto fuerza el botón a la derecha
                        paddingRight: 16,       // Margen derecho ajustado
                        zIndex: 999,
                    }}
                    pointerEvents="box-none" // Permite tocar a través del área vacía
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.fab,
                            { position: 'relative', bottom: 0, right: 0 }, // Resetear posicionamiento absoluto
                            pressed && styles.fabPressed,
                        ]}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <LinearGradient
                            colors={[colors.showcase, '#059669']}
                            style={styles.fabGradient}
                        >
                            <Icon name="Plus" size={28} color="#fff" strokeWidth={2.5} />
                        </LinearGradient>
                    </Pressable>
                </View>
            )}

            {/* Project Detail Modal */}
            <Modal
                visible={!!selectedProject}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setSelectedProject(null)}
            >
                {selectedProject && (
                    <ProjectDetailSheet
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                        onVote={handleVote}
                    />
                )}
            </Modal>

            {/* Create Project Modal */}
            <CreateProjectModal
                visible={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />
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
    // Category tabs
    categoryContainer: {
        marginBottom: SPACING.xs,
    },
    categoryList: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    categoryTab: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.sm,
        backgroundColor: colors.surface,
        marginRight: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryTabSelected: {
        backgroundColor: colors.showcase,
    },
    categoryTabDisabled: {
        opacity: 0.6,
    },
    categoryLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
    },
    categoryLabelSelected: {
        color: '#fff',
    },
    categoryLabelDisabled: {
        color: colors.textMuted,
    },
    comingSoonBadge: {
        marginLeft: 6,
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.xs,
    },
    comingSoonText: {
        fontSize: 9,
        color: colors.textMuted,
        fontWeight: '600',
    },
    // Tools filter
    toolsWrapper: {
        position: 'relative',
        marginBottom: SPACING.sm,
    },
    toolsList: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    toolChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
        marginRight: SPACING.sm,
        gap: 6,
    },
    toolChipSelected: {
        backgroundColor: `${colors.showcase}20`,
        borderColor: colors.showcase,
    },
    chipPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.97 }],
    },
    toolLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    toolLabelSelected: {
        color: colors.showcase,
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
    sortRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        gap: SPACING.sm,
    },
    sortChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.sm,
        backgroundColor: colors.surface,
        gap: 4,
    },
    sortChipSelected: {
        backgroundColor: `${colors.showcase}20`,
    },
    sortLabel: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '500',
    },
    sortLabelSelected: {
        color: colors.showcase,
    },
    listContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 100, // Extra space for FAB
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
        backgroundColor: colors.showcase,
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
    // Trending badge
    trendingBadge: {
        position: 'absolute',
        top: SPACING.xs,
        right: SPACING.xs,
        backgroundColor: '#EF4444',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: RADIUS.sm,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trendingText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    // FAB with enhanced glow - posición derecha fija
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        shadowColor: colors.showcase,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 12,
        zIndex: 999,
    },
    fabPressed: {
        transform: [{ scale: 0.95 }],
        shadowOpacity: 0.3,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
