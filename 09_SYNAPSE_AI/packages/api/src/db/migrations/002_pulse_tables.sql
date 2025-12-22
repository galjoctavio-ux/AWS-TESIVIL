-- ═══════════════════════════════════════════════════════════════
-- PULSE MODULE - DATABASE MIGRATIONS
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- 1. AI Stats Table (aggregated model statistics)
create table if not exists ai_stats (
  model_id text primary key references ai_models(id) on delete cascade,
  benchmark_score decimal,
  community_score decimal,
  avg_speed decimal,
  avg_precision decimal,
  avg_hallucination decimal,
  reviews_count int default 0,
  tokens_per_second int,
  updated_at timestamptz default now()
);

-- 2. AI Votes Table (review voting system)
create table if not exists ai_votes (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references model_reviews(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  vote_type text check (vote_type in ('upvote', 'downvote')),
  created_at timestamptz default now(),
  unique(review_id, user_id)
);

-- 3. AI Ranking History (weekly trends)
create table if not exists ai_ranking_history (
  id uuid primary key default uuid_generate_v4(),
  model_id text references ai_models(id) on delete cascade,
  week_number int not null,
  year int not null default extract(year from now()),
  ranking_position int not null,
  score_snapshot decimal,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

create index if not exists idx_ai_votes_review on ai_votes(review_id);
create index if not exists idx_ai_votes_user on ai_votes(user_id);
create index if not exists idx_ai_ranking_history_model on ai_ranking_history(model_id, week_number desc);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

-- ai_stats: public read
alter table ai_stats enable row level security;

drop policy if exists "Anyone can view stats" on ai_stats;
create policy "Anyone can view stats"
  on ai_stats for select
  using (true);

drop policy if exists "Service role updates stats" on ai_stats;
create policy "Service role updates stats"
  on ai_stats for all
  using (auth.role() = 'service_role');

-- ai_votes: read all, write own
alter table ai_votes enable row level security;

drop policy if exists "Anyone can view votes" on ai_votes;
create policy "Anyone can view votes"
  on ai_votes for select
  using (true);

drop policy if exists "Users can create votes" on ai_votes;
create policy "Users can create votes"
  on ai_votes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own votes" on ai_votes;
create policy "Users can update own votes"
  on ai_votes for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete own votes" on ai_votes;
create policy "Users can delete own votes"
  on ai_votes for delete
  using (auth.uid() = user_id);

-- ai_ranking_history: public read
alter table ai_ranking_history enable row level security;

drop policy if exists "Anyone can view ranking history" on ai_ranking_history;
create policy "Anyone can view ranking history"
  on ai_ranking_history for select
  using (true);

drop policy if exists "Service role manages history" on ai_ranking_history;
create policy "Service role manages history"
  on ai_ranking_history for all
  using (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- TRIGGER: Update review helpful count when votes change
-- ═══════════════════════════════════════════════════════════════

create or replace function update_review_helpful_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    update model_reviews
    set is_helpful_count = (
      select count(*) filter (where vote_type = 'upvote') - count(*) filter (where vote_type = 'downvote')
      from ai_votes
      where review_id = NEW.review_id
    )
    where id = NEW.review_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update model_reviews
    set is_helpful_count = (
      select count(*) filter (where vote_type = 'upvote') - count(*) filter (where vote_type = 'downvote')
      from ai_votes
      where review_id = OLD.review_id
    )
    where id = OLD.review_id;
    return OLD;
  end if;
end;
$$ language plpgsql;

drop trigger if exists trigger_update_helpful_count on ai_votes;
create trigger trigger_update_helpful_count
after insert or update or delete on ai_votes
for each row execute function update_review_helpful_count();
