import React from "react";
import ProductCarousel from "@/components/ProductCarousel";
import SectionHeading from "@/components/SectionHeading";
import { getCachedNewArrivals } from "@/lib/supabase/cached-queries";

const SECTION_CONTENT = {
  title: "New Arrivals",
  description: "Check out our latest arrivals",
} as const;

export default async function SectionNewArrivals() {
  const products = await getCachedNewArrivals();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      <SectionHeading
        title={SECTION_CONTENT.title}
        description={SECTION_CONTENT.description}
      />
      <div className="mt-8">
        <ProductCarousel products={products as any} priorityCount={6} />
      </div>
    </>
  );
}
