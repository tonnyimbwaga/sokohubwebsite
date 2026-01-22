"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Product } from "@/data/types";
import type { Size } from "@/components/SizeButton"; // Assuming SizeButton exports this type
import ButtonPrimary from "@/shared/Button/ButtonPrimary";

interface StickyAddToCartBarProps {
  product: Product;
  isVisible: boolean;
  onAddToCart: () => void; // Simplified for now, might need more args
  selectedSize?: Size; // Cascade: Intended for future use e.g. display selected size or mini-selector
  // We might need to pass down more props related to size selection and warnings
  // or manage a simplified version of that logic here.
  currentPrice: number; // Price to display, could be base or size-specific
  hasSizes: boolean; // Cascade: Intended for future use e.g. conditional rendering of mini-selector
  isAddToCartDisabled: boolean;
}

const StickyAddToCartBar: React.FC<StickyAddToCartBarProps> = ({
  product,
  isVisible,
  onAddToCart,
  selectedSize, // Cascade: Prop retained for future enhancements
  currentPrice,
  hasSizes, // Cascade: Prop retained for future enhancements
  isAddToCartDisabled,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 p-3 shadow-top lg:hidden"
    >
      <div className="container mx-auto flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <p className="text-sm text-gray-500 truncate max-w-[100px]">
            {product.name}
          </p>
          <p className="text-lg font-semibold text-primary">
            KSh {currentPrice.toLocaleString()}
          </p>
        </div>

        {/* Mini size selector could go here if hasSizes and compact enough */}
        {/* For now, we assume size selection is handled before this bar becomes critical or on the bar itself */}

        <ButtonPrimary
          onClick={onAddToCart}
          disabled={isAddToCartDisabled}
          className="flex-grow max-w-[200px] !py-2.5 text-sm"
        >
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          Add to Cart
        </ButtonPrimary>
      </div>
    </motion.div>
  );
};

export default StickyAddToCartBar;
