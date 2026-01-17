import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export function useDeleteApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteApp = useCallback(async (appId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("store_apps")
      .delete()
      .eq("id", appId);

    setLoading(false);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    return true;
  }, []);

  return { deleteApp, loading, error };
}
