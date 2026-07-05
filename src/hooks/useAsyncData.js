import { useEffect, useState } from "react";
import { usePreloadedData } from "../context/PreloadedDataContext.jsx";

export function useAsyncData(loader, deps = [], options = {}) {
  const { initialData = null, enabled = true, cacheKey } = options;
  const preloadedData = usePreloadedData();
  const cachedData = cacheKey ? preloadedData?.[cacheKey] : undefined;
  const [data, setData] = useState(cachedData ?? initialData);
  const [loading, setLoading] = useState(enabled && cachedData === undefined);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const result = await loader();
        if (!cancelled) {
          setData(result);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, deps);

  return { data, loading, error, setData };
}
