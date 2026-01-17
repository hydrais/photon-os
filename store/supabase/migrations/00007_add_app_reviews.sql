-- app_reviews table
CREATE TABLE app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES store_apps(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,  -- Photon user ID
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(app_id, user_id)  -- One review per user per app
);

CREATE INDEX idx_app_reviews_app_id ON app_reviews(app_id);
CREATE INDEX idx_app_reviews_created_at ON app_reviews(created_at DESC);

ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON app_reviews FOR SELECT USING (true);
CREATE POLICY "Public insert" ON app_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON app_reviews FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON app_reviews FOR DELETE USING (true);

-- Denormalized stats on store_apps
ALTER TABLE store_apps ADD COLUMN average_rating DECIMAL(2, 1);
ALTER TABLE store_apps ADD COLUMN review_count INTEGER DEFAULT 0;

-- Auto-update trigger for updated_at
CREATE FUNCTION update_app_reviews_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_reviews_set_updated_at
BEFORE UPDATE ON app_reviews FOR EACH ROW
EXECUTE FUNCTION update_app_reviews_updated_at();

-- Trigger to keep rating stats in sync
CREATE OR REPLACE FUNCTION update_app_rating_stats() RETURNS TRIGGER AS $$
DECLARE target_app_id UUID;
BEGIN
  target_app_id := COALESCE(NEW.app_id, OLD.app_id);
  UPDATE store_apps SET
    average_rating = (SELECT ROUND(AVG(rating)::numeric, 1) FROM app_reviews WHERE app_id = target_app_id),
    review_count = (SELECT COUNT(*) FROM app_reviews WHERE app_id = target_app_id)
  WHERE id = target_app_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_reviews_update_stats
AFTER INSERT OR UPDATE OR DELETE ON app_reviews
FOR EACH ROW EXECUTE FUNCTION update_app_rating_stats();
