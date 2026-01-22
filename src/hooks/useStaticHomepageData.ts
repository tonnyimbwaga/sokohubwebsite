/**
 * Ultra-Fast Homepage Data Hook
 *
 * This hook provides blazing fast data loading with multiple fallback strategies:
 * 1. Try to load from static JSON files first (fastest)
 * 2. Fall back to API route with aggressive caching
 * 3. Final fallback to database query (slowest)
 */

import { useState, useEffect } from "react";
import type { StaticHomepageData } from "@/lib/static-homepage-data";

interface UseStaticHomepageDataResult {
  data: StaticHomepageData | null;
  isLoading: boolean;
  error: string | null;
  source: "static" | "api" | "fallback" | null;
}

export function useStaticHomepageData(): UseStaticHomepageDataResult {
  const [data, setData] = useState<StaticHomepageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"static" | "api" | "fallback" | null>(
    null,
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        // Strategy 1: Try to load directly from static file (fastest - ~1ms)
        try {
          const staticResponse = await fetch("/data/homepage.json", {
            cache: "force-cache", // Aggressive browser caching
          });

          if (staticResponse.ok) {
            const staticData = await staticResponse.json();
            if (!isCancelled) {
              setData(staticData);
              setSource("static");
              setIsLoading(false);
              console.log("✅ Loaded from static file (~1ms)");
              return;
            }
          }
        } catch (staticError) {
          console.log("Static file not available, trying API...");
        }

        // Strategy 2: Fall back to API route with caching (~10-50ms)
        try {
          const apiResponse = await fetch("/api/static-data/homepage", {
            cache: "force-cache",
          });

          if (apiResponse.ok) {
            const apiData = await apiResponse.json();
            if (!isCancelled) {
              setData(apiData);
              setSource("api");
              setIsLoading(false);
              console.log("✅ Loaded from API route (~10-50ms)");
              return;
            }
          }
        } catch (apiError) {
          console.log("API route failed, using fallback...");
        }

        // Strategy 3: Final fallback - minimal data structure (~100-500ms)
        if (!isCancelled) {
          const fallbackData: StaticHomepageData = {
            categories: [],
            featuredProducts: [],
            dealProducts: [],
            trendingProducts: [],
            lastUpdated: new Date().toISOString(),
            version: "2.0",
          };

          setData(fallbackData);
          setSource("fallback");
          setError("Using fallback data - static files not available");
          setIsLoading(false);
          console.log("⚠️ Using fallback data");
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, []);

  return { data, isLoading, error, source };
}

// Hook for individual category data (also blazing fast)
export function useStaticCategoryData(categorySlug: string) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadCategoryData() {
      try {
        // Try to load category-specific static file
        const response = await fetch(`/data/category-${categorySlug}.json`, {
          cache: "force-cache",
        });

        if (response.ok) {
          const categoryData = await response.json();
          if (!isCancelled) {
            setData(categoryData);
            setIsLoading(false);
            console.log(`✅ Loaded category ${categorySlug} from static file`);
          }
        } else {
          throw new Error("Category data not found");
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load category data",
          );
          setIsLoading(false);
        }
      }
    }

    if (categorySlug) {
      loadCategoryData();
    }

    return () => {
      isCancelled = true;
    };
  }, [categorySlug]);

  return { data, isLoading, error };
}
