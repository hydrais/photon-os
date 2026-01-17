ALTER TABLE store_apps ADD COLUMN icon_url TEXT;

-- Drop existing function (return type is changing)
DROP FUNCTION IF EXISTS search_store_apps(TEXT);

-- Recreate search function with icon_url
CREATE FUNCTION search_store_apps(search_query TEXT)
RETURNS TABLE (
  id UUID, bundle_id TEXT, name TEXT, author TEXT, url TEXT,
  description TEXT, tagline TEXT, icon_url TEXT, submitted_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  developer_id UUID, developer_display_name TEXT, developer_description TEXT,
  status TEXT, unlisted_at TIMESTAMPTZ, current_version TEXT,
  average_rating DECIMAL, review_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.id, sa.bundle_id, sa.name,
    COALESCE(dp.display_name, sa.author) as author,
    sa.url, sa.description, sa.tagline, sa.icon_url, sa.submitted_at, sa.updated_at, sa.developer_id,
    dp.display_name, dp.description,
    sa.status, sa.unlisted_at, sa.current_version,
    sa.average_rating, sa.review_count
  FROM store_apps sa
  LEFT JOIN developer_profiles dp ON sa.developer_id = dp.id
  WHERE sa.status = 'listed'
    AND (search_query = '' OR search_query IS NULL
      OR to_tsvector('english', sa.name || ' ' || COALESCE(dp.display_name, sa.author) || ' ' || COALESCE(sa.description, ''))
         @@ plainto_tsquery('english', search_query))
  ORDER BY sa.submitted_at DESC;
END;
$$ LANGUAGE plpgsql;
