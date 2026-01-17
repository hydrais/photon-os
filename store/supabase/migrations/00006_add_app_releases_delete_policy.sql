-- Add DELETE policy for app_releases (may have been missing from initial migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'app_releases'
    AND policyname = 'Public delete'
  ) THEN
    CREATE POLICY "Public delete" ON app_releases FOR DELETE USING (true);
  END IF;
END
$$;
