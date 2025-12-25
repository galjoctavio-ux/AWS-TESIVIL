import {
    collection, addDoc, getDocs, query, where, orderBy, limit,
    serverTimestamp, doc, updateDoc, increment, getDoc, Timestamp,
    writeBatch, deleteDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { UserRank } from './user-service';

// ============================================
// COMUNIDAD SOS - QRclima
// Según master_plan.md - Módulo 6 (Community SOS)
// ============================================

// ============================================
// TIPOS
// ============================================

export interface SOSThread {
    id?: string;
    authorId: string;
    authorName: string;
    authorRank: UserRank;
    authorPhotoURL?: string;      // URL de foto de perfil del autor
    authorIsPro?: boolean;        // True si el autor es usuario PRO
    title: string;
    content: string;
    brand: string;
    model?: string;
    errorCode?: string;          // Código de error relacionado
    imageUrl?: string;           // URL de la foto adjunta (comprimida)
    status: 'Abierto' | 'Resuelto';
    createdAt: any;
    updatedAt?: any;
    likes: number;
    commentCount: number;
    viewCount: number;
    isOffensive?: boolean;       // Flag de contenido ofensivo (IA)
    toxicityScore?: number;      // Score de toxicidad (0-1)
    tags?: string[];             // Tags para búsqueda
    // Sistema de Casos Fijados
    isPinned?: boolean;          // True si el caso está fijado
    pinnedAt?: any;              // Timestamp de cuando fue fijado
    pinnedUntil?: any;           // Timestamp hasta cuando está fijado
}

export interface SOSComment {
    id?: string;
    threadId: string;
    authorId: string;
    authorName: string;
    authorRank: UserRank;
    authorPhotoURL?: string;      // URL de foto de perfil del autor
    authorIsPro?: boolean;        // True si el autor es usuario PRO
    content: string;
    isSolution: boolean;
    createdAt: any;
    votes: number;
    isOffensive?: boolean;
    toxicityScore?: number;
}

export interface CommunityFailure {
    id?: string;
    brand: string;
    model: string;
    errorCode: string;
    symptom: string;
    solution: string;
    reportCount: number;          // Regla de 3: se promueve cuando llega a 3
    isVerified: boolean;          // true cuando reportCount >= 3
    reporters: string[];          // IDs de técnicos que lo reportaron
    createdAt: any;
    updatedAt?: any;
}

// ============================================
// CONFIGURACIÓN
// ============================================

const COMMUNITY_CONFIG = {
    // Rate Limiting
    maxCommentsPerHour: 5,
    maxThreadsPerDay: 3,

    // Regla de 3 - Promoción de fallas a base oficial
    verificationThreshold: 3,

    // Moderación
    toxicityThreshold: 0.7,  // Contenido con score > 0.7 se flagea

    // Tokens
    threadReward: 20,
    solutionReward: 50,
    verifiedFailureReward: 100,  // Por contribuir a falla verificada

    // Sistema de Casos Fijados (Pinned)
    pinCost: 50,             // Costo en tokens para fijar un caso
    pinDurationHours: 24,    // Duración del pin en horas
};

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    message?: string;
}

/**
 * Verifica el rate limit para un usuario
 */
export const checkRateLimit = async (
    userId: string,
    actionType: 'comment' | 'thread'
): Promise<RateLimitResult> => {
    try {
        const now = new Date();
        let timeWindow: Date;
        let maxAllowed: number;
        let collectionName: string;

        if (actionType === 'comment') {
            timeWindow = new Date(now.getTime() - 60 * 60 * 1000); // 1 hora
            maxAllowed = COMMUNITY_CONFIG.maxCommentsPerHour;
            collectionName = 'sos_comments';
        } else {
            timeWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 horas
            maxAllowed = COMMUNITY_CONFIG.maxThreadsPerDay;
            collectionName = 'sos_threads';
        }

        const q = query(
            collection(db, collectionName),
            where('authorId', '==', userId),
            where('createdAt', '>=', Timestamp.fromDate(timeWindow))
        );

        const snapshot = await getDocs(q);
        const count = snapshot.size;
        const remaining = Math.max(0, maxAllowed - count);

        if (count >= maxAllowed) {
            return {
                allowed: false,
                remaining: 0,
                message: actionType === 'comment'
                    ? `Límite de ${maxAllowed} comentarios por hora alcanzado`
                    : `Límite de ${maxAllowed} hilos por día alcanzado`,
            };
        }

        return { allowed: true, remaining };
    } catch (error) {
        console.error('Error checking rate limit:', error);
        // En caso de error, permitir para no bloquear
        return { allowed: true, remaining: 1 };
    }
};

// ============================================
// MODERACIÓN CON IA (GROQ)
// ============================================

interface ModerationResult {
    isOffensive: boolean;
    toxicityScore: number;
    categories?: string[];
}

/**
 * Modera contenido con Groq API
 * En producción, esto debería ser una Cloud Function
 */
export const moderateContent = async (text: string): Promise<ModerationResult> => {
    // TODO: Implementar llamada real a Groq API
    // Por ahora, usa detección básica de palabras

    const forbiddenPatterns = [
        /\b(estafa|fraude|scam)\b/i,
        /\b(idiota|tonto|imbecil|pendejo)\b/i,
        /\b(mierda|chinga|verga|puta)\b/i,
        /\b(roba|robar|ladr[oó]n)\b/i,
    ];

    const warningPatterns = [
        /\b(malo|terrible|horrible)\b/i,
        /\b(ment[ií]r|falso)\b/i,
    ];

    let toxicityScore = 0;
    const categories: string[] = [];

    // Check forbidden (high toxicity)
    for (const pattern of forbiddenPatterns) {
        if (pattern.test(text)) {
            toxicityScore = Math.max(toxicityScore, 0.9);
            categories.push('offensive_language');
        }
    }

    // Check warnings (medium toxicity)
    for (const pattern of warningPatterns) {
        if (pattern.test(text)) {
            toxicityScore = Math.max(toxicityScore, 0.5);
            categories.push('negative_sentiment');
        }
    }

    return {
        isOffensive: toxicityScore >= COMMUNITY_CONFIG.toxicityThreshold,
        toxicityScore,
        categories: categories.length > 0 ? categories : undefined,
    };
};

/**
 * Llamada real a Groq API (para Cloud Functions)
 * Esta función debe ejecutarse en el servidor, no en el cliente
 */
export const moderateWithGroq = async (text: string): Promise<ModerationResult> => {
    // Esta función es un placeholder para la implementación en Cloud Functions
    // El código real usaría:
    //
    // const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //         model: 'llama3-8b-8192',
    //         messages: [{
    //             role: 'system',
    //             content: 'Eres un moderador de contenido...'
    //         }, {
    //             role: 'user',
    //             content: text
    //         }],
    //         temperature: 0.1,
    //     }),
    // });

    // Por ahora, usar moderación local
    return moderateContent(text);
};

// ============================================
// THREADS
// ============================================

export const createThread = async (
    threadData: Omit<SOSThread, 'id' | 'createdAt' | 'likes' | 'commentCount' | 'viewCount' | 'status'>
): Promise<string> => {
    // 1. Check rate limit
    const rateLimit = await checkRateLimit(threadData.authorId, 'thread');
    if (!rateLimit.allowed) {
        throw new Error(rateLimit.message || 'Rate limit exceeded');
    }

    // 2. Moderate content
    const titleModeration = await moderateContent(threadData.title);
    const contentModeration = await moderateContent(threadData.content);

    const isOffensive = titleModeration.isOffensive || contentModeration.isOffensive;
    const toxicityScore = Math.max(titleModeration.toxicityScore, contentModeration.toxicityScore);

    if (isOffensive) {
        throw new Error('Contenido detectado como inapropiado. Por favor revisa tu lenguaje.');
    }

    try {
        // 3. Create thread
        const docRef = await addDoc(collection(db, 'sos_threads'), {
            ...threadData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            likes: 0,
            commentCount: 0,
            viewCount: 0,
            status: 'Abierto',
            isOffensive: false,
            toxicityScore,
        });

        // 4. Award tokens
        const userRef = doc(db, 'users', threadData.authorId);
        await updateDoc(userRef, {
            token_balance: increment(COMMUNITY_CONFIG.threadReward)
        });

        console.log('Thread created:', docRef.id);
        return docRef.id;
    } catch (e) {
        console.error('Error creating thread:', e);
        throw e;
    }
};

export const getThreads = async (
    filter: 'recent' | 'solved' | 'popular' = 'recent',
    page: number = 1,
    pageSize: number = 10
): Promise<{ threads: SOSThread[]; totalPages: number; currentPage: number }> => {
    try {
        let q;
        const now = new Date();

        let allThreads: SOSThread[] = [];

        // Estrategia: Obtener siempre por fecha (recent) y filtrar en memoria
        // Esto evita errores de "Missing Index" en Firestore para consultas complejas
        // y permite manejar la paginación y el pin de forma consistente.

        // 1. Base Query: Get threads ordered by date
        q = query(
            collection(db, 'sos_threads'),
            orderBy('createdAt', 'desc'),
            limit(100) // Traemos suficientes para filtrar en cliente
        );

        const snapshot = await getDocs(q);

        // 2. Map & Filter
        allThreads = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as SOSThread))
            .filter(thread => !thread.isOffensive);

        // 3. Apply Filter (Solved vs Recent)
        if (filter === 'solved') {
            allThreads = allThreads.filter(t => t.status === 'Resuelto');
        } else if (filter === 'popular') {
            // Client-side sort for popular to avoid index issues too
            allThreads.sort((a, b) => b.likes - a.likes);
        }

        // 4. Expire Pins & Sort Pinned First (Always applied)

        // Expire old pins and sort pinned first
        allThreads = allThreads.map(thread => {
            if (thread.isPinned && thread.pinnedUntil) {
                const pinnedUntil = thread.pinnedUntil.toDate
                    ? thread.pinnedUntil.toDate()
                    : new Date(thread.pinnedUntil);
                if (pinnedUntil < now) {
                    // Pin expired - mark as not pinned (will be updated on next write)
                    return { ...thread, isPinned: false };
                }
            }
            return thread;
        });

        // Sort: pinned first, then by date
        allThreads.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0; // Maintain existing order (by date from query)
        });

        // Calculate pagination
        const totalItems = allThreads.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const paginatedThreads = allThreads.slice(startIndex, startIndex + pageSize);

        return {
            threads: paginatedThreads,
            totalPages: Math.max(1, totalPages),
            currentPage: page
        };
    } catch (e) {
        console.error('Error fetching threads:', e);
        return { threads: [], totalPages: 1, currentPage: 1 };
    }
};

export const getThreadById = async (threadId: string): Promise<SOSThread | null> => {
    try {
        const threadRef = doc(db, 'sos_threads', threadId);
        const snapshot = await getDoc(threadRef);

        if (snapshot.exists()) {
            // Increment view count
            await updateDoc(threadRef, {
                viewCount: increment(1)
            });

            return { id: snapshot.id, ...snapshot.data() } as SOSThread;
        }
        return null;
    } catch (e) {
        console.error('Error fetching thread:', e);
        return null;
    }
};

export const likeThread = async (threadId: string, userId: string): Promise<void> => {
    // TODO: Track user likes to prevent duplicate likes
    const threadRef = doc(db, 'sos_threads', threadId);
    await updateDoc(threadRef, {
        likes: increment(1)
    });
};

/**
 * Fija un caso en la parte superior pagando con tokens
 * @param threadId - ID del hilo a fijar
 * @param userId - ID del usuario que paga
 * @returns Objeto con éxito y mensaje
 */
export const pinThread = async (
    threadId: string,
    userId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        // 1. Verify thread exists and user is author
        const threadRef = doc(db, 'sos_threads', threadId);
        const threadSnap = await getDoc(threadRef);

        if (!threadSnap.exists()) {
            return { success: false, message: 'Caso no encontrado' };
        }

        const threadData = threadSnap.data() as SOSThread;
        if (threadData.authorId !== userId) {
            return { success: false, message: 'Solo el autor puede fijar el caso' };
        }

        if (threadData.isPinned) {
            return { success: false, message: 'Este caso ya está fijado' };
        }

        // 2. Check user has enough tokens
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const userData = userSnap.data();
        const tokenBalance = userData.tokenBalance || userData.token_balance || 0;

        if (tokenBalance < COMMUNITY_CONFIG.pinCost) {
            return {
                success: false,
                message: `Necesitas ${COMMUNITY_CONFIG.pinCost} tokens. Tu balance: ${tokenBalance}`
            };
        }

        // 3. Deduct tokens and pin thread
        const pinnedUntil = new Date();
        pinnedUntil.setHours(pinnedUntil.getHours() + COMMUNITY_CONFIG.pinDurationHours);

        const batch = writeBatch(db);

        // Deduct tokens
        batch.update(userRef, {
            token_balance: increment(-COMMUNITY_CONFIG.pinCost)
        });

        // Pin thread
        batch.update(threadRef, {
            isPinned: true,
            pinnedAt: serverTimestamp(),
            pinnedUntil: Timestamp.fromDate(pinnedUntil),
            updatedAt: serverTimestamp()
        });

        await batch.commit();

        return {
            success: true,
            message: `¡Caso fijado por ${COMMUNITY_CONFIG.pinDurationHours} horas!`
        };
    } catch (e) {
        console.error('Error pinning thread:', e);
        return { success: false, message: 'Error al fijar el caso' };
    }
};

/**
 * Obtiene el costo de fijar un caso
 */
export const getPinCost = (): number => COMMUNITY_CONFIG.pinCost;

// ============================================
// COMMENTS
// ============================================

export const addComment = async (
    commentData: Omit<SOSComment, 'id' | 'createdAt' | 'votes' | 'isSolution'>
): Promise<string> => {
    // 1. Check rate limit
    const rateLimit = await checkRateLimit(commentData.authorId, 'comment');
    if (!rateLimit.allowed) {
        throw new Error(rateLimit.message || 'Rate limit exceeded');
    }

    // 2. Moderate content
    const moderation = await moderateContent(commentData.content);

    if (moderation.isOffensive) {
        throw new Error('Comentario detectado como inapropiado.');
    }

    try {
        // 3. Create comment
        const docRef = await addDoc(collection(db, 'sos_comments'), {
            ...commentData,
            createdAt: serverTimestamp(),
            votes: 0,
            isSolution: false,
            isOffensive: false,
            toxicityScore: moderation.toxicityScore,
        });

        // 4. Update thread comment count
        const threadRef = doc(db, 'sos_threads', commentData.threadId);
        await updateDoc(threadRef, {
            commentCount: increment(1),
            updatedAt: serverTimestamp(),
        });

        return docRef.id;
    } catch (e) {
        console.error('Error adding comment:', e);
        throw e;
    }
};

export const getComments = async (threadId: string): Promise<SOSComment[]> => {
    try {
        const q = query(
            collection(db, 'sos_comments'),
            where('threadId', '==', threadId),
            where('isOffensive', '==', false),
            orderBy('isSolution', 'desc'),  // Solutions first
            orderBy('votes', 'desc'),
            orderBy('createdAt', 'asc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SOSComment));
    } catch (e) {
        console.error('Error fetching comments:', e);
        return [];
    }
};

export const voteComment = async (commentId: string, increment_value: number = 1): Promise<void> => {
    const commentRef = doc(db, 'sos_comments', commentId);
    await updateDoc(commentRef, {
        votes: increment(increment_value)
    });
};

export const markSolution = async (
    threadId: string,
    commentId: string,
    solverId: string
): Promise<void> => {
    try {
        const batch = writeBatch(db);

        // 1. Mark thread as solved
        const threadRef = doc(db, 'sos_threads', threadId);
        batch.update(threadRef, {
            status: 'Resuelto',
            updatedAt: serverTimestamp(),
        });

        // 2. Mark comment as solution
        const commentRef = doc(db, 'sos_comments', commentId);
        batch.update(commentRef, {
            isSolution: true
        });

        // 3. Award solver
        const userRef = doc(db, 'users', solverId);
        batch.update(userRef, {
            token_balance: increment(COMMUNITY_CONFIG.solutionReward)
        });

        await batch.commit();
        console.log('Solution marked:', commentId);
    } catch (e) {
        console.error('Error marking solution:', e);
        throw e;
    }
};

// ============================================
// BASE DE FALLAS COMUNITARIA (REGLA DE 3)
// ============================================

/**
 * Reporta una falla. Si 3 técnicos diferentes reportan la misma falla,
 * se verifica y se añade a la base de datos oficial.
 */
export const reportCommunityFailure = async (
    reportData: {
        brand: string;
        model: string;
        errorCode: string;
        symptom: string;
        solution: string;
        reporterId: string;
    }
): Promise<{ isNew: boolean; isNowVerified: boolean; reportCount: number }> => {
    try {
        // Check if failure already exists
        const q = query(
            collection(db, 'community_failures'),
            where('brand', '==', reportData.brand),
            where('errorCode', '==', reportData.errorCode)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            // Create new failure report
            await addDoc(collection(db, 'community_failures'), {
                brand: reportData.brand,
                model: reportData.model,
                errorCode: reportData.errorCode,
                symptom: reportData.symptom,
                solution: reportData.solution,
                reportCount: 1,
                isVerified: false,
                reporters: [reportData.reporterId],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            return { isNew: true, isNowVerified: false, reportCount: 1 };
        } else {
            // Update existing failure
            const failureDoc = snapshot.docs[0];
            const failureData = failureDoc.data() as CommunityFailure;

            // Check if this user already reported
            if (failureData.reporters?.includes(reportData.reporterId)) {
                return {
                    isNew: false,
                    isNowVerified: failureData.isVerified,
                    reportCount: failureData.reportCount
                };
            }

            const newReportCount = (failureData.reportCount || 0) + 1;
            const isNowVerified = newReportCount >= COMMUNITY_CONFIG.verificationThreshold;

            const updates: any = {
                reportCount: increment(1),
                reporters: [...(failureData.reporters || []), reportData.reporterId],
                updatedAt: serverTimestamp(),
            };

            // If just verified, update that too
            if (isNowVerified && !failureData.isVerified) {
                updates.isVerified = true;

                // Award all reporters
                for (const reporterId of failureData.reporters || []) {
                    const userRef = doc(db, 'users', reporterId);
                    await updateDoc(userRef, {
                        token_balance: increment(COMMUNITY_CONFIG.verifiedFailureReward)
                    });
                }
                // Award current reporter too
                const currentUserRef = doc(db, 'users', reportData.reporterId);
                await updateDoc(currentUserRef, {
                    token_balance: increment(COMMUNITY_CONFIG.verifiedFailureReward)
                });
            }

            await updateDoc(doc(db, 'community_failures', failureDoc.id), updates);

            return { isNew: false, isNowVerified, reportCount: newReportCount };
        }
    } catch (e) {
        console.error('Error reporting community failure:', e);
        throw e;
    }
};

/**
 * Obtiene fallas verificadas por la comunidad
 */
export const getVerifiedFailures = async (
    brand?: string,
    limitCount: number = 50
): Promise<CommunityFailure[]> => {
    try {
        let q;

        if (brand) {
            q = query(
                collection(db, 'community_failures'),
                where('isVerified', '==', true),
                where('brand', '==', brand),
                orderBy('reportCount', 'desc'),
                limit(limitCount)
            );
        } else {
            q = query(
                collection(db, 'community_failures'),
                where('isVerified', '==', true),
                orderBy('reportCount', 'desc'),
                limit(limitCount)
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityFailure));
    } catch (e) {
        console.error('Error fetching verified failures:', e);
        return [];
    }
};

/**
 * Busca fallas comunitarias por código de error
 */
export const searchCommunityFailures = async (
    errorCode: string
): Promise<CommunityFailure[]> => {
    try {
        const q = query(
            collection(db, 'community_failures'),
            where('errorCode', '==', errorCode.toUpperCase())
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityFailure));
    } catch (e) {
        console.error('Error searching community failures:', e);
        return [];
    }
};

// ============================================
// SEARCH
// ============================================

export const searchThreads = async (
    searchQuery: string,
    limitCount: number = 20
): Promise<SOSThread[]> => {
    // Firestore doesn't support full-text search natively
    // In production, use Algolia, Typesense, or Cloud Functions with Firestore
    // For now, do client-side filtering

    try {
        const result = await getThreads('recent', 1, 100);
        const lowerQuery = searchQuery.toLowerCase();

        return result.threads
            .filter((thread: SOSThread) =>
                thread.title.toLowerCase().includes(lowerQuery) ||
                thread.content.toLowerCase().includes(lowerQuery) ||
                thread.brand?.toLowerCase().includes(lowerQuery) ||
                thread.errorCode?.toLowerCase().includes(lowerQuery)
            )
            .slice(0, limitCount);
    } catch (e) {
        console.error('Error searching threads:', e);
        return [];
    }
};
