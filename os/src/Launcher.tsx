import { useEffect, useState } from "react";
import { useInstalledApps } from "@photon-os/react";
import { AppIcon } from "./components/launcher/app-icon";
import { Spinner } from "./components/ui/spinner";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./components/ui/drawer";
import { Button } from "./components/ui/button";
import { OS, type AppDefinition } from "@photon-os/sdk";
import { LAUNCHER_APP, SYSTEM_APPS } from "./lib/os/OperatingSystemContext";
import { useAuth } from "./lib/auth/AuthContext";
import { fetchSharedPreference } from "./lib/supabase/preferences";

const FILTERED_BUNDLE_IDS = [LAUNCHER_APP.bundleId];
const SYSTEM_APP_BUNDLE_IDS = SYSTEM_APPS.map((a) => a.bundleId);
const BACKGROUND_PREF_KEY = "launcher_background_url";

export function Launcher() {
  const { user } = useAuth();
  const { installedApps, loading, refresh } = useInstalledApps();
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  // Fetch background preference on mount and periodically
  useEffect(() => {
    if (!user) return;

    const loadBackground = () => {
      fetchSharedPreference(user.id, BACKGROUND_PREF_KEY)
        .then((url) => setBackgroundUrl(url as string | null))
        .catch((err) => console.error("Failed to load background:", err));
    };

    loadBackground();
    const interval = setInterval(loadBackground, 3000);
    return () => clearInterval(interval);
  }, [user]);

  // Refresh when window gains focus (e.g., returning from Settings)
  useEffect(() => {
    const handleFocus = () => refresh();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [refresh]);

  // Show system apps immediately while loading, then show all apps once loaded
  const appsToShow = loading
    ? SYSTEM_APPS.filter((a) => !FILTERED_BUNDLE_IDS.includes(a.bundleId))
    : installedApps.filter((a) => !FILTERED_BUNDLE_IDS.includes(a.bundleId));

  // Debug logging
  console.log("[Launcher] loading:", loading, "installedApps:", installedApps.length, "appsToShow:", appsToShow.length);

  const launchApp = async (app: AppDefinition) => {
    const os = new OS();
    const result = await os.apps.launchApp(app);
    if (result.error) alert(result.error.message);
  };

  const uninstallApp = async (app: AppDefinition) => {
    const os = new OS();
    await os.apps.requestAppUninstall(app);
  };

  return (
    <div
      className={`fixed inset-0 flex flex-col bg-cover bg-center bg-no-repeat ${
        !backgroundUrl
          ? "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500"
          : ""
      }`}
      style={
        backgroundUrl ? { backgroundImage: `url(${backgroundUrl})` } : undefined
      }
    >
      <div className="flex-1 overflow-auto p-6 pt-12">
        {appsToShow.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/70 text-center">
              <p className="text-lg">No apps installed</p>
              <p className="text-sm mt-1">Install apps to see them here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-6 justify-items-center">
            {appsToShow.map((app) => (
              <AppIcon
                key={app.bundleId}
                app={app}
                onClick={() => launchApp(app)}
                onAppInfo={() => setSelectedApp(app)}
                onUninstall={() => uninstallApp(app)}
                canBeUninstalled={!SYSTEM_APP_BUNDLE_IDS.includes(app.bundleId)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Subtle loading indicator at the bottom */}
      {loading && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center z-50 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm">
            <Spinner className="size-4 text-white" />
            <span className="text-white text-sm">Loading apps...</span>
          </div>
        </div>
      )}

      <Drawer
        open={selectedApp !== null}
        onOpenChange={(open) => !open && setSelectedApp(null)}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedApp?.name}</DrawerTitle>
            <DrawerDescription>by {selectedApp?.author}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">Bundle ID</div>
              <div className="text-sm font-mono">{selectedApp?.bundleId}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">URL</div>
              <div className="text-sm font-mono">{selectedApp?.url}</div>
            </div>
          </div>
          {selectedApp &&
            !SYSTEM_APP_BUNDLE_IDS.includes(selectedApp.bundleId) && (
              <DrawerFooter>
                <Button
                  variant="destructive"
                  onClick={() => {
                    uninstallApp(selectedApp);
                    setSelectedApp(null);
                  }}
                >
                  Uninstall
                </Button>
              </DrawerFooter>
            )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
