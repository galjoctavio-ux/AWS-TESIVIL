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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPasswordResetCode = exports.sendPasswordResetEmail = exports.verifyEmailToken = exports.sendVerificationEmail = exports.onUserRead = exports.forceExpireSubscription = exports.expireSubscriptions = exports.stripeWebhook = exports.createTokenPurchaseIntent = exports.createPaymentSheetParams = exports.createStripeCheckout = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// Stripe configuration - Las claves se configuran con:
// firebase functions:config:set stripe.secret_key="sk_live_..."
const STRIPE_SECRET_KEY = ((_a = functions.config().stripe) === null || _a === void 0 ? void 0 : _a.secret_key) || '';
const STRIPE_WEBHOOK_SECRET = ((_b = functions.config().stripe) === null || _b === void 0 ? void 0 : _b.webhook_secret) || '';
// Resend configuration - La clave se configura con:
// firebase functions:config:set resend.api_key="re_..."
const RESEND_API_KEY = ((_c = functions.config().resend) === null || _c === void 0 ? void 0 : _c.api_key) || '';
// Import email templates
const email_templates_1 = require("./email-templates");
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
// STRIPE: Crear parámetros para PaymentSheet nativo
// ============================================
exports.createPaymentSheetParams = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onCall(async (data, context) => {
    var _a, _b;
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado para realizar pagos');
    }
    const { amount, planType, userId } = data;
    if (!amount || !planType || !userId) {
        throw new functions.https.HttpsError('invalid-argument', 'Se requieren amount, planType y userId');
    }
    try {
        const Stripe = require('stripe');
        const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
        // Obtener email del usuario
        const userEmail = ((_a = context.auth.token) === null || _a === void 0 ? void 0 : _a.email) || '';
        // Crear o buscar customer
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        let customer;
        if (customers.data.length > 0) {
            customer = customers.data[0];
        }
        else {
            customer = await stripe.customers.create({
                email: userEmail,
                metadata: { firebaseUserId: userId }
            });
        }
        // Crear ephemeral key para el cliente móvil
        const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: '2023-10-16' });
        // Determinar duración de suscripción
        const durationDays = planType === 'yearly' ? 365 : 30;
        // Crear PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Ya viene en centavos
            currency: 'mxn',
            customer: customer.id,
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId,
                planType,
                durationDays: durationDays.toString(),
            }
        });
        console.log(`✅ PaymentIntent created: ${paymentIntent.id} for user ${userId}`);
        return {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
            publishableKey: ((_b = functions.config().stripe) === null || _b === void 0 ? void 0 : _b.publishable_key) || '',
        };
    }
    catch (error) {
        console.error('Error creating payment sheet params:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// ============================================
// STRIPE: Crear PaymentIntent para compra de tokens (micropagos)
// ============================================
exports.createTokenPurchaseIntent = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado para comprar tokens');
    }
    const { amount, userId, tokensAmount } = data;
    if (!amount || !userId || !tokensAmount) {
        throw new functions.https.HttpsError('invalid-argument', 'Se requieren amount, userId y tokensAmount');
    }
    try {
        const Stripe = require('stripe');
        const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
        const userEmail = ((_a = context.auth.token) === null || _a === void 0 ? void 0 : _a.email) || '';
        // Crear o buscar customer
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        let customer = customers.data.length > 0
            ? customers.data[0]
            : await stripe.customers.create({
                email: userEmail,
                metadata: { firebaseUserId: userId }
            });
        // Crear ephemeral key
        const ephemeralKey = await stripe.ephemeralKeys.create({ customer: customer.id }, { apiVersion: '2023-10-16' });
        // Crear PaymentIntent para compra de tokens
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'mxn',
            customer: customer.id,
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId,
                type: 'token_purchase',
                tokensAmount: tokensAmount.toString(),
            }
        });
        console.log(`✅ Token purchase PaymentIntent created: ${paymentIntent.id} for ${tokensAmount} tokens`);
        return {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        };
    }
    catch (error) {
        console.error('Error creating token purchase intent:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// ============================================
// STRIPE: Webhook para confirmar pagos
// ============================================
exports.stripeWebhook = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onRequest(async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
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
        // Manejar evento de pago exitoso (Checkout Session - flow antiguo)
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
        // Manejar PaymentIntent exitoso (PaymentSheet - flow nativo)
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const userId = (_c = paymentIntent.metadata) === null || _c === void 0 ? void 0 : _c.userId;
            const paymentType = (_d = paymentIntent.metadata) === null || _d === void 0 ? void 0 : _d.type;
            if (!userId) {
                console.log('No userId in metadata, skipping');
                res.status(200).json({ received: true });
                return;
            }
            // COMPRA DE TOKENS (micropagos)
            if (paymentType === 'token_purchase') {
                const tokensAmount = parseInt(((_e = paymentIntent.metadata) === null || _e === void 0 ? void 0 : _e.tokensAmount) || '0');
                if (tokensAmount > 0) {
                    // Incrementar balance de tokens
                    await db.collection('users').doc(userId).update({
                        tokenBalance: admin.firestore.FieldValue.increment(tokensAmount),
                    });
                    // Registrar transacción en el ledger
                    await db.collection('token_transactions').add({
                        userId,
                        type: 'token_purchase',
                        amount: tokensAmount,
                        description: `Compra de ${tokensAmount} tokens`,
                        referenceId: paymentIntent.id,
                        createdAt: admin.firestore.Timestamp.now(),
                    });
                    console.log(`🪙 [TokenPurchase] Added ${tokensAmount} tokens to user ${userId}`);
                }
            }
            // SUSCRIPCIÓN PRO
            else {
                const durationDays = parseInt(((_f = paymentIntent.metadata) === null || _f === void 0 ? void 0 : _f.durationDays) || '30');
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + durationDays);
                await db.collection('users').doc(userId).update({
                    subscription: 'Pro',
                    subscriptionEndDate: admin.firestore.Timestamp.fromDate(endDate),
                    stripePaymentIntentId: paymentIntent.id,
                    stripePaymentAt: admin.firestore.Timestamp.now(),
                });
                console.log(`🎉 [PaymentSheet] Subscription activated for ${userId}, expires: ${endDate}`);
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
// ============================================
// EMAIL: Enviar email de verificación con Resend
// ============================================
exports.sendVerificationEmail = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onCall(async (data, context) => {
    var _a;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado para enviar email de verificación');
    }
    const userId = context.auth.uid;
    const userEmail = (_a = context.auth.token) === null || _a === void 0 ? void 0 : _a.email;
    if (!userEmail) {
        throw new functions.https.HttpsError('failed-precondition', 'No se encontró email asociado a tu cuenta');
    }
    try {
        // Generar código de 6 dígitos
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Guardar código en Firestore con expiración de 15 minutos
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        await db.collection('email_verifications').doc(userId).set({
            code: verificationCode,
            email: userEmail,
            createdAt: admin.firestore.Timestamp.now(),
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
            attempts: 0,
        });
        // Enviar email con Resend
        const { Resend } = require('resend');
        const resend = new Resend(RESEND_API_KEY);
        const htmlContent = (0, email_templates_1.getVerificationEmailTemplate)(verificationCode);
        const { error } = await resend.emails.send({
            from: 'QRClima <noreply@tesivil.com>',
            to: [userEmail],
            subject: '🔐 Tu código de verificación - QRClima',
            html: htmlContent,
        });
        if (error) {
            console.error('Error sending email with Resend:', error);
            throw new functions.https.HttpsError('internal', 'Error al enviar email');
        }
        console.log(`✅ Verification email sent to ${userEmail}`);
        return { success: true, message: 'Email de verificación enviado' };
    }
    catch (error) {
        console.error('Error in sendVerificationEmail:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// ============================================
// EMAIL: Verificar código de email
// ============================================
exports.verifyEmailToken = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Debes estar autenticado');
    }
    const { code } = data;
    const userId = context.auth.uid;
    if (!code || typeof code !== 'string' || code.length !== 6) {
        throw new functions.https.HttpsError('invalid-argument', 'El código debe ser de 6 dígitos');
    }
    try {
        const verificationDoc = await db.collection('email_verifications').doc(userId).get();
        if (!verificationDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'No se encontró solicitud de verificación. Solicita un nuevo código.');
        }
        const verificationData = verificationDoc.data();
        // Verificar intentos (máximo 5)
        if (verificationData.attempts >= 5) {
            throw new functions.https.HttpsError('resource-exhausted', 'Demasiados intentos. Solicita un nuevo código.');
        }
        // Incrementar intentos
        await db.collection('email_verifications').doc(userId).update({
            attempts: admin.firestore.FieldValue.increment(1)
        });
        // Verificar expiración
        const expiresAt = verificationData.expiresAt.toDate();
        if (new Date() > expiresAt) {
            throw new functions.https.HttpsError('deadline-exceeded', 'El código ha expirado. Solicita uno nuevo.');
        }
        // Verificar código
        if (verificationData.code !== code) {
            throw new functions.https.HttpsError('invalid-argument', 'Código incorrecto');
        }
        // ¡Código correcto! Marcar email como verificado
        await db.collection('users').doc(userId).update({
            emailVerified: true,
            emailVerifiedAt: admin.firestore.Timestamp.now(),
        });
        // Limpiar documento de verificación
        await db.collection('email_verifications').doc(userId).delete();
        console.log(`✅ Email verified for user ${userId}`);
        return { success: true, message: 'Email verificado correctamente' };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error('Error in verifyEmailToken:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// ============================================
// EMAIL: Enviar email de recuperación de contraseña con Resend
// ============================================
exports.sendPasswordResetEmail = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onCall(async (data, context) => {
    const { email } = data;
    if (!email || typeof email !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Email es requerido');
    }
    try {
        // Usar Firebase Auth para buscar usuario (más confiable, normaliza emails)
        let userId;
        try {
            const userRecord = await admin.auth().getUserByEmail(email);
            userId = userRecord.uid;
        }
        catch (authError) {
            // Usuario no existe - no revelar esto por seguridad
            console.log(`Password reset requested for non-existent email: ${email}`);
            return { success: true, message: 'Si el email existe, recibirás un código' };
        }
        // Generar código de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Guardar código con expiración de 15 minutos
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        await db.collection('password_resets').doc(userId).set({
            code: resetCode,
            email: email.toLowerCase().trim(),
            createdAt: admin.firestore.Timestamp.now(),
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
            attempts: 0,
        });
        // Enviar email con Resend
        const { Resend } = require('resend');
        const resend = new Resend(RESEND_API_KEY);
        const htmlContent = (0, email_templates_1.getPasswordResetEmailTemplate)(resetCode);
        const { error } = await resend.emails.send({
            from: 'QRClima <noreply@tesivil.com>',
            to: [email],
            subject: '🔐 Recuperar contraseña - QRClima',
            html: htmlContent,
        });
        if (error) {
            console.error('Error sending password reset email:', error);
            throw new functions.https.HttpsError('internal', 'Error al enviar email');
        }
        console.log(`✅ Password reset email sent to ${email}`);
        return { success: true, message: 'Si el email existe, recibirás un código' };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error('Error in sendPasswordResetEmail:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// ============================================
// EMAIL: Verificar código y cambiar contraseña
// ============================================
exports.verifyPasswordResetCode = functions
    .runWith({ timeoutSeconds: 60 })
    .https
    .onCall(async (data, context) => {
    const { email, code, newPassword } = data;
    if (!email || typeof email !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Email es requerido');
    }
    if (!code || typeof code !== 'string' || code.length !== 6) {
        throw new functions.https.HttpsError('invalid-argument', 'El código debe ser de 6 dígitos');
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        throw new functions.https.HttpsError('invalid-argument', 'La contraseña debe tener al menos 6 caracteres');
    }
    try {
        // Normalizar email para búsqueda case-insensitive
        const normalizedEmail = email.toLowerCase().trim();
        // Buscar el documento de password_resets por email directamente
        const resetSnapshot = await db.collection('password_resets')
            .where('email', '==', normalizedEmail)
            .limit(1)
            .get();
        // También buscar sin normalizar por si el email original no estaba normalizado
        let resetDoc = resetSnapshot.empty ? null : resetSnapshot.docs[0];
        if (!resetDoc) {
            const resetSnapshotOriginal = await db.collection('password_resets')
                .where('email', '==', email)
                .limit(1)
                .get();
            resetDoc = resetSnapshotOriginal.empty ? null : resetSnapshotOriginal.docs[0];
        }
        if (!resetDoc) {
            throw new functions.https.HttpsError('not-found', 'No se encontró solicitud de recuperación. Solicita un nuevo código.');
        }
        const resetData = resetDoc.data();
        const userId = resetDoc.id; // El documento ID es el userId
        // Verificar intentos (máximo 5)
        if (resetData.attempts >= 5) {
            throw new functions.https.HttpsError('resource-exhausted', 'Demasiados intentos. Solicita un nuevo código.');
        }
        // Incrementar intentos
        await db.collection('password_resets').doc(userId).update({
            attempts: admin.firestore.FieldValue.increment(1)
        });
        // Verificar expiración
        const expiresAt = resetData.expiresAt.toDate();
        if (new Date() > expiresAt) {
            throw new functions.https.HttpsError('deadline-exceeded', 'El código ha expirado. Solicita uno nuevo.');
        }
        // Verificar código
        if (resetData.code !== code) {
            throw new functions.https.HttpsError('invalid-argument', 'Código incorrecto');
        }
        // ¡Código correcto! Actualizar contraseña en Firebase Auth
        await admin.auth().updateUser(userId, {
            password: newPassword
        });
        // Limpiar documento de reset
        await db.collection('password_resets').doc(userId).delete();
        console.log(`✅ Password reset successful for user ${userId}`);
        return { success: true, message: 'Contraseña actualizada correctamente' };
    }
    catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        console.error('Error in verifyPasswordResetCode:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
// ============================================
// NOTIFICACIONES
// ============================================
__exportStar(require("./notifications"), exports);
//# sourceMappingURL=index.js.map