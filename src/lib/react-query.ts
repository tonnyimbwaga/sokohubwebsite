import { QueryClient } from "@tanstack/react-query";

// EMERGENCY: Extremely aggressive caching to reduce requests
const STALE_TIMES = {
  // Much longer stale times to reduce requests
  SHORT: 5 * 60 * 1000, // 5 minutes (was 15 seconds)
  MEDIUM: 15 * 60 * 1000, // 15 minutes (was 1 minute)
  LONG: 60 * 60 * 1000, // 1 hour (was 30 minutes)
  SESSION: 4 * 60 * 60 * 1000, // 4 hours (was 2 hours)
  PERSISTENT: 24 * 60 * 60 * 1000, // 24 hours (unchanged)
} as const;

// Much longer cache times to prevent re-fetching
const CACHE_TIMES = {
  SHORT: STALE_TIMES.SHORT * 4, // 20 minutes
  MEDIUM: STALE_TIMES.MEDIUM * 4, // 1 hour
  LONG: STALE_TIMES.LONG * 4, // 4 hours
  SESSION: STALE_TIMES.SESSION * 2, // 8 hours
  PERSISTENT: STALE_TIMES.PERSISTENT * 2, // 48 hours
} as const;

// Create a client with EXTREMELY aggressive caching to stop excessive requests
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // EMERGENCY: Much longer stale time to prevent requests
        staleTime: STALE_TIMES.MEDIUM, // 15 minutes default
        // Much longer cache time to keep data in memory
        gcTime: CACHE_TIMES.MEDIUM, // 1 hour
        // ABSOLUTELY NO retries to prevent request storms
        retry: false,
        retryDelay: 0,
        // DISABLE ALL automatic refetches
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,
        // Network mode optimizations
        networkMode: "online",
        // EMERGENCY: Disable background refetching completely
        notifyOnChangeProps: ["data", "error", "isLoading"],
      },
      mutations: {
        // No retries for mutations
        retry: false,
        retryDelay: 0,
        // Network mode for mutations
        networkMode: "online",
      },
    },
  });

// Global query client instance
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep one query client
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}

export const queryClient = getQueryClient();

// Export types for better type safety
export type StaleTime = keyof typeof STALE_TIMES;
export type CacheTime = keyof typeof CACHE_TIMES;

// Query key factory to ensure consistent cache keys
export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.products.all, "list", { filters }] as const,
    detail: (id: string) => [...queryKeys.products.all, "detail", id] as const,
    related: (productId: string) =>
      [...queryKeys.products.all, "related", productId] as const,
    search: (query: string) =>
      [...queryKeys.products.all, "search", query] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.categories.all, "list", { filters }] as const,
    detail: (id: string) =>
      [...queryKeys.categories.all, "detail", id] as const,
    products: (categoryId: string, filters?: Record<string, unknown>) =>
      [
        ...queryKeys.categories.all,
        "products",
        categoryId,
        { filters },
      ] as const,
  },
  blog: {
    all: ["blog"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.blog.all, "list", { filters }] as const,
    detail: (slug: string) => [...queryKeys.blog.all, "detail", slug] as const,
    featured: ["blog", "featured"] as const,
    categories: ["blog", "categories"] as const,
  },
  cart: {
    all: ["cart"] as const,
    count: ["cart", "count"] as const,
  },
  user: {
    all: ["user"] as const,
    profile: ["user", "profile"] as const,
    orders: ["user", "orders"] as const,
    order: (id: string) => [...queryKeys.user.orders, id] as const,
  },
} as const;

// Helper functions for common query options with EMERGENCY settings
export const queryOptions = {
  // For data that rarely changes (categories, static content)
  static: {
    staleTime: STALE_TIMES.PERSISTENT, // 24 hours
    gcTime: CACHE_TIMES.PERSISTENT, // 48 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  // For product listings and details
  products: {
    staleTime: STALE_TIMES.LONG, // 1 hour
    gcTime: CACHE_TIMES.LONG, // 4 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  // For user-specific data (cart, orders, profile)
  user: {
    staleTime: STALE_TIMES.MEDIUM, // 15 minutes
    gcTime: CACHE_TIMES.MEDIUM, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  // For search results
  search: {
    staleTime: STALE_TIMES.MEDIUM, // 15 minutes
    gcTime: CACHE_TIMES.MEDIUM, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
  // For blog posts and related content
  blog: {
    staleTime: STALE_TIMES.LONG, // 1 hour
    gcTime: CACHE_TIMES.LONG, // 4 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  },
} as const;
