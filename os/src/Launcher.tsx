import { useInstalledApps } from "@photon-os/react";
import { AppIcon } from "./components/launcher/app-icon";
import { Spinner } from "./components/ui/spinner";
import { OS, type AppDefinition } from "@photon-os/sdk";

const FILTERED_BUNDLE_IDS = ["com.photon-os.launcher"];

export function Launcher() {
  const { installedApps, loading } = useInstalledApps();

  const filteredApps = installedApps.filter(
    (a) => !FILTERED_BUNDLE_IDS.includes(a.bundleId)
  );

  const launchApp = async (app: AppDefinition) => {
    const os = new OS();
    const result = await os.apps.launchApp(app);
    if (result.error) alert(result.error.message);
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
