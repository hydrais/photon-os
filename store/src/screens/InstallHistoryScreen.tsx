import { useNavigate } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import { AppRow } from "@/components/store/AppRow";
import { useInstallHistory } from "@/hooks/useInstallHistory";
import { useInstalledApps } from "@/hooks/useInstalledApps";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarBackButton } from "@/components/ui/photon/nav-bar-back-button";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonContentArea } from "@/components/ui/photon/content-area";

export function InstallHistoryScreen() {
  const navigate = useNavigate();
  const { user } = useDeveloperProfile();
  const { history, loading, error } = useInstallHistory(user?.id);
  const { isInstalled, refresh: refreshInstalled } = useInstalledApps();

  return (
    <>
      <PhotonNavBar>
        <PhotonNavBarBackButton onClick={() => navigate("/more")} />
        <PhotonNavBarTitle>Install History</PhotonNavBarTitle>
      </PhotonNavBar>

      <PhotonContentArea>
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
      </PhotonContentArea>
    </>
  );
}
