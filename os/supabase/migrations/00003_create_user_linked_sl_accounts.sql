-- User linked Second Life accounts table
-- Stores SL accounts linked to each Photon user

create table public.user_linked_sl_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  avatar_uuid text not null,
  avatar_name text not null,
  linked_at timestamptz default now() not null,

  -- One user can't link the same SL account twice
  unique(user_id, avatar_uuid)
);

-- Index for efficient user lookups
create index idx_user_linked_sl_accounts_user_id on public.user_linked_sl_accounts(user_id);

-- Index for looking up by avatar UUID (for external API linking)
create index idx_user_linked_sl_accounts_avatar_uuid on public.user_linked_sl_accounts(avatar_uuid);

-- Enable Row Level Security
alter table public.user_linked_sl_accounts enable row level security;

-- RLS Policies: Users can view/delete their own linked accounts
create policy "Users can view own linked SL accounts"
  on public.user_linked_sl_accounts for select
  using (auth.uid() = user_id);

create policy "Users can unlink own SL accounts"
  on public.user_linked_sl_accounts for delete
  using (auth.uid() = user_id);

-- Insert policy for service role (external API linking)
-- The linking happens via external API with service role, not user-initiated
create policy "Service role can link SL accounts"
  on public.user_linked_sl_accounts for insert
  with check (true);
