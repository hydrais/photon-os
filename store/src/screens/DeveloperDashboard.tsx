import { Link, useNavigate } from "react-router";
import { Plus } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DeveloperAppCard } from "@/components/dashboard/DeveloperAppCard";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { useMyApps } from "@/hooks/useMyApps";
import { PhotonNavBar } from "@/components/ui/photon/nav-bar";
import { PhotonNavBarBackButton } from "@/components/ui/photon/nav-bar-back-button";
import { PhotonNavBarTitle } from "@/components/ui/photon/nav-bar-title";
import { PhotonSectionHeader } from "@/components/ui/photon/section-header";
import { PhotonContentArea } from "@/components/ui/photon/content-area";

function StoreDashboardContent() {
  const { profile } = useDeveloperProfile();
  const { apps, loading, refetch } = useMyApps(profile?.id || null);
  const navigate = useNavigate();

  const listedApps = apps.filter((app) => app.status === "listed");
  const unlistedApps = apps.filter((app) => app.status === "unlisted");

  return (
    <>
      <PhotonNavBar>
        <PhotonNavBarBackButton onClick={() => navigate("/more")} />

        <PhotonNavBarTitle>Your Apps</PhotonNavBarTitle>

        <Button asChild>
          <Link to="/submit">
            <Plus />
            List New App
          </Link>
        </Button>
      </PhotonNavBar>

      <PhotonContentArea>
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Spinner />
          </div>
        ) : listedApps.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No apps yet</EmptyTitle>
              <EmptyDescription>
                You haven't listed any apps in the store yet.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link to="/submit">List Your First App</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {listedApps.length > 0 && (
              <section>
                <PhotonSectionHeader>
                  Listed ({listedApps.length})
                </PhotonSectionHeader>

                <div className="grid gap-4 sm:grid-cols-2">
                  {listedApps.map((app) => (
                    <DeveloperAppCard
                      key={app.id}
                      app={app}
                      onUpdate={refetch}
                    />
                  ))}
                </div>
              </section>
            )}

            {unlistedApps.length > 0 && (
              <section>
                <PhotonSectionHeader>
                  Unlisted ({unlistedApps.length})
                </PhotonSectionHeader>

                <div className="grid gap-4 sm:grid-cols-2">
                  {unlistedApps.map((app) => (
                    <DeveloperAppCard
                      key={app.id}
                      app={app}
                      onUpdate={refetch}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </PhotonContentArea>
    </>
  );
}

export function StoreDashboardScreen() {
  return (
    <AuthGuard requireProfile>
      <StoreDashboardContent />
    </AuthGuard>
  );
}
