import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AppReview } from "@/lib/supabase/client";

export function useAppReviews(appId: string | undefined) {
  const [reviews, setReviews] = useState<AppReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!appId) {
      setReviews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("app_reviews")
        .select("*")
        .eq("app_id", appId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setReviews(data as AppReview[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { reviews, loading, error, refetch: fetch };
}
