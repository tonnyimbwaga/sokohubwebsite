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
      price,
      compare_at_price,
      stock,
      status,
      sku,
      slug,
      images,
      categories:categories(name, slug),
      deal_order
    `,
    )
    .eq("status", "active")
    .not("compare_at_price", "is", null)
    .gt("stock", 0)
    .order("deal_order", { ascending: true })
    .limit(12);

  if (error) {
    return NextResponse.json(
      { error: "Unable to load deals at this time." },
      { status: 500 },
    );
  }

  const products = (rawData || [])
    .filter((p: any) => p.compare_at_price && p.compare_at_price > p.price)
    .sort((a: any, b: any) => {
      const discountA =
        ((a.compare_at_price - a.price) / a.compare_at_price) * 100;
      const discountB =
        ((b.compare_at_price - b.price) / b.compare_at_price) * 100;
      return discountB - discountA;
    })
    .map((product: any, index: number) => {
      const imageUrl =
        Array.isArray(product.images) && product.images.length > 0
          ? getProductImageUrl(product.images[0])
          : "/images/placeholder.png";

      return {
        id: product.id,
        name: product.name,
        description: "",
        price: product.compare_at_price || product.price,
        salePrice: product.price,
        images: [{ url: imageUrl || "/images/placeholder.png" }],
        sku: product.sku || `TOT-${String(product.id).slice(0, 8)}`,
        category: product.categories?.name || "",
        categorySlug: product.categories?.slug || "",
        ageRange: "",
        inStock: (product.stock || 0) > 0,
        isFeatured: false,
        rating: 5,
        reviews: 0,
        index: index + 1,
        slug: product.slug,
        sizes: [
          {
            value: "default",
            label: "Standard",
            price: product.price,
            inStock: true,
          },
        ],
      } satisfies Product;
    });

  return NextResponse.json(products, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=3600, max-age=300, stale-while-revalidate=86400",
    },
  });
}

