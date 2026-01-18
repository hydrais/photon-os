import { useState, useCallback } from "react";
import { supabase, type AppCategory } from "@/lib/supabase/client";

export type UpdateAppData = {
  name: string;
  url: string;
  iconUrl?: string | null;
  description?: string | null;
  tagline?: string | null;
  category?: AppCategory | null;
};

export function useUpdateApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (appId: string, data: UpdateAppData): Promise<boolean> => {
      setLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from("store_apps")
        .update({
          name: data.name,
          url: data.url,
          icon_url: data.iconUrl || null,
          description: data.description || null,
          tagline: data.tagline || null,
          category: data.category || null,
        })
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

  return { update, loading, error };
}
