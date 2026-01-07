import { supabase } from "./client";
import type { AppDefinition } from "@photon-os/sdk";

type UserInstalledAppRow = {
  id: string;
  user_id: string;
  bundle_id: string;
  name: string;
  author: string;
  url: string;
  installed_at: string;
};

function rowToAppDefinition(row: UserInstalledAppRow): AppDefinition {
  return {
    bundleId: row.bundle_id,
    name: row.name,
    author: row.author,
    url: row.url,
  };
}

export async function fetchInstalledApps(): Promise<AppDefinition[]> {
  const { data, error } = await supabase
    .from("user_installed_apps")
    .select("*")
    .order("installed_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch installed apps:", error);
    throw error;
  }

  return (data ?? []).map(rowToAppDefinition);
}

export async function insertInstalledApp(
  userId: string,
  app: AppDefinition
): Promise<void> {
  const { error } = await supabase.from("user_installed_apps").insert({
    user_id: userId,
    bundle_id: app.bundleId,
    name: app.name,
    author: app.author,
    url: app.url,
  });

  if (error) {
    // Handle unique constraint violation gracefully
    if (error.code === "23505") {
      console.warn("App already installed:", app.bundleId);
      return;
    }
    console.error("Failed to install app:", error);
    throw error;
  }
}

export async function deleteInstalledApp(
  userId: string,
  bundleId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_installed_apps")
    .delete()
    .eq("user_id", userId)
    .eq("bundle_id", bundleId);

  if (error) {
    console.error("Failed to uninstall app:", error);
    throw error;
  }
}
