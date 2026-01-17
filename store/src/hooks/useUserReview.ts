import { useCallback, useEffect, useState } from "react";
import { os } from "@/lib/os";
import { supabase } from "@/lib/supabase/client";
import type { AppReview } from "@/lib/supabase/client";

export function useUserReview(appId: string | undefined) {
  const [review, setReview] = useState<AppReview | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!appId) {
      setReview(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await os.user.getCurrentUser();
      setUserId(user.id);

      const { data, error: fetchError } = await supabase
        .from("app_reviews")
        .select("*")
        .eq("app_id", appId)
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw new Error(fetchError.message);
      }

      setReview(data || null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { review, userId, loading, error, refetch: fetch };
}
