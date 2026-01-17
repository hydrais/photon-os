-- Track installs from the store for history
CREATE TABLE store_install_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,  -- Photon user ID
  app_id UUID REFERENCES store_apps(id) ON DELETE SET NULL,
  bundle_id TEXT NOT NULL,
  installed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bundle_id)
);

CREATE INDEX idx_store_install_events_user_id ON store_install_events(user_id);

-- RLS policies (open like other tables)
ALTER TABLE store_install_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON store_install_events FOR SELECT USING (true);
CREATE POLICY "Public insert" ON store_install_events FOR INSERT WITH CHECK (true);

-- Add updated_at to store_apps for tracking changes
ALTER TABLE store_apps ADD COLUMN updated_at TIMESTAMPTZ;
UPDATE store_apps SET updated_at = submitted_at WHERE updated_at IS NULL;
ALTER TABLE store_apps ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE store_apps ALTER COLUMN updated_at SET NOT NULL;

-- Trigger to auto-update updated_at
CREATE FUNCTION update_store_apps_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER store_apps_set_updated_at
BEFORE UPDATE ON store_apps FOR EACH ROW
EXECUTE FUNCTION update_store_apps_updated_at();
