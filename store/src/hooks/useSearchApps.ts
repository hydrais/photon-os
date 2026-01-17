import { useState, useCallback, useRef, useEffect } from "react";
import { supabase, type StoreApp } from "@/lib/supabase/client";

const DEBOUNCE_MS = 300;

export function useSearchApps() {
  const [results, setResults] = useState<StoreApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    setLoading(true);

    const { data, error } = await supabase.rpc("search_store_apps", {
      search_query: searchQuery,
    });

    if (error) {
      console.error("Search error:", error);
      setResults([]);
    } else {
      setResults(data || []);
    }

    setLoading(false);
  }, []);

  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, DEBOUNCE_MS);
    },
    [performSearch]
  );

  // Initial fetch of all apps
  useEffect(() => {
    performSearch("");
  }, [performSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { results, loading, query, search };
}
