import React from "react";
import ProductCard from "@/components/ProductCard";
import SidebarFilters from "@/components/SideBarFilter";
import { getCachedProducts, getCachedCategories } from "@/lib/supabase/cached-queries";
import SearchInput from "@/components/Products/SearchInput";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const categories = await getCachedCategories();

  // Transform Next.js params to our query params
  const queryParams = {
    search: typeof params.q === "string" ? params.q : undefined,
    categorySlug: typeof params.category === "string" ? params.category : undefined,
    page: typeof params.page === "string" ? parseInt(params.page) : 1,
  };

  const { products, totalProducts } = await getCachedProducts(queryParams);

  return (
    <div className="">
      <div className="container relative flex flex-col lg:flex-row" id="body">
        <div className="pr-4 pt-10 lg:basis-1/3 xl:basis-1/4">
          <SidebarFilters categories={categories} activeCategory={queryParams.categorySlug} />
        </div>
        <div className="mb-10 shrink-0 border-t lg:mx-4 lg:mb-0 lg:border-t-0" />
        <div className="relative flex-1">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="hidden text-gray-600 lg:block">
                Showing {products?.length || 0} of {totalProducts} results
              </span>
            </div>
            <div className="flex w-full items-center gap-2 lg:w-auto">
              <SearchInput defaultValue={queryParams.search} />
            </div>
          </div>

          <div className="mb-10 shrink-0 border-t lg:hidden" />

          {!products || products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No products found. Try adjusting your search or filters.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
