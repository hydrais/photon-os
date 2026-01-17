import { useState, useEffect, useCallback } from "react";
import { os } from "@/lib/os";
import { supabase, type DeveloperProfile } from "@/lib/supabase/client";
import type { PhotonUser } from "@photon-os/sdk";

type DeveloperProfileState = {
  user: PhotonUser | null;
  profile: DeveloperProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasProfile: boolean;
};

export function useDeveloperProfile() {
  const [state, setState] = useState<DeveloperProfileState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    hasProfile: false,
  });

  const fetchProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Get current user from Photon OS
      const user = await os.user.getCurrentUser();

      // Fetch developer profile from database
      const { data, error } = await supabase
        .from("developer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned (expected for new users)
        throw new Error(error.message);
      }

      setState({
        user,
        profile: data || null,
        loading: false,
        error: null,
        isAuthenticated: true,
        hasProfile: !!data,
      });
    } catch (err) {
      setState({
        user: null,
        profile: null,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to authenticate",
        isAuthenticated: false,
        hasProfile: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { ...state, refetch: fetchProfile };
}
