import { supabase } from "./client";

// Permission types - will be exported from SDK in future versions
export type PermissionType = "devices";
export type PermissionStatus = "granted" | "denied" | "not_requested";

export type AppPermissionRecord = {
  id: string;
  user_id: string;
  bundle_id: string;
  permission_type: PermissionType;
  granted: boolean;
  granted_at: string;
  updated_at: string;
};

/**
 * Fetch a specific permission for an app
 * Returns: true (granted), false (denied), or null (not yet requested)
 */
export async function fetchPermission(
  userId: string,
  bundleId: string,
  permissionType: PermissionType
): Promise<boolean | null> {
  const { data, error } = await supabase
    .from("user_app_permissions")
    .select("granted")
    .eq("user_id", userId)
    .eq("bundle_id", bundleId)
    .eq("permission_type", permissionType)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch permission:", error);
    throw error;
  }

  return data?.granted ?? null;
}

/**
 * Set (grant or deny) a permission for an app
 */
export async function setPermission(
  userId: string,
  bundleId: string,
  permissionType: PermissionType,
  granted: boolean
): Promise<void> {
  const { error } = await supabase.from("user_app_permissions").upsert(
    {
      user_id: userId,
      bundle_id: bundleId,
      permission_type: permissionType,
      granted,
      granted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "user_id,bundle_id,permission_type",
    }
  );

  if (error) {
    console.error("Failed to set permission:", error);
    throw error;
  }
}

/**
 * Delete a permission record (resets to "not_requested" state)
 */
export async function deletePermission(
  userId: string,
  bundleId: string,
  permissionType: PermissionType
): Promise<void> {
  const { error } = await supabase
    .from("user_app_permissions")
    .delete()
    .eq("user_id", userId)
    .eq("bundle_id", bundleId)
    .eq("permission_type", permissionType);

  if (error) {
    console.error("Failed to delete permission:", error);
    throw error;
  }
}

/**
 * Fetch all permissions for a specific app
 */
export async function fetchAppPermissions(
  userId: string,
  bundleId: string
): Promise<Record<PermissionType, boolean | null>> {
  const { data, error } = await supabase
    .from("user_app_permissions")
    .select("permission_type, granted")
    .eq("user_id", userId)
    .eq("bundle_id", bundleId);

  if (error) {
    console.error("Failed to fetch app permissions:", error);
    throw error;
  }

  // Build a record with all permission types, defaulting to null (not requested)
  const permissions: Record<PermissionType, boolean | null> = {
    devices: null,
  };

  for (const row of data || []) {
    permissions[row.permission_type as PermissionType] = row.granted;
  }

  return permissions;
}

/**
 * Fetch all permissions for all apps for a user
 */
export async function fetchAllPermissionsForUser(
  userId: string
): Promise<Record<string, Record<PermissionType, boolean | null>>> {
  const { data, error } = await supabase
    .from("user_app_permissions")
    .select("bundle_id, permission_type, granted")
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to fetch all permissions:", error);
    throw error;
  }

  const result: Record<string, Record<PermissionType, boolean | null>> = {};

  for (const row of data || []) {
    if (!result[row.bundle_id]) {
      result[row.bundle_id] = { devices: null };
    }
    result[row.bundle_id][row.permission_type as PermissionType] = row.granted;
  }

  return result;
}
