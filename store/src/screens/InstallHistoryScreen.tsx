import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AppRow } from "@/components/store/AppRow";
import { useInstallHistory } from "@/hooks/useInstallHistory";
import { useInstalledApps } from "@/hooks/useInstalledApps";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";

export function InstallHistoryScreen() {
  const { user } = useDeveloperProfile();
  const { history, loading, error } = useInstallHistory(user?.id);
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
          <h1 className="text-2xl font-semibold">Install History</h1>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            <p>Failed to load install history</p>
          </div>
        ) : !user ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Sign in to Photon OS to view your install history.
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No apps installed from the store yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((item) =>
              item.app ? (
                <AppRow
                  key={item.id}
                  app={item.app}
                  subtitle="date"
                  isInstalled={isInstalled(item.bundle_id)}
                  onInstalled={refreshInstalled}
                />
              ) : (
                <div key={item.id} className="py-3 text-muted-foreground">
                  {item.bundle_id} (app no longer available)
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
