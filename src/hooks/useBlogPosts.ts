import { useQuery } from "@tanstack/react-query";
import { blogPostQueries } from "@/lib/supabase/blog-posts";

export function useBlogPosts({
  page = 1,
  categorySlug,
  search,
}: {
  page?: number;
  categorySlug?: string;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: ["blog-posts", { page, categorySlug, search }],
    queryFn: () => blogPostQueries.getBlogPosts({ page, categorySlug, search }),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => blogPostQueries.getBlogPostBySlug(slug),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRecentPosts(limit = 4) {
  return useQuery({
    queryKey: ["blog-posts", "recent", limit],
    queryFn: () => blogPostQueries.getRecentPosts(limit),
    staleTime: 1000 * 60 * 5,
  });
}
