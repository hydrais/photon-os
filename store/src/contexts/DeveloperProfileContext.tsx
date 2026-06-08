import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { os } from "@/lib/os";
import { supabase, type DeveloperProfile } from "@/lib/supabase/client";
import type { PhotonUser } from "@photon-os/sdk";
import {
  DeveloperProfileContext,
  type DeveloperProfileContextValue,
} from "./developer-profile";

const ACTIVE_PROFILE_KEY_PREFIX = "photon-store:active-developer-profile:";

function activeProfileKey(userId: string) {
  return `${ACTIVE_PROFILE_KEY_PREFIX}${userId}`;
}

function readActiveProfileId(userId: string): string | null {
  try {
    return localStorage.getItem(activeProfileKey(userId));
  } catch {
    return null;
  }
}

function writeActiveProfileId(userId: string, profileId: string) {
  try {
    localStorage.setItem(activeProfileKey(userId), profileId);
  } catch {
    // Storage may be unavailable (private mode / disabled). Fall back to
    // in-memory state only.
  }
}

type State = {
  user: PhotonUser | null;
  profiles: DeveloperProfile[];
  activeProfileId: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
};

const initialState: State = {
  user: null,
  profiles: [],
  activeProfileId: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

export function DeveloperProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  // Guards against stale responses overwriting newer state (e.g. StrictMode
  // double-invoke in dev, or rapid refetches).
  const fetchTokenRef = useRef(0);

  const fetchProfiles = useCallback(async () => {
    const token = ++fetchTokenRef.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const user = await os.user.getCurrentUser();

      const { data, error } = await supabase
        .from("developer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      if (token !== fetchTokenRef.current) return;

      const profiles = data || [];

      // Resolve the active profile: prefer the persisted choice if it still
      // exists, otherwise fall back to the oldest profile and self-heal storage.
      let activeProfileId: string | null = null;
      if (profiles.length > 0) {
        const stored = readActiveProfileId(user.id);
        const storedIsValid =
          stored !== null && profiles.some((p) => p.id === stored);
        if (storedIsValid) {
          activeProfileId = stored;
        } else {
          const fallbackId = profiles[0].id;
          activeProfileId = fallbackId;
          writeActiveProfileId(user.id, fallbackId);
        }
      }

      setState({
        user,
        profiles,
        activeProfileId,
        loading: false,
        error: null,
        isAuthenticated: true,
      });
    } catch (err) {
      if (token !== fetchTokenRef.current) return;
      setState({
        user: null,
        profiles: [],
        activeProfileId: null,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to authenticate",
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const setActiveProfile = useCallback((profileId: string) => {
    setState((prev) => {
      if (!prev.profiles.some((p) => p.id === profileId)) {
        return prev;
      }
      if (prev.user) {
        writeActiveProfileId(prev.user.id, profileId);
      }
      return { ...prev, activeProfileId: profileId };
    });
  }, []);

  const activeProfile =
    state.profiles.find((p) => p.id === state.activeProfileId) ?? null;

  const value: DeveloperProfileContextValue = {
    user: state.user,
    profiles: state.profiles,
    activeProfile,
    profile: activeProfile,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    hasProfile: state.profiles.length > 0,
    setActiveProfile,
    refetch: fetchProfiles,
  };

  return (
    <DeveloperProfileContext.Provider value={value}>
      {children}
    </DeveloperProfileContext.Provider>
  );
}
