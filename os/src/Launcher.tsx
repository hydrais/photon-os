import { useState } from "react";
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

const FILTERED_BUNDLE_IDS = [LAUNCHER_APP.bundleId];
const SYSTEM_APP_BUNDLE_IDS = SYSTEM_APPS.map((a) => a.bundleId);

export function Launcher() {
  const { installedApps, loading } = useInstalledApps();
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);

  const filteredApps = installedApps.filter(
    (a) => !FILTERED_BUNDLE_IDS.includes(a.bundleId)
  );

  const launchApp = async (app: AppDefinition) => {
    const os = new OS();
    const result = await os.apps.launchApp(app);
    if (result.error) alert(result.error.message);
  };

  const installApp = async () => {
    const os = new OS();
    await os.apps.requestAppInstall({
      author: "Jesse Dunlap",
      name: "Avatar Manager",
      bundleId: "com.photon-os.test",
      url: "/__test",
    });
  };

  const uninstallApp = async (app: AppDefinition) => {
    const os = new OS();
    await os.apps.requestAppUninstall(app);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex flex-col">
      <div className="flex-1 overflow-auto p-6 pt-12">
        {loading ? (
          <div className="flex items-center justify-center h-full text-background">
            <Spinner className="size-6" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/70 text-center">
              <p className="text-lg">No apps installed</p>
              <p className="text-sm mt-1">Install apps to see them here</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-6 justify-items-center">
            {filteredApps.map((app) => (
              <AppIcon
                key={app.bundleId}
                app={app}
                onClick={() => launchApp(app)}
                onAppInfo={() => setSelectedApp(app)}
                onUninstall={() => uninstallApp(app)}
                canBeUninstalled={!SYSTEM_APP_BUNDLE_IDS.includes(app.bundleId)}
              />
            ))}

            <button onClick={() => installApp()}>Install</button>
          </div>
        )}
      </div>

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
