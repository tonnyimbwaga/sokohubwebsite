"use client";

import React from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  status?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  categories: Category[];
}

interface SectionBlogsProps {
  blogs: BlogPost[];
}

export default function SectionBlogs({ blogs }: SectionBlogsProps) {
  if (!blogs || blogs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No blog posts found.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((post: BlogPost) => (
          <article
            key={post.id}
            className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {post.featured_image && (
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback image if the featured image fails to load
                    (e.target as HTMLImageElement).src =
                      "/images/placeholder-image.jpg";
                    console.log("Image failed to load:", post.featured_image);
                  }}
                />
              </div>
            )}
            <div className="p-6">
              <h2 className="mb-2 text-xl font-semibold">
                <a href={`/blog/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </a>
              </h2>
              <p className="mb-4 text-gray-600">{post.excerpt}</p>
              <div className="flex flex-wrap gap-2">
                {post.categories && post.categories.length > 0 ? (
                  post.categories.map((cat: Category) => (
                    <span
                      key={cat.id}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                    >
                      {cat.name}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
                    General
                  </span>
                )}
              </div>
              <time className="mt-4 block text-sm text-gray-500">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </time>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
