import { useState, useCallback } from "react";
import { supabase, type DeveloperProfile } from "@/lib/supabase/client";

export type UpdateProfileData = {
  displayName: string;
  description?: string;
};

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (
      profileId: string,
      data: UpdateProfileData
    ): Promise<DeveloperProfile | null> => {
      setLoading(true);
      setError(null);

      const { data: profile, error: updateError } = await supabase
        .from("developer_profiles")
        .update({
          display_name: data.displayName,
          description: data.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId)
        .select()
        .single();

      setLoading(false);

      if (updateError) {
        setError(updateError.message);
        return null;
      }

      return profile;
    },
    []
  );

  return { update, loading, error };
}
