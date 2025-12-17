import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// ============================================
// Firebase Admin SDK Configuration
// ============================================
// 
// INSTRUCCIONES DE CONFIGURACIÓN:
// 
// 1. Ve a Firebase Console > Configuración del proyecto > Cuentas de servicio
// 2. Haz clic en "Generar nueva clave privada"
// 3. Guarda el archivo JSON de forma segura
// 4. Configura las variables de entorno:
//    - FIREBASE_PROJECT_ID
//    - FIREBASE_CLIENT_EMAIL
//    - FIREBASE_PRIVATE_KEY (con saltos de línea escapados como \n)
// 
// ============================================

const firebaseAdminConfig = {
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Reemplazar \n escapados con saltos de línea reales
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
};

// Inicializar solo si no hay instancias existentes
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

// Exportar instancias
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);

// ============================================
// Helper Functions
// ============================================

/**
 * Verifica si un usuario es administrador
 */
export const isUserAdmin = async (email: string): Promise<boolean> => {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    return adminEmails.includes(email);
};

/**
 * Obtiene estadísticas globales de la app
 */
export const getGlobalStats = async () => {
    try {
        // Usuarios totales
        const usersSnapshot = await adminDb.collection('users').count().get();
        const totalUsers = usersSnapshot.data().count;

        // Usuarios PRO
        const proSnapshot = await adminDb.collection('users')
            .where('is_premium', '==', true)
            .count()
            .get();
        const proUsers = proSnapshot.data().count;

        // Servicios del mes
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const servicesSnapshot = await adminDb.collection('services')
            .where('createdAt', '>=', startOfMonth)
            .count()
            .get();
        const servicesThisMonth = servicesSnapshot.data().count;

        // Tokens en circulación (suma de balances)
        const usersWithTokens = await adminDb.collection('users').get();
        let tokenFloat = 0;
        usersWithTokens.docs.forEach(doc => {
            tokenFloat += doc.data().token_balance || 0;
        });

        // Pedidos pendientes
        const pendingOrdersSnapshot = await adminDb.collection('orders')
            .where('status', 'in', ['paid', 'processing'])
            .count()
            .get();
        const pendingOrders = pendingOrdersSnapshot.data().count;

        return {
            totalUsers,
            proUsers,
            servicesThisMonth,
            tokenFloat,
            pendingOrders,
        };
    } catch (error) {
        console.error('Error fetching global stats:', error);
        return null;
    }
};

/**
 * Obtiene usuarios con paginación
 */
export const getUsers = async (
    page: number = 1,
    limit: number = 20,
    searchQuery?: string
) => {
    try {
        let query = adminDb.collection('users')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .offset((page - 1) * limit);

        // TODO: Para búsqueda necesitaremos índices compuestos o Algolia/Typesense
        // Por ahora retornamos sin filtro de búsqueda del lado del servidor

        const snapshot = await query.get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

/**
 * Actualiza un usuario
 */
export const updateUser = async (
    userId: string,
    updates: {
        is_banned?: boolean;
        is_premium?: boolean;
        eligible_for_directory?: boolean;
        token_balance?: number;
    }
) => {
    try {
        await adminDb.collection('users').doc(userId).update({
            ...updates,
            updatedAt: new Date(),
        });
        return true;
    } catch (error) {
        console.error('Error updating user:', error);
        return false;
    }
};

/**
 * Obtiene órdenes pendientes
 */
export const getPendingOrders = async () => {
    try {
        const snapshot = await adminDb.collection('orders')
            .where('status', 'in', ['paid', 'processing'])
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        return [];
    }
};

/**
 * Marca una orden como enviada
 */
export const markOrderShipped = async (
    orderId: string,
    trackingNumber: string,
    trackingCarrier: string
) => {
    try {
        await adminDb.collection('orders').doc(orderId).update({
            status: 'shipped',
            trackingNumber,
            trackingCarrier,
            shippedAt: new Date(),
        });

        // TODO: Disparar notificación push al usuario

        return true;
    } catch (error) {
        console.error('Error marking order as shipped:', error);
        return false;
    }
};

/**
 * Obtiene contenido flaggeado para moderación
 */
export const getFlaggedContent = async () => {
    try {
        // Hilos flaggeados
        const threadsSnapshot = await adminDb.collection('sos_threads')
            .where('isOffensive', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        // Comentarios flaggeados
        const commentsSnapshot = await adminDb.collection('sos_comments')
            .where('isOffensive', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const threads = threadsSnapshot.docs.map(doc => ({
            id: doc.id,
            type: 'thread' as const,
            ...doc.data(),
        }));

        const comments = commentsSnapshot.docs.map(doc => ({
            id: doc.id,
            type: 'comment' as const,
            ...doc.data(),
        }));

        return [...threads, ...comments].sort((a: any, b: any) =>
            b.createdAt?.toDate?.() - a.createdAt?.toDate?.()
        );
    } catch (error) {
        console.error('Error fetching flagged content:', error);
        return [];
    }
};

/**
 * Acciones de moderación
 */
export const moderateContent = async (
    contentId: string,
    contentType: 'thread' | 'comment',
    action: 'dismiss' | 'delete' | 'ban'
) => {
    try {
        const collection = contentType === 'thread' ? 'sos_threads' : 'sos_comments';
        const docRef = adminDb.collection(collection).doc(contentId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('Content not found');
        }

        const authorId = doc.data()?.authorId;

        switch (action) {
            case 'dismiss':
                await docRef.update({ isOffensive: false, reviewedAt: new Date() });
                break;

            case 'delete':
                await docRef.delete();
                break;

            case 'ban':
                await docRef.delete();
                if (authorId) {
                    await adminDb.collection('users').doc(authorId).update({
                        is_banned: true,
                        bannedAt: new Date(),
                        banReason: 'Contenido inapropiado',
                    });
                }
                break;
        }

        // Log de auditoría
        await adminDb.collection('admin_logs').add({
            action: `moderation_${action}`,
            contentId,
            contentType,
            authorId,
            adminId: 'system', // TODO: Obtener del usuario autenticado
            timestamp: new Date(),
        });

        return true;
    } catch (error) {
        console.error('Error moderating content:', error);
        return false;
    }
};
