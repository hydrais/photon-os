-- Second Life account linking codes table
-- Temporary codes that users generate to link their SL accounts

create table public.sl_linking_codes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now() not null,

  -- Each code must be unique
  unique(code)
);

-- Index for quick code lookups (used by Edge Function)
create index idx_sl_linking_codes_code on public.sl_linking_codes(code);

-- Index for user's codes lookup
create index idx_sl_linking_codes_user_id on public.sl_linking_codes(user_id);

-- Enable Row Level Security
alter table public.sl_linking_codes enable row level security;

-- Users can view their own linking codes
create policy "Users can view own linking codes"
  on public.sl_linking_codes for select
  using (auth.uid() = user_id);

-- Users can create linking codes for themselves
create policy "Users can create linking codes"
  on public.sl_linking_codes for insert
  with check (auth.uid() = user_id);

-- Service role handles updates (marking used) via Edge Function
