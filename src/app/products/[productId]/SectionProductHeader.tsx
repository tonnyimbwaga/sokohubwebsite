"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const VariantButton = dynamic(() => import("@/components/VariantButton"), {
  ssr: false,
});
import type { Variant } from "@/components/VariantButton";

import { useCart } from "@/hooks/useCart";
import OptimizedImage from "@/components/OptimizedImage";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { Product } from "@/data/types";
import { getProductImageUrl } from "@/utils/product-images";
import { trackAddToCart } from "@/lib/fpixel";
import StickyAddToCartBar from "@/components/StickyAddToCartBar";
import { toast } from "sonner";
import { sanitizeHTML } from "@/utils/sanitizeHTML";

interface Props {
  product: Product;
}

const SectionProductHeader = ({ product }: Props) => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(undefined);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showVariantWarning, setShowVariantWarning] = useState(false);

  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);
  const desktopAddToCartRef = useRef<HTMLDivElement>(null);
  const mobileAddToCartRef = useRef<HTMLDivElement>(null);

  // ... (sanitizedDescription code)

  // ... (displayPriceValue code)

  // ... (useEffect for warning)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const isMobile = window.innerWidth < 1024;
        const entry = entries.find(e => {
          return isMobile ? e.target === mobileAddToCartRef.current : e.target === desktopAddToCartRef.current;
        });

        if (entry) {
          setIsStickyBarVisible(!entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );

    if (desktopAddToCartRef.current) observer.observe(desktopAddToCartRef.current);
    if (mobileAddToCartRef.current) observer.observe(mobileAddToCartRef.current);

    const handleResize = () => {
      const isMobile = window.innerWidth < 1024;
      const targetRef = isMobile ? mobileAddToCartRef.current : desktopAddToCartRef.current;

      if (targetRef) {
        const rect = targetRef.getBoundingClientRect();
        // Simple check: if top is above viewport (scrolled past) or extremely far below (though usually we care about scrolled past)
        // Actually, just relying on observer state might be safer/simpler, but observer callbak fires on resize? No.
        // So we force a check or rely on scrolling.
        // Let's just reset based on a manual check.
        const isOutOfView = rect.bottom < 0;
        setIsStickyBarVisible(isOutOfView);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleActionClick = (action: "addToCart" | "buyNow") => {
    if (hasVariants && !selectedVariant) {
      setShowVariantWarning(true);
      const variantSection = document.getElementById("variant-selection-section");
      variantSection?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const cartItem = {
      ...product,
      quantity: 1,
      selectedSize: selectedVariant?.value,
      price: displayPriceValue, // Use the variant price
    };

    if (action === "addToCart") {
      addToCart(cartItem);
      trackAddToCart({
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: displayPriceValue,
        currency: "KES",
      });
      toast.success(`${product.name} added to cart!`, {
        description: selectedVariant ? `Variant: ${selectedVariant.label}` : undefined,
        action: {
          label: "View Cart",
          onClick: () => router.push("/cart"),
        },
      });
    } else {
      addToCart(cartItem);
      router.push("/cart");
    }
  };

  const handleWhatsAppOrder = () => {
    if (hasVariants && !selectedVariant) {
      setShowVariantWarning(true);
      return;
    }

    const message = `Hello, I'm interested in buying the ${product.name}${selectedVariant ? ` (${selectedVariant.label})` : ""
      } for KES ${displayPriceValue.toLocaleString()}. Here is the link: ${window.location.href}`;
    const whatsappUrl = `https://wa.me/254712345678?text=${encodeURIComponent(
      message,
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <div className="main-layout pt-4 pb-8 lg:pt-8">
        <div className="content-with-sidebars flex flex-col lg:flex-row gap-8 lg:items-start px-4">
          <div className="lg:w-[60%] flex flex-col gap-6">
            {/* Image Gallery */}
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-xl group border border-slate-100">
              <OptimizedImage
                src={getProductImageUrl(product.images[selectedImageIndex])}
                alt={product.images[selectedImageIndex]?.alt || product.name}
                className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                width={800}
                height={800}
                priority
              />
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white shadow-sm ${selectedImageIndex === index
                      ? "border-primary ring-4 ring-primary/10"
                      : "border-slate-100 opacity-60 hover:opacity-100 hover:border-slate-300"
                      }`}
                  >
                    <OptimizedImage
                      src={getProductImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      className="h-full w-full object-contain"
                      width={150}
                      height={150}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Product Details (Mobile/Tablet) */}
            <div className="lg:hidden space-y-4">
              <div className="text-sm font-bold tracking-wider text-primary uppercase bg-primary/5 px-4 py-1 rounded-full w-fit">
                {product.category}
              </div>
              <h1 className="text-3xl font-black text-slate-900 leading-tight">
                {product.name}
              </h1>
              <div
                className={`text-slate-600 leading-relaxed text-base prose prose-slate max-w-none prose-p:my-2 ${!isDescriptionExpanded && "line-clamp-3"
                  }`}
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-primary font-bold text-sm tracking-wide uppercase flex items-center gap-2 hover:gap-3 transition-all"
              >
                {isDescriptionExpanded ? "Show Less" : "Read More"}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isDescriptionExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Product info for attributes/options */}
              {product.options && Object.entries(product.options).length > 0 && (
                <div className="w-full mt-6 bg-white/95 rounded-2xl shadow-lg p-6 border border-slate-100">
                  <h3 className="text-lg font-bold mb-4 text-slate-900">Specifications</h3>
                  <div className="space-y-3">
                    {Object.entries(product.options).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <span className="text-sm font-medium text-slate-500">{key}</span>
                        <span className="text-sm font-bold text-slate-900">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile Action Buttons */}
              <div className="space-y-4 pt-6" ref={mobileAddToCartRef}>
                {/* Variant Selection for Mobile */}
                {hasVariants && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Option</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {product.sizes?.map((variant: any) => (
                        <VariantButton
                          key={variant.value}
                          variant={variant}
                          selected={selectedVariant?.value === variant.value}
                          onSelect={setSelectedVariant}
                          disabled={!product.inStock}
                        />
                      ))}
                    </div>
                    {showVariantWarning && !selectedVariant && (
                      <p className="text-xs text-red-500 font-bold bg-red-100/50 p-2 rounded-lg">
                        Please select an option
                      </p>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <ButtonPrimary
                    className="w-full justify-center bg-primary hover:bg-black text-white font-black rounded-2xl py-4 shadow-xl uppercase tracking-widest text-sm"
                    onClick={() => handleActionClick("addToCart")}
                    disabled={!product.inStock}
                  >
                    Add to Cart
                  </ButtonPrimary>

                  <button
                    onClick={() => handleActionClick("buyNow")}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-4 font-black text-slate-900 hover:border-primary uppercase tracking-widest text-sm"
                    disabled={!product.inStock}
                  >
                    Buy Now
                  </button>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-4 font-black text-white hover:bg-[#128C7E] shadow-lg shadow-green-200 uppercase tracking-widest text-sm"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.897-5.335 11.9-11.894a11.83 11.83 0 00-3.415-8.412" />
                    </svg>
                    WhatsApp Us
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info Card - desktop only */}
          <div className="mt-8 lg:mt-0 lg:w-[40%] lg:pl-8 xl:pl-12 hidden lg:flex justify-center">
            <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-8 flex flex-col gap-6 border border-slate-100">
              <div className="space-y-2">
                <div className="text-xs font-black tracking-[0.2em] text-primary uppercase">
                  {product.category}
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Price Display */}
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">
                    {hasVariants && !selectedVariant ? "From " : ""}
                    KES {displayPriceValue.toLocaleString()}
                  </span>
                  {(product as any).compare_at_price && (product as any).compare_at_price > displayPriceValue && (
                    <span className="text-lg text-slate-400 line-through font-medium">
                      KES {(product as any).compare_at_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div id="variant-selection-section" className="space-y-6 pt-4">
                {/* Unified Variant Selection */}
                {hasVariants && (
                  <motion.div
                    className={`p-1 rounded-2xl transition-all ${showVariantWarning ? "bg-red-50/50" : ""}`}
                    animate={showVariantWarning ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Option</h3>
                      {selectedVariant && (
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 animate-in fade-in zoom-in-95">
                          SELECTED: {selectedVariant.label}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {product.sizes?.map((variant: any) => (
                        <VariantButton
                          key={variant.value}
                          variant={variant}
                          selected={selectedVariant?.value === variant.value}
                          onSelect={setSelectedVariant}
                          disabled={!product.inStock}
                        />
                      ))}
                    </div>

                    <AnimatePresence>
                      {showVariantWarning && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-xs text-red-500 mt-4 font-bold flex items-center gap-2 bg-red-100/50 p-2 rounded-lg"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Please make a selection to continue
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4" ref={desktopAddToCartRef}>
                <ButtonPrimary
                  className="w-full justify-center bg-primary hover:bg-black text-white font-black rounded-2xl py-4 transition-all duration-300 shadow-xl hover:shadow-primary/25 disabled:opacity-50 uppercase tracking-widest text-sm"
                  onClick={() => handleActionClick("addToCart")}
                  disabled={!product.inStock}
                >
                  Add to Cart
                </ButtonPrimary>

                <button
                  onClick={() => handleActionClick("buyNow")}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-4 font-black text-slate-900 transition-all duration-300 hover:border-primary hover:text-primary disabled:opacity-50 uppercase tracking-widest text-sm"
                  disabled={!product.inStock}
                >
                  Buy Now
                </button>

                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-4 font-black text-white transition-all duration-300 hover:bg-[#128C7E] shadow-lg shadow-green-200 hover:shadow-green-300 uppercase tracking-widest text-sm"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.897-5.335 11.9-11.894a11.83 11.83 0 00-3.415-8.412" />
                  </svg>
                  WhatsApp Us
                </button>
              </div>

              {/* Delivery Info Mockup */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V9a1 1 0 00-1-1h-5z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-slate-400 leading-tight">Delivery</span>
                    <span className="text-xs font-bold text-slate-800">2-3 Hours</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.946-3.076 9.165-7.418 10.824a1.051 1.051 0 01-.764 0C5.4 16.165 2.324 11.946 2.324 7c0-.68.056-1.35.166-2.001zm8.834 2.002a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 102 0v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black text-slate-400 leading-tight">Payment</span>
                    <span className="text-xs font-bold text-slate-800">Secured</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Options / attributes (e.g. Material) (Desktop) */}
        {product.options && Object.entries(product.options).length > 0 && (
          <div className="hidden lg:block main-layout px-4 mt-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-xl font-black text-slate-900 mb-6">Product Specifications</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(product.options).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1 border-l-2 border-slate-100 pl-4 hover:border-primary transition-colors">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{key}</span>
                    <span className="text-base font-bold text-slate-800">{value as string}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <StickyAddToCartBar
        product={product}
        selectedSize={selectedVariant}
        onSelectSize={setSelectedVariant}
        onActionClick={handleActionClick}
        isVisible={isStickyBarVisible}
      />
    </>
  );
};

export default SectionProductHeader;
