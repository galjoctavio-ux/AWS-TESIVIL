import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    TextInput,
} from 'react-native';
import { Icon } from '@/components/icons/Icon';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { SPACING, RADIUS, API_URL } from '@/constants/config';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeColors } from '@/constants/themes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface NewsArticle {
    id: string;
    processed_title: string;
    original_title: string;
    bullets: string[];
    why_it_matters: string;
    source_name: string;
    original_url: string;
    published_at: string;
    importance: number;
    is_breaking: boolean;
    like_count?: number;
    comment_count?: number;
}

interface Comment {
    id: string;
    content: string;
    created_at: string;
    profiles: {
        alias: string;
        photo_url: string | null;
    };
    replies?: Comment[]; // Nested replies
}

interface NewsDetailSheetProps {
    articleId: string | null;
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════

async function fetchArticle(id: string): Promise<NewsArticle> {
    const response = await fetch(`${API_URL}/api/news/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data;
}

async function fetchComments(articleId: string): Promise<Comment[]> {
    const response = await fetch(`${API_URL}/api/news/${articleId}/comments`);
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data || [];
}

async function postComment(articleId: string, content: string, parentId?: string): Promise<Comment> {
    const response = await fetch(`${API_URL}/api/news/${articleId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': 'demo-user', // TODO: Replace with real auth
        },
        body: JSON.stringify({ content, parentId: parentId || null }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to post comment');
    return data.data;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

const NewsDetailSheet = forwardRef<BottomSheet, NewsDetailSheetProps>(
    ({ articleId, onClose }, ref) => {
        const { colors } = useTheme();
        const queryClient = useQueryClient();
        const [commentText, setCommentText] = useState('');
        const [replyingTo, setReplyingTo] = useState<{ id: string; alias: string } | null>(null);
        const [liked, setLiked] = useState(false);

        const styles = createStyles(colors);

        // Snap points for bottom sheet
        const snapPoints = useMemo(() => ['75%', '95%'], []);

        // Fetch article details
        const {
            data: article,
            isLoading: isLoadingArticle,
            error: articleError,
        } = useQuery({
            queryKey: ['news', articleId],
            queryFn: () => fetchArticle(articleId!),
            enabled: !!articleId,
        });

        // Fetch comments
        const { data: comments = [], isLoading: isLoadingComments } = useQuery({
            queryKey: ['news', articleId, 'comments'],
            queryFn: () => fetchComments(articleId!),
            enabled: !!articleId,
        });

        // Post comment mutation (supports replies)
        const commentMutation = useMutation({
            mutationFn: (params: { content: string; parentId?: string }) =>
                postComment(articleId!, params.content, params.parentId),
            onSuccess: () => {
                setCommentText('');
                setReplyingTo(null);
                queryClient.invalidateQueries({ queryKey: ['news', articleId, 'comments'] });
            },
        });

        // Like mutation
        const [localLikeCount, setLocalLikeCount] = useState<number | null>(null);

        const likeMutation = useMutation({
            mutationFn: async () => {
                const response = await fetch(`${API_URL}/api/news/${articleId}/like`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();
                if (!data.success) throw new Error(data.error);
                return data;
            },
            onSuccess: (data) => {
                setLiked(true);
                // Update local count immediately from API response
                if (data.newCount !== undefined) {
                    setLocalLikeCount(data.newCount);
                } else {
                    // Fallback: increment locally
                    setLocalLikeCount((prev) => (prev ?? (article?.like_count || 0)) + 1);
                }
                queryClient.invalidateQueries({ queryKey: ['news', articleId] });
                queryClient.invalidateQueries({ queryKey: ['news'] });
            },
        });

        // Handle open original URL
        const handleOpenOriginal = useCallback(async () => {
            if (article?.original_url) {
                try {
                    await Linking.openURL(article.original_url);
                } catch (error) {
                    console.error('Failed to open URL:', error);
                }
            }
        }, [article?.original_url]);

        // Handle submit comment
        const handleSubmitComment = useCallback(() => {
            if (commentText.trim()) {
                commentMutation.mutate({
                    content: commentText.trim(),
                    parentId: replyingTo?.id,
                });
            }
        }, [commentText, commentMutation, replyingTo]);

        // Render backdrop
        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.7}
                />
            ),
            []
        );

        // Format relative time
        const getRelativeTime = (dateStr: string) => {
            const date = new Date(dateStr);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 60) return `Hace ${diffMins} minutos`;
            if (diffHours < 24) return `Hace ${diffHours} horas`;
            return `Hace ${diffDays} días`;
        };

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={snapPoints}
                enablePanDownToClose
                onClose={onClose}
                backdropComponent={renderBackdrop}
                backgroundStyle={styles.sheetBackground}
                handleIndicatorStyle={styles.handleIndicator}
            >
                <BottomSheetScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                >
                    {/* Loading State */}
                    {isLoadingArticle && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.feed} />
                            <Text style={styles.loadingText}>Cargando artículo...</Text>
                        </View>
                    )}

                    {/* Error State */}
                    {articleError && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorIcon}>⚠️</Text>
                            <Text style={styles.errorText}>Error al cargar el artículo</Text>
                        </View>
                    )}

                    {/* Article Content */}
                    {article && (
                        <>
                            {/* Header */}
                            <View style={styles.header}>
                                {article.is_breaking && (
                                    <View style={styles.breakingBadge}>
                                        <Text style={styles.breakingText}>🚨 BREAKING</Text>
                                    </View>
                                )}
                                <View style={styles.metaRow}>
                                    <Text style={styles.source}>{article.source_name}</Text>
                                    <Text style={styles.time}>
                                        • {getRelativeTime(article.published_at)}
                                    </Text>
                                </View>
                            </View>

                            {/* Title */}
                            <Text style={styles.title}>
                                {article.processed_title || article.original_title}
                            </Text>

                            {/* Bullets Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>📋 Resumen</Text>
                                <View style={styles.bulletsList}>
                                    {article.bullets?.map((bullet, index) => (
                                        <View key={index} style={styles.bulletRow}>
                                            <Text style={styles.bulletDot}>•</Text>
                                            <Text style={styles.bulletText}>{bullet}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Why It Matters Section */}
                            {article.why_it_matters && (
                                <View style={styles.section}>
                                    <Text style={styles.sectionTitle}>💡 ¿Por qué te importa?</Text>
                                    <View style={styles.whyBox}>
                                        <Text style={styles.whyText}>{article.why_it_matters}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Action Buttons Row: Like + Original Link */}
                            <View style={styles.actionButtonsRow}>
                                {/* Like Button */}
                                <TouchableOpacity
                                    style={[styles.likeButton, liked && styles.likeButtonActive]}
                                    onPress={() => !liked && likeMutation.mutate()}
                                    disabled={liked || likeMutation.isPending}
                                    activeOpacity={0.8}
                                >
                                    {likeMutation.isPending ? (
                                        <ActivityIndicator size="small" color={colors.feed} />
                                    ) : (
                                        <Icon name="Heart" size={20} color={liked ? '#fff' : colors.feed} />
                                    )}
                                    <Text style={[styles.likeButtonText, liked && styles.likeButtonTextActive]}>
                                        {localLikeCount ?? article.like_count ?? 0} Me gusta
                                    </Text>
                                </TouchableOpacity>

                                {/* Original Link Button */}
                                {article.original_url ? (
                                    <TouchableOpacity
                                        style={styles.originalButton}
                                        onPress={handleOpenOriginal}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.originalButtonIcon}>🔗</Text>
                                        <Text style={styles.originalButtonText}>
                                            Leer original
                                        </Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            {/* Divider */}
                            <View style={styles.divider} />

                            {/* Comments Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>
                                    💬 Comentarios ({comments.length})
                                </Text>

                                {/* Replying To Banner */}
                                {replyingTo && (
                                    <View style={styles.replyingBanner}>
                                        <Text style={styles.replyingText}>Respondiendo a @{replyingTo.alias}</Text>
                                        <TouchableOpacity onPress={() => setReplyingTo(null)}>
                                            <Text style={styles.cancelReply}>✕</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Comment Input */}
                                <View style={styles.commentInputRow}>
                                    <TextInput
                                        style={styles.commentInput}
                                        placeholder={replyingTo ? "Escribe tu respuesta..." : "Escribe un comentario..."}
                                        placeholderTextColor={colors.textMuted}
                                        value={commentText}
                                        onChangeText={setCommentText}
                                        multiline
                                        maxLength={500}
                                    />
                                    <TouchableOpacity
                                        style={[
                                            styles.sendButton,
                                            !commentText.trim() && styles.sendButtonDisabled,
                                        ]}
                                        onPress={handleSubmitComment}
                                        disabled={!commentText.trim() || commentMutation.isPending}
                                    >
                                        {commentMutation.isPending ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.sendButtonText}>➤</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {/* Comments List */}
                                {isLoadingComments ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={colors.feed}
                                        style={{ marginTop: SPACING.md }}
                                    />
                                ) : comments.length === 0 ? (
                                    <View style={styles.noComments}>
                                        <Text style={styles.noCommentsText}>
                                            Sé el primero en comentar
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={styles.commentsList}>
                                        {comments.map((comment) => (
                                            <View key={comment.id} style={styles.commentItem}>
                                                <View style={styles.commentHeader}>
                                                    <Text style={styles.commentAuthor}>
                                                        @{comment.profiles?.alias || 'Usuario'}
                                                    </Text>
                                                    <Text style={styles.commentTime}>
                                                        {getRelativeTime(comment.created_at)}
                                                    </Text>
                                                </View>
                                                <Text style={styles.commentContent}>
                                                    {comment.content}
                                                </Text>

                                                {/* Reply Button */}
                                                <TouchableOpacity
                                                    style={styles.replyButton}
                                                    onPress={() => setReplyingTo({
                                                        id: comment.id,
                                                        alias: comment.profiles?.alias || 'Usuario'
                                                    })}
                                                >
                                                    <Text style={styles.replyButtonText}>↩️ Responder</Text>
                                                </TouchableOpacity>

                                                {/* Nested Replies */}
                                                {comment.replies && comment.replies.length > 0 && (
                                                    <View style={styles.repliesContainer}>
                                                        {comment.replies.map((reply) => (
                                                            <View key={reply.id} style={styles.replyCard}>
                                                                <Text style={styles.replyingToLabel}>
                                                                    ↳ En respuesta a @{comment.profiles?.alias || 'Usuario'}
                                                                </Text>
                                                                <Text style={styles.replyAuthor}>
                                                                    @{reply.profiles?.alias || 'Usuario'}
                                                                </Text>
                                                                <Text style={styles.replyText}>{reply.content}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </>
                    )}
                </BottomSheetScrollView>
            </BottomSheet>
        );
    }
);

NewsDetailSheet.displayName = 'NewsDetailSheet';

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════

const createStyles = (colors: ThemeColors) => StyleSheet.create({
    sheetBackground: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: RADIUS.xl,
        borderTopRightRadius: RADIUS.xl,
    },
    handleIndicator: {
        backgroundColor: colors.textMuted,
        width: 40,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    loadingText: {
        marginTop: SPACING.md,
        color: colors.textMuted,
        fontSize: 14,
    },
    errorContainer: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    errorText: {
        color: colors.error,
        fontSize: 16,
    },
    header: {
        marginBottom: SPACING.md,
    },
    breakingBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.error,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.sm,
    },
    breakingText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    source: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.feed,
    },
    time: {
        fontSize: 13,
        color: colors.textMuted,
        marginLeft: SPACING.xs,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
        lineHeight: 28,
        marginBottom: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: SPACING.sm,
    },
    bulletsList: {
        gap: SPACING.sm,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletDot: {
        fontSize: 16,
        color: colors.feed,
        marginRight: SPACING.sm,
        lineHeight: 22,
    },
    bulletText: {
        flex: 1,
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    whyBox: {
        backgroundColor: `${colors.feed}15`,
        borderLeftWidth: 3,
        borderLeftColor: colors.feed,
        padding: SPACING.md,
        borderRadius: RADIUS.sm,
    },
    whyText: {
        fontSize: 15,
        color: colors.textPrimary,
        lineHeight: 22,
        fontStyle: 'italic',
    },
    originalButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.feed,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
    },
    originalButtonIcon: {
        fontSize: 16,
        marginRight: SPACING.sm,
    },
    originalButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    originalButtonDisabled: {
        backgroundColor: colors.textMuted,
        opacity: 0.6,
    },
    divider: {
        height: 1,
        backgroundColor: colors.surfaceBorder,
        marginVertical: SPACING.lg,
    },
    commentInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.background,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        color: colors.textPrimary,
        fontSize: 14,
        minHeight: 44,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: colors.surfaceBorder,
    },
    sendButton: {
        backgroundColor: colors.feed,
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        fontSize: 18,
        color: '#fff',
    },
    noComments: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    noCommentsText: {
        color: colors.textMuted,
        fontSize: 14,
    },
    commentsList: {
        gap: SPACING.md,
    },
    commentItem: {
        backgroundColor: colors.background,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    commentAuthor: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.feed,
    },
    commentTime: {
        fontSize: 12,
        color: colors.textMuted,
    },
    commentContent: {
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    // Reply styles
    replyingBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: `${colors.feed}20`,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.sm,
    },
    replyingText: {
        fontSize: 13,
        color: colors.feed,
        fontWeight: '500',
    },
    cancelReply: {
        fontSize: 16,
        color: colors.textMuted,
        padding: SPACING.xs,
    },
    replyButton: {
        marginTop: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    replyButtonText: {
        fontSize: 12,
        color: colors.feed,
        fontWeight: '500',
    },
    repliesContainer: {
        marginTop: SPACING.sm,
        marginLeft: SPACING.md,
        paddingLeft: SPACING.sm,
        borderLeftWidth: 2,
        borderLeftColor: `${colors.feed}40`,
    },
    replyCard: {
        backgroundColor: colors.surface,
        padding: SPACING.sm,
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.xs,
    },
    replyingToLabel: {
        fontSize: 11,
        color: colors.textMuted,
        marginBottom: 2,
    },
    replyAuthor: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.feed,
        marginBottom: 2,
    },
    replyText: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
    // Like button styles
    actionButtonsRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginVertical: SPACING.md,
    },
    likeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        backgroundColor: colors.background,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.md,
        borderWidth: 2,
        borderColor: colors.feed,
    },
    likeButtonActive: {
        backgroundColor: colors.feed,
        borderColor: colors.feed,
    },
    likeButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.feed,
    },
    likeButtonTextActive: {
        color: '#fff',
    },
});

export default NewsDetailSheet;
