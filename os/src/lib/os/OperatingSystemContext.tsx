import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  AppBundleId,
  AppDefinition,
  RunningAppInstance,
  OperatingSystemAPI,
  PhotonUser,
} from "@photon-os/sdk";
import { useApps } from "./hooks/useApps";
import { useAuth } from "../auth/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import * as pmrpc from "pm-rpc";
import { InstallAppDrawer } from "@/components/system/install-app-drawer";
import { UninstallAppDrawer } from "@/components/system/uninstall-app-drawer";

export const LAUNCHER_APP: AppDefinition = {
  bundleId: "com.photon-os.launcher",
  author: "Photon OS",
  name: "Launcher",
  url: "/__launcher",
};

export const SYSTEM_APPS: AppDefinition[] = [
  LAUNCHER_APP,
  {
    bundleId: "com.photon-os.settings",
    author: "Photon OS",
    name: "Settings",
    url: "/__settings",
  },
];

type OperatingSystemContextType = {
  api: OperatingSystemAPI;
  runningApps: RunningAppInstance[];
  installedApps: AppDefinition[];
  appIframeRefs: Record<AppBundleId, HTMLIFrameElement>;
  setAppIframeRef: (
    bundleId: string,
    element: HTMLIFrameElement | null
  ) => void;
  foregroundApp: (app: AppDefinition) => void;
  closeApp: (app: AppDefinition) => void;
  multitasking: boolean;
  setMultitasking: (value: boolean) => void;
};

export const OperatingSystemContext = createContext<OperatingSystemContextType>(
  {} as OperatingSystemContextType
);

export function OperatingSystemProvider({ children }: PropsWithChildren) {
  const [apiLoading, setApiLoading] = useState(true);
  const [installAppRequest, setInstallAppRequest] =
    useState<AppDefinition | null>(null);
  const [uninstallAppRequest, setUninstallAppRequest] =
    useState<AppDefinition | null>(null);
  const [multitasking, setMultitasking] = useState(false);

  const { user } = useAuth();

  const {
    runningApps,
    installedApps,
    appIframeRefs,
    setAppIframeRef,
    launchApp,
    foregroundApp,
    closeApp,
    installApp,
    uninstallApp,
  } = useApps();

  const api: OperatingSystemAPI = useMemo(
    () => ({
      async system_homeButton() {
        foregroundApp(LAUNCHER_APP);
      },
      async apps_getInstalledApps() {
        return installedApps;
      },
      async apps_launchApp(app) {
        launchApp(app);
        return { launched: true, app, error: null };
      },
      async apps_foregroundApp(app) {
        foregroundApp(app);
      },
      async apps_requestAppInstall(app) {
        setInstallAppRequest(app);
      },
      async apps_requestAppUninstall(app) {
        setUninstallAppRequest(app);
      },
      async user_getCurrentUser(): Promise<PhotonUser> {
        if (!user) throw new Error("Not authenticated");
        return {
          id: user.id,
          displayName:
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "User",
        };
      },
    }),
    [installedApps, runningApps, user]
  );

  useEffect(() => {
    pmrpc.api.set("photon_os", api);
    setApiLoading(false);
  }, [api]);

  const loading = apiLoading;

  return (
    <OperatingSystemContext.Provider
      value={{
        api,
        runningApps,
        installedApps,
        appIframeRefs,
        setAppIframeRef,
        foregroundApp,
        closeApp,
        multitasking,
        setMultitasking,
      }}
    >
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-foreground text-background">
          <Spinner />
        </div>
      ) : (
        <>
          {children}
          <InstallAppDrawer
            app={installAppRequest}
            type="permanent"
            onDecline={() => setInstallAppRequest(null)}
            onInstall={() => {
              if (!installAppRequest) return;
              installApp(installAppRequest);
              setInstallAppRequest(null);
            }}
          />
          <UninstallAppDrawer
            app={uninstallAppRequest}
            onDecline={() => setUninstallAppRequest(null)}
            onUninstall={() => {
              if (!uninstallAppRequest) return;
              uninstallApp(uninstallAppRequest);
              setUninstallAppRequest(null);
            }}
          />
        </>
      )}
    </OperatingSystemContext.Provider>
  );
}
