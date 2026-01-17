import { OS } from "@photon-os/sdk";
import { useEffect, useState } from "react";

export function useScale() {
  const [scale, setScale] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const os = new OS();

    const fetchScale = async () => {
      try {
        setError(null);
        const result = await os.system.getScale();
        setScale(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchScale();
  }, []);

  return { scale, loading, error };
}
