import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AppRow } from "@/components/store/AppRow";
import { useRecentUpdates } from "@/hooks/useRecentUpdates";
import { useInstalledApps } from "@/hooks/useInstalledApps";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";

export function RecentUpdatesScreen() {
  const { user } = useDeveloperProfile();
  const { updates, loading, error } = useRecentUpdates(user?.id);
  const { isInstalled, refresh: refreshInstalled } = useInstalledApps();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <header className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon-sm">
            <Link to="/more">
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Recent Updates</h1>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>Failed to load updates</p>
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Sign in to Photon OS to view app updates.
            </p>
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No recently updated apps.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {updates.map((app) => (
              <AppRow
                key={app.id}
                app={app}
                subtitle="updatedDate"
                isInstalled={isInstalled(app.bundle_id)}
                onInstalled={refreshInstalled}
                latestRelease={app.latestRelease ?? undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
