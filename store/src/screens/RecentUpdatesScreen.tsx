import { useNavigate } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import { AppRow } from "@/components/store/AppRow";
import { useRecentUpdates } from "@/hooks/useRecentUpdates";
import { useInstalledApps } from "@/hooks/useInstalledApps";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarBackButton } from "@/components/ui/photon/nav-bar-back-button";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonContentArea } from "@/components/ui/photon/content-area";

export function RecentUpdatesScreen() {
  const navigate = useNavigate();
  const { user } = useDeveloperProfile();
  const { updates, loading, error } = useRecentUpdates(user?.id);
  const { isInstalled, refresh: refreshInstalled } = useInstalledApps();

  return (
    <>
      <PhotonNavBar>
        <PhotonNavBarBackButton onClick={() => navigate("/more")} />
        <PhotonNavBarTitle>Recent Updates</PhotonNavBarTitle>
      </PhotonNavBar>

      <PhotonContentArea>
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
      </PhotonContentArea>
    </>
  );
}
