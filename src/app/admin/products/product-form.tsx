"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { SupabaseImageUpload } from "@/components/shared/SupabaseImageUpload/SupabaseImageUpload";
import dynamic from "next/dynamic";
const SimpleRichTextEditor = dynamic(
  () => import("@/components/shared/SimpleRichTextEditor/SimpleRichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 border rounded-lg min-h-[200px] bg-slate-50 animate-pulse" />
    ),
  },
);

import ProductSizeConfig, { Size } from "@/components/ProductSizeConfig";
import Image from "next/image";
import { getProductImageUrl } from "@/utils/product-images";

export interface ImageInfo {
  web_image_url: string;
  feed_image_url: string;
  alt: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number | null;
  compare_at_price?: number | null;
  stock: number;
  category_id: string; // Keep for backward compatibility
  category_ids: string[]; // New field for multiple categories
  status: "draft" | "active" | "archived";
  is_featured: boolean;
  is_trending: boolean;
  is_deal: boolean;
  images: ImageInfo[];
  sizes?: Size[];
  tags?: string[];
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: ProductFormData & { id?: string };
  onClose: () => void;
  isModal?: boolean; // New prop to control modal rendering
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50);

export default function ProductForm({
  product,
  onClose,
  isModal = true,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<ImageInfo[]>(
    product?.images || [],
  );
  const [productSizes, setProductSizes] = useState<Size[]>(
    product?.sizes || [],
  );
  const [useSizePricing, setUseSizePricing] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    Category[]
  >({
    queryKey: ["categories-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 15, // Cache for 15 mins
  });

  const defaultValues = {
    ...product,
    images: product?.images || [],
    status: product?.status || "active", // Default to active
    stock: product?.stock ?? 8, // Default stock to 8
    is_featured: product?.is_featured || false,
    is_trending: product?.is_trending || false,
    is_deal: product?.is_deal || false,
    compare_at_price: product?.compare_at_price ?? null,
    sizes: product?.sizes || [],
    price: product?.price ?? null,
    tags: product?.tags || [],
    category_id: product?.category_id || "", // Set the primary category
    category_ids:
      product?.category_ids && product.category_ids.length > 0
        ? product.category_ids
        : [], // Additional categories from junction table
  };

  console.log(
    "Product Form - Default values category_ids:",
    defaultValues.category_ids,
  );

  const methods = useForm<ProductFormData>({
    defaultValues,
    mode: "onTouched", // Validate on blur
    reValidateMode: "onChange", // Re-validate on change after first submission
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = methods;

  const PRODUCT_IMAGES_BUCKET = "product-images"; // Define bucket name

  // Watch name changes to auto-generate slug
  const watchName = watch("name");
  const [lastGeneratedSlug, setLastGeneratedSlug] = useState<string>(
    product?.slug || "",
  );
  const [slugError, setSlugError] = useState<string>("");

  // Initialize size pricing mode based on existing sizes
  useEffect(() => {
    if (productSizes && productSizes.length > 0) {
      setUseSizePricing(true);
    }
  }, [productSizes]);

  // Debounced slug validation
  const checkSlugUniqueness = useCallback(
    async (slug: string) => {
      if (!slug || slug === product?.slug) {
        setSlugError("");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setSlugError(
            "This URL is already being used by another product. Please choose a different one.",
          );
        } else {
          setSlugError("");
        }
      } catch (error) {
        console.error("Error checking slug uniqueness:", error);
      }
    },
    [product?.slug],
  );

  // Debounce slug checking
  useEffect(() => {
    const currentSlug = watch("slug");
    if (currentSlug && currentSlug.length > 2) {
      const timeoutId = setTimeout(() => {
        checkSlugUniqueness(currentSlug);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
    setSlugError("");
    return undefined;
  }, [watch("slug"), checkSlugUniqueness, watch]);

  useEffect(() => {
    if (watchName) {
      const currentSlug = watch("slug");
      const newSlug = generateSlug(watchName);

      // Only auto-generate slug for NEW products or if current slug matches the last auto-generated slug
      // For existing products that are published, don't auto-generate to preserve URLs
      const isNewProduct = !product?.id;
      const isPublishedProduct = product?.status === "active";

      if (isNewProduct && (!currentSlug || currentSlug === lastGeneratedSlug)) {
        setValue("slug", newSlug);
        setLastGeneratedSlug(newSlug);
      } else if (
        !isNewProduct &&
        !isPublishedProduct &&
        (!currentSlug || currentSlug === lastGeneratedSlug)
      ) {
        // For existing but unpublished products, allow auto-generation
        setValue("slug", newSlug);
        setLastGeneratedSlug(newSlug);
      }
    }
  }, [
    watchName,
    setValue,
    watch,
    lastGeneratedSlug,
    product?.id,
    product?.status,
  ]);

  // Handle image upload completion
  const handleImageUploadComplete = (urls: {
    webp: string;
    original: string;
  }) => {
    const newImage: ImageInfo = {
      web_image_url: `product-images/${urls.webp}`,
      feed_image_url: `product-images/${urls.original}`,
      alt: "",
    };
    const updatedImages = [...uploadedImages, newImage];
    setUploadedImages(updatedImages);
    setValue("images", updatedImages);
  };

  // Handle image removal
  const removeImage = (index: number) => {
    const updatedImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(updatedImages);
    setValue("images", updatedImages);
  };

  // Handle alt text change
  const handleAltTextChange = (index: number, alt: string) => {
    const updatedImages = uploadedImages.map((img, i) =>
      i === index ? { ...img, alt } : img,
    );
    setUploadedImages(updatedImages);
    setValue("images", updatedImages);
  };

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Prepare the product data
      const productData = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        compare_at_price: data.compare_at_price,
        stock: data.stock,
        category_id: data.category_id || null, // Use the selected primary category
        status: data.status,
        is_featured: data.is_featured,
        is_trending: data.is_trending,
        is_deal: data.is_deal,
        images: data.images,
        sizes: data.sizes,
        tags: data.tags,
      };

      let productId;

      if (product?.id) {
        // Update existing product
        const { error } = await (supabase
          .from("products")
          .update(productData as any)
          .eq("id", product.id) as any);

        if (error) throw error;
        productId = product.id;
      } else {
        // Create new product
        const { data: newProduct, error } = await (supabase
          .from("products")
          .insert(productData as any)
          .select()
          .single() as any);

        if (error) throw error;
        productId = newProduct.id;
      }

      // Update product categories using RPC
      if (data.category_ids && data.category_ids.length > 0) {
        const { error: rpcError } = await (supabase.rpc(
          "update_product_categories",
          {
            p_product_id: productId,
            p_category_ids: data.category_ids,
          } as any
        ) as any);

        if (rpcError) {
          console.error("Error updating product categories:", rpcError);
          throw new Error(
            `Failed to update product categories: ${rpcError.message}`,
          );
        }
      } else {
        // If no categories selected, clear all categories for this product
        const { error: rpcError } = await (supabase.rpc(
          "update_product_categories",
          {
            p_product_id: productId,
            p_category_ids: [],
          } as any
        ) as any);

        if (rpcError) {
          console.error("Error clearing product categories:", rpcError);
          throw new Error(
            `Failed to clear product categories: ${rpcError.message}`,
          );
        }
      }

      // Return the product with its ID
      return { id: productId, ...productData };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });

      // Trigger comprehensive cache invalidation for blazing fast homepage
      try {
        // 1. Trigger cache invalidation
        const cacheResponse = await fetch("/api/cache/invalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: result.id,
            action: product?.id ? "update" : "create",
          }),
        });

        if (cacheResponse.ok) {
          console.log("✅ Cache invalidation completed successfully");
        } else {
          console.warn(
            "⚠️ Cache invalidation failed:",
            await cacheResponse.text(),
          );
        }
      } catch (error) {
        console.warn("⚠️ Failed to invalidate cache:", error);
      }

      onClose();
    },
    onError: (error: Error) => {
      console.error("Error saving product:", error);
      setSubmitError(error.message);
      // The error will be available in mutation.error
    },
  });

  const onSubmit = async (data: ProductFormData) => {
    // Prevent submission if there's a slug error
    if (slugError) {
      setSubmitError("Please fix the URL error before saving your product.");
      return;
    }

    // Validate pricing based on mode
    if (useSizePricing) {
      // When using size pricing, ensure at least one size has a price
      if (!productSizes || productSizes.length === 0) {
        setSubmitError(
          "Please add at least one size when using size-based pricing.",
        );
        return;
      }

      const hasValidPrices = productSizes.some((size) => size.price > 0);
      if (!hasValidPrices) {
        setSubmitError("Please set prices for at least one size.");
        return;
      }
    } else {
      // When not using size pricing, ensure main price is set
      if (!data.price || data.price <= 0) {
        setSubmitError("Please enter a valid price for the product.");
        return;
      }
    }

    console.log("Form submission - category_ids:", data.category_ids);
    console.log("Form submission - full data:", data);
    console.log("Form submission - useSizePricing:", useSizePricing);

    setIsSubmitting(true);
    setSubmitError(null);
    mutation.mutate(
      {
        ...data,
        sizes: useSizePricing ? productSizes : [], // Only save sizes if using size pricing
      },
      {
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  const formContent = (
    <>
      {isModal && (
        <header className="sticky top-0 z-20 bg-white px-8 pt-8 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Edit Product" : "Create New Product"}
          </h2>
        </header>
      )}
      <form
        id="product-form"
        onSubmit={handleSubmit(onSubmit)}
        className={`flex-1 overflow-y-auto ${isModal ? "px-8 py-6" : "px-0 py-0"
          } space-y-10`}
      >
        {/* Product Details */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Product Details
          </h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name", {
                  required: "Please enter a name for your product",
                })}
                className="block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary text-base"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL Slug
                {product?.status === "active" ? (
                  <span className="text-xs text-amber-600 ml-2 font-medium">
                    🔒 URL is locked for published products to prevent broken
                    links
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 ml-2">
                    (Auto-generated, but you can edit it)
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="slug"
                  {...register("slug", {
                    required: "URL is required for your product page",
                    pattern: {
                      value: /^[a-z0-9-]+$/,
                      message:
                        "URL can only contain lowercase letters, numbers, and hyphens",
                    },
                  })}
                  className={`flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary text-base ${product?.status === "active"
                    ? "bg-gray-50 text-gray-600"
                    : ""
                    }`}
                  placeholder="product-url-slug"
                  readOnly={product?.status === "active"}
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentName = watch("name");
                    if (currentName) {
                      const newSlug = generateSlug(currentName);
                      setValue("slug", newSlug);
                      setLastGeneratedSlug(newSlug);
                    }
                  }}
                  disabled={product?.status === "active"}
                  className={`px-4 py-3 border border-gray-300 rounded-lg transition-colors text-sm whitespace-nowrap ${product?.status === "active"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Generate from Name
                </button>
              </div>
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.slug.message}
                </p>
              )}
              {slugError && (
                <p className="text-red-500 text-xs mt-1">{slugError}</p>
              )}
              {!errors.slug && !slugError && watch("slug") && (
                <div className="text-xs mt-1 space-y-1">
                  <p className="text-green-600">✓ This URL is available</p>
                  <p className="text-gray-500">
                    Preview:{" "}
                    <span className="font-mono text-blue-600">
                      {typeof window !== "undefined"
                        ? window.location.origin
                        : "https://your-site.com"}
                      /products/{watch("slug")}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <Controller
                name="description"
                control={control}
                rules={{
                  required:
                    "Please add a description to help customers understand your product",
                }}
                render={({ field }) => (
                  <SimpleRichTextEditor
                    initialContent={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tags (comma-separated)
              </label>
              <Controller
                name="tags"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <input
                    type="text"
                    id="tags"
                    className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
                    defaultValue={
                      Array.isArray(field.value) ? field.value.join(", ") : ""
                    }
                    onChange={(e) => {
                      const tags = e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean);
                      field.onChange(tags);
                    }}
                  />
                )}
              />
            </div>
          </div>
        </section>
        <hr className="my-6 border-gray-200" />
        {/* Pricing & Stock */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Pricing & Stock
          </h3>

          {/* Pricing Mode Toggle */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Pricing Mode
                </h4>
                <p className="text-xs text-gray-500">
                  {useSizePricing
                    ? "Individual prices for each size"
                    : "Single price for all sizes"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUseSizePricing(!useSizePricing)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useSizePricing ? "bg-primary" : "bg-gray-200"
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useSizePricing ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {useSizePricing ? "Base Price (Optional)" : "Price"}
              </label>
              <input
                type="number"
                id="price"
                {...register("price", {
                  valueAsNumber: true,
                  validate: (value) => {
                    if (useSizePricing) {
                      // When using size pricing, base price is optional
                      return true;
                    }
                    // When not using size pricing, price is required
                    return (
                      (value !== null && value > 0) ||
                      "Please enter a price for your product."
                    );
                  },
                })}
                className={`block w-full border border-gray-300 rounded-lg px-4 py-3 text-base ${useSizePricing ? "bg-gray-50" : ""
                  }`}
                step="0.01"
                disabled={useSizePricing}
                placeholder={
                  useSizePricing
                    ? "Set individual prices below"
                    : "Enter product price"
                }
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.price.message}
                </p>
              )}
              {useSizePricing && (
                <p className="text-xs text-gray-500 mt-1">
                  Set individual prices for each size in the Sizes section below
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="compare_at_price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Compare at Price
              </label>
              <input
                type="number"
                id="compare_at_price"
                {...register("compare_at_price", { valueAsNumber: true })}
                className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
                step="0.01"
              />
            </div>
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stock
              </label>
              <input
                type="number"
                id="stock"
                {...register("stock", {
                  required: "Please enter how many items you have in stock",
                  valueAsNumber: true,
                  min: 0,
                })}
                className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              />
              {errors.stock && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.stock.message}
                </p>
              )}
            </div>
          </div>
        </section>
        <hr className="my-6 border-gray-200" />
        {/* Sizes */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sizes</h3>
          {useSizePricing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Size-based pricing enabled:</strong> Set individual
                prices for each size below. The base price field above is
                disabled when using size pricing.
              </p>
            </div>
          )}
          <ProductSizeConfig
            initialSizes={productSizes}
            onChange={setProductSizes}
            useSizePricing={useSizePricing}
          />
        </section>
        <hr className="my-6 border-gray-200" />
        {/* Organization */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Organization
          </h3>
          <div className="space-y-4">
            {/* Primary Category */}
            <div>
              <label
                htmlFor="category_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Primary Category <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                This will be the main category for this product and affects
                homepage display order.
              </p>
              {isLoadingCategories ? (
                <p>Loading categories...</p>
              ) : (
                <Controller
                  name="category_id"
                  control={control}
                  rules={{
                    required:
                      "Please select a primary category for your product",
                  }}
                  render={({ field }) => (
                    <select
                      id="category_id"
                      {...field}
                      className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-primary focus:border-primary"
                    >
                      <option value="">Select primary category...</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category_id && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category_id.message}
                </p>
              )}
            </div>

            {/* Additional Categories */}
            <div>
              <label
                htmlFor="category_ids"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Additional Categories{" "}
                <span className="text-gray-400">(Optional)</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Select additional categories where this product should also
                appear.
              </p>
              {isLoadingCategories ? (
                <p>Loading categories...</p>
              ) : (
                <Controller
                  name="category_ids"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 border border-gray-200 rounded-lg p-3">
                      {categories?.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            id={`category-${category.id}`}
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            checked={field.value?.includes(category.id)}
                            onChange={(e) => {
                              const newCategoryIds = e.target.checked
                                ? [...(field.value || []), category.id]
                                : (field.value || []).filter(
                                  (id) => id !== category.id,
                                );
                              field.onChange(newCategoryIds);
                            }}
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="block text-sm text-gray-900"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                />
              )}
              {errors.category_ids && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category_ids.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                {...register("status", {
                  required: "Please select a status for your product",
                })}
                className="block w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.status.message}
                </p>
              )}
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="is_featured"
                    {...register("is_featured")}
                    type="checkbox"
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="is_featured"
                    className="font-medium text-gray-700"
                  >
                    Featured
                  </label>
                  <p className="text-gray-500">
                    Display on main featured sections.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="is_trending"
                    {...register("is_trending")}
                    type="checkbox"
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="is_trending"
                    className="font-medium text-gray-700"
                  >
                    Trending
                  </label>
                  <p className="text-gray-500">Mark as a trending product.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="is_deal"
                    {...register("is_deal")}
                    type="checkbox"
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="is_deal"
                    className="font-medium text-gray-700"
                  >
                    Deal
                  </label>
                  <p className="text-gray-500">Mark as a special deal.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <hr className="my-6 border-gray-200" />
        {/* Images */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Product Images
          </h3>
          <SupabaseImageUpload
            bucket={PRODUCT_IMAGES_BUCKET}
            onComplete={handleImageUploadComplete}
            maxFiles={5}
            path={`products/${watch("slug")}`}
          />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center bg-white border rounded-lg p-4 shadow-sm"
              >
                <Image
                  width={100}
                  height={100}
                  src={getProductImageUrl(image)}
                  alt={image.alt || `Product image ${index + 1}`}
                  className="h-32 w-full object-cover rounded-md mb-2"
                />
                <label className="block text-xs text-gray-600 mb-1">
                  Alt text
                </label>
                <input
                  type="text"
                  placeholder="Alt text"
                  value={image.alt}
                  onChange={(e) => handleAltTextChange(index, e.target.value)}
                  className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary px-2 py-1 mb-2"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 text-white bg-red-600 hover:bg-red-700 rounded-full p-1 shadow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>
        {submitError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {submitError}</span>
          </div>
        )}
      </form>
      {isModal && (
        <footer className="sticky bottom-0 z-30 bg-white px-8 py-4 border-t flex justify-end gap-4 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-6 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : product
                ? "Save Changes"
                : "Create Product"}
          </button>
        </footer>
      )}
    </>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 overflow-y-auto">
        <div className="relative w-full max-w-2xl mx-auto my-8 bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {formContent}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="bg-white py-2 px-6 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="product-form"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : product
              ? "Save Changes"
              : "Create Product"}
        </button>
      </div>
    </div>
  );
}
