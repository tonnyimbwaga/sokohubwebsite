"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import dynamic from "next/dynamic";
const SizeButton = dynamic(() => import("@/components/SizeButton"), {
  ssr: false,
});
import type { Size } from "@/components/SizeButton";

import { useCart } from "@/hooks/useCart";
import OptimizedImage from "@/components/OptimizedImage";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { Product, Color } from "@/data/types";
import Link from "next/link";
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
  const [selectedSize, setSelectedSize] = useState<Size | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<Color | undefined>(
    undefined,
  );
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [showColorWarning, setShowColorWarning] = useState(false);

  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);
  const addToCartButtonRef = useRef<HTMLDivElement>(null);

  // Sanitize product description
  const sanitizedDescription = product.description
    ? sanitizeHTML(product.description)
    : "";

  // Helper for size pricing
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const lowestSizePrice = hasSizes
    ? Math.min(...(product.sizes ?? []).map((s: Size) => s.price))
    : product.price;

  // Reset warning when size is selected
  useEffect(() => {
    if (selectedSize) {
      setShowSizeWarning(false);
    }
  }, [selectedSize]);

  // Reset color warning when color is selected
  useEffect(() => {
    if (selectedColor) {
      setShowColorWarning(false);
    }
  }, [selectedColor]);

  useEffect(() => {
    const mainAddToCartButton = addToCartButtonRef.current;
    if (!mainAddToCartButton) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsStickyBarVisible(
            !entry.isIntersecting && window.innerWidth < 1024,
          );
        }
      },
      { threshold: 0 },
    );

    observer.observe(mainAddToCartButton);

    const handleResize = () => {
      if (mainAddToCartButton) {
        const rect = mainAddToCartButton.getBoundingClientRect();
        const isOutOfView = rect.bottom < 0 || rect.top > window.innerHeight;
        setIsStickyBarVisible(isOutOfView && window.innerWidth < 1024);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      observer.unobserve(mainAddToCartButton);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Combined handler for Add to Cart and Buy Now
  const handleActionClick = (action: "addToCart" | "buyNow") => {
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;

    // Check if size selection is required and missing
    if (hasSizes && !selectedSize) {
      setShowSizeWarning(true);
      return; // Stop processing
    }

    // Check if color selection is required and missing
    if (hasColors && !selectedColor) {
      setShowColorWarning(true);
      return; // Stop processing
    }

    // Calculate final price based on selection
    const finalPrice = selectedSize?.price || (selectedColor?.price ? (product.price + selectedColor.price) : product.price);

    // Proceed with the action
    const itemToAdd = {
      ...product,
      price: finalPrice,
      quantity: 1,
      selectedSize: selectedSize?.value,
      selectedColor: selectedColor
    };
    addToCart(itemToAdd);
    trackAddToCart({
      content_ids: [String(product.id)],
      content_name: product.name,
      content_type: "product",
      value: (selectedSize?.price || (selectedColor?.price ? (product.price + selectedColor.price) : product.price)),
      currency: "KES",
    });

    let successMessage = `${product.name} added to cart!`;
    if (selectedSize?.value && selectedColor?.label) {
      successMessage = `${product.name} (Size: ${selectedSize.label}, Color: ${selectedColor.label}) added to cart!`;
    } else if (selectedSize?.value) {
      successMessage = `${product.name} (Size: ${selectedSize.label}) added to cart!`;
    } else if (selectedColor?.label) {
      successMessage = `${product.name} (Color: ${selectedColor.label}) added to cart!`;
    }
    toast.success(successMessage);

    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(100); // Vibrate for 100ms
    }

    if (action === "buyNow") {
      router.push("/checkout");
    }
  };

  const handleWhatsAppOrder = () => {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254700000000";
    const productUrl = `${window.location.origin}/products/${product.slug}`;
    let message = `Hello, I'm interested in ordering: *${product.name}*\nURL: ${productUrl}`;
    if (selectedSize) message += `\nSize: *${selectedSize.label}*`;
    if (selectedColor) message += `\nColor: *${selectedColor.label}*`;

    const encMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encMessage}`, "_blank");
  };

  // Main image logic
  const mainImageUrl = getProductImageUrl(product.images?.[selectedImageIndex]);

  return (
    <div className="relative">
      <div className="container">
        {/* Breadcrumbs */}
        <nav
          className="mb-4 text-sm text-gray-500 overflow-x-auto whitespace-nowrap max-w-full block lg:hidden"
          aria-label="Breadcrumb"
        >
          <ol className="flex flex-nowrap items-center gap-1 max-w-full">
            <li className="truncate max-w-[40vw]">
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            {product.category && (
              <li className="truncate max-w-[40vw]">
                <span className="mx-1">/</span>
                <Link
                  href={`/category/${product.categorySlug}`}
                  className="hover:underline"
                >
                  {product.category.length > 18
                    ? product.category.slice(0, 16) + "…"
                    : product.category}
                </Link>
              </li>
            )}
            <li className="truncate max-w-[40vw] font-semibold">
              <span className="mx-1">/</span>
              {product.name.length > 18
                ? product.name.slice(0, 16) + "…"
                : product.name}
            </li>
          </ol>
        </nav>
        <nav
          className="mb-4 text-sm text-gray-500 hidden lg:block"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </li>
            {product.category && (
              <li>
                <span className="mx-1">/</span>
                <Link
                  href={`/category/${product.categorySlug}`}
                  className="hover:underline"
                >
                  {product.category}
                </Link>
              </li>
            )}
            <li className="font-semibold">
              <span className="mx-1">/</span>
              {product.name}
            </li>
          </ol>
        </nav>
        <div className="relative flex flex-col lg:flex-row bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-4 md:p-8 gap-8">
          {/* Product Images Column */}
          <div className="relative w-full lg:w-[60%] xl:w-[65%] flex flex-col gap-8">
            {/* Main Image */}
            <div className="relative aspect-square w-full bg-white rounded-2xl shadow-[0_8px_25px_rgb(0,0,0,0.08)] overflow-hidden">
              <OptimizedImage
                src={mainImageUrl}
                alt={product.name}
                width={800}
                height={600}
                quality={90}
                priority={true}
                preload={true}
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain transition-opacity duration-700 ease-in-out group-hover:scale-110 rounded-xl w-full h-full"
              />
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  className={`relative aspect-square overflow-hidden rounded-xl transition-all duration-200 ${index === selectedImageIndex
                    }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <OptimizedImage
                    src={getProductImageUrl(image)}
                    alt={product.name}
                    width={120}
                    height={120}
                    quality={60}
                    loading="lazy"
                    className={`object-contain w-full h-full ${index === selectedImageIndex ? "ring-2 ring-primary" : ""
                      }`}
                  />
                </button>
              ))}
            </div>
            {/* Mobile: Product Info Card comes next */}
            <div className="block lg:hidden w-full">
              <div className="w-full bg-white/95 rounded-2xl shadow-[0_8px_25px_rgb(0,0,0,0.08)] p-6 flex flex-col gap-4">
                <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
                <div className="mb-4 flex items-center space-x-4">
                  <span className="text-2xl font-bold text-primary">
                    {(() => {
                      if (hasSizes && selectedSize) return `KES ${selectedSize.price.toLocaleString()}`;
                      if (product.colors && product.colors.length > 0 && selectedColor && selectedColor.price > 0) {
                        return `KES ${selectedColor.price.toLocaleString()}`;
                      }
                      if (hasSizes) return `From KES ${lowestSizePrice.toLocaleString()}`;
                      return `KES ${product.price.toLocaleString()}`;
                    })()}
                  </span>
                  {/* Only show compare price if no sizes and no specific color price */}
                  {!hasSizes && !selectedColor?.price && product.salePrice && (
                    <span className="text-lg text-gray-500 line-through">
                      KES {product.salePrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Color Selection (Mobile) */}
                {product.colors && product.colors.length > 0 && (
                  <motion.div
                    className={`mb-4 p-4 rounded-xl border-2 transition-all ${showColorWarning ? "border-red-500 bg-red-50" : "border-transparent bg-slate-50/50"
                      }`}
                    animate={showColorWarning ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15, duration: 0.4 }}
                  >
                    <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
                      <span>Select Color</span>
                      {selectedColor && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {selectedColor.label}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color: Color, index: number) => (
                        <button
                          key={index}
                          onClick={() => setSelectedColor(color)}
                          disabled={!color.available}
                          title={color.label}
                          className={`group relative flex items-center justify-center rounded-xl p-1 transition-all duration-200 border-2 ${selectedColor?.label === color.label
                            ? "border-primary bg-primary/5 shadow-md scale-105"
                            : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                            } ${!color.available ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <div className={`flex items-center gap-2 ${color.value ? "px-3 py-1" : "px-4 py-2"}`}>
                            {color.value && (
                              <div
                                className="w-5 h-5 rounded-full border border-gray-200"
                                style={{ backgroundColor: color.value }}
                              />
                            )}
                            <span className={`text-sm font-bold ${selectedColor?.label === color.label ? "text-primary" : "text-slate-700"
                              }`}>
                              {color.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {showColorWarning && (
                      <p className="text-xs text-red-500 mt-2 font-medium">Please select a color to continue</p>
                    )}
                  </motion.div>
                )}

                {/* Size Selection (Mobile) */}
                {hasSizes && (
                  <motion.div
                    className={`mb-4 p-4 rounded-xl border-2 transition-all ${showSizeWarning ? "border-red-500 bg-red-50" : "border-transparent bg-slate-50/50"
                      }`}
                    animate={showSizeWarning ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15, duration: 0.4 }}
                  >
                    <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
                      <span>Select Size</span>
                      {selectedSize && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {selectedSize.label}
                        </span>
                      )}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {product.sizes?.map((size: Size) => (
                        <SizeButton
                          key={size.value}
                          size={size}
                          selected={selectedSize?.value === size.value}
                          onSelect={setSelectedSize}
                          disabled={!product.inStock}
                        />
                      ))}
                    </div>
                    {showSizeWarning && (
                      <p className="text-xs text-red-500 mt-2 font-medium">Please select a size to continue</p>
                    )}
                  </motion.div>
                )}
                {/* Add to Cart Button */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full"
                >
                  <ButtonPrimary
                    className="mx-auto w-11/12 sm:w-full justify-center bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-3 transition-all duration-150 shadow-[0_4px_12px_rgb(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgb(0,0,0,0.15)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-primary"
                    onClick={() => handleActionClick("addToCart")}
                    disabled={!product.inStock || (hasSizes && !selectedSize)}
                  >
                    Add to Cart
                  </ButtonPrimary>
                </motion.div>
                {/* Buy Now Button */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full"
                >
                  <button
                    onClick={() => handleActionClick("buyNow")}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-slate-900 bg-transparent py-[10px] px-4 font-bold text-slate-900 transition-all duration-150 hover:bg-slate-900 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
                    disabled={!product.inStock || (hasSizes && !selectedSize)}
                  >
                    Buy Now
                  </button>
                </motion.div>
                {/* WhatsApp Button */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full"
                >
                  <button
                    onClick={handleWhatsAppOrder}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 px-4 font-bold text-white transition-all duration-150 hover:bg-green-700 shadow-md hover:shadow-lg"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.897-5.335 11.9-11.894a11.83 11.83 0 00-3.415-8.412" />
                    </svg>
                    Order via WHATSAPP
                  </button>
                </motion.div>
              </div>
            </div>
            {/* Mobile: Product Description Card comes after info card */}
            <div className="block lg:hidden w-full">
              <div className="w-full bg-white/95 rounded-2xl shadow-[0_8px_25px_rgb(0,0,0,0.08)] p-6 mt-4">
                <h3 className="text-lg font-semibold mb-4">
                  Product Description
                </h3>
                <div
                  className={`prose prose-sm product-description max-w-none ${!isDescriptionExpanded ? "line-clamp-3" : ""
                    }`}
                  dangerouslySetInnerHTML={{
                    __html: sanitizedDescription,
                  }}
                />
                {product.description.length > 200 && (
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className="mt-4 text-gray-600 hover:text-gray-900 font-medium text-sm"
                  >
                    {isDescriptionExpanded ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Product Info Card - desktop only */}
          <div className="mt-8 lg:mt-0 lg:w-[40%] lg:pl-8 xl:pl-12 hidden lg:flex justify-center">
            <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-[0_8px_25px_rgb(0,0,0,0.08)] p-6 flex flex-col gap-4">
              {/* Price Display */}
              <div className="mb-4 flex items-center space-x-4">
                <span className="text-2xl font-bold text-primary">
                  {(() => {
                    if (hasSizes && selectedSize) return `KES ${selectedSize.price.toLocaleString()}`;
                    if (product.colors && product.colors.length > 0 && selectedColor && selectedColor.price > 0) {
                      return `KES ${((product.price || 0) + selectedColor.price).toLocaleString()}`;
                    }
                    if (hasSizes) return `From KES ${lowestSizePrice.toLocaleString()}`;
                    return `KES ${(product.price || 0).toLocaleString()}`;
                  })()}
                </span>
                {!hasSizes && !selectedColor?.price && product.salePrice && (
                  <span className="text-lg text-gray-500 line-through">
                    KES {product.salePrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Color Selection (Desktop) */}
              {product.colors && product.colors.length > 0 && (
                <motion.div
                  className={`mb-6 p-4 rounded-xl border-2 transition-all ${showColorWarning ? "border-red-500 bg-red-50" : "border-transparent bg-slate-50/50"
                    }`}
                  animate={showColorWarning ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15, duration: 0.4 }}
                >
                  <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
                    <span>Select Color</span>
                    {selectedColor && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {selectedColor.label}
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color: Color, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        disabled={!color.available}
                        title={color.label}
                        className={`group relative flex items-center justify-center rounded-xl p-1 transition-all duration-200 border-2 ${selectedColor?.label === color.label
                          ? "border-primary bg-primary/5 shadow-md scale-105"
                          : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                          } ${!color.available ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className={`flex items-center gap-2 ${color.value ? "px-3 py-1" : "px-4 py-2"}`}>
                          {color.value && (
                            <div
                              className="w-5 h-5 rounded-full border border-gray-200"
                              style={{ backgroundColor: color.value }}
                            />
                          )}
                          <span className={`text-sm font-bold ${selectedColor?.label === color.label ? "text-primary" : "text-slate-700"
                            }`}>
                            {color.label}
                          </span>
                          {color.price > 0 && (
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1 rounded ml-1">
                              +KES {color.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                  {showColorWarning && (
                    <p className="text-xs text-red-500 mt-2 font-medium">Please select a color to continue</p>
                  )}
                </motion.div>
              )}

              {/* Size Selection (Desktop) */}
              {hasSizes && (
                <motion.div
                  className={`mb-6 p-4 rounded-xl border-2 transition-all ${showSizeWarning ? "border-red-500 bg-red-50" : "border-transparent bg-slate-50/50"
                    }`}
                  animate={showSizeWarning ? { x: [-3, 3, -3, 3, 0] } : { x: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15, duration: 0.4 }}
                >
                  <h3 className="text-base font-semibold mb-3 flex items-center justify-between">
                    <span>Select Size</span>
                    {selectedSize && (
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {selectedSize.label}
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {product.sizes?.map((size: Size) => (
                      <SizeButton
                        key={size.value}
                        size={size}
                        selected={selectedSize?.value === size.value}
                        onSelect={setSelectedSize}
                        disabled={!product.inStock}
                      />
                    ))}
                  </div>
                  {showSizeWarning && (
                    <p className="text-xs text-red-500 mt-2 font-medium">Please select a size to continue</p>
                  )}
                </motion.div>
              )}
              {/* Add to Cart Button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full"
              >
                <ButtonPrimary
                  className="mx-auto w-11/12 sm:w-full justify-center bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-3 transition-all duration-150 shadow-[0_4px_12px_rgb(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgb(0,0,0,0.15)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-primary"
                  onClick={() => handleActionClick("addToCart")}
                  disabled={!product.inStock || (hasSizes && !selectedSize)}
                >
                  Add to Cart
                </ButtonPrimary>
              </motion.div>
              {/* Buy Now Button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full"
              >
                <button
                  onClick={() => handleActionClick("buyNow")}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary bg-transparent py-[10px] px-4 font-semibold text-primary transition-all duration-150 hover:bg-primary/10 disabled:opacity-60 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
                  disabled={!product.inStock || (hasSizes && !selectedSize)}
                >
                  Buy Now
                </button>
              </motion.div>
              {/* WhatsApp Button */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full"
              >
                <button
                  onClick={handleWhatsAppOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 px-4 font-bold text-white transition-all duration-150 hover:bg-green-700 shadow-md hover:shadow-lg"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.897-5.335 11.9-11.894a11.83 11.83 0 00-3.415-8.412" />
                  </svg>
                  Order via WHATSAPP
                </button>
              </motion.div>
            </div>
          </div>
        </div>
        {/* Product Description Card - desktop only, now below the main flex row */}
        <div className="mt-8 hidden lg:block w-full">
          <div className="w-full max-w-5xl mx-auto bg-white/95 rounded-2xl shadow-[0_8px_25px_rgb(0,0,0,0.08)] p-6">
            <h3 className="text-lg font-semibold mb-4">Product Description</h3>
            <div
              className={`prose prose-sm product-description max-w-none ${!isDescriptionExpanded ? "line-clamp-3" : ""
                }`}
              dangerouslySetInnerHTML={{
                __html: sanitizedDescription,
              }}
            />
            {product.description.length > 200 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-4 text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                {isDescriptionExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </div>
        </div>

        {/* Image Modal */}
        <AnimatePresence>
          {isImageModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
              onClick={() => setIsImageModalOpen(false)}
            >
              <div className="relative h-full w-full">
                <OptimizedImage
                  src={getProductImageUrl(mainImageUrl)}
                  alt={product.name}
                  width={1200}
                  height={800}
                  loading="eager"
                  quality={75}
                  className="object-contain rounded-lg w-full h-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp Checkout Modal */}
        {/* 
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          onClose={() => setIsCheckoutModalOpen(false)}
          items={[{ ...product, quantity: 1, size: selectedSize?.value }]}
          total={product.salePrice || product.price}
          singleProduct
        />
        */}

        {/* Sticky Add to Cart Bar */}
        <StickyAddToCartBar
          product={product}
          isVisible={isStickyBarVisible}
          onAddToCart={() => handleActionClick("addToCart")} // Pass the same handler
          selectedSize={selectedSize}
          currentPrice={
            selectedSize?.price || product.salePrice || product.price
          }
          hasSizes={hasSizes}
          isAddToCartDisabled={!product.inStock || (hasSizes && !selectedSize)}
        />
      </div>
    </div>
  );
};

export default SectionProductHeader;
