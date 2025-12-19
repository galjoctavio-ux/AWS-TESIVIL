-- ═══════════════════════════════════════════════════════════════
-- SYNAPSE_AI - Migration 001: Core Profiles
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ───────────────────────────────────────────────────────────────
-- PROFILES TABLE
-- Main user profiles linked to Supabase Auth
-- ───────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  alias text unique,
  photo_url text,
  is_premium boolean default false,
  premium_until timestamptz,
  role text default 'user' check (role in ('user', 'developer', 'partner', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger to update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ───────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────────────────────
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Profiles are inserted on signup"
  on profiles for insert
  with check (auth.uid() = id);

-- ───────────────────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ───────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
