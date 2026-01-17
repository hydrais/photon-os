-- Add status column for soft delete/unlist functionality
ALTER TABLE store_apps
ADD COLUMN status TEXT NOT NULL DEFAULT 'listed'
CHECK (status IN ('listed', 'unlisted'));

ALTER TABLE store_apps
ADD COLUMN unlisted_at TIMESTAMPTZ DEFAULT NULL;

-- Add index for filtering by status
CREATE INDEX idx_store_apps_status ON store_apps(status);

-- Add RLS policies for update and delete
CREATE POLICY "Public update" ON store_apps FOR UPDATE USING (true);
CREATE POLICY "Public delete" ON store_apps FOR DELETE USING (true);

-- Drop existing function (return type is changing)
DROP FUNCTION IF EXISTS search_store_apps(TEXT);

-- Recreate search function to filter out unlisted apps
CREATE FUNCTION search_store_apps(search_query TEXT)
RETURNS TABLE (
  id UUID, bundle_id TEXT, name TEXT, author TEXT, url TEXT,
  description TEXT, submitted_at TIMESTAMPTZ, developer_id UUID,
  developer_display_name TEXT, developer_description TEXT,
  status TEXT, unlisted_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.id, sa.bundle_id, sa.name,
    COALESCE(dp.display_name, sa.author) as author,
    sa.url, sa.description, sa.submitted_at, sa.developer_id,
    dp.display_name, dp.description,
    sa.status, sa.unlisted_at
  FROM store_apps sa
  LEFT JOIN developer_profiles dp ON sa.developer_id = dp.id
  WHERE sa.status = 'listed'
    AND (search_query = '' OR search_query IS NULL
      OR to_tsvector('english', sa.name || ' ' || COALESCE(dp.display_name, sa.author) || ' ' || COALESCE(sa.description, ''))
         @@ plainto_tsquery('english', search_query))
  ORDER BY sa.submitted_at DESC;
END;
$$ LANGUAGE plpgsql;
