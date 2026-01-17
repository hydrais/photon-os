import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export function useUnlistApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlist = useCallback(async (appId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("store_apps")
      .update({
        status: "unlisted",
        unlisted_at: new Date().toISOString(),
      })
      .eq("id", appId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return false;
    }

    return true;
  }, []);

  return { unlist, loading, error };
}
