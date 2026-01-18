import { useState, useEffect, useCallback } from "react";
import { supabase, type StoreApp, type AppCategory } from "@/lib/supabase/client";

export type DiscoverFilter = "featured" | "top-rated" | "new";

export function useDiscoverApps(filter: DiscoverFilter, category?: AppCategory | null) {
  const [apps, setApps] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase.from("store_apps").select("*").eq("status", "listed");

    if (category) {
      query = query.eq("category", category);
    }

    switch (filter) {
      case "featured":
        query = query
          .eq("featured", true)
          .order("submitted_at", { ascending: false });
        break;
      case "top-rated":
        query = query
          .not("average_rating", "is", null)
          .order("average_rating", { ascending: false })
          .order("review_count", { ascending: false });
        break;
      case "new":
        query = query.order("updated_at", { ascending: false }).limit(50);
        break;
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
      setApps([]);
    } else {
      setApps(data || []);
    }

    setLoading(false);
  }, [filter, category]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  return { apps, loading, error, refetch: fetchApps };
}
