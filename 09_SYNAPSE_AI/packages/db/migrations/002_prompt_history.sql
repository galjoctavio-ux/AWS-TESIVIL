-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - Migration 002: Prompt Engine
-- Module: Engine (Prompt Generator)
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- PROMPT BUILDER HISTORY
-- Stores user prompt generation history
-- ───────────────────────────────────────────────────────────────
create table prompt_builder_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  
  -- Inputs
  input_raw text not null,          -- Original user idea
  input_enriched text,              -- Layer A enriched output
  
  -- Configuration
  config_json jsonb not null,       -- { style, light, lens/technique, aspect, engine }
  
  -- Output
  prompt_final text not null,       -- Final prompt to copy
  negative_prompt text,             -- Negative prompt if applicable
  
  -- Metadata
  tokens_used integer default 0,
  created_at timestamptz default now()
);

-- Index for user history queries
create index idx_prompt_history_user 
  on prompt_builder_history(user_id, created_at desc);

-- ───────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────
alter table prompt_builder_history enable row level security;

create policy "Users see own prompts"
  on prompt_builder_history for select
  using (auth.uid() = user_id);

create policy "Users insert own prompts"
  on prompt_builder_history for insert
  with check (auth.uid() = user_id);

create policy "Users delete own prompts"
  on prompt_builder_history for delete
  using (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────
-- USAGE TRACKING (for rate limiting)
-- ───────────────────────────────────────────────────────────────
create table prompt_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  feature text not null,            -- 'magic_wand', 'generate'
  used_at timestamptz default now()
);

create index idx_prompt_usage_user_feature 
  on prompt_usage(user_id, feature, used_at desc);

-- Function to check daily limit
create or replace function check_daily_limit(
  p_user_id uuid,
  p_feature text,
  p_limit integer
) returns boolean as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from prompt_usage
  where user_id = p_user_id
    and feature = p_feature
    and used_at >= current_date;
  
  return v_count < p_limit;
end;
$$ language plpgsql;
