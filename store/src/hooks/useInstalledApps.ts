import type { AppDefinition } from "@photon-os/sdk";
import { useCallback, useEffect, useMemo, useState } from "react";
import { os } from "../lib/os";

export function useInstalledApps() {
  const [installedApps, setInstalledApps] = useState<AppDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const apps = await os.apps.getInstalledApps();
      setInstalledApps(apps);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const installedBundleIds = useMemo(
    () => new Set(installedApps.map((app) => app.bundleId)),
    [installedApps]
  );

  const isInstalled = useCallback(
    (bundleId: string) => installedBundleIds.has(bundleId),
    [installedBundleIds]
  );

  return { installedApps, installedBundleIds, isInstalled, loading, error, refresh };
}
