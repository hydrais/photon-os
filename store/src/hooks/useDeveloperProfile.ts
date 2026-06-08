import { useContext } from "react";
import {
  DeveloperProfileContext,
  type DeveloperProfileContextValue,
} from "@/contexts/developer-profile";

/**
 * Access the current user's developer profiles and the active profile.
 *
 * Backed by DeveloperProfileProvider so the active-profile selection is shared
 * across the whole app. `profile` is an alias for `activeProfile` for
 * backward compatibility with existing call sites.
 */
export function useDeveloperProfile(): DeveloperProfileContextValue {
  const ctx = useContext(DeveloperProfileContext);
  if (!ctx) {
    throw new Error(
      "useDeveloperProfile must be used within a DeveloperProfileProvider"
    );
  }
  return ctx;
}
