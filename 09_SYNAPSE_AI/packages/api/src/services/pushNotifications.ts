import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { supabaseAdmin } from '../lib/supabase';

// Create a new Expo SDK client
const expo = new Expo();

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface NotificationPayload {
    title: string;
    body: string;
    data?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════
// SEND SINGLE NOTIFICATION
// ═══════════════════════════════════════════════════════════════

export async function sendPushNotification(
    token: string,
    payload: NotificationPayload
): Promise<boolean> {
    if (!Expo.isExpoPushToken(token)) {
        console.warn(`[Push] Invalid Expo push token: ${token}`);
        return false;
    }

    const message: ExpoPushMessage = {
        to: token,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
    };

    try {
        const tickets = await expo.sendPushNotificationsAsync([message]);
        const ticket = tickets[0];

        if (ticket.status === 'ok') {
            console.log(`[Push] Notification sent successfully to ${token.slice(0, 20)}...`);
            return true;
        } else {
            console.error(`[Push] Failed to send notification:`, ticket);
            return false;
        }
    } catch (error) {
        console.error(`[Push] Error sending notification:`, error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// SEND BULK NOTIFICATIONS (for news broadcasts)
// ═══════════════════════════════════════════════════════════════

export async function sendBulkPushNotifications(
    tokens: string[],
    payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
    // Filter valid tokens
    const validTokens = tokens.filter(token => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
        console.log('[Push] No valid tokens to send to');
        return { sent: 0, failed: tokens.length };
    }

    const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        sound: 'default' as const,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
    }));

    // Chunk messages (Expo recommends <= 100 per request)
    const chunks = expo.chunkPushNotifications(messages);
    let sent = 0;
    let failed = 0;

    for (const chunk of chunks) {
        try {
            const tickets = await expo.sendPushNotificationsAsync(chunk);
            tickets.forEach((ticket: ExpoPushTicket) => {
                if (ticket.status === 'ok') {
                    sent++;
                } else {
                    failed++;
                }
            });
        } catch (error) {
            console.error(`[Push] Error sending chunk:`, error);
            failed += chunk.length;
        }
    }

    console.log(`[Push] Bulk notification result: ${sent} sent, ${failed} failed`);
    return { sent, failed };
}

// ═══════════════════════════════════════════════════════════════
// NOTIFY NEWS SUBSCRIBERS
// ═══════════════════════════════════════════════════════════════

export async function notifyNewsSubscribers(
    newsTitle: string,
    importance: number,
    articleId: string
): Promise<void> {
    try {
        // Determine which users to notify based on importance
        // importance >= 9 = breaking news -> notify 'breaking' and 'all' users
        // importance < 9 = regular news -> notify only 'all' users
        const levels = importance >= 9 ? ['breaking', 'all'] : ['all'];

        const { data: users, error } = await supabaseAdmin
            .from('profiles')
            .select('expo_push_token')
            .in('notifications_news_level', levels)
            .not('expo_push_token', 'is', null);

        if (error) {
            console.error('[Push] Error fetching users for news notification:', error);
            return;
        }

        if (!users || users.length === 0) {
            console.log('[Push] No users to notify for news');
            return;
        }

        const tokens = users.map(u => u.expo_push_token).filter(Boolean) as string[];
        const isBreaking = importance >= 9;

        await sendBulkPushNotifications(tokens, {
            title: isBreaking ? '🔴 Breaking News' : '📰 Nueva Noticia',
            body: newsTitle,
            data: {
                type: 'news',
                articleId,
                isBreaking,
            },
        });

        console.log(`[Push] Notified ${tokens.length} users about news: "${newsTitle.slice(0, 50)}..."`);
    } catch (error) {
        console.error('[Push] Error notifying news subscribers:', error);
    }
}

// ═══════════════════════════════════════════════════════════════
// NOTIFY PROJECT OWNER OF COMMENT
// ═══════════════════════════════════════════════════════════════

export async function notifyProjectOwner(
    projectId: string,
    commentContent: string,
    commenterAlias: string | null
): Promise<void> {
    try {
        // Get project owner
        const { data: project, error: projectError } = await supabaseAdmin
            .from('projects')
            .select('user_id, title')
            .eq('id', projectId)
            .single();

        if (projectError || !project || !project.user_id) {
            console.log('[Push] Project has no owner or not found');
            return;
        }

        // Get owner's push token and notification preference
        const { data: owner, error: ownerError } = await supabaseAdmin
            .from('profiles')
            .select('expo_push_token, notifications_comments_enabled')
            .eq('id', project.user_id)
            .single();

        if (ownerError || !owner) {
            console.log('[Push] Project owner not found');
            return;
        }

        if (!owner.notifications_comments_enabled || !owner.expo_push_token) {
            console.log('[Push] Owner has comments notifications disabled or no push token');
            return;
        }

        // Send notification
        const commenter = commenterAlias || 'Alguien';
        const preview = commentContent.length > 50
            ? commentContent.slice(0, 47) + '...'
            : commentContent;

        await sendPushNotification(owner.expo_push_token, {
            title: `💬 Nuevo comentario en "${project.title}"`,
            body: `${commenter}: ${preview}`,
            data: {
                type: 'comment',
                projectId,
            },
        });

        console.log(`[Push] Notified project owner about comment on "${project.title}"`);
    } catch (error) {
        console.error('[Push] Error notifying project owner:', error);
    }
}
