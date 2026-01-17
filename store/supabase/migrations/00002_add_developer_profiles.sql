-- Developer profiles table
CREATE TABLE developer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,  -- Photon user ID from SDK
  display_name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_developer_profiles_user_id ON developer_profiles(user_id);

-- Add developer_id to store_apps
ALTER TABLE store_apps ADD COLUMN developer_id UUID REFERENCES developer_profiles(id);

-- RLS policies
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON developer_profiles FOR SELECT USING (true);
CREATE POLICY "Public insert" ON developer_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update" ON developer_profiles FOR UPDATE USING (true);

-- Drop existing function (return type is changing)
DROP FUNCTION IF EXISTS search_store_apps(TEXT);

-- Recreate search function to include developer info
CREATE FUNCTION search_store_apps(search_query TEXT)
RETURNS TABLE (
  id UUID, bundle_id TEXT, name TEXT, author TEXT, url TEXT,
  description TEXT, submitted_at TIMESTAMPTZ, developer_id UUID,
  developer_display_name TEXT, developer_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.id, sa.bundle_id, sa.name,
    COALESCE(dp.display_name, sa.author) as author,
    sa.url, sa.description, sa.submitted_at, sa.developer_id,
    dp.display_name, dp.description
  FROM store_apps sa
  LEFT JOIN developer_profiles dp ON sa.developer_id = dp.id
  WHERE search_query = '' OR search_query IS NULL
    OR to_tsvector('english', sa.name || ' ' || COALESCE(dp.display_name, sa.author) || ' ' || COALESCE(sa.description, ''))
       @@ plainto_tsquery('english', search_query)
  ORDER BY sa.submitted_at DESC;
END;
$$ LANGUAGE plpgsql;
