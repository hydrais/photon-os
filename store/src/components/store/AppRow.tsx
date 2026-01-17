import { useState } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ReleaseNotePreview } from "@/components/store/ReleaseNotePreview";
import { os } from "@/lib/os";
import type { StoreApp, AppRelease } from "@/lib/supabase/client";

type AppRowProps = {
  app: StoreApp;
  subtitle?: "author" | "date" | "updatedDate";
  isInstalled: boolean;
  onInstalled?: () => void;
  latestRelease?: AppRelease;
};

export function AppRow({
  app,
  subtitle = "author",
  isInstalled,
  onInstalled,
  latestRelease,
}: AppRowProps) {
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await os.apps.requestAppInstall({
        bundleId: app.bundle_id,
        name: app.name,
        author: app.author,
        url: app.url,
      });
      onInstalled?.();
    } catch (error) {
      console.error("Failed to request app install:", error);
    } finally {
      setInstalling(false);
    }
  };

  const handleOpen = async () => {
    try {
      await os.apps.launchApp({
        bundleId: app.bundle_id,
        name: app.name,
        author: app.author,
        url: app.url,
      });
    } catch (error) {
      console.error("Failed to launch app:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSubtitleText = () => {
    switch (subtitle) {
      case "date":
        return formatDate(app.submitted_at);
      case "updatedDate":
        return `Updated ${formatDate(app.updated_at)}`;
      default:
        return app.author;
    }
  };

  const subtitleText = getSubtitleText();

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Clickable area linking to app detail */}
      <Link
        to={`/app/${app.id}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        {/* App Icon Placeholder */}
        <div className="size-14 shrink-0 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xl font-semibold">
          {app.name.charAt(0).toUpperCase()}
        </div>

        {/* App Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{app.name}</div>
          <div className="text-sm text-muted-foreground truncate">
            {subtitleText}
          </div>
          {latestRelease && (
            <div className="mt-1">
              <ReleaseNotePreview release={latestRelease} maxLength={50} />
            </div>
          )}
        </div>
      </Link>

      {/* Action Button */}
      <Button
        size="sm"
        variant={isInstalled ? "secondary" : "default"}
        onClick={isInstalled ? handleOpen : handleInstall}
        disabled={installing}
        className="shrink-0 min-w-[70px]"
      >
        {installing ? (
          <Spinner className="size-4" />
        ) : isInstalled ? (
          "Open"
        ) : (
          "Install"
        )}
      </Button>
    </div>
  );
}
