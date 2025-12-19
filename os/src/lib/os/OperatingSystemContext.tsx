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
} from "@photon-os/sdk";
import { useApps } from "./hooks/useApps";
import { Spinner } from "@/components/ui/spinner";
import * as pmrpc from "pm-rpc";

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
};

export const OperatingSystemContext = createContext<OperatingSystemContextType>(
  {} as OperatingSystemContextType
);

export function OperatingSystemProvider({ children }: PropsWithChildren) {
  const [apiLoading, setApiLoading] = useState(true);

  const {
    runningApps,
    installedApps,
    appIframeRefs,
    setAppIframeRef,
    loading: appsLoading,
    launchApp,
    foregroundApp,
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
    }),
    [installedApps, runningApps]
  );

  useEffect(() => {
    pmrpc.api.set("photon_os", api);
    setApiLoading(false);
  }, [api]);

  const loading = appsLoading || apiLoading;

  return (
    <OperatingSystemContext.Provider
      value={{
        api,
        runningApps,
        installedApps,
        appIframeRefs,
        setAppIframeRef,
      }}
    >
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-foreground text-background">
          <Spinner />
        </div>
      ) : (
        children
      )}
    </OperatingSystemContext.Provider>
  );
}
