import { useState, useEffect, useCallback } from "react";
import { supabase, type StoreApp } from "@/lib/supabase/client";

export function useMyApps(developerId: string | null) {
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    if (!developerId) {
      setApps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("store_apps")
      .select("*")
      .eq("developer_id", developerId)
      .order("submitted_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setApps([]);
    } else {
      setApps(data || []);
    }

    setLoading(false);
  }, [developerId]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  return { apps, loading, error, refetch: fetchApps };
}
