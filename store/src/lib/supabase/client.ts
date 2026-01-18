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

export type AppCategory = "avatar" | "tools" | "games" | "social" | "media" | "education";

export type Category = {
  id: string;
  slug: AppCategory;
  name: string;
  description: string | null;
  created_at: string;
};

export type StoreApp = {
  id: string;
  bundle_id: string;
  name: string;
  author: string;
  url: string;
  icon_url: string | null;
  description: string | null;
  tagline: string | null;
  submitted_at: string;
  updated_at: string;
  developer_id: string | null;
  developer_display_name: string | null;
  developer_description: string | null;
  status: "listed" | "unlisted";
  unlisted_at: string | null;
  current_version: string | null;
  average_rating: number | null;
  review_count: number;
  featured: boolean;
  category: AppCategory | null;
};

export type AppRelease = {
  id: string;
  app_id: string;
  version: string;
  release_notes: string | null;
  published_at: string;
};

export type StoreInstallEvent = {
  id: string;
  user_id: string;
  app_id: string | null;
  bundle_id: string;
  installed_at: string;
};

export type AppReview = {
  id: string;
  app_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};
