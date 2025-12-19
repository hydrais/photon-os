import { createContext, useCallback, type PropsWithChildren } from "react";
import type {
  AppBundleId,
  AppDefinition,
  RunningAppInstance,
  OperatingSystemAPI,
} from "@photon-os/sdk";
import { useApps } from "./hooks/useApps";
import { Spinner } from "@/components/ui/spinner";
import pmrpc from "pm-rpc";

type OperatingSystemContextType = {
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
  const {
    runningApps,
    installedApps,
    appIframeRefs,
    setAppIframeRef,
    loading: appsLoading,
  } = useApps();

  const loading = appsLoading;

  useCallback(() => {
    const api: OperatingSystemAPI = {
      async apps_getInstalledApps() {
        console.log("getinstalledapps");
        return installedApps;
      },
    };
    pmrpc.api.set("photon_os", api);
  }, [installedApps]);

  return (
    <OperatingSystemContext.Provider
      value={{ runningApps, installedApps, appIframeRefs, setAppIframeRef }}
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
