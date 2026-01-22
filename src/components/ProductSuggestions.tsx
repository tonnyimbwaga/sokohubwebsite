"use client";

import React from "react";
import ProductCarousel from "./ProductCarousel";
import SectionHeading from "./SectionHeading";
import type { Product } from "@/lib/supabase/product-queries";

interface ProductSuggestionsProps {
  relatedProducts: Product[]; // Same category products
  trendingProducts: Product[]; // Popular/trending products
  dealsProducts: Product[]; // Best deals products
  currentCategory?: string;
}

export default function ProductSuggestions({
  relatedProducts,
  trendingProducts,
  dealsProducts,
  currentCategory,
}: ProductSuggestionsProps) {
  return (
    <div className="space-y-16">
      {/* Section 1: Same Category Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mb-12">
          <SectionHeading
            title={`More from ${currentCategory || "This Category"}`}
            description="Discover similar products you might love"
          />
          <div className="mt-8">
            <ProductCarousel
              products={
                relatedProducts
                  .slice(0, 8)
                  .map((p) => ({
                    ...p,
                    isFeatured: p.isFeatured || false,
                  })) as any
              }
              priorityCount={4}
              showViewAll={false}
            />
          </div>
        </div>
      )}

      {/* Section 2: Trending Products */}
      {trendingProducts && trendingProducts.length > 0 && (
        <div className="mb-12">
          <SectionHeading
            title="Trending Now"
            description="Popular picks that other families are loving"
          />
          <div className="mt-8">
            <ProductCarousel
              products={
                trendingProducts
                  .slice(0, 8)
                  .map((p) => ({
                    ...p,
                    isFeatured: p.isFeatured || false,
                  })) as any
              }
              priorityCount={4}
              showViewAll={false}
            />
          </div>
        </div>
      )}

      {/* Section 3: Best Deals */}
      {dealsProducts && dealsProducts.length > 0 && (
        <div>
          <SectionHeading
            title="Best Deals"
            description="Amazing offers you don't want to miss"
          />
          <div className="mt-8">
            <ProductCarousel
              products={
                dealsProducts
                  .filter(
                    (p: any) =>
                      p.compare_at_price && p.compare_at_price > p.price,
                  )
                  .map((p: any) => {
                    const discountPercentage = p.compare_at_price
                      ? ((p.compare_at_price - p.price) / p.compare_at_price) *
                        100
                      : 0;
                    return {
                      ...p,
                      isFeatured: p.isFeatured || false,
                      discountPercentage: Math.round(discountPercentage),
                    };
                  })
                  .sort(
                    (a: any, b: any) =>
                      b.discountPercentage - a.discountPercentage,
                  )
                  .slice(0, 8) as any
              }
              priorityCount={4}
              showViewAll={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
