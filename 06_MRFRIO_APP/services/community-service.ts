import { collection, addDoc, getDocs, query, where, orderBy, limit, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export interface SOSThread {
    id: string;
    authorId: string;
    authorName: string;
    authorRank: string;
    title: string;
    content: string;
    brand: string;
    model: string;
    status: 'Abierto' | 'Resuelto';
    createdAt: any;
    likes: number;
    commentCount: number;
    isOffensive?: boolean; // AI Flag
}

export interface SOSComment {
    id: string;
    threadId: string;
    authorId: string;
    authorName: string;
    authorRank: string;
    content: string;
    isSolution: boolean;
    createdAt: any;
    votes: number;
}

// SIMULATED AI MODERATION (Mock)
const checkContentSafety = (text: string): boolean => {
    const forbiddenWords = ['estafa', 'fraude', 'grosera', 'tonto', 'idiota'];
    const lowerText = text.toLowerCase();
    return !forbiddenWords.some(word => lowerText.includes(word));
};

export const createThread = async (threadData: Omit<SOSThread, 'id' | 'createdAt' | 'likes' | 'commentCount'>) => {
    // 1. Mock AI Guardrail
    if (!checkContentSafety(threadData.content) || !checkContentSafety(threadData.title)) {
        throw new Error("Contenido detectado como inapropiado por la IA. Por favor revisa tu lenguaje.");
    }

    try {
        // 2. Create Thread
        const docRef = await addDoc(collection(db, 'sos_threads'), {
            ...threadData,
            createdAt: serverTimestamp(),
            likes: 0,
            commentCount: 0,
            status: 'Abierto'
        });

        // 3. Reward Author (Simulated Token increase)
        // In real app, this would be a Cloud Function trigger
        const userRef = doc(db, 'users', threadData.authorId);
        await updateDoc(userRef, {
            token_balance: increment(5) // Participation reward
        });

        return docRef.id;
    } catch (e) {
        console.error('Error creating thread:', e);
        throw e;
    }
};

export const getThreads = async (filter: 'recent' | 'solved' = 'recent') => {
    try {
        let q;
        if (filter === 'solved') {
            q = query(
                collection(db, 'sos_threads'),
                where('status', '==', 'Resuelto'),
                orderBy('createdAt', 'desc'),
                limit(20)
            );
        } else {
            q = query(
                collection(db, 'sos_threads'),
                orderBy('createdAt', 'desc'),
                limit(20)
            );
        }

        const querySnapshot = await getDocs(q);
        const threads: SOSThread[] = [];
        querySnapshot.forEach((doc) => {
            threads.push({ id: doc.id, ...doc.data() } as SOSThread);
        });
        return threads;
    } catch (e) {
        console.error('Error fetching threads:', e);
        return [];
    }
};

export const addComment = async (commentData: Omit<SOSComment, 'id' | 'createdAt' | 'votes' | 'isSolution'>) => {
    // 1. Mock AI Guardrail
    if (!checkContentSafety(commentData.content)) {
        throw new Error("Comentario inapropiado.");
    }

    try {
        const docRef = await addDoc(collection(db, 'sos_comments'), {
            ...commentData,
            createdAt: serverTimestamp(),
            votes: 0,
            isSolution: false
        });

        // Update thread comment count
        const threadRef = doc(db, 'sos_threads', commentData.threadId);
        await updateDoc(threadRef, {
            commentCount: increment(1)
        });

        return docRef.id;
    } catch (e) {
        throw e;
    }
};

export const getComments = async (threadId: string) => {
    try {
        const q = query(
            collection(db, 'sos_comments'),
            where('threadId', '==', threadId),
            orderBy('createdAt', 'asc')
        );

        const querySnapshot = await getDocs(q);
        const comments: SOSComment[] = [];
        querySnapshot.forEach((doc) => {
            comments.push({ id: doc.id, ...doc.data() } as SOSComment);
        });
        return comments;
    } catch (e) {
        return [];
    }
};

export const markSolution = async (threadId: string, commentId: string, solverId: string) => {
    try {
        // 1. Mark Thread as Solved
        const threadRef = doc(db, 'sos_threads', threadId);
        await updateDoc(threadRef, {
            status: 'Resuelto'
        });

        // 2. Mark Comment as Solution
        const commentRef = doc(db, 'sos_comments', commentId);
        await updateDoc(commentRef, {
            isSolution: true
        });

        // 3. Reward Solver (Big Reward)
        const userRef = doc(db, 'users', solverId);
        await updateDoc(userRef, {
            token_balance: increment(50) // Solution reward
        });

    } catch (e) {
        console.error("Error marking solution:", e);
        throw e;
    }
};
