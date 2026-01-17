import { useState, useEffect } from "react";
import { useInstalledApps } from "@photon-os/react";
import { OS, type AppDefinition } from "@photon-os/sdk";
import * as pmrpc from "pm-rpc";
import type { PermissionType } from "@/lib/supabase/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Trash2, Plus, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  fetchAllPermissionsForUser,
  setPermission,
} from "@/lib/supabase/permissions";

function AppIconImage({ app }: { app: AppDefinition }) {
  const [iconError, setIconError] = useState(false);
  const showIcon = app.icon && !iconError;

  return (
    <div className="size-10 shrink-0 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-base font-semibold overflow-hidden">
      {showIcon ? (
        <img
          src={app.icon}
          alt={app.name}
          className="w-full h-full object-cover"
          onError={() => setIconError(true)}
        />
      ) : (
        app.name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

const SYSTEM_BUNDLE_IDS = [
  "com.hydrais.photon.launcher",
  "com.hydrais.photon.settings",
];

export function AppsSection() {
  const { installedApps, loading, refresh } = useInstalledApps();
  const { user } = useAuth();
  const [showInstallDrawer, setShowInstallDrawer] = useState(false);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [appPermissions, setAppPermissions] = useState<
    Record<string, Record<PermissionType, boolean | null>>
  >({});
  const [installForm, setInstallForm] = useState({
    url: "",
    name: "",
    author: "",
    bundleId: "",
  });

  // Load permissions for all apps
  useEffect(() => {
    if (!user) return;

    fetchAllPermissionsForUser(user.id)
      .then((permissions) => {
        setAppPermissions(permissions);
      })
      .catch((error) => {
        console.error("Failed to load permissions:", error);
      });
  }, [user]);

  const handlePermissionToggle = async (
    bundleId: string,
    permissionType: PermissionType,
    currentValue: boolean | null
  ) => {
    if (!user) return;

    // If currently granted (true), we'll set to denied (false)
    // If currently denied (false) or not requested (null), we'll grant it
    const newValue = currentValue !== true;

    // Optimistic update
    setAppPermissions((prev) => ({
      ...prev,
      [bundleId]: {
        ...(prev[bundleId] || { devices: null }),
        [permissionType]: newValue,
      },
    }));

    try {
      // Set permission to true (granted) or false (denied)
      await setPermission(user.id, bundleId, permissionType, newValue);

      // Invalidate the OS permission cache via RPC
      try {
        const api = await pmrpc.api.request<{
          permissions_invalidateCache: (bundleId?: string) => Promise<void>;
        }>("photon_os", { target: window.parent });
        await api.permissions_invalidateCache(bundleId);
      } catch (rpcError) {
        console.warn("Failed to invalidate permission cache via RPC:", rpcError);
      }
    } catch (error) {
      console.error("Failed to update permission:", error);
      // Rollback on error
      setAppPermissions((prev) => ({
        ...prev,
        [bundleId]: {
          ...(prev[bundleId] || { devices: null }),
          [permissionType]: currentValue,
        },
      }));
    }
  };

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
          {userApps.map((app) => {
            const isExpanded = expandedApp === app.bundleId;
            const permissions = appPermissions[app.bundleId] || {
              devices: null,
            };

            return (
              <div
                key={app.bundleId}
                className="rounded-2xl bg-card ring-1 ring-foreground/10 overflow-hidden"
              >
                <button
                  className="flex items-center gap-4 p-4 w-full text-left"
                  onClick={() =>
                    setExpandedApp(isExpanded ? null : app.bundleId)
                  }
                >
                  <AppIconImage app={app} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{app.name}</div>
                    <div className="text-sm text-muted-foreground">
                      by {app.author}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="size-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-5 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-foreground/5">
                    <div className="pt-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Permissions
                      </h4>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Cpu className="size-5 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              Device Access
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {permissions.devices === true
                                ? "Allowed"
                                : permissions.devices === false
                                  ? "Denied"
                                  : "Not requested"}
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={permissions.devices === true}
                          onCheckedChange={() =>
                            handlePermissionToggle(
                              app.bundleId,
                              "devices",
                              permissions.devices
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-foreground/5">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUninstall(app)}
                        className="w-full"
                      >
                        <Trash2 className="size-4 mr-1.5" />
                        Uninstall App
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
              <AppIconImage app={app} />
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
