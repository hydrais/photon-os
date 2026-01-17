import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AppRelease } from "@/lib/supabase/client";

export function useAppReleases(appId: string | undefined) {
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!appId) {
      setReleases([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("app_releases")
        .select("*")
        .eq("app_id", appId)
        .order("published_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setReleases(data as AppRelease[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { releases, loading, error, refetch: fetch };
}
