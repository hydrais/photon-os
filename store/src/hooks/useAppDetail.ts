import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { StoreApp, AppRelease } from "@/lib/supabase/client";

export type AppDetail = StoreApp & {
  latestRelease: AppRelease | null;
};

export function useAppDetail(appId: string | undefined) {
  const [app, setApp] = useState<AppDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!appId) {
      setApp(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch the app
      const { data: appData, error: appError } = await supabase
        .from("store_apps")
        .select("*")
        .eq("id", appId)
        .single();

      if (appError) {
        throw new Error(appError.message);
      }

      // Fetch the latest release
      const { data: releaseData, error: releaseError } = await supabase
        .from("app_releases")
        .select("*")
        .eq("app_id", appId)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (releaseError) {
        throw new Error(releaseError.message);
      }

      setApp({
        ...(appData as StoreApp),
        latestRelease: releaseData as AppRelease | null,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { app, loading, error, refetch: fetch };
}
