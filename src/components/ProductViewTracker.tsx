"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/fpixel";
import type { Product } from "@/lib/supabase/product-queries";

interface Props {
  product: Product | null;
}

const ProductViewTracker = ({ product }: Props) => {
  useEffect(() => {
    if (product) {
      console.log("Tracking ViewContent for product:", product.id);
      trackViewContent({
        content_name: product.name,
        content_ids: [String(product.id)],
        content_type: "product",
        value: product.price, // Use the main price
        currency: "KES",
      });
    }
  }, [product]); // Dependency array ensures it runs when product data is available

  // This component doesn't render anything visible
  return null;
};

export default ProductViewTracker;
