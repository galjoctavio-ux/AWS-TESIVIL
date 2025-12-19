-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - Migration 006: Analytics & Monetization
-- Module: App Analytics + Monetization Tracking
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- APP ANALYTICS
-- General event tracking for insights
-- ───────────────────────────────────────────────────────────────
create table app_analytics (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null,         -- Event name
  target_id text,                   -- ID of model, news, project
  user_id uuid references profiles(id),
  metadata jsonb,                   -- { platform, version, source }
  created_at timestamptz default now()
);

-- Indexes for queries
create index idx_analytics_event on app_analytics(event_type, created_at desc);
create index idx_analytics_user on app_analytics(user_id, created_at desc);
create index idx_analytics_target on app_analytics(target_id, event_type);

-- ───────────────────────────────────────────────────────────────
-- CLICKS TABLE
-- Track external link clicks (for affiliate/ads)
-- ───────────────────────────────────────────────────────────────
create table clicks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id),
  target_type text not null,        -- 'model', 'news', 'project', 'ad'
  target_id text not null,
  destination_url text,
  created_at timestamptz default now()
);

create index idx_clicks_target on clicks(target_type, created_at desc);
create index idx_clicks_user on clicks(user_id, created_at desc);

-- ───────────────────────────────────────────────────────────────
-- EVENTS REFERENCE
-- ───────────────────────────────────────────────────────────────
comment on table app_analytics is '
EVENT TYPES:
- prompt_generated: User generated a prompt
- model_viewed: User opened model detail
- model_clicked: User clicked "Try" button (external)
- news_viewed: User opened news article
- project_viewed: User opened project detail
- project_clicked: User clicked "Visit/Download"
- ad_impression: Ad was displayed
- ad_clicked: User clicked ad
- review_created: User submitted review
- upvote: User upvoted content
';

-- ───────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────
alter table app_analytics enable row level security;
alter table clicks enable row level security;

-- Analytics: service role insert, admin read
create policy "Service role inserts analytics" on app_analytics for insert
  with check (true);  -- Allow from API
create policy "Admins read analytics" on app_analytics for select
  using (exists(
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Clicks: same as analytics
create policy "Anyone can register click" on clicks for insert with check (true);
create policy "Admins read clicks" on clicks for select
  using (exists(
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- ───────────────────────────────────────────────────────────────
-- AGGREGATE VIEWS (For Dashboard KPIs)
-- ───────────────────────────────────────────────────────────────

-- Daily Active Users
create or replace view daily_active_users as
select 
  date_trunc('day', created_at) as day,
  count(distinct user_id) as dau
from app_analytics
where user_id is not null
group by date_trunc('day', created_at)
order by day desc;

-- Event Counts by Type
create or replace view event_counts as
select 
  event_type,
  count(*) as total,
  count(distinct user_id) as unique_users,
  date_trunc('day', created_at) as day
from app_analytics
group by event_type, date_trunc('day', created_at)
order by day desc, total desc;

-- Top Clicked Models
create or replace view top_clicked_models as
select 
  target_id as model_id,
  count(*) as click_count,
  count(distinct user_id) as unique_users
from clicks
where target_type = 'model'
group by target_id
order by click_count desc
limit 20;

-- ───────────────────────────────────────────────────────────────
-- CLEANUP JOB (Retention: 90 days)
-- ───────────────────────────────────────────────────────────────
create or replace function cleanup_old_analytics()
returns void as $$
begin
  delete from app_analytics where created_at < now() - interval '90 days';
  delete from clicks where created_at < now() - interval '90 days';
end;
$$ language plpgsql;
