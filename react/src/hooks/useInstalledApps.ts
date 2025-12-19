import { AppDefinition, OS } from "@photon-os/sdk";
import { useEffect, useState } from "react";

export function useInstalledApps() {
  const [installedApps, setInstalledApps] = useState<AppDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const os = new OS();

  const refresh = async () => {
    console.log("refreshing");

    try {
      setError(null);
      setLoading(true);
      setInstalledApps(await os.getInstalledApps());
    } catch (err) {
      setError(err as Error);
    } finally {
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

  return { installedApps, refresh, loading, error };
}
