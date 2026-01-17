import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StarRating } from "@/components/store/StarRating";
import { useAppReviews } from "@/hooks/useAppReviews";
import { useDeleteReview } from "@/hooks/useDeleteReview";
import type { AppReview, StoreApp } from "@/lib/supabase/client";

type ReviewManagementProps = {
  app: StoreApp;
  onStatsChange?: () => void;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ReviewManagement({ app, onStatsChange }: ReviewManagementProps) {
  const { reviews, loading, refetch } = useAppReviews(app.id);
  const { deleteReview, loading: deleting, error: deleteError } = useDeleteReview();
  const [deleteTarget, setDeleteTarget] = useState<AppReview | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const success = await deleteReview(deleteTarget.id);

    if (success) {
      setDeleteTarget(null);
      refetch();
      onStatsChange?.();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rating Stats */}
      <div className="flex items-center gap-4 pb-4 border-b">
        {app.review_count > 0 ? (
          <>
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(app.average_rating || 0)} size="md" />
              <span className="text-lg font-semibold">
                {app.average_rating?.toFixed(1)}
              </span>
            </div>
            <span className="text-muted-foreground">
              {app.review_count} {app.review_count === 1 ? "review" : "reviews"}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">No reviews yet</span>
        )}
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">No reviews to display</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteTarget(review)}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
              {review.comment ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {review.comment}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No comment
                </p>
              )}
              <p className="text-xs text-muted-foreground/60">
                User: {review.user_id}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive px-6">{deleteError}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner className="size-4" /> : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
