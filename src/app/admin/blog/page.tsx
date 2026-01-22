"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import dynamic from "next/dynamic";
const BlogPostForm = dynamic(() => import("./blog-form"), { ssr: false });
import { BlogPostFormData } from "./blog-form";
import Modal from "@/components/shared/Modal/Modal";

interface BlogPost extends Omit<BlogPostFormData, "status"> {
  id: string;
  created_at: string;
  status: "draft" | "published";
  user_id: string;
}

type BlogFormPost = BlogPostFormData & { id?: string };

export default function BlogPage() {
  // Add useEffect to disable bfcache
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", (event) => {
        if (event.persisted) {
          // If this page might be restored from bfcache
          window.location.reload();
        }
      });
    }
  }, []);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogFormPost | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const perPage = 10;

  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    data: posts,
    isLoading,
    error,
  } = useQuery<BlogPost[]>({
    queryKey: ["blog-posts", page, search],
    queryFn: async () => {
      try {
        let query = supabase
          .from("blog_posts")
          .select("*")
          .range((page - 1) * perPage, page * perPage - 1)
          .order("created_at", { ascending: false });

        if (search) {
          query = query.ilike("title", `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching posts:", error);
          console.error("Error details:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          throw error;
        }

        if (!data) {
          console.log("No data returned from query");
          return [];
        }

        console.log("Raw posts data:", data);

        return data as BlogPost[];
      } catch (error) {
        console.error("Error in queryFn:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        }
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: totalCount } = useQuery<number>({
    queryKey: ["blog-posts-count", search],
    queryFn: async () => {
      try {
        let query = supabase
          .from("blog_posts")
          .select("*", { count: "exact", head: true });
        if (search) {
          query = query.ilike("title", `%${search}%`);
        }
        const { count, error } = await query;
        if (error) {
          console.error("Error fetching count:", error);
          throw error;
        }
        return count || 0;
      } catch (error) {
        console.error("Error fetching count:", error);
        return 0;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts-count"] });
    },
  });

  const handleEdit = (post: BlogPost) => {
    setSelectedPost(post);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error deleting post:", error);
        // eslint-disable-next-line no-alert, no-restricted-globals
        alert("Failed to delete post. Please try again.");
      }
    }
  };

  const totalPages = Math.ceil((totalCount || 0) / perPage);

  if (error) {
    console.error("Query error:", error);
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
        <p className="text-sm text-red-500">
          An error occurred while fetching posts. Please check the console for
          details.
        </p>
        <pre className="mt-4 rounded-md bg-gray-100 p-4 text-sm">
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Blog Posts
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your blog posts and content
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              setSelectedPost(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            New Post
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Author ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Published
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  Loading posts...
                </td>
              </tr>
            ) : !posts?.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No posts found
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {post.title}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {post.user_id || "Unknown"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${post.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100 text-slate-800"
                        }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {post.published_at
                      ? format(new Date(post.published_at), "MMM d, yyyy")
                      : "Not published"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-primary hover:text-gray-900"
                      >
                        <FiEdit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{(page - 1) * perPage + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(page * perPage, totalCount || 0)}
                </span>{" "}
                of <span className="font-medium">{totalCount}</span> results
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${pageNum === page
                          ? "z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                        }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Blog Post Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedPost ? "Edit Blog Post" : "New Blog Post"}
      >
        <BlogPostForm
          post={selectedPost}
          onClose={() => {
            setIsFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
            queryClient.invalidateQueries({ queryKey: ["blog-posts-count"] });
          }}
        />
      </Modal>
    </div>
  );
}
