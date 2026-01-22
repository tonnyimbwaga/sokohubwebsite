"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/types";
import Heading from "@/shared/Heading/Heading";
import { getProductImageUrl } from "@/utils/product-images";

interface Props {
  currentProduct: Product;
}

const SectionMoreProducts = ({ currentProduct }: Props) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        const { data: rawProducts, error } = await supabase
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
            sku,
            slug,
            category_id,
            images,
            categories:categories(name, slug)
          `,
          )
          .eq("status", "active")
          .eq("categories.name", currentProduct.category)
          .neq("id", currentProduct.id)
          .limit(4);

        if (error) {
          console.error("Error fetching related products:", error);
          return;
        }

        const products: Product[] = (rawProducts || []).map((product: any) => {
          // Calculate discount percentage if compare_at_price exists
          const discountPercentage =
            product.compare_at_price && product.compare_at_price > product.price
              ? Math.round(
                  ((product.compare_at_price - product.price) /
                    product.compare_at_price) *
                    100,
                )
              : undefined;

          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.compare_at_price || product.price, // Show original price
            salePrice:
              product.compare_at_price &&
              product.compare_at_price > product.price
                ? product.price
                : undefined, // Show sale price if applicable
            images:
              product.images?.map((img: string | { url: string }) =>
                getProductImageUrl(img),
              ) || [],
            sku: product.sku,
            slug: product.slug,
            category: product.categories?.name || "",
            categorySlug: product.categories?.slug || "",
            ageRange: "",
            inStock: product.stock > 0,
            isFeatured: product.is_featured || false,
            rating: 5,
            reviews: 0,
            discountPercentage,
          };
        });

        // Sort products to show deals first (highest discount percentage first), then regular products
        const sortedProducts = products.sort((a, b) => {
          if (a.discountPercentage && b.discountPercentage) {
            return b.discountPercentage - a.discountPercentage;
          } else if (a.discountPercentage && !b.discountPercentage) {
            return -1; // a comes first
          } else if (!a.discountPercentage && b.discountPercentage) {
            return 1; // b comes first
          }
          return 0; // maintain original order for products without discounts
        });

        setRelatedProducts(sortedProducts);
      } catch (err) {
        console.error("Error in fetchRelatedProducts:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRelatedProducts();
  }, [currentProduct.category, currentProduct.id]);

  if (isLoading) {
    return (
      <div className="container">
        <div className="my-16">
          <Heading>Related Products</Heading>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-w-1 aspect-h-1 mb-4 rounded-lg bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-1/3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="container">
      <div className="my-16">
        <Heading>Related Products</Heading>
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SectionMoreProducts;
