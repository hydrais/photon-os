import { supabase } from "./client";

// JSON-serializable value types for preferences
export type PreferenceValue =
  | string
  | number
  | boolean
  | null
  | PreferenceValue[]
  | { [key: string]: PreferenceValue };

// ============ Sandboxed Preferences (app-specific) ============

export async function fetchSandboxedPreference(
  userId: string,
  bundleId: string,
  key: string
): Promise<PreferenceValue | null> {
  const { data, error } = await supabase
    .from("user_sandboxed_preferences")
    .select("value")
    .eq("user_id", userId)
    .eq("bundle_id", bundleId)
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch sandboxed preference:", error);
    throw error;
  }

  return data?.value ?? null;
}

export async function setSandboxedPreference(
  userId: string,
  bundleId: string,
  key: string,
  value: PreferenceValue
): Promise<void> {
  const { error } = await supabase
    .from("user_sandboxed_preferences")
    .upsert(
      {
        user_id: userId,
        bundle_id: bundleId,
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,bundle_id,key",
      }
    );

  if (error) {
    console.error("Failed to set sandboxed preference:", error);
    throw error;
  }
}

export async function deleteSandboxedPreference(
  userId: string,
  bundleId: string,
  key: string
): Promise<void> {
  const { error } = await supabase
    .from("user_sandboxed_preferences")
    .delete()
    .eq("user_id", userId)
    .eq("bundle_id", bundleId)
    .eq("key", key);

  if (error) {
    console.error("Failed to delete sandboxed preference:", error);
    throw error;
  }
}

// ============ Shared Preferences (global) ============

export async function fetchSharedPreference(
  userId: string,
  key: string
): Promise<PreferenceValue | null> {
  const { data, error } = await supabase
    .from("user_shared_preferences")
    .select("value")
    .eq("user_id", userId)
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch shared preference:", error);
    throw error;
  }

  return data?.value ?? null;
}

export async function setSharedPreference(
  userId: string,
  key: string,
  value: PreferenceValue
): Promise<void> {
  const { error } = await supabase
    .from("user_shared_preferences")
    .upsert(
      {
        user_id: userId,
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,key",
      }
    );

  if (error) {
    console.error("Failed to set shared preference:", error);
    throw error;
  }
}

export async function deleteSharedPreference(
  userId: string,
  key: string
): Promise<void> {
  const { error } = await supabase
    .from("user_shared_preferences")
    .delete()
    .eq("user_id", userId)
    .eq("key", key);

  if (error) {
    console.error("Failed to delete shared preference:", error);
    throw error;
  }
}
