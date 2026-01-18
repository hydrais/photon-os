import { useParams, Navigate } from "react-router";
import { DiscoverScreen } from "./DiscoverScreen";
import type { AppCategory } from "@/lib/supabase/client";

const validCategories: AppCategory[] = [
  "avatar",
  "tools",
  "games",
  "social",
  "media",
  "education",
];

export function CategoryScreen() {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  if (!categorySlug || !validCategories.includes(categorySlug as AppCategory)) {
    return <Navigate to="/more" replace />;
  }

  return <DiscoverScreen category={categorySlug as AppCategory} />;
}
