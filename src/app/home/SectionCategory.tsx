"use client";

import React from "react";
import ProductCarousel from "@/components/ProductCarousel";
import SectionHeading from "@/components/SectionHeading";
import { generateCategoryAnchor } from "@/lib/static-category-data";
import type { Product } from "@/data/types";

interface SectionCategoryProps {
  categoryName: string;
  categorySlug: string;
  description?: string;
  totalProductCount?: number;
  products?: Product[]; // Accept products from server-side
}

const SectionCategory = ({
  categoryName,
  categorySlug,
  description,
  totalProductCount = 0,
  products = [],
}: SectionCategoryProps) => {
  // Always render the section to ensure carousel links work
  return (
    <div
      id={generateCategoryAnchor(categorySlug)}
      className="section-container p-8 scroll-mt-24"
    >
      <SectionHeading
        title={categoryName}
        description={
          (() => {
            if (!description) {
              return `Explore our curated selection of ${categoryName.toLowerCase()}`;
            }
            // Match the first sentence including punctuation and trailing space
            const match = description.match(/^.*?[.!?](?:\s|$)/);
            return match ? match[0].trim() : description;
          })()
        }
      />
      <div className="mt-8">
        {products.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="mb-2">🚀 New Inventory Pending</div>
            <div>
              Our logistics team is currently updating our {categoryName.toLowerCase()} collection.
            </div>
            <div className="text-sm mt-2">
              Please check back shortly for our newest arrivals.
            </div>
          </div>
        )}
        {products.length > 0 && (
          <ProductCarousel
            products={products}
            priorityCount={7}
            showViewAll={true}
            categoryName={categoryName}
            categorySlug={categorySlug}
            totalProductCount={totalProductCount}
          />
        )}
      </div>
    </div>
  );
};

export default SectionCategory;
