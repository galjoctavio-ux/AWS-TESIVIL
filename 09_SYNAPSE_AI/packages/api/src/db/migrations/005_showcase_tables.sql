-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - SHOWCASE MODULE MIGRATION (FINAL)
-- Based on existing 005_projects.sql schema
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- 1. ENSURE TABLES EXIST
-- ═══════════════════════════════════════════════════════════════

-- Projects table (matches existing schema from 005_projects.sql)
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  
  -- Content
  title text not null,
  description text,
  tools_array text[] not null default '{}',
  image_urls text[],
  
  -- Link
  action_type text default 'inspiration',
  project_url text,
  
  -- Metrics (NOTE: uses plural 'counts')
  views_count integer default 0,
  upvotes_count integer default 0,
  
  -- Status
  report_count integer default 0,
  is_hidden boolean default false,
  is_trending boolean default false,
  is_featured_until timestamptz,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project Views
create table if not exists project_views (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  viewer_id uuid,
  created_at timestamptz default now()
);

-- Project Votes
create table if not exists project_votes (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

-- Project Comments
create table if not exists project_comments (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  comment_type text,
  is_moderated boolean default true,
  is_approved boolean default true,
  created_at timestamptz default now()
);

-- Project Reports
create table if not exists project_reports (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  reporter_id uuid references profiles(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  reason text,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════
-- 2. ADD MISSING COLUMNS (safe if already exist)
-- ═══════════════════════════════════════════════════════════════

DO $$ 
BEGIN
  -- Add moderation_status if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'moderation_status') THEN
    ALTER TABLE projects ADD COLUMN moderation_status text default 'approved';
  END IF;
  
  -- Add is_featured if missing (for simpler boolean check)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'is_featured') THEN
    ALTER TABLE projects ADD COLUMN is_featured boolean default false;
  END IF;
  
  -- Add comment_count if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'comment_count') THEN
    ALTER TABLE projects ADD COLUMN comment_count integer default 0;
  END IF;
  
  -- Add is_approved to comments if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_comments' AND column_name = 'is_approved') THEN
    ALTER TABLE project_comments ADD COLUMN is_approved boolean default true;
  END IF;
  
  -- Add user_id to reports if missing (alternative to reporter_id)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_reports' AND column_name = 'user_id') THEN
    ALTER TABLE project_reports ADD COLUMN user_id uuid references profiles(id) on delete cascade;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 3. INDEXES (safe with IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════

create index if not exists idx_projects_user on projects(user_id);
create index if not exists idx_projects_created on projects(created_at desc);
create index if not exists idx_projects_upvotes on projects(upvotes_count desc);
create index if not exists idx_projects_views on projects(views_count desc);
create index if not exists idx_projects_trending on projects(is_trending) where is_trending = true;
create index if not exists idx_views_project_time on project_views(project_id, created_at);
create index if not exists idx_comments_project on project_comments(project_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════
-- 4. ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

alter table projects enable row level security;
alter table project_views enable row level security;
alter table project_votes enable row level security;
alter table project_comments enable row level security;
alter table project_reports enable row level security;

-- Projects
drop policy if exists "View public projects" on projects;
create policy "View public projects" on projects for select
  using (is_hidden = false or auth.uid() = user_id);

drop policy if exists "Users create projects" on projects;
create policy "Users create projects" on projects for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users edit own projects" on projects;
create policy "Users edit own projects" on projects for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete own projects" on projects;
create policy "Users delete own projects" on projects for delete
  using (auth.uid() = user_id);

-- Service role can do everything
drop policy if exists "Service role full access" on projects;
create policy "Service role full access" on projects for all
  using (auth.role() = 'service_role');

-- Views
drop policy if exists "Anyone can read views" on project_views;
create policy "Anyone can read views" on project_views for select using (true);

drop policy if exists "Anyone can register view" on project_views;
create policy "Anyone can register view" on project_views for insert with check (true);

-- Votes
drop policy if exists "Anyone can view votes" on project_votes;
create policy "Anyone can view votes" on project_votes for select using (true);

drop policy if exists "Users can vote" on project_votes;
create policy "Users can vote" on project_votes for insert with check (auth.uid() = user_id);

drop policy if exists "Users can unvote" on project_votes;
create policy "Users can unvote" on project_votes for delete using (auth.uid() = user_id);

-- Comments
drop policy if exists "View moderated comments" on project_comments;
create policy "View moderated comments" on project_comments for select
  using (is_moderated = true or auth.uid() = user_id);

drop policy if exists "Users can comment" on project_comments;
create policy "Users can comment" on project_comments for insert
  with check (auth.uid() = user_id);

-- Reports
drop policy if exists "Users can report" on project_reports;
create policy "Users can report" on project_reports for insert
  with check (auth.uid() = user_id or auth.uid() = reporter_id);

drop policy if exists "Service reads reports" on project_reports;
create policy "Service reads reports" on project_reports for select
  using (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════════
-- 5. RPC FUNCTIONS (for API calls)
-- ═══════════════════════════════════════════════════════════════

-- Increment views (using correct column name)
create or replace function increment_project_views(p_project_id uuid)
returns void as $$
begin
  update projects set views_count = views_count + 1 where id = p_project_id;
  insert into project_views (project_id, viewer_id) values (p_project_id, auth.uid());
end;
$$ language plpgsql security definer;

-- Increment upvotes (using correct column name)
create or replace function increment_project_upvotes(p_project_id uuid)
returns void as $$
begin
  update projects set upvotes_count = upvotes_count + 1 where id = p_project_id;
end;
$$ language plpgsql security definer;

-- Decrement upvotes
create or replace function decrement_project_upvotes(p_project_id uuid)
returns void as $$
begin
  update projects set upvotes_count = greatest(upvotes_count - 1, 0) where id = p_project_id;
end;
$$ language plpgsql security definer;

-- Increment comments
create or replace function increment_project_comments(p_project_id uuid)
returns void as $$
begin
  update projects set comment_count = comment_count + 1 where id = p_project_id;
end;
$$ language plpgsql security definer;

-- ═══════════════════════════════════════════════════════════════
-- 6. TRENDING SYSTEM
-- ═══════════════════════════════════════════════════════════════

create or replace function check_trending_projects()
returns void as $$
begin
  -- Reset trending
  update projects set is_trending = false where is_trending = true;
  
  -- Mark projects with >100 views in 24h as trending
  update projects p
  set is_trending = true
  where id in (
    select project_id 
    from project_views 
    where created_at > now() - interval '24 hours'
    group by project_id
    having count(*) >= 100
  );
end;
$$ language plpgsql security definer;

-- ═══════════════════════════════════════════════════════════════
-- DONE - Migration Complete!
-- ═══════════════════════════════════════════════════════════════
