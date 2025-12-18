/**
 * Training Community Service
 * Maneja comentarios, reacciones y tokens del módulo de capacitación
 */

import {
    addTrainingPost,
    getTrainingPosts,
    updateTrainingPostStatus,
    addTrainingReaction,
    getTrainingReactions,
    TrainingPost,
} from './database-service';
import { moderateComment, moderateContentLocal } from './ai-moderation-service';
import { earnTokens } from './wallet-service';

export interface CommentData {
    moduleId: number;
    userId: string;
    userName: string;
    content: string;
    parentId?: number;
}

export interface CommentWithReactions extends TrainingPost {
    reactions: { maestro: number; tal_cual: number; interesante: number };
    replies?: CommentWithReactions[];
}

/**
 * Agrega un comentario al módulo con moderación IA
 */
export const addComment = async (data: CommentData): Promise<{
    success: boolean;
    postId?: number;
    approved: boolean;
    expertBadge: boolean;
    tokensEarned: number;
    reason?: string;
}> => {
    try {
        // 1. Moderar contenido con IA
        let moderationResult;
        try {
            moderationResult = await moderateComment(data.content);
        } catch {
            // Fallback a moderación local
            moderationResult = moderateContentLocal(data.content);
        }

        // 2. Guardar el post con su status
        const status = moderationResult.approved ? 'approved' : 'rejected';
        const postId = await addTrainingPost(
            data.moduleId,
            data.userId,
            data.userName,
            data.content,
            status,
            moderationResult.expertBadge ? 1 : 0,
            data.parentId,
            moderationResult.reason
        );

        // 3. Si fue aprobado, otorgar tokens
        let tokensEarned = 0;
        if (moderationResult.approved) {
            const result = await earnTokens(
                data.userId,
                'training_comment_approved',
                `comment_${postId}`
            );
            if (result.success) {
                tokensEarned = 2;
            }
        }

        return {
            success: true,
            postId,
            approved: moderationResult.approved,
            expertBadge: moderationResult.expertBadge,
            tokensEarned,
            reason: moderationResult.reason
        };
    } catch (error) {
        console.error('Error adding comment:', error);
        return {
            success: false,
            approved: false,
            expertBadge: false,
            tokensEarned: 0,
            reason: 'Error al procesar el comentario'
        };
    }
};

/**
 * Obtiene comentarios de un módulo con sus reacciones
 */
export const getCommentsWithReactions = async (moduleId: number): Promise<CommentWithReactions[]> => {
    try {
        const posts = await getTrainingPosts(moduleId);

        // Agregar reacciones a cada post
        const commentsWithReactions: CommentWithReactions[] = await Promise.all(
            posts.map(async (post) => {
                const reactions = await getTrainingReactions(post.id);
                return { ...post, reactions };
            })
        );

        // Organizar en árbol (posts padres con replies)
        const rootComments = commentsWithReactions.filter(c => !c.parent_id);
        const replies = commentsWithReactions.filter(c => c.parent_id);

        return rootComments.map(root => ({
            ...root,
            replies: replies.filter(r => r.parent_id === root.id)
        }));
    } catch (error) {
        console.error('Error getting comments:', error);
        return [];
    }
};

/**
 * Agrega una reacción a un comentario
 * Si es "maestro", otorga +5 tokens al autor del comentario
 */
export const reactToComment = async (
    postId: number,
    reactorUserId: string,
    reactionType: 'maestro' | 'tal_cual' | 'interesante',
    postAuthorId: string
): Promise<{ success: boolean; tokensAwarded: number }> => {
    try {
        const added = await addTrainingReaction(postId, reactorUserId, reactionType);

        if (!added) {
            return { success: false, tokensAwarded: 0 };
        }

        // Si es reacción "maestro", otorgar tokens al autor
        let tokensAwarded = 0;
        if (reactionType === 'maestro' && postAuthorId !== reactorUserId) {
            const result = await earnTokens(
                postAuthorId,
                'training_reaction_maestro',
                `reaction_${postId}`
            );
            if (result.success) {
                tokensAwarded = 5;
            }
        }

        return { success: true, tokensAwarded };
    } catch (error) {
        console.error('Error adding reaction:', error);
        return { success: false, tokensAwarded: 0 };
    }
};

/**
 * Obtiene el conteo de reacciones de un post
 */
export const getReactionCounts = async (postId: number) => {
    return getTrainingReactions(postId);
};
