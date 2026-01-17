import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DeveloperProfile = {
  id: string;
  user_id: string;
  display_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type StoreApp = {
  id: string;
  bundle_id: string;
  name: string;
  author: string;
  url: string;
  description: string | null;
  submitted_at: string;
  updated_at: string;
  developer_id: string | null;
  developer_display_name: string | null;
  developer_description: string | null;
  status: "listed" | "unlisted";
  unlisted_at: string | null;
};

export type StoreInstallEvent = {
  id: string;
  user_id: string;
  app_id: string | null;
  bundle_id: string;
  installed_at: string;
};
