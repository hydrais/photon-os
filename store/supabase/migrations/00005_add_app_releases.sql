-- app_releases table for version history and release notes
CREATE TABLE app_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES store_apps(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_notes TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(app_id, version)
);

CREATE INDEX idx_app_releases_app_id ON app_releases(app_id);
CREATE INDEX idx_app_releases_published_at ON app_releases(published_at DESC);

ALTER TABLE app_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON app_releases FOR SELECT USING (true);
CREATE POLICY "Public insert" ON app_releases FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON app_releases FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON app_releases FOR DELETE USING (true);

-- Quick access to current version on store_apps
ALTER TABLE store_apps ADD COLUMN current_version TEXT;
