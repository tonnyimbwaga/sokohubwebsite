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

  // Fetch active products
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      `id, name, description, price, compare_at_price, stock, status, slug, images, sizes, colors, category_id, google_product_category`,
    )
    .eq("status", "active") as { data: any[] | null, error: any };

  if (productsError) {
    console.error("Error fetching products for feed:", productsError.message);
  }

  // Fallback if no products found
  if (!products || products.length === 0) {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(siteConfig.name)} Product Feed</title>
    <link>${SITE_URL}</link>
    <description>No active products found</description>
  </channel>
</rss>`,
      {
        status: 200,
        headers: { "Content-Type": "application/xml" },
      },
    );
  }

  const productIds = products.map((p) => p.id);

  // Parallel fetch dependencies
  const [{ data: productCategories }, { data: oldCategories }, { data: imageVersions }] = await Promise.all([
    supabase.from("product_categories").select(`product_id, categories!inner(id, name, slug)`).in("product_id", productIds),
    supabase.from("categories").select("id, name, slug").in("id", products.map((p: any) => p.category_id).filter(Boolean)),
    supabase.from("product_image_versions").select("product_id, web_image_url, feed_image_url").in("product_id", productIds)
  ]);

  const productCategoriesMap = new Map<string, any[]>();
  if (productCategories) {
    productCategories.forEach((pc: any) => {
      if (!productCategoriesMap.has(pc.product_id)) productCategoriesMap.set(pc.product_id, []);
      const cats = productCategoriesMap.get(pc.product_id);
      if (cats) cats.push(pc.categories);
    });
  }

  if (oldCategories) {
    products.forEach((product: any) => {
      const cat = (oldCategories as any[])?.find((c: any) => c.id === product.category_id);
      if (cat) {
        if (!productCategoriesMap.has(product.id)) productCategoriesMap.set(product.id, []);
        const categories = productCategoriesMap.get(product.id);
        const existing = categories ? categories.find((c: any) => c.id === (cat as any).id) : null;
        if (!existing && categories) categories.push(cat);
      }
    });
  }

  const imageVersionsMap = new Map();
  if (imageVersions) {
    imageVersions.forEach((v: any) => {
      imageVersionsMap.set(`${v.product_id}|${v.web_image_url}`, v.feed_image_url);
    });
  }

  const getAvailability = (status: string, stock: number | null) => {
    if (status === "active" && (stock === null || stock > 0)) return "in stock";
    return "out of stock";
  };

  /**
   * Generates a clean, Merchant Center compatible image URL.
   * Ensures JPEG format and correct bucket paths.
   */
  const getFeedImageUrls = (productId: string, imageJson: any[]): string[] => {
    if (!Array.isArray(imageJson)) return [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const defaultBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "product-images";
    const knownBuckets = ["product-images", "categories", "hero-slides", "blog"];

    const urls = imageJson
      .map((img) => {
        if (!img) return null;
        let rawPath = typeof img === "string" ? img : img.url || img.web_image_url;
        if (!rawPath || typeof rawPath !== "string" || rawPath.includes("undefined")) return null;

        rawPath = rawPath.trim();
        if (/^https?:\/\//i.test(rawPath)) return rawPath;

        // Check for optimized version first
        const optimizedVersion = imageVersionsMap.get(`${productId}|${rawPath}`);

        let finalBucket = defaultBucket;
        let finalPath = optimizedVersion || rawPath;

        // Clean up path and determine bucket
        if (finalPath.startsWith("/")) finalPath = finalPath.slice(1);

        // Remove any unintentional "bucket/bucket/" nesting
        knownBuckets.forEach(b => {
          if (finalPath.startsWith(`${b}/${b}/`)) {
            finalPath = finalPath.replace(`${b}/${b}/`, `${b}/`);
          }
        });

        const parts = finalPath.split("/");
        if (parts.length > 1 && knownBuckets.includes(parts[0])) {
          finalBucket = parts[0];
          finalPath = parts.slice(1).join("/");
        }

        // Form the URL
        // If it's a standard web format (including webp), use direct URL for maximum reliability
        // WebP IS supported by Google Merchant Center. Error usually comes from render endpoint failures.
        const isStandardFormat = /\.(jpe?g|png|gif|webp)$/i.test(finalPath);

        if (isStandardFormat) {
          return `${supabaseUrl}/storage/v1/object/public/${finalBucket}/${finalPath}`;
        } else {
          // Force JPEG via transformation ONLY for non-standard or missing extensions
          return `${supabaseUrl}/storage/v1/render/image/public/${finalBucket}/${finalPath}?format=jpg&quality=90`;
        }
      })
      .filter(Boolean) as string[];

    if (urls.length === 0) {
      urls.push(`${SITE_URL}/images/placeholder.png`);
    }

    return urls;
  };

  function buildMerchantDescription(product: any, maxLength = 5000): string {
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ");
    const parts: string[] = [];
    if (product.description) parts.push(stripHtml(product.description));

    let combined = parts.join(" ").replace(/\s+/g, " ").trim();
    if (combined.length < 120) {
      const fallback = `${product.name} available at ${siteConfig.name}. Order online for fast delivery in Kenya.`;
      combined = combined ? `${combined} ${fallback}` : fallback;
    }

    if (combined.length > maxLength) {
      combined = combined.substring(0, maxLength);
      const lastSpace = combined.lastIndexOf(" ");
      if (lastSpace > 0) combined = combined.substring(0, lastSpace);
      combined += "...";
    }
    return combined;
  }

  const items = products
    .flatMap((product: any) => {
      const imageUrls = getFeedImageUrls(product.id, product.images);
      const productLink = `${SITE_URL}/products/${product.slug}`;
      const availability = getAvailability(product.status, product.stock);
      const googleCategory = product.google_product_category || "";
      const categories = productCategoriesMap.get(product.id) || [];
      const productType = categories.length > 0 ? categories[0]?.name || "" : "";
      const cleanDescription = buildMerchantDescription(product);

      const currentPrice = typeof product.price === "number" ? product.price : 0;
      const comparePrice = typeof product.compare_at_price === "number" ? product.compare_at_price : null;

      let basePrice = comparePrice && comparePrice > currentPrice ? comparePrice : currentPrice;
      let salePrice = comparePrice && comparePrice > currentPrice ? currentPrice : null;

      const saleEffectiveDate = salePrice
        ? `${new Date().toISOString().split("T")[0]}T00:00+03:00/${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}T23:59+03:00`
        : null;

      const sizes = Array.isArray(product.sizes) ? product.sizes : [];
      const colors = Array.isArray(product.colors) ? product.colors : [];

      const formatItem = (variantId: string, variantTitle: string, variantPrice: number, variantSize?: string, variantColor?: string) => {
        const pId = product.id as string;
        // Aggressive ID shortening for Google Merchant Center (50 char limit)
        // Use last 8 chars of product UUID + variant suffix, ensure strictly <= 50
        const shortPid = pId.includes("-") ? pId.split("-").pop() || pId : pId.slice(-12);
        let finalId = variantId ? `${shortPid.slice(-8)}${variantId}` : pId;

        if (finalId.length > 50) {
          finalId = finalId.slice(0, 50);
        }

        return `
      <item>
        <g:id>${escapeXml(finalId)}</g:id>
        <g:item_group_id>${escapeXml(pId)}</g:item_group_id>
        <g:title>${escapeXml(product.name)}${variantTitle}</g:title>
        <g:description>${escapeXml(cleanDescription)}</g:description>
        <g:link>${escapeXml(productLink)}</g:link>
        <g:image_link>${escapeXml(imageUrls[0] || "")}</g:image_link>
        ${imageUrls.slice(1, 11).map(url => `<g:additional_image_link>${escapeXml(url)}</g:additional_image_link>`).join("\n")}
        <g:availability>${availability}</g:availability>
        <g:price>${variantPrice.toFixed(2)} KES</g:price>
        ${salePrice && variantPrice === basePrice ? `<g:sale_price>${salePrice.toFixed(2)} KES</g:sale_price>` : ""}
        ${saleEffectiveDate && salePrice && variantPrice === basePrice ? `<g:sale_price_effective_date>${saleEffectiveDate}</g:sale_price_effective_date>` : ""}
        <g:condition>new</g:condition>
        <g:brand>${escapeXml(siteConfig.name)}</g:brand>
        ${variantSize ? `<g:size>${escapeXml(variantSize)}</g:size>` : ""}
        ${variantColor ? `<g:color>${escapeXml(variantColor)}</g:color>` : ""}
        <g:shipping>
          <g:country>KE</g:country>
          <g:service>Standard</g:service>
          <g:price>0 KES</g:price>
        </g:shipping>
        <g:mpn>${escapeXml(product.id as string)}</g:mpn>
        ${googleCategory ? `<g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>` : ""}
        ${productType ? `<g:product_type>${escapeXml(productType)}</g:product_type>` : ""}
        <g:identifier_exists>no</g:identifier_exists>
      </item>`;
      };

      if (sizes.length > 0 || colors.length > 0) {
        const variants: string[] = [];
        const sizeList = sizes.length > 0 ? sizes : [null];
        const colorList = colors.length > 0 ? colors : [null];

        sizeList.forEach((size: any) => {
          colorList.forEach((color: any) => {
            const sLabel = size ? (typeof size === 'string' ? size : size.label || size.value) : "";
            const cLabel = color ? (typeof color === 'string' ? color : color.label || color.name) : "";

            let vTitle = "";
            if (sLabel) vTitle += ` - ${sLabel}`;
            if (cLabel) vTitle += ` - ${cLabel}`;

            let vId = "";
            if (sLabel) vId += `-${sLabel.replace(/\s+/g, "-")}`;
            if (cLabel) vId += `-${cLabel.replace(/\s+/g, "-")}`;

            let vPrice = basePrice;
            if (size && typeof size === 'object' && size.price > 0) vPrice = size.price;

            variants.push(formatItem(vId, vTitle, vPrice, sLabel || undefined, cLabel || undefined));
          });
        });
        return variants;
      }

      return formatItem("", "", basePrice);
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


