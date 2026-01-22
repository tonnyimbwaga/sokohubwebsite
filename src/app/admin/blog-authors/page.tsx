"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import dynamic from "next/dynamic";
import Modal from "@/components/shared/Modal/Modal";
import { BlogAuthorFormData } from "./blog-author-form";
import { supabase } from "@/lib/supabase/client";

const BlogAuthorForm = dynamic(() => import("./blog-author-form"), {
  ssr: false,
});

interface BlogAuthor extends BlogAuthorFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

export default function BlogAuthorsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<BlogAuthor | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const queryClient = useQueryClient();

  // Fetch authors
  const {
    data: authors = [],
    isLoading,
    error,
  } = useQuery<BlogAuthor[]>({
    queryKey: ["blog-authors", page, search],
    queryFn: async () => {
      let query = supabase.from("blog_authors").select("*", { count: "exact" });

      if (search) {
        query = query.ilike("full_name", `%${search}%`);
      }

      const { data, error: queryError } = await query
        .order("full_name", { ascending: true })
        .range((page - 1) * perPage, page * perPage - 1);

      if (queryError) throw queryError;
      return data || [];
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_authors")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-authors"] });
    },
  });

  const handleEdit = (author: BlogAuthor) => {
    setSelectedAuthor(author);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-alert, no-restricted-globals
    if (
      window.confirm(
        "Are you sure you want to delete this author? This action cannot be undone.",
      )
    ) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error deleting author:", error);
        // eslint-disable-next-line no-alert, no-restricted-globals
        alert("Failed to delete author. Please try again.");
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedAuthor(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Blog Authors</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage the authors who can write blog posts on your site.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              setSelectedAuthor(null);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Add Author
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <div className="relative mt-1 rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Search authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading authors
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{(error as Error).message}</p>
                </div>
              </div>
            </div>
          </div>
        ) : authors.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No authors
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new author.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                New Author
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Created
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {authors.map((author) => (
                        <tr key={author.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                {author.avatar_url ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={author.avatar_url}
                                    alt={author.full_name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    {author.full_name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-gray-900">
                                  {author.full_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {author.email || "-"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {format(new Date(author.created_at), "MMM d, yyyy")}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleEdit(author)}
                              className="text-primary-600 hover:text-primary-900 mr-4"
                            >
                              <FiEdit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(author.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Author Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedAuthor(null);
        }}
        title={selectedAuthor ? "Edit Author" : "Add New Author"}
      >
        <BlogAuthorForm
          author={selectedAuthor || undefined}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedAuthor(null);
          }}
        />
      </Modal>
    </div>
  );
}
