import { useCallback, useState } from "react";
import { supabase } from "../lib/supabase/client";

export function useRecordInstall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const recordInstall = useCallback(
    async (userId: string, appId: string, bundleId: string) => {
      setLoading(true);
      setError(null);
      try {
        const { error: insertError } = await supabase
          .from("store_install_events")
          .upsert(
            { user_id: userId, app_id: appId, bundle_id: bundleId },
            { onConflict: "user_id,bundle_id" }
          );

        if (insertError) {
          throw new Error(insertError.message);
        }
        return true;
      } catch (err) {
        setError(err as Error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { recordInstall, loading, error };
}
