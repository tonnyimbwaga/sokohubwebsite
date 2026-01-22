"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import type { Product } from "@/data/types";

const SECTION_CONTENT = {
  title: "All Deals",
  description: "Browse all our amazing deals and save big on these items",
} as const;

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  status: string;
  is_featured: boolean;
  is_deal: boolean;
  deal_order: number | null;
  sku: string;
  category_id: string;
  images: Array<{
    web_image_url?: string;
    feed_image_url?: string;
    url?: string;
    alt?: string;
  }>;
  categories: {
    name: string;
    slug: string;
  } | null;
  slug: string;
}

const DealsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      setError(null);
      try {
        const { error: tableError } = await supabase
          .from("products")
          .select("id")
          .limit(1);

        if (tableError?.message?.includes("does not exist")) {
          console.error("Products table not found. Database setup required.");
          setError("Store is being set up. Please check back soon.");
          setLoading(false);
          return;
        }

        const { data: rawData, error: fetchError } = await supabase
          .from("products")
          .select(
            `
            id,
            name,
            description,
            price,
            compare_at_price,
            stock,
            status,
            is_featured,
            is_deal,
            deal_order,
            sku,
            slug,
            category_id,
            images,
            categories:categories(name, slug)
          `,
          )
          .eq("status", "active")
          .not("compare_at_price", "is", null)
          .order("deal_order", { ascending: true })
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Error fetching deals:", fetchError.message, {
            details: fetchError.details,
            hint: fetchError.hint,
            context: "DealsPage",
            timestamp: new Date().toISOString(),
          });
          setError("Unable to load deals at this time.");
          setLoading(false);
          return;
        }

        if (!rawData || rawData.length === 0) {
          setProducts([]);
        } else {
          const fetchedProducts = rawData as unknown as DatabaseProduct[];
          // Calculate discount percentage for each product
          const productsWithDiscount = fetchedProducts
            .filter(
              (product) =>
                product.compare_at_price &&
                product.compare_at_price > product.price,
            )
            .map((product) => {
              const discountPercentage = product.compare_at_price
                ? ((product.compare_at_price - product.price) /
                    product.compare_at_price) *
                  100
                : 0;
              return {
                ...product,
                discountPercentage,
              };
            })
            // Sort by discount percentage (highest first)
            .sort((a, b) => b.discountPercentage - a.discountPercentage);

          const productsWithImages = productsWithDiscount.map(
            (product, index) => ({
              id: product.id,
              name: product.name,
              description: product.description,
              price: product.compare_at_price || product.price,
              salePrice: product.price,
              images: Array.isArray(product.images)
                ? product.images.map((img) => ({ url: img }))
                : [{ url: "/images/placeholder.png" }],
              sku: product.sku || `TOT-${product.id.slice(0, 8)}`,
              slug: product.slug,
              category: product.categories?.name || "",
              categorySlug: "",
              ageRange: "",
              inStock: product.stock > 0,
              isFeatured: product.is_featured || false,
              rating: 5,
              reviews: 0,
              index: index + 1,
              sizes: [
                {
                  value: "0-2",
                  label: "0-2 years",
                  price: product.price,
                  inStock: true,
                },
                {
                  value: "2-4",
                  label: "2-4 years",
                  price: product.price,
                  inStock: true,
                },
                {
                  value: "4-6",
                  label: "4-6 years",
                  price: product.price,
                  inStock: true,
                },
                {
                  value: "6+",
                  label: "6+ years",
                  price: product.price,
                  inStock: true,
                },
              ],
            }),
          ) as Product[];
          setProducts(productsWithImages);
        }
      } catch (err) {
        console.error(
          "Error in DealsPage fetch:",
          err instanceof Error ? err.message : "Unknown error",
          {
            context: "DealsPage useEffect",
            timestamp: new Date().toISOString(),
          },
        );
        setError("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return (
    <div className="container py-10">
      <SectionHeading
        title={SECTION_CONTENT.title}
        description={SECTION_CONTENT.description}
      />
      <div className="mt-8">
        {loading && (
          <div className="text-center text-gray-500">Loading deals...</div>
        )}
        {error && (
          <div className="text-center text-red-500">Error: {error}</div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="text-center text-gray-500">
            No deals available at the moment.
          </div>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="best-deals-card"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsPage;
