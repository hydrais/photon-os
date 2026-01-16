import type {
  RunningAppInstance,
  AppDefinition,
  AppBundleId,
} from "@photon-os/sdk";
import { useState, useCallback, useEffect, useRef } from "react";
import { LAUNCHER_APP, SYSTEM_APPS } from "../OperatingSystemContext";
import {
  fetchInstalledApps,
  insertInstalledApp,
  deleteInstalledApp,
} from "../../supabase/installedApps";

export function useApps(userId: string | undefined) {
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

  const [isLoadingApps, setIsLoadingApps] = useState(true);

  const [appIframeRefs, setAppIframeRefs] = useState<
    Record<AppBundleId, HTMLIFrameElement>
  >({});

  // Track whether initial load has completed to prevent loading flicker on re-renders
  const hasInitiallyLoadedRef = useRef(false);

  // Load installed apps from Supabase when userId is available
  useEffect(() => {
    if (!userId) {
      setIsLoadingApps(false);
      return;
    }

    let cancelled = false;

    async function loadApps() {
      // Only show loading state on initial load, not on subsequent effect re-runs
      if (!hasInitiallyLoadedRef.current) {
        setIsLoadingApps(true);
      }
      try {
        const userApps = await fetchInstalledApps();
        if (!cancelled) {
          setInstalledApps([...SYSTEM_APPS, ...userApps]);
          hasInitiallyLoadedRef.current = true;
        }
      } catch (error) {
        console.error("Failed to load installed apps:", error);
      } finally {
        if (!cancelled) {
          setIsLoadingApps(false);
        }
      }
    }

    loadApps();

    return () => {
      cancelled = true;
    };
  }, [userId]);

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

  const installApp = useCallback(
    async (app: AppDefinition) => {
      if (!userId) {
        console.error("Cannot install app: no user ID");
        return;
      }

      const alreadyInstalled = installedApps.some(
        (a) => a.bundleId === app.bundleId
      );
      if (alreadyInstalled) return;

      // Optimistic update
      setInstalledApps((v) => [...v, app]);

      try {
        await insertInstalledApp(userId, app);
      } catch (error) {
        // Rollback on failure
        setInstalledApps((v) => v.filter((a) => a.bundleId !== app.bundleId));
        console.error("Failed to persist app installation:", error);
      }
    },
    [userId, installedApps]
  );

  const uninstallApp = useCallback(
    async (app: AppDefinition) => {
      if (!userId) {
        console.error("Cannot uninstall app: no user ID");
        return;
      }

      // Prevent uninstalling system apps
      const isSystemApp = SYSTEM_APPS.some(
        (sa) => sa.bundleId === app.bundleId
      );
      if (isSystemApp) {
        console.warn("Cannot uninstall system app:", app.bundleId);
        return;
      }

      // Store for potential rollback
      const previousApps = [...installedApps];

      // Optimistic update
      setInstalledApps((v) => v.filter((a) => a.bundleId !== app.bundleId));

      try {
        await deleteInstalledApp(userId, app.bundleId);
      } catch (error) {
        // Rollback on failure
        setInstalledApps(previousApps);
        console.error("Failed to persist app uninstallation:", error);
      }
    },
    [userId, installedApps]
  );

  const foregroundApp = useCallback((app: AppDefinition) => {
    setRunningApps((prev) => {
      const runningApp = prev.find(
        (a) => a.definition.bundleId === app.bundleId
      );
      if (!runningApp) throw new Error(`App not running: ${app.bundleId}`);

      const now = new Date();
      return prev.map((a) => ({
        ...a,
        isInBackground: a.definition.bundleId === app.bundleId ? false : true,
        lastForegroundedAt:
          a.definition.bundleId === app.bundleId ? now : a.lastForegroundedAt,
      }));
    });
  }, []);

  const launchApp = useCallback(
    (app: AppDefinition) => {
      setRunningApps((prev) => {
        const runningApp = prev.find(
          (a) => a.definition.bundleId === app.bundleId
        );
        if (runningApp) {
          // App already running, foreground it
          const now = new Date();
          return prev.map((a) => ({
            ...a,
            isInBackground: a.definition.bundleId === app.bundleId ? false : true,
            lastForegroundedAt:
              a.definition.bundleId === app.bundleId ? now : a.lastForegroundedAt,
          }));
        }
        // Launch new app
        const now = new Date();
        return [
          ...prev.map((a) => ({ ...a, isInBackground: true })),
          {
            definition: app,
            isInBackground: false,
            startedAt: now,
            lastForegroundedAt: now,
          },
        ];
      });
    },
    []
  );

  const closeApp = useCallback((app: AppDefinition) => {
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
  }, []);

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
    isLoadingApps,
  };
}
