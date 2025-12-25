"use strict";
/**
 * QRclima Cloud Functions
 *
 * Funciones serverless para tareas automáticas:
 * 1. Expiración automática de suscripciones PRO
 * 2. Limpieza programada de datos
 * 3. Pagos con Stripe
 *
 * DEPLOYMENT:
 * firebase deploy --only functions
 */
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserRead = exports.forceExpireSubscription = exports.expireSubscriptions = exports.stripeWebhook = exports.createStripeCheckout = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Stripe configuration - Las claves se configuran con:
// firebase functions:config:set stripe.secret_key="sk_live_..."
const STRIPE_SECRET_KEY = ((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key) || '';
const STRIPE_WEBHOOK_SECRET = ((_b = functions.config().stripe) === null || _b === void 0 ? void 0 : _b.webhook_secret) || '';
// ============================================
// STRIPE: Crear sesión de Checkout
// ============================================
exports.createStripeCheckout = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onRequest(async (req, res) => {
    // CORS headers
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const { userId, email, priceId, planType } = req.body;
        if (!userId || !email || !priceId || !planType) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Importar Stripe dinámicamente
        const Stripe = require('stripe');
        const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
        // Determinar duración de suscripción
        const durationDays = planType === 'yearly' ? 365 : 30;
        // Crear sesión de checkout
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'mxn',
                        product_data: {
                            name: planType === 'yearly' ? 'QRclima Pro Anual' : 'QRclima Pro Mensual',
                            description: `Suscripción PRO por ${durationDays} días`,
                        },
                        unit_amount: planType === 'yearly' ? 99900 : 9900, // En centavos
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // Usar páginas que existan - el webhook activa la suscripción automáticamente
            success_url: 'https://checkout.stripe.com/success',
            cancel_url: 'https://checkout.stripe.com/cancel',
            customer_email: email,
            metadata: {
                userId,
                planType,
                durationDays: durationDays.toString(),
            },
        });
        console.log(`✅ Checkout session created: ${session.id} for user ${userId}`);
        res.status(200).json({
            sessionId: session.id,
            url: session.url,
        });
    }
    catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
// ============================================
// STRIPE: Webhook para confirmar pagos
// ============================================
exports.stripeWebhook = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onRequest(async (req, res) => {
    var _a, _b;
    if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }
    try {
        const Stripe = require('stripe');
        const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        // Manejar evento de pago exitoso
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
            const durationDays = parseInt(((_b = session.metadata) === null || _b === void 0 ? void 0 : _b.durationDays) || '30');
            if (userId) {
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + durationDays);
                await db.collection('users').doc(userId).update({
                    subscription: 'Pro',
                    subscriptionEndDate: admin.firestore.Timestamp.fromDate(endDate),
                    stripeSessionId: session.id,
                    stripePaymentAt: admin.firestore.Timestamp.now(),
                });
                console.log(`🎉 Subscription activated for ${userId}, expires: ${endDate}`);
            }
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Webhook handler failed');
    }
});
// ============================================
// SCHEDULED: Expirar suscripciones cada día
// Ejecuta todos los días a las 3:00 AM (hora de México)
// ============================================
exports.expireSubscriptions = functions
    .runWith({ timeoutSeconds: 300, memory: '256MB' })
    .pubsub
    .schedule('0 3 * * *')
    .timeZone('America/Mexico_City')
    .onRun(async (context) => {
    console.log('🔄 Iniciando limpieza de suscripciones expiradas...');
    const now = admin.firestore.Timestamp.now();
    let expiredCount = 0;
    let errorCount = 0;
    try {
        // Buscar usuarios con suscripción PRO y fecha de expiración pasada
        const expiredUsersSnapshot = await db
            .collection('users')
            .where('subscription', 'in', ['Pro', 'Pro+'])
            .where('subscriptionEndDate', '<', now)
            .get();
        console.log(`📋 Encontrados ${expiredUsersSnapshot.size} usuarios con suscripción expirada`);
        // Procesar en lotes (batches) para mejor rendimiento
        const batchSize = 500;
        let batch = db.batch();
        let operationsInBatch = 0;
        for (const doc of expiredUsersSnapshot.docs) {
            const userData = doc.data();
            console.log(`⏰ Expirando suscripción para: ${userData.email || doc.id}`);
            batch.update(doc.ref, {
                subscription: 'free',
                subscriptionEndDate: null,
                subscriptionExpiredAt: now, // Guardar registro de cuándo expiró
            });
            operationsInBatch++;
            expiredCount++;
            // Commit batch cada 500 operaciones (límite de Firestore)
            if (operationsInBatch >= batchSize) {
                await batch.commit();
                batch = db.batch();
                operationsInBatch = 0;
            }
        }
        // Commit cualquier operación restante
        if (operationsInBatch > 0) {
            await batch.commit();
        }
        console.log(`✅ Limpieza completada: ${expiredCount} suscripciones expiradas`);
    }
    catch (error) {
        console.error('❌ Error en limpieza de suscripciones:', error);
        errorCount++;
    }
    // Log resumen para monitoreo
    console.log(`📊 Resumen: ${expiredCount} expirados, ${errorCount} errores`);
    return null;
});
// ============================================
// HTTP: Endpoint manual para forzar expiración
// Útil para pruebas y debugging
// ============================================
exports.forceExpireSubscription = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado para ejecutar esta función');
    }
    const { userId } = data;
    if (!userId) {
        throw new functions.https.HttpsError('invalid-argument', 'userId es requerido');
    }
    try {
        // Solo permitir expirar tu propia cuenta o si eres admin
        const callerDoc = await db.collection('users').doc(context.auth.uid).get();
        const callerData = callerDoc.data();
        if (context.auth.uid !== userId && (callerData === null || callerData === void 0 ? void 0 : callerData.role) !== 'admin') {
            throw new functions.https.HttpsError('permission-denied', 'No tienes permiso para modificar este usuario');
        }
        // Expirar suscripción
        await db.collection('users').doc(userId).update({
            subscription: 'free',
            subscriptionEndDate: null,
            subscriptionExpiredAt: admin.firestore.Timestamp.now(),
        });
        console.log(`🔓 Suscripción expirada manualmente para: ${userId}`);
        return { success: true, message: 'Suscripción expirada correctamente' };
    }
    catch (error) {
        console.error('Error expirando suscripción:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// ============================================
// TRIGGER: Verificar expiración al leer perfil
// Se ejecuta cuando se lee un documento de usuario
// ============================================
exports.onUserRead = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    // Solo procesar si hay suscripción activa
    if (after.subscription === 'free')
        return null;
    // Verificar si la suscripción expiró
    if (after.subscriptionEndDate) {
        const endDate = after.subscriptionEndDate.toDate();
        const now = new Date();
        if (endDate < now && before.subscription !== 'free') {
            console.log(`🔄 Auto-expirando suscripción para ${context.params.userId}`);
            await change.after.ref.update({
                subscription: 'free',
                subscriptionEndDate: null,
                subscriptionExpiredAt: admin.firestore.Timestamp.now(),
            });
        }
    }
    return null;
});
//# sourceMappingURL=index.js.map