import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    TextInput,
    FlatList,
    ActivityIndicator,
    Linking,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    StatusBar,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, RADIUS, API_URL } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { incrementStat } from '@/lib/userStats';
import { useAlias } from '@/contexts/AliasContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// API Response interface
interface ApiResponse {
    success: boolean;
    data?: any;
    error?: string;
    reason?: string;
}

interface ProjectDetailSheetProps {
    project: {
        id: string;
        title: string;
        description?: string;
        image_urls?: string[];
        tools_array?: string[];
        upvotes_count?: number;
        views_count?: number;
        comment_count?: number;
        action_type?: 'visit' | 'download' | 'inspiration';
        project_url?: string;
        is_trending?: boolean;
        is_featured_until?: string | null;
        profiles?: {
            alias: string;
            photo_url?: string;
        };
        created_at: string;
    };
    onClose: () => void;
    onVote: (projectId: string) => void;
}

// Fetch comments
async function fetchComments(projectId: string) {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/comments`);
    const data = await response.json() as ApiResponse;
    if (!data.success) throw new Error(data.error);
    return data.data || [];
}

// Post comment (supports replies with parentId and authorAlias)
async function postComment(projectId: string, content: string, parentId?: string, authorAlias?: string) {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'demo-user', // TODO: Replace with real auth
        },
        body: JSON.stringify({ content, parentId: parentId || null, authorAlias }),
    });
    const data = await response.json() as ApiResponse;
    if (!data.success) throw new Error(data.error || data.reason || 'Failed to post comment');
    return data.data;
}

// Report project
async function reportProject(projectId: string, reason: string) {
    const response = await fetch(`${API_URL}/api/projects/${projectId}/report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'demo-user',
        },
        body: JSON.stringify({ reason }),
    });
    const data = await response.json() as ApiResponse;
    if (!data.success) throw new Error(data.error);
    return data;
}

export function ProjectDetailSheet({ project, onClose, onVote }: ProjectDetailSheetProps) {
    const { colors } = useTheme();
    const { alias } = useAlias();
    const insets = useSafeAreaInsets();
    const queryClient = useQueryClient();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentText, setCommentText] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);
    const [viewerImageIndex, setViewerImageIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const imageViewerRef = useRef<FlatList>(null);

    const styles = createStyles(colors);

    // Track view once on mount
    React.useEffect(() => {
        incrementStat('projectsViewed');
    }, []);

    // Local state for instant vote feedback
    const [localUpvotes, setLocalUpvotes] = useState(project.upvotes_count || 0);
    const [hasVoted, setHasVoted] = useState(false);

    // Handle vote with instant feedback
    const handleLocalVote = () => {
        if (hasVoted) return;
        setLocalUpvotes(prev => prev + 1);
        setHasVoted(true);
        onVote(project.id);
    };

    // State for replying to a comment
    const [replyingTo, setReplyingTo] = useState<{ id: string; alias: string } | null>(null);

    // Fetch comments
    const { data: comments = [], isLoading: loadingComments } = useQuery({
        queryKey: ['project-comments', project.id],
        queryFn: () => fetchComments(project.id),
    });

    // Post comment mutation (supports replies)
    const commentMutation = useMutation({
        mutationFn: (params: { content: string; parentId?: string }) =>
            postComment(project.id, params.content, params.parentId, alias),
        onSuccess: () => {
            setCommentText('');
            setReplyingTo(null);
            queryClient.invalidateQueries({ queryKey: ['project-comments', project.id] });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        onError: (error: Error) => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', error.message);
        },
    });

    // Report mutation
    const reportMutation = useMutation({
        mutationFn: (reason: string) => reportProject(project.id, reason),
        onSuccess: () => {
            setShowReportModal(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Listo', 'Reporte enviado. Gracias por ayudarnos a mantener la comunidad.');
        },
    });

    // Normalize URL - add https:// if missing
    const normalizeUrl = (url: string): string => {
        if (!url) return '';
        const trimmedUrl = url.trim();
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
            return 'https://' + trimmedUrl;
        }
        return trimmedUrl;
    };

    // Handle opening URL with error handling
    const handleOpenUrl = async (url: string) => {
        try {
            const normalizedUrl = normalizeUrl(url);
            const canOpen = await Linking.canOpenURL(normalizedUrl);
            if (canOpen) {
                await Linking.openURL(normalizedUrl);
            } else {
                Alert.alert('Error', 'No se puede abrir este enlace. Verifica que la URL sea válida.');
            }
        } catch (error) {
            console.error('Error opening URL:', error);
            Alert.alert('Error', 'Ocurrió un error al intentar abrir el enlace.');
        }
    };

    // Get action button config
    const getActionButton = () => {
        const url = project.project_url;
        if (!url || url.trim() === '') return null;

        const config = {
            visit: { label: '🔗 Visitar Proyecto', color: colors.showcase },
            download: { label: '📥 Descargar', color: '#10B981' },
            inspiration: { label: '👁️ Ver más', color: colors.textSecondary },
        };

        const type = project.action_type || 'visit';
        return { ...config[type], url };
    };

    const actionButton = getActionButton();

    // Format date
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Handle image scroll
    const onScroll = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
        setCurrentImageIndex(index);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
                <View style={styles.headerBadges}>
                    {project.is_trending && (
                        <View style={styles.trendingBadge}>
                            <Text style={styles.badgeText}>🔥 Trending</Text>
                        </View>
                    )}
                    {project.is_featured_until && (
                        <View style={styles.featuredBadge}>
                            <Text style={styles.badgeText}>⭐ Destacado</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity onPress={() => setShowReportModal(true)} style={styles.reportButton}>
                    <Text style={styles.reportIcon}>⚠️</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Image Carousel */}
                {project.image_urls && project.image_urls.length > 0 ? (
                    <View style={styles.carouselContainer}>
                        <FlatList
                            ref={flatListRef}
                            data={project.image_urls}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={onScroll}
                            keyExtractor={(_, index) => `img-${index}`}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => {
                                        setViewerImageIndex(index);
                                        setShowImageViewer(true);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                >
                                    <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="contain" />
                                    {/* Tap hint */}
                                    <View style={styles.tapHint}>
                                        <Text style={styles.tapHintText}>🔍 Toca para ampliar</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                        {/* Pagination Dots */}
                        {project.image_urls.length > 1 && (
                            <View style={styles.pagination}>
                                {project.image_urls.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.paginationDot,
                                            index === currentImageIndex && styles.paginationDotActive,
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.placeholderImage}>
                        <Image
                            source={require('@/assets/images/placeholder-logo.png')}
                            style={{ width: 120, height: 120, opacity: 0.9 }}
                            resizeMode="contain"
                        />
                    </View>
                )}

                {/* Title & Author */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{project.title}</Text>
                    {project.profiles?.alias && (
                        <Text style={styles.author}>por @{project.profiles.alias}</Text>
                    )}
                    <Text style={styles.date}>{formatDate(project.created_at)}</Text>
                </View>

                {/* Description */}
                {project.description && (
                    <View style={styles.descriptionSection}>
                        <Text style={styles.description}>{project.description}</Text>
                    </View>
                )}

                {/* Tools/Stack */}
                <View style={styles.toolsSection}>
                    <Text style={styles.sectionTitle}>Stack Tecnológico</Text>
                    <View style={styles.toolsRow}>
                        {(project.tools_array || []).map((tool, index) => (
                            <View key={index} style={styles.toolChip}>
                                <Text style={styles.toolText}>{tool}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>👁️</Text>
                        <Text style={styles.statValue}>{project.views_count || 0}</Text>
                        <Text style={styles.statLabel}>vistas</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.statItem, hasVoted && { opacity: 0.6 }]}
                        onPress={handleLocalVote}
                        disabled={hasVoted}
                    >
                        <Text style={styles.statIcon}>👍</Text>
                        <Text style={styles.statValue}>{localUpvotes}</Text>
                        <Text style={styles.statLabel}>{hasVoted ? 'votado' : 'útil'}</Text>
                    </TouchableOpacity>
                    <View style={styles.statItem}>
                        <Text style={styles.statIcon}>💬</Text>
                        <Text style={styles.statValue}>{comments.length}</Text>
                        <Text style={styles.statLabel}>comentarios</Text>
                    </View>
                </View>

                {/* Action Button */}
                {actionButton && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: actionButton.color }]}
                        onPress={() => handleOpenUrl(actionButton.url)}
                    >
                        <Text style={styles.actionButtonText}>{actionButton.label}</Text>
                    </TouchableOpacity>
                )}

                {/* Comments Section */}
                <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>Comentarios ({comments.length})</Text>

                    {loadingComments ? (
                        <ActivityIndicator color={colors.showcase} style={{ marginVertical: 20 }} />
                    ) : comments.length === 0 ? (
                        <Text style={styles.noComments}>Sé el primero en comentar 💬</Text>
                    ) : (
                        comments.map((comment: any) => (
                            <View key={comment.id} style={styles.commentCard}>
                                <View style={styles.commentHeader}>
                                    <Text style={styles.commentAuthor}>
                                        @{comment.author_alias || comment.profiles?.alias || 'Anónimo'}
                                    </Text>
                                    {comment.comment_type && (
                                        <View style={styles.commentTypeBadge}>
                                            <Text style={styles.commentTypeText}>{comment.comment_type}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.commentText}>{comment.content}</Text>

                                {/* Reply Button */}
                                <TouchableOpacity
                                    style={styles.replyButton}
                                    onPress={() => setReplyingTo({
                                        id: comment.id,
                                        alias: comment.author_alias || comment.profiles?.alias || 'Anónimo'
                                    })}
                                >
                                    <Text style={styles.replyButtonText}>↩️ Responder</Text>
                                </TouchableOpacity>

                                {/* Nested Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <View style={styles.repliesContainer}>
                                        {comment.replies.map((reply: any) => (
                                            <View key={reply.id} style={styles.replyCard}>
                                                <Text style={styles.replyingToLabel}>
                                                    ↳ En respuesta a @{comment.author_alias || comment.profiles?.alias || 'Anónimo'}
                                                </Text>
                                                <Text style={styles.replyAuthor}>
                                                    @{reply.author_alias || reply.profiles?.alias || 'Anónimo'}
                                                </Text>
                                                <Text style={styles.replyText}>{reply.content}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* Spacer for input + safe area */}
                <View style={{ height: 120 + insets.bottom }} />
            </ScrollView>

            {/* Comment Input - with safe area padding */}
            <View style={[styles.commentInputContainer, { paddingBottom: Math.max(SPACING.md, insets.bottom + 8) }]}>
                {/* Replying To Banner */}
                {replyingTo && (
                    <View style={styles.replyingBanner}>
                        <Text style={styles.replyingText}>Respondiendo a @{replyingTo.alias}</Text>
                        <TouchableOpacity onPress={() => setReplyingTo(null)}>
                            <Text style={styles.cancelReply}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder={replyingTo ? "Escribe tu respuesta..." : "Escribe un comentario..."}
                        placeholderTextColor={colors.textMuted}
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                        onPress={() => commentMutation.mutate({
                            content: commentText,
                            parentId: replyingTo?.id
                        })}
                        disabled={!commentText.trim() || commentMutation.isPending}
                    >
                        {commentMutation.isPending ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={styles.sendButtonText}>➤</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Simple Report Modal */}
            {showReportModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.reportModal}>
                        <Text style={styles.modalTitle}>Reportar Proyecto</Text>
                        <Text style={styles.modalSubtitle}>
                            ¿Por qué quieres reportar este proyecto?
                        </Text>
                        {['Contenido inapropiado', 'Spam', 'Información falsa', 'Otro'].map((reason) => (
                            <TouchableOpacity
                                key={reason}
                                style={styles.reportOption}
                                onPress={() => reportMutation.mutate(reason)}
                            >
                                <Text style={styles.reportOptionText}>{reason}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowReportModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Fullscreen Image Viewer Modal */}
            <Modal
                visible={showImageViewer}
                animationType="fade"
                transparent={true}
                statusBarTranslucent={true}
                onRequestClose={() => setShowImageViewer(false)}
            >
                <View style={styles.imageViewerOverlay}>
                    <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" />

                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.imageViewerClose}
                        onPress={() => setShowImageViewer(false)}
                    >
                        <Text style={styles.imageViewerCloseText}>✕</Text>
                    </TouchableOpacity>

                    {/* Image Counter */}
                    {project.image_urls && project.image_urls.length > 1 && (
                        <View style={styles.imageCounter}>
                            <Text style={styles.imageCounterText}>
                                {viewerImageIndex + 1} / {project.image_urls.length}
                            </Text>
                        </View>
                    )}

                    {/* Fullscreen Image Gallery */}
                    <FlatList
                        ref={imageViewerRef}
                        data={project.image_urls || []}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={viewerImageIndex}
                        getItemLayout={(_, index) => ({
                            length: SCREEN_WIDTH,
                            offset: SCREEN_WIDTH * index,
                            index,
                        })}
                        onMomentumScrollEnd={(e) => {
                            const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                            setViewerImageIndex(newIndex);
                        }}
                        keyExtractor={(_, index) => `fullimg-${index}`}
                        renderItem={({ item }) => (
                            <ScrollView
                                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                                contentContainerStyle={styles.imageViewerScrollContent}
                                maximumZoomScale={4}
                                minimumZoomScale={1}
                                showsVerticalScrollIndicator={false}
                                showsHorizontalScrollIndicator={false}
                                centerContent={true}
                                bouncesZoom={true}
                            >
                                <Image
                                    source={{ uri: item }}
                                    style={styles.fullscreenImage}
                                    resizeMode="contain"
                                />
                            </ScrollView>
                        )}
                    />

                    {/* Hint */}
                    <View style={styles.zoomHint}>
                        <Text style={styles.zoomHintText}>Pellizca para hacer zoom • Desliza para cambiar</Text>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 18,
        color: colors.textPrimary,
    },
    headerBadges: {
        flexDirection: 'row',
        gap: SPACING.xs,
    },
    trendingBadge: {
        backgroundColor: '#EF4444',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    featuredBadge: {
        backgroundColor: colors.showcase,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    reportButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportIcon: {
        fontSize: 16,
    },
    content: {
        flex: 1,
    },
    carouselContainer: {
        height: 300,
        backgroundColor: colors.background,
    },
    carouselImage: {
        width: SCREEN_WIDTH,
        height: 300,
        backgroundColor: colors.background,
    },
    pagination: {
        position: 'absolute',
        bottom: SPACING.sm,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    paginationDotActive: {
        backgroundColor: '#fff',
        width: 24,
    },
    placeholderImage: {
        height: 200,
        backgroundColor: `${colors.showcase}20`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleSection: {
        padding: SPACING.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.textPrimary,
        lineHeight: 32,
    },
    author: {
        fontSize: 14,
        color: colors.showcase,
        marginTop: 4,
    },
    date: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 4,
    },
    descriptionSection: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    description: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    toolsSection: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: SPACING.sm,
    },
    toolsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
    },
    toolChip: {
        backgroundColor: colors.surface,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        borderRadius: RADIUS.full,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    toolText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: SPACING.lg,
        marginHorizontal: SPACING.lg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    statItem: {
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 24,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textMuted,
    },
    actionButton: {
        marginHorizontal: SPACING.lg,
        marginVertical: SPACING.lg,
        paddingVertical: SPACING.md,
        borderRadius: RADIUS.md,
        alignItems: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    commentsSection: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
    },
    noComments: {
        textAlign: 'center',
        color: colors.textMuted,
        paddingVertical: SPACING.xl,
    },
    commentCard: {
        backgroundColor: colors.surface,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.sm,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    commentAuthor: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.showcase,
    },
    commentTypeBadge: {
        marginLeft: SPACING.sm,
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: RADIUS.xs,
    },
    commentTypeText: {
        fontSize: 10,
        color: colors.textMuted,
    },
    commentText: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    commentInputContainer: {
        flexDirection: 'column',
        padding: SPACING.sm,
        paddingBottom: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: colors.surfaceBorder,
        backgroundColor: colors.background,
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        color: colors.textPrimary,
        maxHeight: 100,
        fontSize: 14,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.showcase,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.sm,
    },
    sendButtonDisabled: {
        backgroundColor: colors.textMuted,
    },
    sendButtonText: {
        fontSize: 18,
        color: '#fff',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportModal: {
        backgroundColor: colors.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        width: '85%',
        maxWidth: 340,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.xs,
        marginBottom: SPACING.md,
    },
    reportOption: {
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceBorder,
    },
    reportOptionText: {
        fontSize: 15,
        color: colors.textPrimary,
    },
    cancelButton: {
        marginTop: SPACING.md,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        color: colors.textMuted,
    },
    // Reply styles
    replyButton: {
        marginTop: SPACING.sm,
        paddingVertical: 4,
    },
    replyButtonText: {
        fontSize: 12,
        color: colors.showcase,
    },
    repliesContainer: {
        marginTop: SPACING.md,
        marginLeft: SPACING.lg,
        paddingLeft: SPACING.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.showcase,
    },
    replyCard: {
        backgroundColor: colors.surfaceLight,
        borderRadius: RADIUS.md,
        padding: SPACING.sm,
        marginBottom: SPACING.xs,
    },
    replyingToLabel: {
        fontSize: 10,
        color: colors.textMuted,
        marginBottom: 2,
    },
    replyAuthor: {
        fontSize: 12,
        color: colors.showcase,
        fontWeight: '600',
    },
    replyText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
        lineHeight: 18,
    },
    replyingBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.xs,
    },
    replyingText: {
        fontSize: 12,
        color: colors.showcase,
    },
    cancelReply: {
        fontSize: 16,
        color: colors.textMuted,
        paddingHorizontal: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    // Image Viewer Styles
    tapHint: {
        position: 'absolute',
        bottom: SPACING.md,
        right: SPACING.md,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
    },
    tapHintText: {
        color: '#fff',
        fontSize: 11,
    },
    imageViewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageViewerClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageViewerCloseText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '600',
    },
    imageCounter: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: RADIUS.full,
    },
    imageCounterText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    imageViewerScrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.8,
    },
    zoomHint: {
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    zoomHintText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
});

export default ProjectDetailSheet;
