import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { StarRating } from "./StarRating";
import type { AppReview } from "@/lib/supabase/client";

type ReviewFormProps = {
  existingReview?: AppReview | null;
  onSubmit: (rating: number, comment: string | null) => Promise<boolean>;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
};

export function ReviewForm({
  existingReview,
  onSubmit,
  onCancel,
  loading = false,
  error,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    const success = await onSubmit(rating, comment.trim() || null);
    if (success && !existingReview) {
      setRating(0);
      setComment("");
    }
  };

  const isEditing = !!existingReview;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Your Rating</label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onRatingChange={setRating}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Comment (optional)</label>
        <Textarea
          placeholder="Share your experience with this app..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || rating === 0}>
          {loading ? <Spinner className="size-4" /> : isEditing ? "Update Review" : "Submit Review"}
        </Button>
      </div>
    </form>
  );
}
