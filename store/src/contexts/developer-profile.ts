import { createContext } from "react";
import type { DeveloperProfile } from "@/lib/supabase/client";
import type { PhotonUser } from "@photon-os/sdk";

export type DeveloperProfileContextValue = {
  user: PhotonUser | null;
  profiles: DeveloperProfile[];
  activeProfile: DeveloperProfile | null;
  /** Backward-compatible alias for activeProfile. */
  profile: DeveloperProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasProfile: boolean;
  setActiveProfile: (profileId: string) => void;
  refetch: () => Promise<void>;
};

export const DeveloperProfileContext =
  createContext<DeveloperProfileContextValue | undefined>(undefined);
