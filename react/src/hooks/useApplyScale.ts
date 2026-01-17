import { OS } from "@photon-os/sdk";
import { useEffect, useState } from "react";

export function useApplyScale() {
  const [scale, setScale] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const os = new OS();

    const applyScale = async () => {
      try {
        setError(null);
        const result = await os.system.applyScale();
        setScale(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    applyScale();
  }, []);

  return { scale, loading, error };
}
