import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export function useRelistApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const relist = useCallback(async (appId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("store_apps")
      .update({
        status: "listed",
        unlisted_at: null,
      })
      .eq("id", appId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return false;
    }

    return true;
  }, []);

  return { relist, loading, error };
}
