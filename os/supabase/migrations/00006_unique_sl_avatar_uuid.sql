-- Add unique constraint on avatar_uuid to prevent linking the same SL account to multiple Photon accounts
-- Note: Run this after cleaning up any existing duplicates

ALTER TABLE public.user_linked_sl_accounts
ADD CONSTRAINT unique_avatar_uuid UNIQUE (avatar_uuid);
