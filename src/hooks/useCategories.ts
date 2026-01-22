import { useQuery } from "@tanstack/react-query";
import { categoryQueries } from "@/lib/supabase/categories";

// Increased stale time since categories change infrequently
const STALE_TIME = 1000 * 60 * 60 * 24; // 24 hours
const GCTIME = 1000 * 60 * 60 * 24 * 7; // 7 days

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryQueries.getCategories(),
    staleTime: STALE_TIME,
    gcTime: GCTIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoryQueries.getCategoryBySlug(slug),
    staleTime: STALE_TIME,
    gcTime: GCTIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useCategoriesWithCount() {
  return useQuery({
    queryKey: ["categories", "with-count"],
    queryFn: () => categoryQueries.getCategoriesWithCount(),
    staleTime: STALE_TIME,
    gcTime: GCTIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
