import { Link } from "react-router";
import { Plus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/store/SearchBar";
import { AppList } from "@/components/store/AppList";
import { ProfileBadge } from "@/components/developer/ProfileBadge";
import { useSearchApps } from "@/hooks/useSearchApps";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";

export function MainScreen() {
  const { results, loading, query, search } = useSearchApps();
  const { hasProfile } = useDeveloperProfile();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-semibold">App Store</h1>
          <div className="flex items-center gap-2">
            <ProfileBadge />
            {hasProfile && (
              <Button asChild variant="outline" size="sm">
                <Link to="/dashboard">
                  <LayoutDashboard className="size-4" data-icon="inline-start" />
                  My Apps
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link to="/submit">
                <Plus className="size-4" data-icon="inline-start" />
                List Your App
              </Link>
            </Button>
          </div>
        </header>

        <div className="mb-6">
          <SearchBar value={query} onChange={search} loading={loading && query !== ""} />
        </div>

        <AppList apps={results} loading={loading && query === ""} />
      </div>
    </div>
  );
}
