import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { StoreApp, AppRelease } from "../lib/supabase/client";

export type AppWithLatestRelease = StoreApp & {
  latestRelease: AppRelease | null;
};

export function useRecentUpdates(userId: string | undefined) {
  const [updates, setUpdates] = useState<AppWithLatestRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setUpdates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get bundle_ids of apps the user has installed from the store
      const { data: installData, error: installError } = await supabase
        .from("store_install_events")
        .select("bundle_id")
        .eq("user_id", userId);

      if (installError) {
        throw new Error(installError.message);
      }

      const bundleIds = installData.map((i) => i.bundle_id);

      if (bundleIds.length === 0) {
        setUpdates([]);
        setLoading(false);
        return;
      }

      // Get apps that were updated in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: appsData, error: appsError } = await supabase
        .from("store_apps")
        .select("*")
        .in("bundle_id", bundleIds)
        .eq("status", "listed")
        .gte("updated_at", thirtyDaysAgo.toISOString())
        .order("updated_at", { ascending: false });

      if (appsError) {
        throw new Error(appsError.message);
      }

      const apps = appsData as StoreApp[];

      // Get the latest release for each app
      const appIds = apps.map((a) => a.id);
      const { data: releasesData, error: releasesError } = await supabase
        .from("app_releases")
        .select("*")
        .in("app_id", appIds)
        .order("published_at", { ascending: false });

      if (releasesError) {
        throw new Error(releasesError.message);
      }

      // Create a map of app_id -> latest release
      const latestReleaseByAppId = new Map<string, AppRelease>();
      for (const release of releasesData as AppRelease[]) {
        if (!latestReleaseByAppId.has(release.app_id)) {
          latestReleaseByAppId.set(release.app_id, release);
        }
      }

      // Combine apps with their latest releases
      const appsWithReleases: AppWithLatestRelease[] = apps.map((app) => ({
        ...app,
        latestRelease: latestReleaseByAppId.get(app.id) || null,
      }));

      setUpdates(appsWithReleases);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { updates, loading, error, refetch: fetch };
}
