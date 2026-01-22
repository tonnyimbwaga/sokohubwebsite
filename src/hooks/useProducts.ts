import { useQuery } from "@tanstack/react-query";
import { productQueries } from "@/lib/supabase/products";

export function useProducts({
  page = 1,
  categorySlug,
  featured,
  deals,
  trending,
  search,
}: {
  page?: number;
  categorySlug?: string;
  featured?: boolean;
  deals?: boolean;
  trending?: boolean;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: [
      "products",
      { page, categorySlug, featured, deals, trending, search },
    ],
    queryFn: () =>
      productQueries.getProducts({
        page,
        categorySlug,
        featured,
        deals,
        trending,
        search,
      }),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => productQueries.getProductBySlug(slug),
    staleTime: 1000 * 60 * 5,
  });
}

export function useNewArrivals(limit = 8) {
  return useQuery({
    queryKey: ["products", "new-arrivals", limit],
    queryFn: () => productQueries.getNewArrivals(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useFeaturedProducts(limit = 8) {
  return useQuery({
    queryKey: ["products", "featured", limit],
    queryFn: () => productQueries.getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeals(limit = 8) {
  return useQuery({
    queryKey: ["products", "deals", limit],
    queryFn: () => productQueries.getDeals(limit),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTrendingProducts(limit = 8) {
  return useQuery({
    queryKey: ["products", "trending", limit],
    queryFn: () => productQueries.getTrendingProducts(limit),
    staleTime: 1000 * 60 * 5,
  });
}
