-- User installed apps table
-- Stores app definitions installed by each user

create table public.user_installed_apps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  bundle_id text not null,
  name text not null,
  author text not null,
  url text not null,
  installed_at timestamptz default now() not null,

  -- One user can't install the same app twice
  unique(user_id, bundle_id)
);

-- Index for efficient user lookups
create index idx_user_installed_apps_user_id on public.user_installed_apps(user_id);

-- Enable Row Level Security
alter table public.user_installed_apps enable row level security;

-- RLS Policies: Users can only access their own data
create policy "Users can view own apps"
  on public.user_installed_apps for select
  using (auth.uid() = user_id);

create policy "Users can install apps"
  on public.user_installed_apps for insert
  with check (auth.uid() = user_id);

create policy "Users can uninstall apps"
  on public.user_installed_apps for delete
  using (auth.uid() = user_id);
