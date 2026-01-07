-- User preferences tables
-- Sandboxed: per-app preferences (only accessible by owning app)
-- Shared: global preferences (readable/writable by any app)

-- Sandboxed preferences (app-specific)
create table public.user_sandboxed_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  bundle_id text not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz default now() not null,
  unique(user_id, bundle_id, key)
);

create index idx_user_sandboxed_preferences_lookup
  on public.user_sandboxed_preferences(user_id, bundle_id);

-- Shared preferences (global, any app can access)
create table public.user_shared_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz default now() not null,
  unique(user_id, key)
);

create index idx_user_shared_preferences_user_id
  on public.user_shared_preferences(user_id);

-- Enable Row Level Security
alter table public.user_sandboxed_preferences enable row level security;
alter table public.user_shared_preferences enable row level security;

-- RLS Policies: user isolation (app isolation handled in application code)
create policy "Users access own sandboxed prefs"
  on public.user_sandboxed_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users access own shared prefs"
  on public.user_shared_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
