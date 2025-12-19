-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - Migration 004: News Feed
-- Module: Feed (News & Alerts)
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- NEWS ARTICLES
-- Processed news from RSS feeds
-- ───────────────────────────────────────────────────────────────
create table news_articles (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  summary_json jsonb not null,      -- { bullets: [], why_it_matters: "" }
  topic_id text not null,           -- Semantic ID for dedup (LAUNCH_OPENAI_O1)
  source_name text not null,        -- 'TechCrunch', 'The Verge', etc
  url_original text unique,         -- Original article URL
  image_url text,
  importance integer check (importance between 1 and 10),
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes for feed queries
create index idx_news_created on news_articles(created_at desc);
create index idx_news_importance on news_articles(importance desc);
create index idx_news_topic on news_articles(topic_id);

-- ───────────────────────────────────────────────────────────────
-- NEWS COMMENTS
-- User comments on news articles
-- ───────────────────────────────────────────────────────────────
create table news_comments (
  id uuid primary key default uuid_generate_v4(),
  article_id uuid references news_articles(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

create index idx_news_comments_article on news_comments(article_id, created_at desc);

-- ───────────────────────────────────────────────────────────────
-- RSS SOURCES (Configuration)
-- ───────────────────────────────────────────────────────────────
create table rss_sources (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  url text not null unique,
  category text,                    -- 'business', 'research', 'official'
  is_active boolean default true,
  last_fetched_at timestamptz,
  created_at timestamptz default now()
);

-- Insert default sources
insert into rss_sources (name, url, category) values
  ('TechCrunch AI', 'https://techcrunch.com/category/artificial-intelligence/feed/', 'business'),
  ('The Verge AI', 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', 'business'),
  ('ArXiv AI', 'https://arxiv.org/rss/cs.AI', 'research'),
  ('Hacker News AI', 'https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT', 'community'),
  ('OpenAI Blog', 'https://openai.com/blog/rss/', 'official'),
  ('Anthropic News', 'https://www.anthropic.com/news/rss', 'official'),
  ('Google DeepMind', 'https://deepmind.google/blog/rss.xml', 'official');

-- ───────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────
alter table news_articles enable row level security;
alter table news_comments enable row level security;

-- News: public read, service_role insert
create policy "Anyone can read news" on news_articles for select using (true);
create policy "Service role inserts news" on news_articles for insert 
  with check (auth.role() = 'service_role');

-- Comments: public read, user insert
create policy "Anyone can read comments" on news_comments for select using (true);
create policy "Users can comment" on news_comments for insert 
  with check (auth.uid() = user_id);
create policy "Users can delete own comments" on news_comments for delete 
  using (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────
-- DEDUP HELPER FUNCTION
-- Check if topic exists in last 24h
-- ───────────────────────────────────────────────────────────────
create or replace function check_topic_duplicate(p_topic_id text)
returns boolean as $$
declare
  v_exists boolean;
begin
  select exists(
    select 1 from news_articles
    where topic_id = p_topic_id
      and created_at >= now() - interval '24 hours'
  ) into v_exists;
  
  return v_exists;
end;
$$ language plpgsql;
