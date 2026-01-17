import { useState } from "react";
import { os } from "@/lib/os";
import { supabase } from "@/lib/supabase/client";

type SubmitReviewInput = {
  rating: number;
  comment: string | null;
};

export function useSubmitReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (appId: string, input: SubmitReviewInput): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const user = await os.user.getCurrentUser();

      const { error: upsertError } = await supabase
        .from("app_reviews")
        .upsert(
          {
            app_id: appId,
            user_id: user.id,
            rating: input.rating,
            comment: input.comment,
          },
          {
            onConflict: "app_id,user_id",
          }
        );

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}
