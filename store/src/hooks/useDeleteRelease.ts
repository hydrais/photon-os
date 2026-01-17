import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export function useDeleteRelease() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRelease = useCallback(async (releaseId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    console.log("useDeleteRelease: deleting", releaseId);
    const { error: deleteError, data } = await supabase
      .from("app_releases")
      .delete()
      .eq("id", releaseId)
      .select();

    console.log("useDeleteRelease: result", { deleteError, data });
    setLoading(false);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    return true;
  }, []);

  return { deleteRelease, loading, error };
}
