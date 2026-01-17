import { AppCard } from "./AppCard";
import { Spinner } from "@/components/ui/spinner";
import type { StoreApp } from "@/lib/supabase/client";

type AppListProps = {
  apps: StoreApp[];
  loading?: boolean;
};

export function AppList({ apps, loading }: AppListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No apps found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}
