import { Link } from "react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DeveloperAppCard } from "@/components/dashboard/DeveloperAppCard";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import { useMyApps } from "@/hooks/useMyApps";

function DeveloperDashboardContent() {
  const { profile } = useDeveloperProfile();
  const { apps, loading, refetch } = useMyApps(profile?.id || null);

  const listedApps = apps.filter((app) => app.status === "listed");
  const unlistedApps = apps.filter((app) => app.status === "unlisted");

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <header className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/">
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Back to Store
            </Link>
          </Button>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold">My Apps</h1>
            <Button asChild size="sm">
              <Link to="/submit">
                <Plus className="size-4" data-icon="inline-start" />
                List New App
              </Link>
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-8" />
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No apps yet</h2>
            <p className="text-muted-foreground mb-4">
              You haven't listed any apps in the store yet.
            </p>
            <Button asChild>
              <Link to="/submit">
                <Plus className="size-4" data-icon="inline-start" />
                List Your First App
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {listedApps.length > 0 && (
              <section>
                <h2 className="text-lg font-medium mb-4">
                  Listed ({listedApps.length})
                </h2>
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
                <h2 className="text-lg font-medium mb-4">
                  Unlisted ({unlistedApps.length})
                </h2>
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
          </div>
        )}
      </div>
    </div>
  );
}

export function DeveloperDashboardScreen() {
  return (
    <AuthGuard requireProfile>
      <DeveloperDashboardContent />
    </AuthGuard>
  );
}
