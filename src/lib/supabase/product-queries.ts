import { supabase } from "./client";
import { PLACEHOLDER_IMAGE } from "@/utils/product-images";

export interface ProductImage {
  url?: string;
  src?: string;
  web_image_url?: string;
  web_optimized_image_url?: string;
  feed_image_url?: string;
  alt?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSize {
  value: string;
  label: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  inStock: boolean;
  status: string;
  sku: string;
  slug: string;
  category_id: string;
  images: ProductImage[];
  category: string;
  categorySlug: string;
  is_trending: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviews?: number;
  salePrice?: number;
  index?: number;
  sizes?: ProductSize[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        stock,
        sku,
        slug,
        category_id,
        images,
        sizes,
        category:category_id(name, slug)
      `,
      )
      .eq("status", "active")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      // eslint-disable-next-line no-console
      console.error("Error fetching product:", error);
      return null;
    }

    const category = Array.isArray(data.category)
      ? data.category[0]
      : data.category;

    return {
      ...(data as unknown as Product),
      category: category?.name || "",
      categorySlug: category?.slug || "",
      images: processImages(data.images),
      inStock: data.stock > 0,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error in getProductBySlug:", error);
    return null;
  }
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 4,
) {
  // Validate required parameters
  if (!categoryId || !excludeId) {
    console.warn("getRelatedProducts: Missing required parameters", {
      categoryId,
      excludeId,
    });
    return [];
  }

  try {
    const products = await fetchProducts({
      eq: [
        ["category_id", categoryId],
        ["status", "active"],
      ],
      neq: [["id", excludeId]],
      limit,
    });

    // If no related products found, return trending products instead
    if (products.length === 0) {
      console.log(
        "No related products found, falling back to trending products",
      );
      return getTrendingProducts(limit);
    }

    return products;
  } catch (error) {
    console.error("Error in getRelatedProducts:", error);
    return [];
  }
}

export async function getFeaturedProducts(limit = 4) {
  return fetchProducts({
    eq: [
      ["is_featured", true],
      ["status", "active"],
    ],
    limit,
  });
}

export async function getTrendingProducts(limit = 4) {
  return fetchProducts({
    eq: [
      ["is_trending", true],
      ["status", "active"],
    ],
    limit,
  });
}

async function fetchProducts({
  eq = [],
  neq = [],
  limit = 10,
}: {
  eq?: [string, any][];
  neq?: [string, any][];
  limit?: number;
}) {
  try {
    // Log the incoming parameters for debugging
    console.log("fetchProducts called with:", { eq, neq, limit });

    // Validate required parameters for certain conditions
    if (
      eq.some(
        ([col]) =>
          col === "category_id" &&
          !eq.find(([col]) => col === "category_id")?.[1],
      )
    ) {
      console.warn(
        "fetchProducts: category_id is required but not provided or empty",
      );
      return [];
    }

    let query = supabase.from("products").select(`
        id,
        name,
        price,
        slug,
        images,
        category:category_id(name, slug)
      `);

    // Add equality conditions
    eq.forEach(([column, value]) => {
      if (value !== undefined && value !== "") {
        query = query.eq(column, value);
      }
    });

    // Add inequality conditions
    neq.forEach(([column, value]) => {
      if (value !== undefined && value !== "") {
        query = query.neq(column, value);
      }
    });

    const { data, error, status, statusText } = await query.limit(limit);

    if (error) {
      console.error("Supabase query error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status,
        statusText,
      });
      throw error;
    }

    if (!data) {
      console.log("fetchProducts: No data returned from query");
      return [];
    }

    const processedData = data.map((product: any) => {
      try {
        const category = Array.isArray(product.category)
          ? product.category[0]
          : product.category;
        return {
          ...product,
          category: category?.name || "",
          categorySlug: category?.slug || "",
          images: processImages(product.images),
        };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Error processing product:", product.id, e);
        return {
          ...product,
          category: "",
          categorySlug: "",
          images: [],
        };
      }
    });

    console.log(`fetchProducts: Returned ${processedData.length} products`);
    return processedData as Product[];
  } catch (error) {
    console.error("Error in fetchProducts:", {
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
            }
          : error,
      timestamp: new Date().toISOString(),
      queryParams: { eq, neq, limit },
    });
    return [];
  }
}

function processImages(images: any): ProductImage[] {
  if (!Array.isArray(images) || images.length === 0) {
    return [
      {
        web_image_url: PLACEHOLDER_IMAGE,
        feed_image_url: PLACEHOLDER_IMAGE,
        alt: "",
      },
    ];
  }

  return images.map((img: any) => {
    if (typeof img === "string") {
      return {
        url: img,
        web_image_url: img,
        feed_image_url: img,
        alt: "",
      };
    }
    if (img && typeof img === "object") {
      const web = img.web_image_url || img.webp_url || img.url || "";
      const feed = img.feed_image_url || img.feed_url || img.url || "";
      if (!web && !feed) {
        return {
          web_image_url: PLACEHOLDER_IMAGE,
          feed_image_url: PLACEHOLDER_IMAGE,
          alt: img.alt || "",
        };
      }
      return {
        url: img.url,
        src: img.src,
        web_image_url: web,
        web_optimized_image_url: img.web_optimized_image_url,
        feed_image_url: feed,
        alt: img.alt || "",
      };
    }
    return {
      web_image_url: PLACEHOLDER_IMAGE,
      feed_image_url: PLACEHOLDER_IMAGE,
      alt: "",
    };
  });
}
