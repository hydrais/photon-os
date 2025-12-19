import { AppDefinition, OS } from "@photon-os/sdk";
import { useEffect, useState } from "react";

export function useInstalledApps() {
  const [installedApps, setInstalledApps] = useState<AppDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const os = new OS();

  const refresh = async () => {
    try {
      setError(null);
      setRefreshing(true);
      setInstalledApps(await os.apps.getInstalledApps());
    } catch (err) {
      setError(err as Error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 5000);

    refresh();

    return () => clearInterval(interval);
  }, []);

  return { installedApps, refresh, loading, refreshing, error };
}
