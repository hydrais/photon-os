import { useState, useCallback } from "react";
import { supabase, type DeveloperProfile } from "@/lib/supabase/client";

export type CreateProfileData = {
  userId: string;
  displayName: string;
  description?: string;
};

export function useCreateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (data: CreateProfileData): Promise<DeveloperProfile | null> => {
      setLoading(true);
      setError(null);

      const { data: profile, error: insertError } = await supabase
        .from("developer_profiles")
        .insert({
          user_id: data.userId,
          display_name: data.displayName,
          description: data.description || null,
        })
        .select()
        .single();

      setLoading(false);

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      return profile;
    },
    []
  );

  return { create, loading, error };
}
