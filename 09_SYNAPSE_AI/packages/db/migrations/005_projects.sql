-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - Migration 005: Projects Showcase
-- Module: Showcase (Community Gallery)
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- PROJECTS TABLE
-- User-submitted projects
-- ───────────────────────────────────────────────────────────────
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  
  -- Content
  title text not null,
  description text not null check (char_length(description) <= 200),
  tools_array text[] not null,      -- ['Cursor', 'Groq', 'Supabase']
  image_urls text[],                -- Array of WebP URLs (max 3)
  
  -- Link
  action_type text check (action_type in ('visit', 'download', 'inspiration')) default 'inspiration',
  project_url text,
  
  -- Metrics
  views_count integer default 0,
  upvotes_count integer default 0,
  
  -- Status
  report_count integer default 0,
  is_hidden boolean default false,
  is_trending boolean default false,
  is_featured_until timestamptz,    -- For monetization: featured slot
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_projects_user on projects(user_id);
create index idx_projects_created on projects(created_at desc);
create index idx_projects_upvotes on projects(upvotes_count desc);
create index idx_projects_trending on projects(is_trending) where is_trending = true;
create index idx_projects_featured on projects(is_featured_until desc nulls last) 
  where is_featured_until is not null;

-- ───────────────────────────────────────────────────────────────
-- PROJECT VIEWS (Analytics)
-- ───────────────────────────────────────────────────────────────
create table project_views (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  viewer_id uuid,                   -- Nullable for anonymous views
  created_at timestamptz default now()
);

create index idx_views_project_time on project_views(project_id, created_at);

-- ───────────────────────────────────────────────────────────────
-- PROJECT VOTES (Upvotes)
-- ───────────────────────────────────────────────────────────────
create table project_votes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

-- ───────────────────────────────────────────────────────────────
-- PROJECT COMMENTS (Moderated by Groq)
-- ───────────────────────────────────────────────────────────────
create table project_comments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  comment_type text,                -- 'pregunta_tecnica', 'felicitacion', 'feedback', 'neutral'
  is_moderated boolean default true,
  created_at timestamptz default now()
);

create index idx_comments_project on project_comments(project_id, created_at desc);

-- ───────────────────────────────────────────────────────────────
-- PROJECT REPORTS
-- ───────────────────────────────────────────────────────────────
create table project_reports (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  reporter_id uuid references profiles(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now(),
  unique(project_id, reporter_id)
);

-- ───────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────
alter table projects enable row level security;
alter table project_views enable row level security;
alter table project_votes enable row level security;
alter table project_comments enable row level security;

-- Projects: public (non-hidden), user owns
create policy "View public projects" on projects for select
  using (is_hidden = false or auth.uid() = user_id);
create policy "Users create projects" on projects for insert
  with check (auth.uid() = user_id);
create policy "Users edit own projects" on projects for update
  using (auth.uid() = user_id);
create policy "Users delete own projects" on projects for delete
  using (auth.uid() = user_id);

-- Views: public read, anyone insert
create policy "Anyone can read views" on project_views for select using (true);
create policy "Anyone can register view" on project_views for insert with check (true);

-- Votes
create policy "Anyone can view votes" on project_votes for select using (true);
create policy "Users can vote" on project_votes for insert with check (auth.uid() = user_id);
create policy "Users can unvote" on project_votes for delete using (auth.uid() = user_id);

-- Comments: moderated public read
create policy "View moderated comments" on project_comments for select
  using (is_moderated = true or auth.uid() = user_id);
create policy "Users can comment" on project_comments for insert
  with check (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────
-- TRIGGERS
-- ───────────────────────────────────────────────────────────────

-- Update view count
create or replace function increment_view_count()
returns trigger as $$
begin
  update projects
  set views_count = views_count + 1
  where id = new.project_id;
  return new;
end;
$$ language plpgsql;

create trigger project_view_counter
  after insert on project_views
  for each row execute function increment_view_count();

-- Update upvote count
create or replace function update_upvote_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update projects set upvotes_count = upvotes_count + 1 where id = new.project_id;
  elsif tg_op = 'DELETE' then
    update projects set upvotes_count = upvotes_count - 1 where id = old.project_id;
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger project_upvote_counter
  after insert or delete on project_votes
  for each row execute function update_upvote_count();

-- Auto-hide on 3 reports
create or replace function check_report_threshold()
returns trigger as $$
begin
  update projects
  set report_count = report_count + 1,
      is_hidden = case when report_count >= 2 then true else is_hidden end
  where id = new.project_id;
  return new;
end;
$$ language plpgsql;

create trigger project_report_threshold
  after insert on project_reports
  for each row execute function check_report_threshold();
