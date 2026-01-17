import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase/client";
import type { StoreApp, StoreInstallEvent } from "../lib/supabase/client";

export type InstallHistoryItem = StoreInstallEvent & {
  app: StoreApp | null;
};

export function useInstallHistory(userId: string | undefined) {
  const [history, setHistory] = useState<InstallHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("store_install_events")
        .select(
          `
          *,
          app:store_apps(*)
        `
        )
        .eq("user_id", userId)
        .order("installed_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setHistory(data as InstallHistoryItem[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { history, loading, error, refetch: fetch };
}
