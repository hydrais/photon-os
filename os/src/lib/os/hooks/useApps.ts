import type {
  RunningAppInstance,
  AppDefinition,
  AppBundleId,
} from "@photon-os/sdk";
import { useState, useCallback } from "react";

export function useApps() {
  const LAUNCHER_DEF: AppDefinition = {
    bundleId: "com.photon-os.launcher",
    author: "Photon OS",
    name: "Launcher",
    url: "/__launcher",
  };

  const [runningApps, setRunningApps] = useState<RunningAppInstance[]>([
    { definition: LAUNCHER_DEF, isInBackground: false, startedAt: new Date() },
  ]);

  const [installedApps, setInstalledApps] = useState<AppDefinition[]>([
    LAUNCHER_DEF,
  ]);

  const [appIframeRefs, setAppIframeRefs] = useState<
    Record<AppBundleId, HTMLIFrameElement>
  >({});

  const [loading, setLoading] = useState(false);

  const setAppIframeRef = useCallback(
    (bundleId: AppBundleId, element: HTMLIFrameElement | null) => {
      setAppIframeRefs((prev) => {
        if (element && prev[bundleId] === element) return prev;
        if (!element && !(bundleId in prev)) return prev;

        const newRefs = { ...prev };
        if (!element) delete newRefs[bundleId];
        else newRefs[bundleId] = element;
        return newRefs;
      });
    },
    []
  );

  return {
    runningApps,
    installedApps,
    appIframeRefs,
    setAppIframeRef,
    loading,
  };
}
