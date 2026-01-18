import { StarRating } from "./StarRating";
import type { AppReview } from "@/lib/supabase/client";

type ReviewListProps = {
  reviews: AppReview[];
  currentUserId?: string | null;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ReviewList({ reviews, currentUserId }: ReviewListProps) {
  const otherReviews = reviews.filter((r) => r.user_id !== currentUserId);

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No reviews yet. Be the first to review this app!
      </p>
    );
  }

  if (otherReviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No reviews from other users yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {otherReviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <StarRating rating={review.rating} size="sm" />
            <span className="text-xs text-muted-foreground">
              {formatDate(review.created_at)}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
