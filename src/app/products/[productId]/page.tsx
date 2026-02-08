import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PLACEHOLDER_IMAGE } from "@/utils/product-images";
import ProductSuggestions from "@/components/ProductSuggestions";
import ProductViewTracker from "@/components/ProductViewTracker";
import SectionProductHeader from "./SectionProductHeader";
import { createClient } from "@/lib/supabase/server";
import { constructMetadata } from "@/utils/seo";

// Add metadata generation for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const { productId } = await params;
  const slug = decodeURIComponent(productId);

  // Fetch product and suggestions in parallel
  const supabase = await createClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, description, price, compare_at_price, stock, sku, slug, images, sizes, colors, options, category:categories!products_category_id_fkey(name, slug)")
    .eq("status", "active")
    .eq("slug", slug)
    .single() as { data: any | null, error: any };

  if (productError || !product) {
    notFound();
  }

  // Skip suggestions in metadata for performance

  const defaultImage =
    product.images[0]?.web_image_url ||
    product.images[0]?.url ||
    PLACEHOLDER_IMAGE;

  return constructMetadata({
    title: product.name,
    description: product.description,
    image: defaultImage,
  });
}

// Re-export for static generation
export const dynamic = "force-static";
export const revalidate = 300; // Revalidate every 5 minutes

export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const slug = decodeURIComponent(productId);

  const supabase = await createClient();

  // 1. Fetch the main product
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, description, price, compare_at_price, stock, sku, slug, images, sizes, colors, options, category:category_id(name, slug)")
    .eq("slug", slug)
    .single() as { data: any | null, error: any };

  if (productError || !product) {
    notFound();
  }

  // 2. Fetch related products from the same category (4 products)
  const { data: relatedProducts } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      compare_at_price,
      stock,
      sku,
      slug,
      images,
      is_featured,
      categories:categories!products_category_id_fkey(name, slug)
    `,
    )
    .eq("status", "active")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .gt("stock", 0)
    .limit(8) as { data: any[] | null, error: any };

  // 3. Fetch trending products (popular products based on views/orders)
  const { data: trendingProducts } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      compare_at_price,
      stock,
      sku,
      slug,
      images,
      is_featured,
      categories:categories!products_category_id_fkey(name, slug)
    `,
    )
    .eq("status", "active")
    .eq("is_featured", true) // Using featured as proxy for trending
    .gt("stock", 0)
    .neq("id", product.id)
    .limit(8) as { data: any[] | null, error: any };

  // 4. Fetch best deals products (products with compare_at_price > price)
  const { data: dealsProducts } = await supabase
    .from("products")
    .select(
      `
      id,
      name,
      price,
      compare_at_price,
      stock,
      sku,
      slug,
      images,
      is_featured,
      categories:categories!products_category_id_fkey(name, slug)
    `,
    )
    .eq("status", "active")
    .not("compare_at_price", "is", null)
    .gt("stock", 0)
    .neq("id", product.id)
    .limit(8) as { data: any[] | null, error: any };

  const typedProduct = {
    ...product,
    inStock: product.stock > 0,
    isFeatured: Boolean(product.is_featured),
    category: product.category?.name || "",
    categorySlug: product.category?.slug || "",
  } as any;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/30 to-white">
      <ProductViewTracker product={typedProduct} />
      <SectionProductHeader product={typedProduct} />

      {/* Product Suggestions - Only 3 sections */}
      <div className="main-layout py-12">
        <div className="content-with-sidebars px-4">
          <div className="section-container p-8">
            <ProductSuggestions
              relatedProducts={(relatedProducts || []) as any}
              trendingProducts={(trendingProducts || []) as any}
              dealsProducts={(dealsProducts || []) as any}
              currentCategory={typedProduct.category}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
