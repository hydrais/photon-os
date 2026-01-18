import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ChangelogList } from "@/components/store/ChangelogList";
import { StarRating } from "@/components/store/StarRating";
import { ReviewForm } from "@/components/store/ReviewForm";
import { ReviewList } from "@/components/store/ReviewList";
import { AppIconImage } from "@/components/store/AppIconImage";
import { useAppDetail } from "@/hooks/useAppDetail";
import { useAppReleases } from "@/hooks/useAppReleases";
import { useAppReviews } from "@/hooks/useAppReviews";
import { useUserReview } from "@/hooks/useUserReview";
import { useSubmitReview } from "@/hooks/useSubmitReview";
import { useInstalledApps } from "@/hooks/useInstalledApps";
import { os } from "@/lib/os";
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarBackButton } from "@/components/ui/photon/nav-bar-back-button";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonContentArea } from "@/components/ui/photon/content-area";

export function AppDetailScreen() {
  const navigate = useNavigate();

  const { appId } = useParams<{ appId: string }>();
  const { app, loading, error, refetch: refetchApp } = useAppDetail(appId);
  const { releases, loading: releasesLoading } = useAppReleases(appId);
  const { reviews, refetch: refetchReviews } = useAppReviews(appId);
  const {
    review: userReview,
    userId,
    refetch: refetchUserReview,
  } = useUserReview(appId);
  const {
    submit: submitReview,
    loading: submitting,
    error: submitError,
  } = useSubmitReview();
  const { isInstalled, refresh: refreshInstalled } = useInstalledApps();
  const [installing, setInstalling] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(false);

  const installed = app ? isInstalled(app.bundle_id) : false;

  const handleInstall = async () => {
    if (!app) return;
    setInstalling(true);
    try {
      await os.apps.requestAppInstall({
        bundleId: app.bundle_id,
        name: app.name,
        author: app.author,
        url: app.url,
        icon: app.icon_url ?? undefined,
      });
      refreshInstalled();
    } catch (err) {
      console.error("Failed to request app install:", err);
    } finally {
      setInstalling(false);
    }
  };

  const handleOpen = async () => {
    if (!app) return;
    try {
      await os.apps.launchApp({
        bundleId: app.bundle_id,
        name: app.name,
        author: app.author,
        url: app.url,
        icon: app.icon_url ?? undefined,
      });
    } catch (err) {
      console.error("Failed to launch app:", err);
    }
  };

  const handleSubmitReview = async (
    rating: number,
    comment: string | null,
  ): Promise<boolean> => {
    if (!appId) return false;
    const success = await submitReview(appId, { rating, comment });
    if (success) {
      setShowReviewForm(false);
      setEditingReview(false);
      refetchUserReview();
      refetchReviews();
      refetchApp();
    }
    return success;
  };

  if (loading) {
    return (
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate(-1)} />
          <PhotonNavBarTitle>App Details</PhotonNavBarTitle>
        </PhotonNavBar>
        <PhotonContentArea>
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-8" />
          </div>
        </PhotonContentArea>
      </>
    );
  }

  if (error || !app) {
    return (
      <>
        <PhotonNavBar>
          <PhotonNavBarBackButton onClick={() => navigate(-1)} />
          <PhotonNavBarTitle>App Details</PhotonNavBarTitle>
        </PhotonNavBar>
        <PhotonContentArea>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">App Not Found</h2>
            <p className="text-muted-foreground">
              The app you're looking for doesn't exist.
            </p>
          </div>
        </PhotonContentArea>
      </>
    );
  }

  return (
    <>
      <PhotonNavBar>
        <PhotonNavBarBackButton onClick={() => navigate(-1)} />
        <PhotonNavBarTitle>{app.name}</PhotonNavBarTitle>
      </PhotonNavBar>

      <PhotonContentArea>
        {/* App Header */}
        <div className="flex flex-col gap-4 ">
          <div className="flex items-center gap-4 p-2 pb-0">
            <AppIconImage iconUrl={app.icon_url} appName={app.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{app.name}</h1>
              {app.tagline && (
                <p className="text-muted-foreground">{app.tagline}</p>
              )}
            </div>
          </div>

          {/* Install/Open Button */}
          <Button
            onClick={installed ? handleOpen : handleInstall}
            disabled={installing}
            className="w-full"
          >
            {installing ? (
              <Spinner className="size-4" />
            ) : installed ? (
              "Open"
            ) : (
              "Install"
            )}
          </Button>
        </div>

        <div className="flex flex-row divide-x bg-gray-100 rounded-lg">
          <div className="flex flex-col gap-2 py-4 px-2 flex-1 items-center justify-center">
            <h3 className="text-xs text-muted-foreground">Rating</h3>
            <div className="flex flex-row gap-1 items-center">
              <Star className={"fill-yellow-400 text-yellow-400 size-4"} />{" "}
              {app.average_rating?.toFixed(1)}
            </div>
          </div>
          <div className="flex flex-col gap-2 p-2 flex-1 items-center justify-center">
            <h3 className="text-xs text-muted-foreground">Author</h3>
            <p className="text-sm text-foreground">{app.author}</p>
          </div>
          <div className="flex flex-col gap-2 p-2 flex-1 items-center justify-center">
            <h3 className="text-xs text-muted-foreground">Version</h3>
            <p className="text-sm text-foreground">v{app.current_version}</p>
          </div>
        </div>

        {/* Description */}
        {app.description && (
          <>
            <div>
              <h2 className="text-lg font-semibold mb-2">About</h2>
              <p className="text-muted-foreground whitespace-pre-wrap text-sm">
                {app.description}
              </p>
            </div>
          </>
        )}

        {/* Latest Release */}
        {app.latestRelease && (
          <>
            <Separator className="my-2" />
            <div>
              <h2 className="text-lg font-semibold mb-2">What's New</h2>
              <p className="text-xs text-muted-foreground mb-1">
                Version {app.latestRelease.version}
              </p>
              {app.latestRelease.release_notes ? (
                <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                  {app.latestRelease.release_notes}
                </p>
              ) : (
                <p className="text-muted-foreground text-sm italic">
                  No release notes for this version.
                </p>
              )}
            </div>
          </>
        )}

        {/* Changelog */}
        {releases.length > 0 && (
          <>
            <Separator className="my-2" />
            <div>
              <h2 className="text-lg font-semibold mb-4">Changelog</h2>
              {releasesLoading ? (
                <Spinner className="size-4" />
              ) : (
                <ChangelogList releases={releases} />
              )}
            </div>
          </>
        )}

        {/* Reviews */}
        <Separator className="my-2" />
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-semibold">Reviews</h2>

            {app.review_count > 0 && (
              <div className="flex items-center gap-2">
                <StarRating
                  rating={Math.round(app.average_rating || 0)}
                  size="sm"
                />
                <span className="text-sm text-muted-foreground">
                  {app.average_rating?.toFixed(1)} ({app.review_count}{" "}
                  {app.review_count === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>

          {/* User's Review Section */}
          {userReview && !editingReview ? (
            <div className="border rounded-lg p-4 mb-4 bg-muted/30 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Your Review</span>
                  <StarRating rating={userReview.rating} size="sm" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingReview(true)}
                >
                  <Pencil className="size-4" data-icon="inline-start" />
                  Edit
                </Button>
              </div>
              {userReview.comment && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {userReview.comment}
                </p>
              )}
            </div>
          ) : editingReview ? (
            <div className="border rounded-lg p-4 mb-4 bg-muted/30">
              <h4 className="text-sm font-medium mb-3">Edit Your Review</h4>
              <ReviewForm
                existingReview={userReview}
                onSubmit={handleSubmitReview}
                onCancel={() => setEditingReview(false)}
                loading={submitting}
                error={submitError}
              />
            </div>
          ) : showReviewForm ? (
            <div className="border rounded-lg p-4 mb-4 bg-muted/30">
              <h4 className="text-sm font-medium mb-3">Write a Review</h4>
              <ReviewForm
                onSubmit={handleSubmitReview}
                onCancel={() => setShowReviewForm(false)}
                loading={submitting}
                error={submitError}
              />
            </div>
          ) : (
            <Button
              variant="outline"
              className="mb-4"
              onClick={() => setShowReviewForm(true)}
            >
              Write a Review
            </Button>
          )}

          {/* Other Reviews */}
          <ReviewList reviews={reviews} currentUserId={userId} />
        </div>
      </PhotonContentArea>
    </>
  );
}
