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

// Parse private key - handle different escape formats
const formatPrivateKey = (key: string | undefined): string | undefined => {
    if (!key) return undefined;
    // Remove surrounding quotes if present
    let cleaned = key.replace(/^["']|["']$/g, '');
    // Replace literal \n with actual newlines
    cleaned = cleaned.replace(/\\n/g, '\n');
    return cleaned;
};

let adminDb: FirebaseFirestore.Firestore;
let adminAuth: ReturnType<typeof getAuth>;

try {
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        console.warn('Firebase Admin: Missing required environment variables');
        console.warn('FIREBASE_PROJECT_ID:', !!process.env.FIREBASE_PROJECT_ID);
        console.warn('FIREBASE_CLIENT_EMAIL:', !!process.env.FIREBASE_CLIENT_EMAIL);
        console.warn('FIREBASE_PRIVATE_KEY:', !!privateKey);
    }

    const firebaseAdminConfig = {
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
    };

    // Inicializar solo si no hay instancias existentes
    const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

    // Exportar instancias
    adminDb = getFirestore(app);
    adminAuth = getAuth(app);
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Create mock objects to prevent crashes
    adminDb = null as any;
    adminAuth = null as any;
}

export { adminDb, adminAuth };

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

        // Usuarios PRO - La app usa subscription: 'Pro' | 'Pro+' con verificación de fecha
        // Necesitamos contar usuarios con subscription activa y no expirada
        const now = new Date();
        const proSnapshot = await adminDb.collection('users')
            .where('subscription', 'in', ['Pro', 'Pro+'])
            .get();

        // Filtrar solo los que tienen suscripción vigente
        const proUsers = proSnapshot.docs.filter(doc => {
            const data = doc.data();
            const endDate = data.subscriptionEndDate?.toDate?.() ||
                (data.subscriptionEndDate ? new Date(data.subscriptionEndDate) : null);
            // Si no hay fecha de expiración o no ha expirado, es PRO activo
            return !endDate || endDate >= now;
        }).length;

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
            tokenFloat += doc.data().tokenBalance || 0;
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
 * Marca una orden como enviada y envía email al cliente
 */
export const markOrderShipped = async (
    orderId: string,
    trackingNumber: string,
    trackingCarrier: string
) => {
    try {
        // Get order and user data first
        const orderDoc = await adminDb.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            console.error('Order not found:', orderId);
            return false;
        }

        const orderData = orderDoc.data()!;
        const userId = orderData.userId;

        // Update order status
        await adminDb.collection('orders').doc(orderId).update({
            status: 'shipped',
            trackingNumber,
            trackingCarrier,
            shippedAt: new Date(),
        });

        // Send email notification
        try {
            if (userId) {
                const userDoc = await adminDb.collection('users').doc(userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data()!;
                    const userEmail = userData.email;
                    const userName = userData.alias || userData.displayName;

                    if (userEmail && process.env.RESEND_API_KEY) {
                        const { Resend } = await import('resend');
                        const resend = new Resend(process.env.RESEND_API_KEY);

                        // Carrier tracking URLs
                        const carrierUrls: { [key: string]: string } = {
                            'DHL': `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${trackingNumber}`,
                            'Estafeta': `https://rastreo3.estafeta.com/Seguimiento/EstafetaQ?type=R&referencia=${trackingNumber}`,
                            'FedEx': `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
                            'Correos de México': `https://www.correosdemexico.gob.mx/SSLServicios/SeguimientoEnvio/Seguimiento.aspx?guia=${trackingNumber}`,
                            'Paquetexpress': `https://www.paquetexpress.com.mx/rastreo?numero=${trackingNumber}`,
                        };
                        const trackingUrl = carrierUrls[trackingCarrier] || '#';
                        const productName = orderData.productName || orderData.product || 'Producto';

                        // Build HTML email
                        const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Tu pedido va en camino! - QRClima</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f0f4f8;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">📦 ¡Tu pedido va en camino!</h1>
                            <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">QRClima Store</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <div style="text-align: center; margin-bottom: 24px;"><span style="font-size: 56px;">🚚</span></div>
                            <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 22px; font-weight: 600; text-align: center;">
                                ¡Excelentes noticias${userName ? `, ${userName}` : ''}!
                            </h2>
                            <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6; text-align: center;">
                                Tu pedido ha sido enviado y pronto llegará a tu puerta.
                            </p>
                            <div style="background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border: 2px solid #c4b5fd; border-radius: 12px; padding: 24px; margin: 0 0 24px; text-align: center;">
                                <p style="margin: 0 0 8px; color: #7c3aed; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${trackingCarrier}</p>
                                <p style="margin: 0 0 16px; color: #5b21b6; font-size: 24px; font-weight: 700; letter-spacing: 2px; font-family: 'Courier New', monospace;">${trackingNumber}</p>
                                <a href="${trackingUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;">Rastrear Envío →</a>
                            </div>
                            <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px;">
                                <table style="width: 100%;">
                                    <tr>
                                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Pedido:</td>
                                        <td style="color: #1e293b; font-size: 13px; font-weight: 500; text-align: right;">#${orderId.slice(0, 12).toUpperCase()}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #64748b; font-size: 13px; padding: 4px 0;">Producto:</td>
                                        <td style="color: #1e293b; font-size: 13px; font-weight: 500; text-align: right;">${productName}</td>
                                    </tr>
                                </table>
                            </div>
                            <p style="margin: 24px 0 0; color: #94a3b8; font-size: 13px; text-align: center;">Tiempo estimado: <strong>2-5 días hábiles</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px;"><hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;"></td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 40px; text-align: center;">
                            <p style="margin: 0 0 8px; color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} QRClima by TESIVIL</p>
                            <p style="margin: 0; color: #cbd5e1; font-size: 11px;">¿Problemas con tu envío? Escríbenos a qrclima@tesivil.com</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

                        await resend.emails.send({
                            from: 'QRClima Store <noreply@tesivil.com>',
                            to: [userEmail],
                            subject: '📦 ¡Tu pedido va en camino! - QRClima',
                            html: htmlContent,
                        });

                        console.log(`📧 Shipped email sent to ${userEmail} for order ${orderId}`);
                    }
                }
            }
        } catch (emailError) {
            console.error('Error sending shipped notification email:', emailError);
            // Don't fail the entire operation if email fails
        }

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
