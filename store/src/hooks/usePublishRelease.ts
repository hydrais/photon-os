import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export type PublishReleaseData = {
  version: string;
  releaseNotes?: string | null;
};

export function usePublishRelease() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publish = useCallback(
    async (appId: string, data: PublishReleaseData): Promise<boolean> => {
      setLoading(true);
      setError(null);

      // Insert the release
      const { error: releaseError } = await supabase
        .from("app_releases")
        .insert({
          app_id: appId,
          version: data.version,
          release_notes: data.releaseNotes || null,
        });

      if (releaseError) {
        setLoading(false);
        setError(releaseError.message);
        return false;
      }

      // Update current_version on store_apps
      const { error: updateError } = await supabase
        .from("store_apps")
        .update({ current_version: data.version })
        .eq("id", appId);

      setLoading(false);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      return true;
    },
    []
  );

  return { publish, loading, error };
}
