import { serverCategoryQueries } from "@/lib/supabase/categories.server";
import CategoryCarousel from "./CategoryCarousel";
import { unstable_cache } from "next/cache";

export const revalidate = 3600; // Revalidate every hour

// Cached function to get category summaries
const getCachedCategorySummaries = unstable_cache(
  async () => {
    return await serverCategoryQueries.getCategorySummaries();
  },
  ["category-summaries"],
  {
    revalidate: 3600, // 1 hour
    tags: ["homepage-categories", "category-summaries"],
  },
);

export default async function CategoryCarouselServer() {
  const categories = await getCachedCategorySummaries();

  // The client component will handle the loading/empty state
  return <CategoryCarousel categories={categories} />;
}
