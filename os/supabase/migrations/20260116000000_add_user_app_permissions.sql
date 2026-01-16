CREATE TABLE user_app_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bundle_id TEXT NOT NULL,
  permission_type TEXT NOT NULL,  -- 'devices' (extensible for future)
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, bundle_id, permission_type)
);

ALTER TABLE user_app_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own permissions"
  ON user_app_permissions FOR ALL
  USING (auth.uid() = user_id);
