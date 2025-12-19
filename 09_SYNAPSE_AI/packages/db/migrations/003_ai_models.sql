-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - Migration 003: AI Models & Rankings
-- Module: The Pulse (Rankings)
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- AI MODELS CATALOG
-- Core table with AI model information
-- ───────────────────────────────────────────────────────────────
create table ai_models (
  id text primary key,              -- e.g. 'anthropic/claude-3.5-sonnet'
  name text not null,               -- 'Claude 3.5 Sonnet'
  brand text not null,              -- 'Anthropic'
  version text,
  category text check (category in ('pro', 'flash')),
  pricing_type text[],              -- ['free_web', 'subscription', 'api']
  pricing_input_1m decimal,         -- $/1M input tokens
  pricing_output_1m decimal,        -- $/1M output tokens
  context_window integer,
  logo_url text,
  website_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_ai_models_brand on ai_models(brand);
create index idx_ai_models_category on ai_models(category);

-- ───────────────────────────────────────────────────────────────
-- AI STATS (Aggregated Scores)
-- ───────────────────────────────────────────────────────────────
create table ai_stats (
  model_id text primary key references ai_models(id) on delete cascade,
  benchmark_score decimal,          -- Average benchmark score
  community_score decimal,          -- Average review score
  avg_speed decimal,
  avg_precision decimal,
  avg_hallucination decimal,
  reviews_count integer default 0,
  tokens_per_second integer,
  updated_at timestamptz default now()
);

-- ───────────────────────────────────────────────────────────────
-- AI BENCHMARKS (Technical Scores)
-- ───────────────────────────────────────────────────────────────
create table ai_benchmarks (
  id uuid primary key default uuid_generate_v4(),
  model_id text references ai_models(id) on delete cascade,
  category text not null,           -- 'coding', 'logic', 'creative', 'vision'
  source text not null,             -- 'LMSYS', 'HumanEval', etc
  score decimal,
  ranking_position integer,
  updated_at timestamptz default now(),
  unique(model_id, category, source)
);

create index idx_ai_benchmarks_model on ai_benchmarks(model_id);

-- ───────────────────────────────────────────────────────────────
-- AI REVIEWS (User Reviews)
-- ───────────────────────────────────────────────────────────────
create table ai_reviews (
  id uuid primary key default uuid_generate_v4(),
  model_id text references ai_models(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  stars_speed integer check (stars_speed between 1 and 5),
  stars_precision integer check (stars_precision between 1 and 5),
  stars_hallucination integer check (stars_hallucination between 1 and 5),
  comment text,
  use_case_tag text,                -- '#Código', '#Resumen', '#Análisis'
  is_helpful_count integer default 0,
  created_at timestamptz default now(),
  unique(model_id, user_id)         -- One review per user per model
);

create index idx_ai_reviews_model on ai_reviews(model_id);
create index idx_ai_reviews_user on ai_reviews(user_id);

-- ───────────────────────────────────────────────────────────────
-- AI VOTES (Review Helpfulness)
-- ───────────────────────────────────────────────────────────────
create table ai_votes (
  id uuid primary key default uuid_generate_v4(),
  review_id uuid references ai_reviews(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  vote_type text check (vote_type in ('upvote', 'downvote')),
  created_at timestamptz default now(),
  unique(review_id, user_id)
);

-- ───────────────────────────────────────────────────────────────
-- AI RANKING HISTORY (Trends)
-- ───────────────────────────────────────────────────────────────
create table ai_ranking_history (
  id uuid primary key default uuid_generate_v4(),
  model_id text references ai_models(id) on delete cascade,
  week_number integer,
  ranking_position integer,
  total_score decimal,
  created_at timestamptz default now()
);

create index idx_ranking_history_model on ai_ranking_history(model_id, week_number desc);

-- ───────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────
alter table ai_models enable row level security;
alter table ai_stats enable row level security;
alter table ai_benchmarks enable row level security;
alter table ai_reviews enable row level security;
alter table ai_votes enable row level security;

-- Models, stats, benchmarks: public read
create policy "Anyone can view models" on ai_models for select using (true);
create policy "Anyone can view stats" on ai_stats for select using (true);
create policy "Anyone can view benchmarks" on ai_benchmarks for select using (true);

-- Reviews: public read, user write
create policy "Anyone can view reviews" on ai_reviews for select using (true);
create policy "Users create own reviews" on ai_reviews for insert with check (auth.uid() = user_id);
create policy "Users edit own reviews" on ai_reviews for update using (auth.uid() = user_id);

-- Votes
create policy "Anyone can view votes" on ai_votes for select using (true);
create policy "Users create own votes" on ai_votes for insert with check (auth.uid() = user_id);
create policy "Users change own votes" on ai_votes for update using (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────
-- TRIGGER: Update Stats on Review Change
-- ───────────────────────────────────────────────────────────────
create or replace function update_ai_stats()
returns trigger as $$
begin
  insert into ai_stats (model_id, avg_speed, avg_precision, avg_hallucination, community_score, reviews_count)
  select 
    coalesce(new.model_id, old.model_id),
    avg(stars_speed),
    avg(stars_precision),
    avg(stars_hallucination),
    avg((stars_speed + stars_precision + stars_hallucination) / 3.0),
    count(*)
  from ai_reviews
  where model_id = coalesce(new.model_id, old.model_id)
  on conflict (model_id) do update set
    avg_speed = excluded.avg_speed,
    avg_precision = excluded.avg_precision,
    avg_hallucination = excluded.avg_hallucination,
    community_score = excluded.community_score,
    reviews_count = excluded.reviews_count,
    updated_at = now();
  
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger ai_reviews_stats_trigger
  after insert or update or delete on ai_reviews
  for each row execute function update_ai_stats();
