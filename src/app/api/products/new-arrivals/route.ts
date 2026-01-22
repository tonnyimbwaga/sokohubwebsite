import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/data/types";
import { getProductImageUrl } from "@/utils/product-images";

// Server-side endpoint to avoid client-side Supabase URL/key being baked at build time.
export async function GET() {
  const supabase = await createClient();

  const { data: rawData, error } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      description,
      price,
      stock,
      status,
      is_featured,
      sku,
      slug,
      images,
      categories:categories!products_category_id_fkey(name, slug)
    `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    return NextResponse.json(
      { error: "Unable to load new arrivals at this time." },
      { status: 500 },
    );
  }

  const products = (rawData || []).map((product: any) => {
    const imageUrl =
      Array.isArray(product.images) && product.images.length > 0
        ? getProductImageUrl(product.images[0])
        : "/images/placeholder.png";

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: undefined,
      images: [{ url: imageUrl || "/images/placeholder.png" }],
      sku: product.sku,
      slug: product.slug || String(product.sku || "").toLowerCase(),
      category: product.categories?.name || "",
      categorySlug: product.categories?.slug || "",
      ageRange: "",
      inStock: (product.stock || 0) > 0,
      isFeatured: !!product.is_featured,
      rating: 5,
      reviews: 0,
      sizes: [
        { value: "0-2", label: "0-2 years", price: product.price, inStock: true },
        { value: "2-4", label: "2-4 years", price: product.price, inStock: true },
        { value: "4-6", label: "4-6 years", price: product.price, inStock: true },
        { value: "6+", label: "6+ years", price: product.price, inStock: true },
      ],
    } satisfies Product;
  });

  return NextResponse.json(products, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
