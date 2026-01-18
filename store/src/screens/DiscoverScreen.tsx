import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { AppRow } from "@/components/store/AppRow";
import { Search, Sparkle, Star, ThumbsUp } from "lucide-react";
import {
  useDiscoverApps,
  type DiscoverFilter,
} from "@/hooks/useDiscoverApps";
import { useInstalledApps } from "@/hooks/useInstalledApps";
import { useRecordInstall } from "@/hooks/useRecordInstall";
import { useDeveloperProfile } from "@/hooks/useDeveloperProfile";
import type { StoreApp, AppCategory } from "@/lib/supabase/client";

type AppListProps = {
  apps: StoreApp[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  isInstalled: (bundleId: string) => boolean;
  onInstalled: (appId: string, bundleId: string) => void;
};

function AppList({
  apps,
  loading,
  error,
  emptyMessage,
  isInstalled,
  onInstalled,
}: AppListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {apps.map((app) => (
        <AppRow
          key={app.id}
          app={app}
          isInstalled={isInstalled(app.bundle_id)}
          onInstalled={() => onInstalled(app.id, app.bundle_id)}
        />
      ))}
    </div>
  );
}

type DiscoverScreenProps = {
  category?: AppCategory;
};

const categoryNames: Record<AppCategory, string> = {
  avatar: "Avatar",
  tools: "Tools",
  games: "Games",
  social: "Social",
  media: "Media",
  education: "Education",
};

export function DiscoverScreen({ category }: DiscoverScreenProps) {
  const [activeTab, setActiveTab] = useState<DiscoverFilter>("featured");

  const featured = useDiscoverApps("featured", category);
  const topRated = useDiscoverApps("top-rated", category);
  const newApps = useDiscoverApps("new", category);

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
    <>
      {category && (
        <div className="border-b px-4 py-3">
          <h1 className="text-xl font-semibold">{categoryNames[category]}</h1>
        </div>
      )}
      <header className="border-b flex flex-col gap-2 p-2 md:flex-row">
        <InputGroup className="h-auto p-0.5 gap-2 rounded-lg">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search apps..." />
        </InputGroup>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as DiscoverFilter)}
        >
          <TabsList className="flex-1 w-full">
            <TabsTrigger value="featured" className="p-2 rounded-full">
              <Star /> Featured
            </TabsTrigger>
            <TabsTrigger value="top-rated" className="p-2 rounded-full">
              <ThumbsUp /> Top Rated
            </TabsTrigger>
            <TabsTrigger value="new" className="p-2 rounded-full">
              <Sparkle /> New
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <main className="flex-1 bg-gray-50 p-2 overflow-auto">
        {activeTab === "featured" && (
          <AppList
            apps={featured.apps}
            loading={featured.loading}
            error={featured.error}
            emptyMessage="No featured apps yet"
            isInstalled={isInstalled}
            onInstalled={handleInstalled}
          />
        )}
        {activeTab === "top-rated" && (
          <AppList
            apps={topRated.apps}
            loading={topRated.loading}
            error={topRated.error}
            emptyMessage="No rated apps yet"
            isInstalled={isInstalled}
            onInstalled={handleInstalled}
          />
        )}
        {activeTab === "new" && (
          <AppList
            apps={newApps.apps}
            loading={newApps.loading}
            error={newApps.error}
            emptyMessage="No apps found"
            isInstalled={isInstalled}
            onInstalled={handleInstalled}
          />
        )}
      </main>
    </>
  );
}
