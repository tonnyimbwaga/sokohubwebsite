"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import BlogForm, { BlogPostFormData } from "./blog-form";
import { PostgrestError } from "@supabase/supabase-js";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"] & {
  profiles: { email: string | null } | null;
};

// This function transforms the database row into the format the form expects.
// It's necessary because the form might have a different structure (e.g., for handling categories).
const transformPostToFormData = (
  post: BlogPost,
): BlogPostFormData & { id: string } => {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    // The form expects an 'excerpt' field, which isn't in the main 'blog_posts' table.
    // We'll use a substring of the content as a default if it's missing.
    excerpt: post.excerpt || post.content.substring(0, 150),
    content: post.content,
    featured_image: post.featured_image || undefined,
    meta_title: post.meta_title || undefined,
    meta_description: post.meta_description || undefined,
    // The form expects a specific enum for status, which we map from the boolean 'is_published'.
    status: post.is_published ? "published" : "draft",
    published_at: post.published_at,
    // The form might handle categories as an array of IDs, which would be fetched/set separately.
    categories: post.tags || [],
    author_id: post.author_id,
  };
};

async function getBlogPosts(page = 1, search = "") {
  const supabase = createClient();
  const perPage = 10;
  let query = supabase
    .from("blog_posts")
    .select("*, profiles(email)", { count: "exact" })
    .range((page - 1) * perPage, page * perPage - 1)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching posts:", error);
    throw error;
  }

  return {
    data: data ?? [],
    error,
    totalPages: Math.ceil((count ?? 0) / perPage),
  };
}

export default function BlogPageClient({
  initialPosts,
  totalPages: initialTotalPages,
  currentPage,
}: {
  initialPosts: BlogPost[];
  totalPages: number;
  currentPage: number;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<
    (BlogPostFormData & { id: string }) | null
  >(null);
  const [page, setPage] = useState(currentPage);
  const [search, setSearch] = useState("");

  const fetchPosts = async (pageNum = 1, searchTerm = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, totalPages: newTotalPages } = await getBlogPosts(
        pageNum,
        searchTerm,
      );
      setPosts(data);
      setTotalPages(newTotalPages);
    } catch (err) {
      setError(err as PostgrestError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPosts(page, search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [page, search]);

  const handleEdit = (post: BlogPost) => {
    setEditingPost(transformPostToFormData(post));
    setIsFormOpen(true);
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", postId);
      if (deleteError) {
        // eslint-disable-next-line no-alert, no-restricted-globals
        alert(`Error deleting post: ${deleteError.message}`);
      } else {
        fetchPosts(page, search);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPost(null);
    fetchPosts(page, search);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button
          onClick={() => {
            setIsFormOpen(true);
            setEditingPost(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Post
        </button>
      </div>

      {isFormOpen ? (
        <BlogForm
          post={editingPost}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">Error: {error.message}</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-start"
                >
                  <div>
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                    <p className="text-gray-500 text-sm">
                      By {post.profiles?.email || "Unknown author"} on{" "}
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        post.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 mx-1 rounded-md ${
                  p === page ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
