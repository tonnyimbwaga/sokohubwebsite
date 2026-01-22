import React, { Suspense } from "react";
import { getHomepageCategoryData } from "@/lib/supabase/categories-homepage.server";
import SectionCategory from "./SectionCategory";

// Optimized skeleton for category sections
const CategorySectionSkeleton = ({
  categoryName,
}: {
  categoryName: string;
}) => (
  <div className="section-container p-4 sm:p-8 animate-pulse">
    <div className="mb-4 sm:mb-6">
      <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 mb-2"></div>
      <div className="h-3 sm:h-4 bg-gray-100 rounded w-48 sm:w-64"></div>
    </div>
    <div className="relative group">
      {/* Skeleton arrows */}
      <div className="absolute -left-1 sm:-left-2 lg:-left-4 top-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 animate-pulse opacity-50"></div>
      <div className="absolute -right-1 sm:-right-2 lg:-right-4 top-1/2 z-20 flex h-10 w-10 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full bg-gray-100 animate-pulse opacity-50"></div>

      <div className="no-scrollbar flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth px-1 py-2 -mx-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 mobile-product-card sm:min-w-[280px] sm:max-w-[280px]"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden card-shadow">
              <div className="aspect-square bg-gray-200 animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
              <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                <div className="h-4 sm:h-5 bg-gray-200 rounded animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
                <div className="h-3 sm:h-4 w-3/4 bg-gray-200 rounded animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 sm:h-6 w-12 sm:w-16 bg-gray-200 rounded animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
                  <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Individual category section with suspense
const CategorySectionWithSuspense = ({
  categoryName,
  categorySlug,
  totalCount,
  products,
}: {
  categoryName: string;
  categorySlug: string;
  totalCount: number;
  products: any[];
}) => (
  <Suspense fallback={<CategorySectionSkeleton categoryName={categoryName} />}>
    <SectionCategory
      categoryName={categoryName}
      categorySlug={categorySlug}
      totalProductCount={totalCount}
      products={products}
    />
  </Suspense>
);

// Server component that fetches all category data
export default async function HomepageCategorySections() {
  try {
    const categoryData = await getHomepageCategoryData();

    console.log(
      "HomepageCategorySections - categoryData:",
      categoryData?.length || 0,
      "categories",
    );

    if (!categoryData || categoryData.length === 0) {
      console.log("HomepageCategorySections - No category data found");
      return (
        <div className="section-container p-4 sm:p-8">
          <div className="text-center text-gray-500 text-sm sm:text-base">
            Loading category sections...
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 sm:space-y-8">
        {categoryData.map(({ category, totalCount, products }) => {
          if (products.length === 0) return null;

          console.log(
            "Rendering category section:",
            category.name,
            category.slug,
            "Total:",
            totalCount,
            "Products:",
            products.length,
          );
          return (
            <CategorySectionWithSuspense
              key={category.id}
              categoryName={category.name}
              categorySlug={category.slug}
              totalCount={totalCount}
              products={products}
            />
          );
        })}
      </div>
    );
  } catch (error) {
    console.error("HomepageCategorySections error:", error);
    return (
      <div className="section-container p-4 sm:p-8">
        <div className="text-center text-red-500 text-sm sm:text-base">
          Unable to load category sections at this time.
        </div>
      </div>
    );
  }
}
