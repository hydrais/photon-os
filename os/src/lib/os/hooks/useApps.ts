import type {
  RunningAppInstance,
  AppDefinition,
  AppBundleId,
} from "@photon-os/sdk";
import { useState, useCallback } from "react";

const LAUNCHER_APP: AppDefinition = {
  bundleId: "com.photon-os.launcher",
  author: "Photon OS",
  name: "Launcher",
  url: "/__launcher",
};

const SYSTEM_APPS: AppDefinition[] = [
  LAUNCHER_APP,
  {
    bundleId: "com.photon-os.settings",
    author: "Photon OS",
    name: "Settings",
    url: "/__settings",
  },
];

export function useApps() {
  const [runningApps, setRunningApps] = useState<RunningAppInstance[]>([
    { definition: LAUNCHER_APP, isInBackground: false, startedAt: new Date() },
  ]);

  const [installedApps, setInstalledApps] =
    useState<AppDefinition[]>(SYSTEM_APPS);

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
