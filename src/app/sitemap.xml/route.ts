import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/config/site";

// Route configuration
export const dynamic = "force-dynamic";
export const revalidate = 302400; // 3.5 days in seconds

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
};

function generateSitemapXml(pages: SitemapEntry[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
      .map(
        (page) => `
    <url>
      <loc>${page.url}</loc>
      ${page.lastModified
            ? `<lastmod>${page.lastModified.toISOString()}</lastmod>`
            : ""
          }
      ${page.changeFrequency
            ? `<changefreq>${page.changeFrequency}</changefreq>`
            : ""
          }
      ${page.priority !== undefined
            ? `<priority>${page.priority}</priority>`
            : ""
          }
    </url>
  `,
      )
      .join("")}
</urlset>`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const siteUrl = siteConfig.url;

    // Get all products
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("slug, tags, updated_at")
      .eq("status", "active") as { data: { slug: string, tags: string[], updated_at: string }[] | null, error: any };

    if (productsError) {
      console.error("Error fetching products for sitemap:", productsError);
    }

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("slug, updated_at")
      .eq("is_active", true) as { data: { slug: string, updated_at: string }[] | null, error: any };

    if (categoriesError) {
      console.error("Error fetching categories for sitemap:", categoriesError);
    }

    // Get all published blog posts
    const { data: blogPosts, error: blogPostsError } = await supabase
      .from("blog_posts")
      .select("slug, published_at")
      .eq("status", "published") as { data: { slug: string, published_at: string }[] | null, error: any };

    if (blogPostsError) {
      console.error("Error fetching blog posts for sitemap:", blogPostsError);
    }

    // Static pages with appropriate change frequencies
    // Updated for siteConfig branding
    const staticPages: SitemapEntry[] = [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 1.0,
      },
      {
        url: `${siteUrl}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      },
      {
        url: `${siteUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: `${siteUrl}/products`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${siteUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${siteUrl}/shipping-information`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${siteUrl}/returns`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${siteUrl}/warranty`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${siteUrl}/terms-and-conditions`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
      {
        url: `${siteUrl}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      },
    ];

    const productPages: SitemapEntry[] =
      products?.map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })) || [];

    const categoryPages: SitemapEntry[] =
      categories?.map((category) => ({
        url: `${siteUrl}/category/${category.slug}`,
        lastModified: category.updated_at
          ? new Date(category.updated_at)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      })) || [];

    const blogPostPages: SitemapEntry[] =
      blogPosts?.map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.published_at
          ? new Date(post.published_at)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      })) || [];

    // Generate tag pages from products
    const uniqueTags = new Set<string>();
    products?.forEach((product) => {
      if (Array.isArray(product.tags)) {
        product.tags.forEach((tag) => uniqueTags.add(tag));
      }
    });

    const tagPages: SitemapEntry[] = [...uniqueTags].map((tag) => ({
      url: `${siteUrl}/tag/${encodeURIComponent(tag)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const allPages = [
      ...staticPages,
      ...productPages,
      ...categoryPages,
      ...blogPostPages,
      ...tagPages,
    ].filter((page) => page && page.url);

    // Generate XML
    const xml = generateSitemapXml(allPages);

    // Return the XML with appropriate headers
    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control":
          "public, s-maxage=302400, stale-while-revalidate=86400",
        "Last-Modified": new Date().toUTCString(),
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
