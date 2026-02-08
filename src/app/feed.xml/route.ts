import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic"; // Ensure this route is always up to date

// XML escape function
function escapeXml(unsafe: string): string {
  if (typeof unsafe !== "string") return "";
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

const SITE_URL = siteConfig.url;

// Cache variables
let cachedFeed: string | null = null;
let cacheTimestamp = 0;

export async function GET(_req: Request) {
  const now = Date.now();
  // Cache for 1 hour
  if (cachedFeed && now - cacheTimestamp < 3600000) {
    return new NextResponse(cachedFeed, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  const supabase = await createClient();

  // Step 1: fetch active products with their categories (both old and new relationships)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      `id, name, description, price, compare_at_price, stock, status, slug, google_product_category, images, sizes, colors, category_id`,
    )
    .eq("status", "active") as { data: any[] | null, error: any };

  if (productsError) {
    console.error("Error fetching products for feed:", productsError.message);
  }

  // Early return on error
  if (!products || products.length === 0) {
    return new NextResponse(
      '<rss version="2.0"><channel><title>Error</title></channel></rss>',
      {
        status: 500,
        headers: { "Content-Type": "application/xml" },
      },
    );
  }

  // Step 2: fetch categories for all products (both old category_id and new many-to-many)
  const productIds = products.map((p) => p.id);

  // Get categories from the many-to-many relationship
  const { data: productCategories, error: categoriesError } = await supabase
    .from("product_categories")
    .select(
      `
      product_id,
      categories!inner(id, name, slug)
    `,
    )
    .in("product_id", productIds) as { data: any[] | null, error: any };

  if (categoriesError) {
    console.error(
      "Error fetching categories for feed:",
      categoriesError.message,
    );
  }

  // Get categories from the old category_id relationship
  const categoryIds = products.map((p) => p.category_id).filter(Boolean);
  const { data: oldCategories, error: oldCategoriesError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .in("id", categoryIds) as { data: any[] | null, error: any };

  if (oldCategoriesError) {
    console.error(
      "Error fetching old categories for feed:",
      oldCategoriesError.message,
    );
  }

  // Create a map of product_id to categories
  const productCategoriesMap = new Map();

  // Add categories from many-to-many relationship
  if (productCategories) {
    productCategories.forEach((pc) => {
      if (!productCategoriesMap.has(pc.product_id)) {
        productCategoriesMap.set(pc.product_id, []);
      }
      productCategoriesMap.get(pc.product_id).push(pc.categories);
    });
  }

  // Add categories from old category_id relationship (if not already added)
  if (oldCategories) {
    products.forEach((product) => {
      if (
        product.category_id &&
        oldCategories.find((c: any) => c.id === product.category_id)
      ) {
        const category = oldCategories.find(
          (c: any) => c.id === product.category_id,
        );
        if (category && !productCategoriesMap.has(product.id)) {
          productCategoriesMap.set(product.id, []);
        }
        if (category) {
          // Only add if not already present
          const existing = productCategoriesMap
            .get(product.id)
            ?.find((c: any) => c.id === category.id);
          if (!existing) {
            productCategoriesMap.get(product.id)?.push(category);
          }
        }
      }
    });
  }

  // Early return on error
  if (!products || products.length === 0) {
    return new NextResponse(
      '<rss version="2.0"><channel><title>Error</title></channel></rss>',
      {
        status: 500,
        headers: { "Content-Type": "application/xml" },
      },
    );
  }

  const getAvailability = (status: string, stock: number | null) => {
    if (status === "active" && (stock === null || stock > 0)) {
      return "in stock";
    }
    return "out of stock";
  };

  const getFeedImageUrls = (imageJson: any[]): string[] => {
    if (!Array.isArray(imageJson)) return [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const feedUrls = imageJson
      .map((img) => {
        if (img) {
          const raw =
            typeof img.feed_image_url === "string" && img.feed_image_url
              ? img.feed_image_url
              : typeof img.feed_url === "string"
                ? img.feed_url
                : null;
          if (raw) {
            let url = raw.trim();
            if (/^https?:\/\//i.test(url)) {
              return url;
            }
            if (url.startsWith("/")) url = url.slice(1);
            if (!url.startsWith("product-images/"))
              url = `product-images/${url}`;
            return `${supabaseUrl}/storage/v1/object/public/${url}`;
          }
        }
        return null;
      })
      .filter(Boolean) as string[];

    if (feedUrls.length === 0) {
      feedUrls.push(`${SITE_URL}/images/placeholder.png`);
    }

    return feedUrls;
  };

  function buildMerchantDescription(product: any, maxLength = 5000): string {
    // Combine description + meta_description to maximize length without exceeding limit
    const parts: string[] = [];

    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ");

    if (product.description) {
      parts.push(stripHtml(product.description));
    }
    if (product.meta_description) {
      parts.push(stripHtml(product.meta_description));
    }

    let combined = parts.join(" ").replace(/\s+/g, " ").trim();

    // Fallback sentence if still too short (<120 chars)
    if (combined.length < 120) {
      const fallback = `${product.name} available at ${siteConfig.name}. Order online for fast delivery.`;
      combined = combined ? `${combined} ${fallback}` : fallback;
    }

    // Ensure we do not exceed maxLength
    if (combined.length > maxLength) {
      combined = combined.substring(0, maxLength);
      const lastSpace = combined.lastIndexOf(" ");
      if (lastSpace > 0) combined = combined.substring(0, lastSpace);
      combined += "...";
    }

    return combined;
  }

  const items = (products || [])
    .flatMap((product: any) => {
      const imageUrls = getFeedImageUrls(product.images);
      const productLink = `${SITE_URL}/products/${product.slug}`;
      const availability = getAvailability(product.status, product.stock);
      const googleCategory = product.google_product_category || "";
      const productCategories = productCategoriesMap.get(product.id) || [];
      const productStoreCategoryName =
        productCategories.length > 0 ? productCategories[0]?.name || "" : "";
      const cleanDescription = buildMerchantDescription(product);

      const currentPrice =
        typeof product.price === "number" ? product.price : 0;
      const originalPrice =
        typeof product.compare_at_price === "number"
          ? product.compare_at_price
          : null;

      let feedPrice: number;
      let feedSalePrice: number | null = null;

      if (originalPrice && originalPrice > currentPrice) {
        feedPrice = originalPrice;
        feedSalePrice = currentPrice;
      } else {
        feedPrice = currentPrice;
      }

      // Additional Google Merchant Center fields
      const currentDate = new Date();
      const saleEffectiveDate = feedSalePrice
        ? `${currentDate.toISOString().split("T")[0]}T00:00+03:00/${new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0]
        }T23:59+03:00`
        : null;

      // Handle variants (Sizes & Colors)
      const productSizes = Array.isArray(product.sizes) ? product.sizes : [];
      const productColors = Array.isArray(product.colors) ? product.colors : [];

      // Helper to format a single item
      const formatItem = (variantIdSuffix: string, variantSize?: string, variantColor?: any) => {
        // Note: size prices usually override, color prices are usually offsets.
        // But for feed, we'll try to be consistent with the frontend logic.

        let finalFeedPrice = feedPrice;
        let finalFeedSalePrice = feedSalePrice;

        if (variantSize && typeof variantSize === 'object' && (variantSize as any).price > 0) {
          finalFeedPrice = (variantSize as any).price;
          finalFeedSalePrice = null; // Simplification: sale prices usually apply to the base
        } else if (variantColor?.price > 0) {
          finalFeedPrice = product.price + variantColor.price;
          finalFeedSalePrice = null;
        }

        return `
      <item>
        <g:id>${escapeXml(product.id)}${variantIdSuffix}</g:id>
        <g:item_group_id>${escapeXml(product.id)}</g:item_group_id>
        <g:title>${escapeXml(product.name)}${variantSize ? ` - ${variantSize}` : ""}${variantColor ? ` - ${variantColor.label}` : ""}</g:title>
        <g:description>${escapeXml(cleanDescription)}</g:description>
        <g:link>${escapeXml(productLink)}</g:link>
        <g:image_link>${escapeXml(
          imageUrls[0] || `${SITE_URL}/images/placeholder.png`,
        )}</g:image_link>
        ${imageUrls
            .slice(1, 11)
            .map(
              (url: string) =>
                `<g:additional_image_link>${escapeXml(
                  url,
                )}</g:additional_image_link>`,
            )
            .join("\n")}
        <g:availability>${availability}</g:availability>
        <g:price>${finalFeedPrice.toFixed(2)} KES</g:price>
        ${finalFeedSalePrice !== null
            ? `<g:sale_price>${finalFeedSalePrice.toFixed(2)} KES</g:sale_price>`
            : ""
          }
        ${saleEffectiveDate
            ? `<g:sale_price_effective_date>${saleEffectiveDate}</g:sale_price_effective_date>`
            : ""
          }
        <g:condition>new</g:condition>

        <g:brand>${escapeXml(siteConfig.name)}</g:brand>
        ${variantSize ? `<g:size>${escapeXml(typeof variantSize === 'string' ? variantSize : (variantSize as any).label || (variantSize as any).value)}</g:size>` : ""}
        ${variantColor ? `<g:color>${escapeXml(variantColor.label)}</g:color>` : ""}
        <g:shipping>
          <g:country>KE</g:country>
          <g:service>Standard</g:service>
          <g:price>0 KES</g:price>
        </g:shipping>
        <g:mpn>${escapeXml(product.id)}</g:mpn>
        ${googleCategory ? `<g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>` : ""}
        ${productStoreCategoryName ? `<g:product_type>${escapeXml(productStoreCategoryName)}</g:product_type>` : ""}
        <g:adult>no</g:adult>
        <g:identifier_exists>no</g:identifier_exists>
      </item>`;
      };

      // Generation logic
      if (productSizes.length > 0 && productColors.length > 0) {
        // Combinations
        return productSizes.flatMap((size: any) =>
          productColors.map((color: any) => {
            const sizeLabel = typeof size === 'string' ? size : size.label || size.value;
            const suffix = `-${sizeLabel.replace(/\s+/g, "-")}-${color.label.replace(/\s+/g, "-")}`;
            return formatItem(suffix, size, color);
          })
        );
      } else if (productSizes.length > 0) {
        // Sizes only
        return productSizes.map((size: any) => {
          const sizeLabel = typeof size === 'string' ? size : size.label || size.value;
          return formatItem(`-${sizeLabel.replace(/\s+/g, "-")}`, size);
        });
      } else if (productColors.length > 0) {
        // Colors only
        return productColors.map((color: any) => {
          return formatItem(`-${color.label.replace(/\s+/g, "-")}`, undefined, color);
        });
      } else {
        // No variants
        return formatItem("");
      }

    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(siteConfig.name)} Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Live product feed for Google Shopping</description>
${items}
  </channel>
</rss>`;

  cachedFeed = xml;
  cacheTimestamp = now;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
