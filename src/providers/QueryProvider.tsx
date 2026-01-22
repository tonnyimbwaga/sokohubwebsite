"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Create a client
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // Optimize for performance and Supabase free tier
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
        retry: 1, // Only retry failed requests once
        refetchOnWindowFocus: false, // Disable automatic refetch on window focus
        refetchOnReconnect: false, // Disable automatic refetch on reconnect
        refetchOnMount: false, // Disable refetch on mount (use cached data when navigating)
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

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use the singleton query client
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
