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

  // Step 1: fetch active products
  // Note: google_product_category might be missing if migration hasn't run yet, 
  // so we handle potential errors or missing fields gracefully in logic.
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      `id, name, description, price, compare_at_price, stock, status, slug, images, sizes, colors, category_id, google_product_category`,
    )
    .eq("status", "active") as { data: any[] | null, error: any };

  if (productsError) {
    console.error("Error fetching products for feed:", productsError.message);
  }

  // Fallback if no products are found - return valid but empty feed
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

  // Step 2: fetch categories (both old and many-to-many)
  const [{ data: productCategories }, { data: oldCategories }, { data: imageVersions }] = await Promise.all([
    supabase.from("product_categories").select(`product_id, categories!inner(id, name, slug)`).in("product_id", productIds),
    supabase.from("categories").select("id, name, slug").in("id", products.map((p: any) => p.category_id).filter(Boolean)),
    supabase.from("product_image_versions").select("product_id, web_image_url, feed_image_url").in("product_id", productIds)
  ]);

  // Create maps for efficient lookups
  const productCategoriesMap = new Map();
  if (productCategories) {
    productCategories.forEach((pc: any) => {
      if (!productCategoriesMap.has(pc.product_id)) productCategoriesMap.set(pc.product_id, []);
      productCategoriesMap.get(pc.product_id).push(pc.categories);
    });
  }

  // Add old relationship categories
  if (oldCategories) {
    products.forEach((product) => {
      const cat = oldCategories.find((c: any) => c.id === product.category_id);
      if (cat) {
        if (!productCategoriesMap.has(product.id)) productCategoriesMap.set(product.id, []);
        const existing = productCategoriesMap.get(product.id).find((c: any) => c.id === cat.id);
        if (!existing) productCategoriesMap.get(product.id).push(cat);
      }
    });
  }

  // Create image versions map: productId|web_url -> feed_url
  const imageVersionsMap = new Map();
  if (imageVersions) {
    imageVersions.forEach((v: any) => {
      imageVersionsMap.set(`${v.product_id}|${v.web_image_url}`, v.feed_image_url);
    });
  }

  const getAvailability = (status: string, stock: number | null) => {
    if (status === "active" && (stock === null || stock > 0)) {
      return "in stock";
    }
    return "out of stock";
  };

  const getFeedImageUrls = (productId: string, imageJson: any[]): string[] => {
    if (!Array.isArray(imageJson)) return [];

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const bucket = "product-images";

    const urls = imageJson
      .map((img) => {
        if (!img) return null;
        const webPath = typeof img === "string" ? img : img.url || img.web_image_url;
        if (!webPath) return null;

        // Check if we have an optimized version
        const optimizedVersion = imageVersionsMap.get(`${productId}|${webPath}`);
        let finalPath = optimizedVersion || webPath;

        if (/^https?:\/\//i.test(finalPath)) return finalPath;

        // Clean up path
        if (finalPath.startsWith("/")) finalPath = finalPath.slice(1);

        return `${supabaseUrl}/storage/v1/object/public/${bucket}/${finalPath}`;
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

      // Price logic
      const currentPrice = typeof product.price === "number" ? product.price : 0;
      const comparePrice = typeof product.compare_at_price === "number" ? product.compare_at_price : null;

      let basePrice = comparePrice && comparePrice > currentPrice ? comparePrice : currentPrice;
      let salePrice = comparePrice && comparePrice > currentPrice ? currentPrice : null;

      const saleEffectiveDate = salePrice
        ? `${new Date().toISOString().split("T")[0]}T00:00+03:00/${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}T23:59+03:00`
        : null;

      // Variants
      const sizes = Array.isArray(product.sizes) ? product.sizes : [];
      const colors = Array.isArray(product.colors) ? product.colors : [];

      const formatItem = (variantId: string, variantTitle: string, variantPrice: number, variantSize?: string, variantColor?: string) => {
        const pId = product.id as string;
        return `
      <item>
        <g:id>${escapeXml(pId)}${variantId}</g:id>
        <g:item_group_id>${escapeXml(pId)}</g:item_group_id>
        <g:title>${escapeXml(product.name)}${variantTitle}</g:title>
        <g:description>${escapeXml(cleanDescription)}</g:description>
        <g:link>${escapeXml(productLink)}</g:link>
        <g:image_link>${escapeXml(imageUrls[0])}</g:image_link>
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
        <g:mpn>${escapeXml(product.id)}</g:mpn>
        ${googleCategory ? `<g:google_product_category>${escapeXml(googleCategory)}</g:google_product_category>` : ""}
        ${productType ? `<g:product_type>${escapeXml(productType)}</g:product_type>` : ""}
        <g:identifier_exists>no</g:identifier_exists>
      </item>`;
      };

      // Generate items for all combinations of sizes and colors
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

            // Variant pricing logic (simplification)
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

