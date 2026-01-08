-- SL Registered Devices table
-- Stores Second Life objects registered to receive/send messages via Photon

create table public.sl_registered_devices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sl_account_id uuid not null references public.user_linked_sl_accounts(id) on delete cascade,
  object_key uuid not null,
  object_name text not null,
  callback_url text not null,
  region_name text,
  registered_at timestamptz default now() not null,
  last_heartbeat_at timestamptz default now() not null,
  is_online boolean default true not null,
  metadata jsonb default '{}'::jsonb,

  -- One registration per object per user
  unique(user_id, object_key)
);

-- Index for efficient user lookups
create index idx_sl_registered_devices_user_id on public.sl_registered_devices(user_id);

-- Index for looking up by object key (for device operations)
create index idx_sl_registered_devices_object_key on public.sl_registered_devices(object_key);

-- Index for heartbeat cleanup job
create index idx_sl_registered_devices_heartbeat on public.sl_registered_devices(last_heartbeat_at) where is_online = true;

-- Enable Row Level Security
alter table public.sl_registered_devices enable row level security;

-- RLS Policies: Users can view/delete their own devices
create policy "Users can view own registered devices"
  on public.sl_registered_devices for select
  using (auth.uid() = user_id);

create policy "Users can unregister own devices"
  on public.sl_registered_devices for delete
  using (auth.uid() = user_id);

-- Insert/update policy for service role (device registration via edge functions)
create policy "Service role can manage devices"
  on public.sl_registered_devices for all
  with check (true);
