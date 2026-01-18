-- Create categories table
CREATE TABLE store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view categories"
  ON store_categories FOR SELECT
  USING (true);

-- Seed categories
INSERT INTO store_categories (slug, name, description) VALUES
  ('avatar', 'Avatar', 'Avatar customization and virtual identity apps'),
  ('tools', 'Tools', 'Utilities and productivity tools'),
  ('games', 'Games', 'Games and interactive entertainment'),
  ('social', 'Social', 'Communication and social networking'),
  ('media', 'Media', 'Music, video, and content players'),
  ('education', 'Education', 'Learning and educational apps');

-- Add category column to store_apps (references slug for simplicity)
ALTER TABLE store_apps ADD COLUMN category TEXT REFERENCES store_categories(slug);

-- Index for faster category queries
CREATE INDEX idx_store_apps_category ON store_apps(category) WHERE category IS NOT NULL;

-- Drop existing function (return type is changing)
DROP FUNCTION IF EXISTS search_store_apps(TEXT);

-- Recreate search function with category field
CREATE FUNCTION search_store_apps(search_query TEXT)
RETURNS TABLE (
  id UUID, bundle_id TEXT, name TEXT, author TEXT, url TEXT,
  description TEXT, tagline TEXT, icon_url TEXT, submitted_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  developer_id UUID, developer_display_name TEXT, developer_description TEXT,
  status TEXT, unlisted_at TIMESTAMPTZ, current_version TEXT,
  average_rating DECIMAL, review_count INTEGER, featured BOOLEAN, category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.id, sa.bundle_id, sa.name,
    COALESCE(dp.display_name, sa.author) as author,
    sa.url, sa.description, sa.tagline, sa.icon_url, sa.submitted_at, sa.updated_at, sa.developer_id,
    dp.display_name, dp.description,
    sa.status, sa.unlisted_at, sa.current_version,
    sa.average_rating, sa.review_count, sa.featured, sa.category
  FROM store_apps sa
  LEFT JOIN developer_profiles dp ON sa.developer_id = dp.id
  WHERE sa.status = 'listed'
    AND (search_query = '' OR search_query IS NULL
      OR to_tsvector('english', sa.name || ' ' || COALESCE(dp.display_name, sa.author) || ' ' || COALESCE(sa.description, ''))
         @@ plainto_tsquery('english', search_query))
  ORDER BY sa.submitted_at DESC;
END;
$$ LANGUAGE plpgsql;
