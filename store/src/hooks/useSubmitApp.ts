import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export type SubmitAppData = {
  bundleId: string;
  name: string;
  url: string;
  iconUrl?: string;
  description?: string;
  developerId: string;
  developerDisplayName: string;
};

export function useSubmitApp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: SubmitAppData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("store_apps").insert({
      bundle_id: data.bundleId,
      name: data.name,
      author: data.developerDisplayName,
      url: data.url,
      icon_url: data.iconUrl || null,
      description: data.description || null,
      developer_id: data.developerId,
    });

    setLoading(false);

    if (insertError) {
      if (insertError.code === "23505") {
        setError("An app with this Bundle ID already exists");
      } else {
        setError(insertError.message);
      }
      return false;
    }

    return true;
  }, []);

  return { submit, loading, error };
}
