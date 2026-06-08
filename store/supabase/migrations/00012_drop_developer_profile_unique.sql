-- Allow a user to have multiple developer profiles.
-- Previously developer_profiles.user_id had an inline UNIQUE constraint
-- (auto-named developer_profiles_user_id_key), enforcing one profile per user.
-- Drop it so a single Photon user can publish apps under multiple developer names.
ALTER TABLE developer_profiles DROP CONSTRAINT IF EXISTS developer_profiles_user_id_key;

-- idx_developer_profiles_user_id (created in migration 00002) is a separate,
-- non-unique index and is intentionally kept so user_id lookups stay fast.

COMMENT ON COLUMN developer_profiles.user_id IS 'Photon user ID from SDK. A user may have multiple developer profiles.';
