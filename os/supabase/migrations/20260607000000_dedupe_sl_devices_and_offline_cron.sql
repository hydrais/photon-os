-- Treat (user_id, object_name) as the unique identity for an SL device, and add
-- an automatic offline-cleanup job driven by stale heartbeats.
--
-- Background:
--   * A Second Life object's UUID (object_key) changes every time it is re-rezzed,
--     reset, or the region restarts. Keying registration on object_key therefore
--     created a brand-new row on every re-rez, so the same device showed up many
--     times under the same object_name.
--   * is_online was only ever set to false when an outbound message delivery failed,
--     so devices that simply stopped sending heartbeats stayed "online" forever.
--     The heartbeat interval is 300s (see lsl/PhotonDevice.lsl), so anything that
--     hasn't checked in for >11 minutes has missed at least two heartbeats.

-- 1. Collapse existing duplicates: keep the most recently-seen row per
--    (user_id, object_name), delete the rest.
delete from public.sl_registered_devices a
using public.sl_registered_devices b
where a.user_id = b.user_id
  and a.object_name = b.object_name
  and (
    a.last_heartbeat_at < b.last_heartbeat_at
    or (a.last_heartbeat_at = b.last_heartbeat_at and a.id < b.id)
  );

-- 2. Swap the uniqueness constraint from object_key to object_name so that a
--    re-rezzed device updates its existing row (refreshing object_key/callback_url)
--    instead of inserting a duplicate.
alter table public.sl_registered_devices
  drop constraint if exists sl_registered_devices_user_id_object_key_key;

alter table public.sl_registered_devices
  add constraint sl_registered_devices_user_id_object_name_key
  unique (user_id, object_name);

-- 3. Schedule the offline-cleanup job that the original schema's
--    idx_sl_registered_devices_heartbeat index was always meant to support.
create extension if not exists pg_cron;

select cron.unschedule('mark-stale-sl-devices-offline')
where exists (
  select 1 from cron.job where jobname = 'mark-stale-sl-devices-offline'
);

select cron.schedule(
  'mark-stale-sl-devices-offline',
  '* * * * *',
  $$
    update public.sl_registered_devices
    set is_online = false
    where is_online = true
      and last_heartbeat_at < now() - interval '11 minutes'
  $$
);
