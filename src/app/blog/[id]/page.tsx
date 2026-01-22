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



const SocialShareButtons = ({ url, title }: { url: string; title: string }) => (
  <div className="flex items-center space-x-3 mt-8 pt-6 border-t border-gray-200">
    <span className="text-sm font-medium text-gray-600">Share this post:</span>
    {/* Twitter */}
    <a
      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url,
      )}&text=${encodeURIComponent(title)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on Twitter"
      className="text-gray-500 hover:text-blue-400"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    </a>
    {/* Facebook */}
    <a
      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on Facebook"
      className="text-gray-500 hover:text-blue-600"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    </a>
    {/* LinkedIn */}
    <a
      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        url,
      )}&title=${encodeURIComponent(title)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Share on LinkedIn"
      className="text-gray-500 hover:text-blue-700"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    </a>
  </div>
);

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
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`;
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

          <footer className="mt-12">
            <SocialShareButtons url={postUrl} title={post.title} />
          </footer>
        </article>
      </div>
    </div>
  );
}
