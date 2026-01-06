import type {
  RunningAppInstance,
  AppDefinition,
  AppBundleId,
} from "@photon-os/sdk";
import { useState, useCallback } from "react";
import { LAUNCHER_APP, SYSTEM_APPS } from "../OperatingSystemContext";

export function useApps() {
  const [runningApps, setRunningApps] = useState<RunningAppInstance[]>([
    {
      definition: LAUNCHER_APP,
      isInBackground: false,
      startedAt: new Date(),
      lastForegroundedAt: new Date(),
    },
  ]);

  const [installedApps, setInstalledApps] =
    useState<AppDefinition[]>(SYSTEM_APPS);

  const [appIframeRefs, setAppIframeRefs] = useState<
    Record<AppBundleId, HTMLIFrameElement>
  >({});

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
    const now = new Date();
    setRunningApps([
      ...runningApps.map((a) => ({ ...a, isInBackground: true })),
      {
        definition: app,
        isInBackground: false,
        startedAt: now,
        lastForegroundedAt: now,
      },
    ]);
  };

  const foregroundApp = (app: AppDefinition) => {
    const runningApp = runningApps.find(
      (a) => a.definition.bundleId === app.bundleId
    );
    if (!runningApp) throw new Error(`App not running: ${app.bundleId}`);

    const now = new Date();
    setRunningApps(
      runningApps.map((a) => ({
        ...a,
        isInBackground: a.definition.bundleId === app.bundleId ? false : true,
        lastForegroundedAt:
          a.definition.bundleId === app.bundleId ? now : a.lastForegroundedAt,
      }))
    );
  };

  const closeApp = (app: AppDefinition) => {
    if (app.bundleId === LAUNCHER_APP.bundleId) return;
    setRunningApps((prev) => {
      const filtered = prev.filter(
        (a) => a.definition.bundleId !== app.bundleId
      );
      if (filtered.length > 0 && filtered.every((a) => a.isInBackground)) {
        const lastApp = filtered[filtered.length - 1];
        lastApp.isInBackground = false;
        lastApp.lastForegroundedAt = new Date();
      }
      return filtered;
    });
  };

  return {
    runningApps,
    installedApps,
    appIframeRefs,
    setAppIframeRef,
    foregroundApp,
    launchApp,
    closeApp,
    installApp,
    uninstallApp,
  };
}
