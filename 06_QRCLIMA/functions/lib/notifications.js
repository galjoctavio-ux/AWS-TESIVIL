"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMaintenanceReminders = exports.onOrderStatusChange = exports.onSolutionAccepted = exports.onSOSReply = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
const fcm = admin.messaging();
/**
 * Helper to send a push notification to a user
 */
const sendPushNotification = async (userId, title, body, data) => {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists)
            return;
        const userData = userDoc.data();
        const fcmToken = userData === null || userData === void 0 ? void 0 : userData.fcmToken;
        if (!fcmToken) {
            console.log(`🔕 User ${userId} has no FCM token`);
            return;
        }
        // Check quiet hours (simple server-side check based on Mexico City time)
        // Note: Ideally client handles this, but server can optimize by not sending
        const now = new Date().toLocaleString('en-US', { timeZone: 'America/Mexico_City' });
        const hour = new Date(now).getHours();
        // Quiet hours: 10PM (22) to 8AM (8)
        if (hour >= 22 || hour < 8) {
            // For critical notifications we might still send them, but for now we respect quiet hours
            // Actually, for immediate triggers (replies), we might want to send them and let the client suppress logic handle it
            // but to save resources/money on FCM, skipping here is an option.
            // However, our task specified client-side logic. We'll send it and let client suppress.
        }
        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            token: fcmToken,
            android: {
                priority: 'high',
                notification: {
                    channelId: 'default',
                },
            },
        };
        await fcm.send(message);
        console.log(`🚀 Notification sent to ${userId}: ${title}`);
    }
    catch (error) {
        console.error(`Error sending notification to ${userId}:`, error);
    }
};
/**
 * 1. TRIGGER: New Reply on SOS Thread
 * Notifies the thread author when someone comments
 */
exports.onSOSReply = functions.firestore
    .document('sos_threads/{threadId}/comments/{commentId}')
    .onCreate(async (snap, context) => {
    var _a;
    const comment = snap.data();
    const threadId = context.params.threadId;
    try {
        // Get thread details to find author
        const threadDoc = await db.collection('sos_threads').doc(threadId).get();
        if (!threadDoc.exists)
            return;
        const thread = threadDoc.data();
        const threadAuthorId = thread === null || thread === void 0 ? void 0 : thread.author_id;
        // Don't notify if author commented on their own thread
        if (threadAuthorId === comment.author_id)
            return;
        // Check author preferences (optional optimization)
        const authorDoc = await db.collection('users').doc(threadAuthorId).get();
        const preferences = (_a = authorDoc.data()) === null || _a === void 0 ? void 0 : _a.notificationPreferences;
        if (preferences && preferences.sosReplies === false) {
            console.log(`🔕 User ${threadAuthorId} opted out of SOS notifications`);
            return;
        }
        await sendPushNotification(threadAuthorId, '💬 Nueva respuesta a tu pregunta', `${comment.author_alias || 'Alguien'} respondió en tu hilo: ${(thread === null || thread === void 0 ? void 0 : thread.title) || 'SOS'}`, { type: 'sos_reply', threadId });
    }
    catch (error) {
        console.error('Error in onSOSReply:', error);
    }
});
/**
 * 2. TRIGGER: Solution Accepted
 * Notifies the user who provided the solution
 */
exports.onSolutionAccepted = functions.firestore
    .document('sos_threads/{threadId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // Check if solution_accepted_comment_id was just set
    if (!before.solution_accepted_comment_id && after.solution_accepted_comment_id) {
        const commentId = after.solution_accepted_comment_id;
        const threadId = context.params.threadId;
        try {
            // Get the winning comment to find the author
            const commentDoc = await db.collection('sos_threads').doc(threadId).collection('comments').doc(commentId).get();
            if (!commentDoc.exists)
                return;
            const comment = commentDoc.data();
            const solverId = comment === null || comment === void 0 ? void 0 : comment.author_id;
            if (!solverId)
                return;
            await sendPushNotification(solverId, '🎉 ¡Tu solución fue aceptada!', `Tu respuesta ayudó a resolver un problema. ¡Ganaste Tokens!`, { type: 'sos_reply', threadId });
        }
        catch (error) {
            console.error('Error in onSolutionAccepted:', error);
        }
    }
});
/**
 * 3. TRIGGER: Order Status Change
 * Notifies user when their store order updates
 */
exports.onOrderStatusChange = functions.firestore
    .document('logistics_orders/{orderId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // Only notify if status changed
    if (before.status === after.status)
        return;
    const userId = after.user_id;
    const orderId = context.params.orderId;
    const newStatus = after.status;
    // Map status to messages
    let title = '';
    let body = '';
    if (newStatus === 'paid') {
        title = '📦 Pedido Confirmado';
        body = `Tu pedido #${orderId.slice(0, 8)} está siendo procesado.`;
    }
    else if (newStatus === 'shipped') {
        title = '🚚 ¡Tu pedido va en camino!';
        body = `Rastreo: ${after.tracking_number || 'Pendiente'}. Paquetería: ${after.carrier || ''}`;
    }
    else if (newStatus === 'delivered') {
        title = '✅ Pedido Entregado';
        body = 'Esperamos que disfrutes tu compra.';
    }
    else {
        return; // Don't notify for other status changes
    }
    await sendPushNotification(userId, title, body, { type: 'order_status', orderId });
});
/**
 * 4. SCHEDULED: Maintenance Reminders (PRO Only)
 * Runs daily at 9:00 AM Mexico City time
 * Checks for services where next_service_date is 7 days from now
 */
exports.sendMaintenanceReminders = functions.pubsub
    .schedule('0 9 * * *')
    .timeZone('America/Mexico_City')
    .onRun(async () => {
    var _a, _b;
    console.log('🔄 Running maintenance reminders check...');
    try {
        const now = new Date();
        const targetDate = new Date();
        targetDate.setDate(now.getDate() + 7); // 7 days from now
        // Format dates for query specific to how they are stored.
        // Assuming next_service_date is a Timestamp or ISO string YYYY-MM-DD
        // If it's a timestamp, we need a range for the whole day.
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        const startTimestamp = admin.firestore.Timestamp.fromDate(startOfDay);
        const endTimestamp = admin.firestore.Timestamp.fromDate(endOfDay);
        // Query services due in 7 days
        const snapshot = await db.collection('services')
            .where('next_service_date', '>=', startTimestamp)
            .where('next_service_date', '<=', endTimestamp)
            .get();
        if (snapshot.empty) {
            console.log('No maintenance services found for date:', startOfDay.toISOString());
            return;
        }
        console.log(`Found ${snapshot.size} services due for maintenance in 7 days.`);
        // Process each service
        for (const doc of snapshot.docs) {
            const service = doc.data();
            const userId = service.user_id;
            // Skip if we already checked this user in this batch (optimization?)
            // Actually, we might want to notify about multiple equipments, but maybe group them?
            // For simplicity, let's process each.
            // GET USER to check preferences (no longer checking PRO - all reminders work)
            const userDoc = await db.collection('users').doc(userId).get();
            const userData = userDoc.data();
            if (!userData)
                continue;
            // NOTE: PRO restriction removed - all scheduled reminders now send notifications
            // PRO is only required to CREATE the reminder, not to receive it
            // Check Preferences
            if (((_a = userData.notificationPreferences) === null || _a === void 0 ? void 0 : _a.maintenanceReminders) === false) {
                continue;
            }
            // Get Client Name
            let clientName = 'Cliente';
            if (service.client_id) {
                const clientDoc = await db.collection('contacts').doc(service.client_id).get();
                if (clientDoc.exists) {
                    clientName = ((_b = clientDoc.data()) === null || _b === void 0 ? void 0 : _b.name) || 'Cliente';
                }
            }
            // Get Equipment Info if needed
            // service.equipment_id has the equipment details
            // Send Notification - message suggests contacting the client
            await sendPushNotification(userId, '📅 Recordatorio de Mantenimiento', `Contacta a ${clientName} para programar su próximo servicio.`, { type: 'maintenance_reminder', serviceId: doc.id, clientId: service.client_id });
        }
    }
    catch (error) {
        console.error('Error in sendMaintenanceReminders:', error);
    }
});
//# sourceMappingURL=notifications.js.map