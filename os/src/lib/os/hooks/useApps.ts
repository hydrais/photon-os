import type {
  RunningAppInstance,
  AppDefinition,
  AppBundleId,
} from "@photon-os/sdk";
import { useState, useCallback } from "react";
import { LAUNCHER_APP, SYSTEM_APPS } from "../OperatingSystemContext";

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

  const installApp = (app: AppDefinition) => {
    const alreadyInstalled = installedApps.some(
      (a) => a.bundleId === app.bundleId
    );
    if (alreadyInstalled) return;
    setInstalledApps((v) => [...v, app]);
  };

  const uninstallApp = (app: AppDefinition) => {
    setInstalledApps((v) => [...v.filter((a) => a.bundleId !== app.bundleId)]);
  };

  const launchApp = (app: AppDefinition) => {
    const runningApp = runningApps.find(
      (a) => a.definition.bundleId === app.bundleId
    );
    if (runningApp) {
      foregroundApp(app);
      return;
    }
    setRunningApps([
      ...runningApps.map((a) => ({ ...a, isInBackground: true })),
      {
        definition: app,
        isInBackground: false,
        startedAt: new Date(),
      },
    ]);
  };

  const foregroundApp = (app: AppDefinition) => {
    const runningApp = runningApps.find(
      (a) => a.definition.bundleId === app.bundleId
    );
    if (!runningApp) throw new Error(`App not running: ${app.bundleId}`);

    setRunningApps(
      runningApps.map((a) => ({
        ...a,
        isInBackground: a.definition.bundleId === app.bundleId ? false : true,
      }))
    );
  };

  return {
    runningApps,
    installedApps,
    appIframeRefs,
    setAppIframeRef,
    loading,
    foregroundApp,
    launchApp,
    installApp,
    uninstallApp,
  };
}
