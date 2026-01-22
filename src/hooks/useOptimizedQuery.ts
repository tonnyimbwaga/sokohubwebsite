import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { CACHE_TIMES } from "@/lib/react-query";

interface QueryConfig<T>
  extends Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> {
  cacheType?: keyof typeof CACHE_TIMES;
}

export function useOptimizedQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  config?: QueryConfig<T>,
) {
  return useQuery<T>({
    queryKey,
    queryFn,
    staleTime: config?.cacheType ? CACHE_TIMES[config.cacheType] : undefined,
    retry: (failureCount, error: any) => {
      // Don't retry on 404s
      if (error?.status === 404) return false;
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...config,
  });
}

// Helper function to determine if data should be refetched
export function shouldRefetch(
  lastUpdated?: number,
  maxAge = CACHE_TIMES.PRODUCT,
) {
  if (!lastUpdated) return true;
  return Date.now() - lastUpdated > maxAge;
}
