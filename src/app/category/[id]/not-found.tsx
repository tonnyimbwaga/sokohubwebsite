import Link from "next/link";
import ProductSuggestions from "@/components/ProductSuggestions";
import { createClient } from "@/lib/supabase/server";
import { constructMetadata } from "@/utils/seo";

export const metadata = constructMetadata({
  title: "Category Not Found",
  description: "We couldn't find the category you're looking for, but we have some amazing alternatives for you!",
});

export default async function CategoryNotFound() {
  const supabase = await createClient();

  // Get featured, trending, and deals products
  const [featuredResult, trendingResult, dealsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .eq("is_featured", true as any)
      .limit(8),
    supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .eq("is_trending", true as any)
      .limit(8),
    supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .not("compare_at_price", "is", null)
      .limit(8),
  ]);

  const featuredProducts = featuredResult.data || [];
  const trendingProducts = trendingResult.data || [];
  const dealsProducts = dealsResult.data || [];

  return (
    <div className="min-h-[50vh] bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
            Category Not Found
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            We couldn&apos;t find the category you&apos;re looking for, but don&apos;t worry!
            We have lots of other amazing products waiting to be discovered.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/products"
              className="inline-block rounded-full bg-primary px-8 py-3 text-lg font-medium text-white shadow-lg transition-transform hover:scale-105"
            >
              Browse Products
            </Link>
            <Link
              href="/"
              className="inline-block rounded-full border-2 border-primary bg-white px-8 py-3 text-lg font-medium text-primary shadow-lg transition-transform hover:scale-105"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <ProductSuggestions
          relatedProducts={featuredProducts}
          trendingProducts={trendingProducts}
          dealsProducts={dealsProducts}
        />
      </div>
    </div>
  );
}
