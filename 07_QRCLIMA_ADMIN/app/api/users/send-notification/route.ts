import { NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Send push notification to a user via Firebase Cloud Messaging
 */
export async function POST(request: Request) {
    try {
        const { userId, title, body } = await request.json();

        if (!userId || !title || !body) {
            return NextResponse.json(
                { error: 'User ID, title, and body are required' },
                { status: 400 }
            );
        }

        if (!adminDb || !adminMessaging) {
            return NextResponse.json(
                { error: 'Firebase services not available' },
                { status: 500 }
            );
        }

        // Get user's FCM token
        const userDoc = await adminDb.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userData = userDoc.data();
        const fcmToken = userData?.fcmToken;

        if (!fcmToken) {
            return NextResponse.json(
                { error: 'Usuario sin token de notificaciones. Debe abrir la app y habilitar notificaciones.' },
                { status: 400 }
            );
        }

        // Check if token looks like an Expo token (old format)
        if (fcmToken.startsWith('ExponentPushToken[')) {
            return NextResponse.json(
                { error: 'Token desactualizado (Expo). El usuario debe cerrar y reabrir la app para actualizar su token.' },
                { status: 400 }
            );
        }

        // Send push notification via FCM
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                type: 'admin_notification',
                sentAt: new Date().toISOString(),
            },
            token: fcmToken,
            android: {
                priority: 'high' as const,
                notification: {
                    channelId: 'default',
                },
            },
        };

        await adminMessaging.send(message);

        // Log admin action
        await adminDb.collection('admin_logs').add({
            action: 'send_notification',
            userId,
            details: { title, body },
            adminId: 'system',
            timestamp: FieldValue.serverTimestamp(),
        });

        console.log(`🔔 Notification sent to user ${userId}: ${title}`);

        return NextResponse.json({
            success: true,
            message: 'Notification sent successfully'
        });
    } catch (error: any) {
        console.error('Error sending notification:', error);

        // Handle specific FCM errors
        if (error.code === 'messaging/registration-token-not-registered') {
            return NextResponse.json(
                { error: 'El token FCM ya no es válido. El usuario debe reiniciar la app.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to send notification: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
