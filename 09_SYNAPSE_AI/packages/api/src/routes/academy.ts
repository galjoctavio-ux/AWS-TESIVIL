import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase';
import { createCheckoutSession, constructWebhookEvent, retrieveCheckoutSession } from '../services/stripe';

// ═══════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════
const WaitlistSchema = z.object({
    contactType: z.enum(['email', 'whatsapp']),
    contactValue: z.string().min(5),
    source: z.enum(['engine_banner', 'showcase_card', 'direct', 'qrclima_profile']).default('direct'),
});

const CheckoutSchema = z.object({
    sessionSlug: z.string(),
    email: z.string().email(),
    whatsapp: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════
const academyRoutes: FastifyPluginAsync = async (fastify) => {

    // ─────────────────────────────────────────────────────────────
    // POST /api/academy/waitlist
    // Registrar lead anónimo (solo WhatsApp o email, SIN cuenta)
    // ─────────────────────────────────────────────────────────────
    fastify.post('/waitlist', async (request, reply) => {
        const body = WaitlistSchema.parse(request.body);

        // Validar formato según tipo
        if (body.contactType === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.contactValue)) {
                return reply.status(400).send({ error: 'Email inválido' });
            }
        } else if (body.contactType === 'whatsapp') {
            // Limpiar y validar WhatsApp (mínimo 10 dígitos)
            const cleaned = body.contactValue.replace(/\D/g, '');
            if (cleaned.length < 10) {
                return reply.status(400).send({ error: 'Número de WhatsApp inválido' });
            }
        }

        const { data, error } = await supabaseAdmin
            .from('academy_waitlist')
            .upsert({
                contact_type: body.contactType,
                contact_value: body.contactValue.toLowerCase().trim(),
                source: body.source,
            }, { onConflict: 'contact_value' })
            .select()
            .single();

        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Error al registrar' });
        }

        // Track en analytics
        await supabaseAdmin.from('academy_analytics').insert({
            event_type: 'waitlist_join',
            contact_value: body.contactValue,
            metadata: { source: body.source, type: body.contactType },
        });

        return {
            success: true,
            message: '¡Te has unido a la lista de espera! Te avisaremos cuando abramos inscripciones.',
        };
    });

    // ─────────────────────────────────────────────────────────────
    // GET /api/academy/sessions
    // Listar sesiones/productos disponibles
    // ─────────────────────────────────────────────────────────────
    fastify.get('/sessions', async (request, reply) => {
        const { data, error } = await supabaseAdmin
            .from('academy_sessions')
            .select(`
        id, 
        slug, 
        title, 
        description, 
        session_type, 
        price_mxn, 
        price_usd, 
        duration_minutes,
        scheduled_at, 
        is_active,
        requires_previous_session
      `)
            .eq('is_active', true)
            .order('price_mxn', { ascending: true });

        if (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Error al obtener sesiones' });
        }

        return data;
    });

    // ─────────────────────────────────────────────────────────────
    // POST /api/academy/checkout
    // Crear sesión de Stripe Checkout
    // ─────────────────────────────────────────────────────────────
    fastify.post('/checkout', async (request, reply) => {
        const body = CheckoutSchema.parse(request.body);

        // Obtener datos de la sesión
        const { data: session, error: sessionError } = await supabaseAdmin
            .from('academy_sessions')
            .select('id, title, price_mxn, requires_previous_session')
            .eq('slug', body.sessionSlug)
            .eq('is_active', true)
            .single();

        if (sessionError || !session) {
            return reply.status(404).send({ error: 'Sesión no encontrada' });
        }

        // Verificar si requiere sesión previa (para el curso intensivo)
        if (session.requires_previous_session) {
            const { data: previousPayment } = await supabaseAdmin
                .from('academy_payments')
                .select('id')
                .eq('email', body.email)
                .eq('session_id', session.requires_previous_session)
                .eq('payment_status', 'confirmed')
                .single();

            if (!previousPayment) {
                return reply.status(403).send({
                    error: 'Primero debes completar la masterclass introductoria',
                    code: 'REQUIRES_PREVIOUS_SESSION',
                });
            }
        }

        // Verificar si ya pagó esta sesión
        const { data: existingPayment } = await supabaseAdmin
            .from('academy_payments')
            .select('id, payment_status')
            .eq('email', body.email)
            .eq('session_id', session.id)
            .single();

        if (existingPayment?.payment_status === 'confirmed') {
            return reply.status(400).send({
                error: 'Ya tienes acceso a esta sesión',
                code: 'ALREADY_PAID',
            });
        }

        // Buscar si está en waitlist
        const { data: waitlistEntry } = await supabaseAdmin
            .from('academy_waitlist')
            .select('id')
            .eq('contact_value', body.email)
            .single();

        // Obtener URLs base desde headers o env
        const baseUrl = process.env.APP_URL || 'https://synapse.app';

        try {
            const { checkoutUrl, checkoutSessionId } = await createCheckoutSession({
                sessionId: session.id,
                sessionTitle: session.title,
                priceMxn: session.price_mxn,
                email: body.email,
                whatsapp: body.whatsapp,
                waitlistId: waitlistEntry?.id,
                successUrl: `${baseUrl}/academy/success`,
                cancelUrl: `${baseUrl}/academy`,
            });

            // Crear registro de pago pendiente
            await supabaseAdmin.from('academy_payments').upsert({
                email: body.email,
                whatsapp: body.whatsapp,
                session_id: session.id,
                waitlist_id: waitlistEntry?.id,
                stripe_checkout_session_id: checkoutSessionId,
                payment_status: 'pending',
                amount_paid: session.price_mxn,
                currency: 'MXN',
            }, { onConflict: 'email,session_id' });

            // Track analytics
            await supabaseAdmin.from('academy_analytics').insert({
                event_type: 'checkout_started',
                contact_value: body.email,
                session_id: session.id,
                metadata: { sessionSlug: body.sessionSlug },
            });

            return { checkoutUrl };
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Error al crear checkout' });
        }
    });

    // ─────────────────────────────────────────────────────────────
    // POST /api/academy/webhook
    // Webhook de Stripe para confirmar pagos
    // ─────────────────────────────────────────────────────────────
    fastify.post('/webhook', {
        config: {
            rawBody: true, // Necesario para verificar firma de Stripe
        },
    }, async (request, reply) => {
        const signature = request.headers['stripe-signature'] as string;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            return reply.status(400).send({ error: 'Missing signature' });
        }

        let event;
        try {
            event = constructWebhookEvent(
                (request as any).rawBody,
                signature,
                webhookSecret
            );
        } catch (err: any) {
            fastify.log.error(`Webhook signature verification failed: ${err.message}`);
            return reply.status(400).send({ error: 'Invalid signature' });
        }

        // Manejar eventos
        switch (event.type) {
            case 'checkout.session.completed': {
                const checkoutSession = event.data.object as any;

                // Actualizar pago a confirmado
                const { error } = await supabaseAdmin
                    .from('academy_payments')
                    .update({
                        payment_status: 'confirmed',
                        stripe_payment_intent_id: checkoutSession.payment_intent,
                        stripe_customer_id: checkoutSession.customer,
                        confirmed_at: new Date().toISOString(),
                    })
                    .eq('stripe_checkout_session_id', checkoutSession.id);

                if (error) {
                    fastify.log.error({ err: error }, 'Error updating payment');
                }

                // Track analytics
                await supabaseAdmin.from('academy_analytics').insert({
                    event_type: 'payment_confirmed',
                    contact_value: checkoutSession.customer_email,
                    session_id: checkoutSession.metadata?.academy_session_id,
                    metadata: {
                        amount: checkoutSession.amount_total / 100,
                        currency: checkoutSession.currency,
                    },
                });

                fastify.log.info(`Payment confirmed for ${checkoutSession.customer_email}`);
                break;
            }

            case 'checkout.session.expired': {
                const expiredSession = event.data.object as any;
                await supabaseAdmin
                    .from('academy_payments')
                    .update({ payment_status: 'failed' })
                    .eq('stripe_checkout_session_id', expiredSession.id);
                break;
            }

            default:
                fastify.log.info(`Unhandled event type: ${event.type}`);
        }

        return { received: true };
    });

    // ─────────────────────────────────────────────────────────────
    // GET /api/academy/session/:slug/access
    // Obtener URL de sesión en vivo (con validación de pago y tiempo)
    // ─────────────────────────────────────────────────────────────
    fastify.get<{ Params: { slug: string }, Querystring: { email: string } }>(
        '/session/:slug/access',
        async (request, reply) => {
            const { slug } = request.params;
            const { email } = request.query;

            if (!email) {
                return reply.status(400).send({ error: 'Email requerido' });
            }

            // Obtener sesión
            const { data: session, error: sessionError } = await supabaseAdmin
                .from('academy_sessions')
                .select('id, meeting_url, scheduled_at, access_window_minutes, title')
                .eq('slug', slug)
                .single();

            if (sessionError || !session) {
                return reply.status(404).send({ error: 'Sesión no encontrada' });
            }

            // Verificar pago confirmado
            const { data: payment } = await supabaseAdmin
                .from('academy_payments')
                .select('payment_status')
                .eq('email', email)
                .eq('session_id', session.id)
                .eq('payment_status', 'confirmed')
                .single();

            if (!payment) {
                return reply.status(403).send({
                    error: 'Acceso denegado',
                    reason: 'payment_not_confirmed',
                });
            }

            // Si no hay fecha programada, dar acceso directo (contenido grabado)
            if (!session.scheduled_at) {
                // Track access
                await supabaseAdmin.from('academy_analytics').insert({
                    event_type: 'session_accessed',
                    contact_value: email,
                    session_id: session.id,
                });

                return {
                    hasAccess: true,
                    meetingUrl: session.meeting_url,
                    title: session.title,
                };
            }

            // Validar ventana de tiempo para sesiones en vivo
            const now = new Date();
            const sessionStart = new Date(session.scheduled_at);
            const accessWindowMs = (session.access_window_minutes || 5) * 60 * 1000;
            const accessOpensAt = new Date(sessionStart.getTime() - accessWindowMs);
            const sessionEndEstimate = new Date(sessionStart.getTime() + 4 * 60 * 60 * 1000); // 4h después

            if (now < accessOpensAt) {
                return reply.status(403).send({
                    error: 'Sesión aún no disponible',
                    reason: 'too_early',
                    opensAt: accessOpensAt.toISOString(),
                    startsAt: session.scheduled_at,
                });
            }

            if (now > sessionEndEstimate) {
                return reply.status(403).send({
                    error: 'La sesión ha terminado',
                    reason: 'session_ended',
                });
            }

            // Track access
            await supabaseAdmin.from('academy_analytics').insert({
                event_type: 'session_accessed',
                contact_value: email,
                session_id: session.id,
            });

            return {
                hasAccess: true,
                meetingUrl: session.meeting_url,
                startsAt: session.scheduled_at,
                title: session.title,
            };
        }
    );

    // ─────────────────────────────────────────────────────────────
    // GET /api/academy/payment/status
    // Verificar estado de pago por email y sesión
    // ─────────────────────────────────────────────────────────────
    fastify.get<{ Querystring: { email: string, sessionSlug: string } }>(
        '/payment/status',
        async (request, reply) => {
            const { email, sessionSlug } = request.query;

            if (!email || !sessionSlug) {
                return reply.status(400).send({ error: 'Email y sessionSlug requeridos' });
            }

            // Obtener ID de sesión
            const { data: session } = await supabaseAdmin
                .from('academy_sessions')
                .select('id')
                .eq('slug', sessionSlug)
                .single();

            if (!session) {
                return reply.status(404).send({ error: 'Sesión no encontrada' });
            }

            const { data: payment } = await supabaseAdmin
                .from('academy_payments')
                .select('payment_status, confirmed_at')
                .eq('email', email)
                .eq('session_id', session.id)
                .single();

            if (!payment) {
                return { hasPaid: false, status: null };
            }

            return {
                hasPaid: payment.payment_status === 'confirmed',
                status: payment.payment_status,
                confirmedAt: payment.confirmed_at,
            };
        }
    );

    // ─────────────────────────────────────────────────────────────
    // GET /api/academy/stats
    // Estadísticas del embudo (para Admin)
    // ─────────────────────────────────────────────────────────────
    fastify.get('/stats', async (request, reply) => {
        // Obtener IDs de sesiones
        const { data: sessions } = await supabaseAdmin
            .from('academy_sessions')
            .select('id, slug, session_type');

        const tripwireSession = sessions?.find(s => s.session_type === 'tripwire');
        const intensiveSession = sessions?.find(s => s.session_type === 'intensive');

        const [waitlistResult, tripwireResult, intensiveResult] = await Promise.all([
            supabaseAdmin.from('academy_waitlist').select('id', { count: 'exact', head: true }),
            tripwireSession
                ? supabaseAdmin.from('academy_payments')
                    .select('id', { count: 'exact', head: true })
                    .eq('session_id', tripwireSession.id)
                    .eq('payment_status', 'confirmed')
                : { count: 0 },
            intensiveSession
                ? supabaseAdmin.from('academy_payments')
                    .select('id', { count: 'exact', head: true })
                    .eq('session_id', intensiveSession.id)
                    .eq('payment_status', 'confirmed')
                : { count: 0 },
        ]);

        const waitlist = waitlistResult.count || 0;
        const tripwire = tripwireResult.count || 0;
        const intensive = intensiveResult.count || 0;

        return {
            waitlist,
            tripwire,
            intensive,
            conversionWaitlistToTripwire: waitlist > 0 ? ((tripwire / waitlist) * 100).toFixed(1) + '%' : '0%',
            conversionTripwireToIntensive: tripwire > 0 ? ((intensive / tripwire) * 100).toFixed(1) + '%' : '0%',
        };
    });
};

export default academyRoutes;
