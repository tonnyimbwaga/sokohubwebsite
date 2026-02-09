"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Product } from "@/data/types";
import type { Variant } from "@/components/VariantButton";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";

interface StickyAddToCartBarProps {
  product: Product;
  isVisible: boolean;
  selectedSize?: Variant;
  onSelectSize?: (variant: Variant) => void;
  onActionClick: (action: "addToCart" | "buyNow") => void;
}

const StickyAddToCartBar: React.FC<StickyAddToCartBarProps> = ({
  product,
  isVisible,
  selectedSize,
  onActionClick,
}) => {
  if (!isVisible) return null;

  // Calculate current price based on selection or product default
  const hasVariants = Array.isArray(product.sizes) && product.sizes.length > 0;
  const currentPrice = selectedSize
    ? selectedSize.price
    : (hasVariants
      ? Math.min(...(product.sizes || []).map(v => v.price))
      : product.price);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] lg:hidden rounded-t-[2.5rem]"
    >
      <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {product.category}
            </span>
            <AnimatePresence mode="wait">
              {selectedSize && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-[10px] font-bold text-slate-500 truncate"
                >
                  • {selectedSize.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <p className="text-xl font-black text-slate-900 tracking-tighter">
            KES {currentPrice.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-grow justify-end">
          <ButtonPrimary
            onClick={() => onActionClick("addToCart")}
            disabled={!product.inStock}
            className="!py-3.5 !px-6 bg-primary hover:bg-black text-white font-black rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 border-none transition-all active:scale-95"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            <span className="text-sm uppercase tracking-widest">Add</span>
          </ButtonPrimary>
        </div>
      </div>
    </motion.div>
  );
};

export default StickyAddToCartBar;
