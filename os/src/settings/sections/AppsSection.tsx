import { useState } from "react";
import { useInstalledApps } from "@photon-os/react";
import { OS, type AppDefinition } from "@photon-os/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Trash2, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const SYSTEM_BUNDLE_IDS = ["com.photon-os.launcher", "com.photon-os.settings"];

export function AppsSection() {
  const { installedApps, loading, refresh } = useInstalledApps();
  const [showInstallDrawer, setShowInstallDrawer] = useState(false);
  const [installForm, setInstallForm] = useState({
    url: "",
    name: "",
    author: "",
    bundleId: "",
  });

  const userApps = installedApps.filter(
    (app) => !SYSTEM_BUNDLE_IDS.includes(app.bundleId)
  );

  const systemApps = installedApps.filter((app) =>
    SYSTEM_BUNDLE_IDS.includes(app.bundleId)
  );

  const handleUninstall = async (app: AppDefinition) => {
    const os = new OS();
    await os.apps.requestAppUninstall(app);
    setTimeout(() => refresh(), 500);
  };

  const handleInstall = async () => {
    if (
      !installForm.url ||
      !installForm.name ||
      !installForm.author ||
      !installForm.bundleId
    ) {
      return;
    }

    const os = new OS();
    await os.apps.requestAppInstall({
      url: installForm.url,
      name: installForm.name,
      author: installForm.author,
      bundleId: installForm.bundleId,
    });

    setShowInstallDrawer(false);
    setInstallForm({ url: "", name: "", author: "", bundleId: "" });
    setTimeout(() => refresh(), 500);
  };

  const isFormValid =
    installForm.url &&
    installForm.name &&
    installForm.author &&
    installForm.bundleId;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Installed Apps</h2>
          <p className="text-sm text-muted-foreground">
            Manage your installed applications
          </p>
        </div>
        <Button onClick={() => setShowInstallDrawer(true)} size="sm">
          <Plus />
          Install App
        </Button>
      </div>

      {userApps.length === 0 ? (
        <div className="rounded-2xl bg-muted/50 p-6 text-center">
          <p className="text-muted-foreground">No user apps installed</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {userApps.map((app) => (
            <div
              key={app.bundleId}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card ring-1 ring-foreground/10"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium">{app.name}</div>
                <div className="text-sm text-muted-foreground">
                  by {app.author}
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleUninstall(app)}
              >
                <Trash2 className="size-4 mr-1.5" />
                Uninstall
              </Button>
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          System Apps
        </h3>
        <div className="flex flex-col gap-2">
          {systemApps.map((app) => (
            <div
              key={app.bundleId}
              className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium">{app.name}</div>
                <div className="text-sm text-muted-foreground">
                  by {app.author}
                </div>
              </div>
              <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-muted">
                System
              </span>
            </div>
          ))}
        </div>
      </div>

      <Drawer open={showInstallDrawer} onOpenChange={setShowInstallDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Install App</DrawerTitle>
            <DrawerDescription>
              Enter the details of the app you want to install
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-url">App URL</Label>
              <Input
                id="app-url"
                type="url"
                placeholder="https://example.com/app"
                value={installForm.url}
                onChange={(e) =>
                  setInstallForm({ ...installForm, url: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-name">App Name</Label>
              <Input
                id="app-name"
                placeholder="My App"
                value={installForm.name}
                onChange={(e) =>
                  setInstallForm({ ...installForm, name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-author">Author</Label>
              <Input
                id="app-author"
                placeholder="Developer Name"
                value={installForm.author}
                onChange={(e) =>
                  setInstallForm({ ...installForm, author: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="app-bundle-id">Bundle ID</Label>
              <Input
                id="app-bundle-id"
                placeholder="com.example.myapp"
                value={installForm.bundleId}
                onChange={(e) =>
                  setInstallForm({ ...installForm, bundleId: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                A unique identifier for the app (e.g., com.developer.appname)
              </p>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleInstall} disabled={!isFormValid}>
              Install
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowInstallDrawer(false)}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
