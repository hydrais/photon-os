import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { os } from "@/lib/os";
import type { StoreApp } from "@/lib/supabase/client";

type AppRowProps = {
  app: StoreApp;
  subtitle?: "author" | "date" | "updatedDate";
  isInstalled: boolean;
  onInstalled?: () => void;
};

export function AppRow({
  app,
  subtitle = "author",
  isInstalled,
  onInstalled,
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
      {/* App Icon Placeholder */}
      <div className="size-14 shrink-0 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-xl font-semibold">
        {app.name.charAt(0).toUpperCase()}
      </div>

      {/* App Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{app.name}</div>
        <div className="text-sm text-muted-foreground truncate">
          {subtitle === "author" && app.developer_id ? (
            <Link
              to={`/developer/${app.developer_id}`}
              className="hover:underline"
            >
              {subtitleText}
            </Link>
          ) : (
            subtitleText
          )}
        </div>
      </div>

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
