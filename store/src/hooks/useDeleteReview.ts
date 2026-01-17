import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useDeleteReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteReview = async (reviewId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("app_reviews")
        .delete()
        .eq("id", reviewId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteReview, loading, error };
}
