import {
  createContext,
  useEffect,
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
  const [apiLoading, setApiLoading] = useState(true);

  const {
    runningApps,
    installedApps,
    appIframeRefs,
    setAppIframeRef,
    loading: appsLoading,
  } = useApps();

  useEffect(() => {
    const api: OperatingSystemAPI = {
      async apps_getInstalledApps() {
        return installedApps;
      },
    };
    pmrpc.api.set("photon_os", api);
    setApiLoading(false);
  }, [installedApps]);

  const loading = appsLoading || apiLoading;

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
