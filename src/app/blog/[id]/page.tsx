// Essential Next.js and Supabase imports
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

// Utility and Type imports
import { format } from "date-fns";
import { sanitizeHTML } from "@/utils/sanitizeHTML";
import type { Database } from "@/types/supabase";

import { siteConfig } from "@/config/site";
import { constructMetadata } from "@/utils/seo";
import TableOfContents from "@/components/TableOfContents";
import type { TocItem } from "@/lib/tocUtils";

// Define more precise types based on the global Database type
type BlogPostAuthor = Database["public"]["Tables"]["profiles"]["Row"];

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"] & {
  profiles: BlogPostAuthor | null;
  blog_categories: {
    id: string;
    name: string;
    slug: string;
  }[];
};




async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();

  // The 'blog_posts_categories' mapping table is no longer used for direct queries.
  // Instead, we assume 'tags' on the 'blog_posts' table holds category slugs or names.
  // The 'profiles' table is joined via 'author_id'.
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
        *,
        profiles ( * )
    `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error(
      `[getPost] Supabase error for slug '${slug}':`,
      error.message,
    );
    return null;
  }

  if (!data) {
    console.log(`[getPost] No published post found for slug '${slug}'.`);
    return null;
  }

  // Since we can't join on categories directly anymore without a proper join table
  // in the query, we'll manually shape the categories if needed or just use tags.
  const postData = {
    ...(data as any),
    blog_categories:
      (data as any).tags?.map((tag: string) => ({ id: tag, name: tag, slug: tag })) ||
      [],
  };

  return postData as BlogPost;
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id: slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const siteUrl = siteConfig.url;

  const imageUrl = post.featured_image
    ? post.featured_image.startsWith("http")
      ? post.featured_image
      : `${siteUrl}${post.featured_image}`
    : siteConfig.ogImage;

  return constructMetadata({
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || "",
    image: imageUrl,
  });
}

const processContentForToc = (htmlContent: string): string => {
  if (!htmlContent) return "";
  const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/&/g, "-and-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  return htmlContent.replace(
    /<h([2-3])(.*?)>(.*?)<\/h[2-3]>/gi,
    (match, level, attrs, innerText) => {
      const textContent = innerText.replace(/<[^>]+>/g, "").trim();
      if (!textContent) return match;
      if (attrs.includes("id=")) return match;
      const id = slugify(textContent);
      return `<h${level} id="${id}"${attrs}>${innerText}</h${level}>`;
    },
  );
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  const contentWithIds = processContentForToc(post.content);
  const sanitizedContent = sanitizeHTML(contentWithIds);

  // Dynamic import for tocUtils to avoid server-side issues if it has client-side dependencies.
  const { generateTocItems } = await import("@/lib/tocUtils");
  const tocItems: TocItem[] = generateTocItems(contentWithIds);
  const authorName = post.profiles?.first_name

    ? `${post.profiles.first_name} ${post.profiles.last_name || ""}`.trim()
    : `${siteConfig.name} Team`;

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-sm text-gray-500">
              {post.profiles?.avatar_url && (
                <Image
                  src={post.profiles.avatar_url}
                  alt={authorName}
                  width={40}
                  height={40}
                  className="rounded-full mr-3"
                />
              )}
              <span>By {authorName}</span>
              <span className="mx-2">&middot;</span>
              <time dateTime={post.published_at || ""}>
                {format(
                  new Date(post.published_at || Date.now()),
                  "MMMM d, yyyy",
                )}
              </time>
            </div>
          </header>

          {post.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={post.featured_image}
                alt={post.title}
                width={1200}
                height={630}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-12">
            <div className="prose prose-lg max-w-none w-full lg:w-3/4">
              <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            </div>
            <aside className="lg:w-1/4">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                  Table of Contents
                </h3>
                <TableOfContents tocItems={tocItems} />
              </div>
            </aside>
          </div>

        </article>
      </div>
    </div>
  );
}
