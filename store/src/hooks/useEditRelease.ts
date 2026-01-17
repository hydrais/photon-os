import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export type EditReleaseData = {
  version: string;
  releaseNotes: string | null;
};

export function useEditRelease() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const edit = useCallback(
    async (releaseId: string, data: EditReleaseData): Promise<boolean> => {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from("app_releases")
        .update({
          version: data.version,
          release_notes: data.releaseNotes,
        })
        .eq("id", releaseId);

      setLoading(false);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      return true;
    },
    []
  );

  return { edit, loading, error };
}
