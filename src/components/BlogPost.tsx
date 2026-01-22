"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { sanitizeHTML } from "@/utils/sanitizeHTML";

interface BlogPostProps {
  id: string;
}

export default function BlogPost({ id }: BlogPostProps) {
  const supabase = createClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          `
            id,
            title,
            content,
            featured_image,
            meta_title,
            meta_description,
            published_at,
            author:profiles(email)
          `,
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (post) {
      document.title = post.meta_title || post.title;
      const metaDescription = document.querySelector(
        'meta[name="description"]',
      );
      if (metaDescription) {
        metaDescription.setAttribute("content", post.meta_description || "");
      }
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-1/4 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold text-gray-900">Post not found</h1>
      </div>
    );
  }

  return (
    <article className="container mx-auto py-8">
      {post.featured_image && (
        <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.title}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

      <div className="flex items-center text-gray-600 mb-8">
        <span>
          By{" "}
          {Array.isArray(post.author) && post.author.length > 0
            ? post.author[0]?.email
            : typeof post.author === "object" && "email" in post.author
            ? (post.author as any).email
            : ""}
        </span>
        <span className="mx-2">•</span>
        <time dateTime={post.published_at || ""}>
          {post.published_at
            ? format(new Date(post.published_at), "MMMM d, yyyy")
            : "Draft"}
        </time>
      </div>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
      />
    </article>
  );
}
