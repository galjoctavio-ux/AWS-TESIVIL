-- ═══════════════════════════════════════════════════════════════
-- Migration: 008_academy_waitlist.sql
-- Módulo de Academia "El Método de las 30 Horas"
-- Fecha: 2025-12-20
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- TABLA: academy_waitlist
-- Leads anónimos (sin cuenta) - solo WhatsApp O correo
-- ═══════════════════════════════════════════════════════════════
create table if not exists academy_waitlist (
  id uuid primary key default uuid_generate_v4(),
  contact_type text not null check (contact_type in ('email', 'whatsapp')),
  contact_value text not null,           -- Email o número de WhatsApp
  source text not null default 'direct', -- 'engine_banner', 'showcase_card', 'direct'
  referrer_code text,                    -- Para afiliados futuros
  invited_at timestamptz,                -- Cuándo se envió invitación
  created_at timestamptz default now(),
  
  constraint unique_contact unique(contact_value)
);

create index idx_waitlist_source on academy_waitlist(source);
create index idx_waitlist_created on academy_waitlist(created_at desc);
create index idx_waitlist_contact_type on academy_waitlist(contact_type);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: academy_sessions
-- Productos/sesiones: Tripwire ($20) e Intensivo ($1500-2000)
-- ═══════════════════════════════════════════════════════════════
create table if not exists academy_sessions (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,               -- 'masterclass-intro', 'intensivo-3-dias'
  title text not null,
  description text,
  session_type text not null check (session_type in ('tripwire', 'intensive', 'addon')),
  price_mxn decimal not null default 0,
  price_usd decimal,
  stripe_price_id text,                    -- Stripe Price ID para checkout
  duration_minutes integer,
  scheduled_at timestamptz,                -- Fecha/hora de sesión en vivo
  access_window_minutes integer default 5, -- Minutos antes de habilitar acceso
  meeting_url text,                        -- URL de Zoom/Meet (oculta hasta pago)
  is_active boolean default true,
  max_attendees integer,
  requires_previous_session uuid references academy_sessions(id), -- Para el intensivo
  created_at timestamptz default now()
);

-- Insertar sesiones iniciales
insert into academy_sessions (slug, title, description, session_type, price_mxn, price_usd, duration_minutes)
values 
  ('masterclass-intro', 'Masterclass Introductoria', 'Conoce el método y decide si el intensivo es para ti. 30 minutos de contenido de alto valor.', 'tripwire', 20, 1, 30),
  ('intensivo-3-dias', 'Capacitación Intensiva 3 Días', 'El flujo completo: Idea → Plan Maestro → DB → Frontend → Deploy. Aprende a construir apps con IA.', 'intensive', 1500, 90, 480)
on conflict (slug) do nothing;

-- Actualizar la referencia del intensivo
update academy_sessions 
set requires_previous_session = (select id from academy_sessions where slug = 'masterclass-intro')
where slug = 'intensivo-3-dias';

-- ═══════════════════════════════════════════════════════════════
-- TABLA: academy_payments
-- Tracking de pagos con Stripe
-- ═══════════════════════════════════════════════════════════════
create table if not exists academy_payments (
  id uuid primary key default uuid_generate_v4(),
  waitlist_id uuid references academy_waitlist(id) on delete set null,
  user_id uuid references profiles(id) on delete set null, -- Se llena cuando crean cuenta
  session_id uuid references academy_sessions(id) on delete cascade not null,
  email text not null,
  whatsapp text,
  
  -- Stripe
  stripe_customer_id text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  
  -- Status
  payment_status text not null default 'pending' 
    check (payment_status in ('pending', 'processing', 'confirmed', 'refunded', 'failed')),
  amount_paid decimal,
  currency text default 'MXN',
  
  -- Timestamps
  confirmed_at timestamptz,
  created_at timestamptz default now(),
  
  constraint unique_payment unique(email, session_id)
);

create index idx_payments_email on academy_payments(email);
create index idx_payments_status on academy_payments(payment_status);
create index idx_payments_stripe_session on academy_payments(stripe_checkout_session_id);

-- ═══════════════════════════════════════════════════════════════
-- TABLA: academy_analytics
-- Eventos del embudo para métricas de conversión
-- ═══════════════════════════════════════════════════════════════
create table if not exists academy_analytics (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,  -- 'waitlist_join', 'checkout_started', 'payment_confirmed', 'session_accessed'
  contact_value text,        -- Email o WhatsApp del lead
  session_id uuid references academy_sessions(id),
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_academy_analytics_event on academy_analytics(event_type, created_at desc);

-- ═══════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════
alter table academy_waitlist enable row level security;
alter table academy_sessions enable row level security;
alter table academy_payments enable row level security;
alter table academy_analytics enable row level security;

-- Waitlist: inserción pública, lectura solo service role
create policy "Anyone can join waitlist"
  on academy_waitlist for insert
  with check (true);

create policy "Service role reads waitlist"
  on academy_waitlist for select
  using (auth.role() = 'service_role');

-- Sessions: lectura pública de sesiones activas
create policy "Anyone can view active sessions"
  on academy_sessions for select
  using (is_active = true);

create policy "Service role manages sessions"
  on academy_sessions for all
  using (auth.role() = 'service_role');

-- Payments: solo service role (Stripe webhooks)
create policy "Service role manages payments"
  on academy_payments for all
  using (auth.role() = 'service_role');

-- Analytics: solo service role
create policy "Service role manages analytics"
  on academy_analytics for all
  using (auth.role() = 'service_role');
