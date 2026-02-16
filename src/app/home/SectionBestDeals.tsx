import React from "react";
import ProductCarousel from "@/components/ProductCarousel";
import SectionHeading from "@/components/SectionHeading";
import { getCachedDeals } from "@/lib/supabase/cached-queries";

const SECTION_CONTENT = {
  title: "Best Deals",
  description: "Save big on these amazing items",
} as const;

export default async function SectionBestDeals() {
  const products = await getCachedDeals();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      <div id="hottest-deals" className="scroll-mt-20">
        <SectionHeading
          title={SECTION_CONTENT.title}
          description={SECTION_CONTENT.description}
        />
        <div className="mt-8">
          <ProductCarousel products={products as any} priorityCount={6} />
        </div>
      </div>
    </>
  );
}
