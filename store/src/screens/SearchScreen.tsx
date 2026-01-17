import { SearchBar } from "@/components/store/SearchBar";
import { AppRow } from "@/components/store/AppRow";
import { Spinner } from "@/components/ui/spinner";
import { useSearchApps } from "@/hooks/useSearchApps";
import { useInstalledApps } from "@/hooks/useInstalledApps";
import { useRecordInstall } from "@/hooks/useRecordInstall";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";

export function SearchScreen() {
  const { results, loading, query, search } = useSearchApps();
  const { isInstalled, refresh: refreshInstalled } = useInstalledApps();
  const { recordInstall } = useRecordInstall();
  const { user } = useDeveloperProfile();

  const handleInstalled = async (appId: string, bundleId: string) => {
    if (user) {
      await recordInstall(user.id, appId, bundleId);
    }
    refreshInstalled();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Search</h1>
        </header>

        <div className="mb-6">
          <SearchBar
            value={query}
            onChange={search}
            loading={loading && query !== ""}
          />
        </div>

        {loading && query === "" ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="size-6" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No apps found</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((app) => (
              <AppRow
                key={app.id}
                app={app}
                isInstalled={isInstalled(app.bundle_id)}
                onInstalled={() => handleInstalled(app.id, app.bundle_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
