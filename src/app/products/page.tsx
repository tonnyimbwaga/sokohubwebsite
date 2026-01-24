import React from "react";
import ProductCard from "@/components/ProductCard";
import SidebarFilters from "@/components/SideBarFilter";
import { getCachedProducts, getCachedCategories } from "@/lib/supabase/cached-queries";
import SearchInput from "@/components/Products/SearchInput";
import MobileFilters from "@/components/Products/MobileFilters";
import { LuPackageSearch } from "react-icons/lu";

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
    minPrice: typeof params.minPrice === "string" ? parseInt(params.minPrice) : undefined,
    maxPrice: typeof params.maxPrice === "string" ? parseInt(params.maxPrice) : undefined,
    sort: (params.sort as any) || "newest",
    page: typeof params.page === "string" ? parseInt(params.page) : 1,
  };

  const { products, totalProducts } = await getCachedProducts(queryParams);

  return (
    <div className="bg-white min-h-screen">
      <div className="container py-12 lg:py-20">
        {/* Header Section */}
        <div className="mb-10 block lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 md:text-5xl">Our Products</h1>
            <p className="mt-4 text-lg text-neutral-500">
              Discover {totalProducts} curated products across {categories.length || 0} categories. Fast delivery within Nairobi and beyond.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 lg:mt-0">
            <div className="w-full sm:w-80">
              <SearchInput defaultValue={queryParams.search} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-500 whitespace-nowrap">Sort By:</span>
              <select
                defaultValue={queryParams.sort}
                onChange={(e) => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("sort", e.target.value);
                  window.location.href = url.toString();
                }}
                className="bg-white border border-neutral-200 rounded-xl px-4 py-2 text-sm font-semibold focus:ring-2 focus:ring-purple-500 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="mb-12 border-neutral-200" />

        <div className="flex flex-col lg:flex-row gap-12" id="body">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-1/4">
            <div className="sticky top-28">
              <SidebarFilters categories={categories} activeCategory={queryParams.categorySlug} />
            </div>
          </aside>

          <main className="flex-1">
            {/* Mobile Actions Bar */}
            <div className="mb-8 flex items-center justify-between lg:hidden bg-neutral-50 p-4 rounded-2xl">
              <MobileFilters categories={categories} activeCategory={queryParams.categorySlug} />
              <div className="text-sm font-semibold text-neutral-600">
                {totalProducts} Items found
              </div>
            </div>

            {/* Desktop Stats Bar */}
            <div className="hidden lg:flex items-center justify-between mb-8 pb-4 border-b border-neutral-100">
              <div className="text-neutral-500 font-medium">
                Showing <span className="text-neutral-900">{products?.length || 0}</span> of <span className="text-neutral-900">{totalProducts}</span> results
              </div>
            </div>

            {/* Product Grid */}
            {!products || products.length === 0 ? (
              <div className="rounded-[2.5rem] bg-neutral-50/50 border-2 border-dashed border-neutral-200 py-32 px-6 text-center">
                <div className="mx-auto w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                  <LuPackageSearch className="text-4xl text-neutral-300" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900">No products found</h3>
                <p className="mt-3 text-neutral-500 max-w-sm mx-auto">We couldn't find any products matching your current filters. Try resetting them or searching for something else.</p>
                <div className="mt-10">
                  <a
                    href="/products"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 font-bold text-black hover:bg-opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    Clear All Filters
                  </a>
                </div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalProducts > 12 && (
                  <div className="mt-20 flex items-center justify-center pt-10 border-t border-neutral-100">
                    <button className="rounded-full bg-neutral-900 px-10 py-4 text-sm font-bold text-white hover:bg-neutral-800 transition-all shadow-xl shadow-black/10">
                      View More Products
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
