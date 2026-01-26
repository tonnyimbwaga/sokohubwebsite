"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(
  () => import("@/components/shared/RichTextEditor/RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="p-4 border rounded-lg min-h-[200px] bg-slate-50 animate-pulse" />
    ),
  },
);

import { SupabaseImageUpload } from "@/components/shared/SupabaseImageUpload/SupabaseImageUpload";
import { getProductImageUrl } from "@/utils/product-images";

export interface BlogPostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  meta_title?: string;
  meta_description?: string;
  status: "draft" | "published";
  published_at?: string | null;
  categories?: string[];
  author_id: string;
}

interface BlogPostFormProps {
  post?: (BlogPostFormData & { id?: string }) | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 50);

export default function BlogPostForm({
  post,
  onSuccess,
  onCancel: _onCancel,
  onClose,
}: BlogPostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string | undefined>(
    post?.featured_image,
  );

  const supabase = createClient();
  const queryClient = useQueryClient();

  // Fetch authors
  const { data: authors = [] } = useQuery({
    queryKey: ["blog-authors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_authors")
        .select("id, full_name")
        .order("full_name");
      return data || [];
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_categories")
        .select("id, name, slug")
        .order("name");
      return data || [];
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<BlogPostFormData>({
    defaultValues: {
      ...post,
      status: post?.status || "draft",
      author_id: post?.author_id || (authors?.[0]?.id ?? ""),
    },
  });

  // Watch title changes to auto-generate slug
  const watchTitle = watch("title");
  useEffect(() => {
    if (watchTitle && !post?.slug) {
      setValue("slug", generateSlug(watchTitle));
    }
  }, [watchTitle, setValue, post?.slug]);

  const handleImageUpload = (urls: { webp: string; original: string }) => {
    // urls.webp already includes the "blog/" bucket prefix
    const bucketPath = urls.webp;
    setFeaturedImage(bucketPath);
    setValue("featured_image", bucketPath);
  };

  const mutation = useMutation({
    mutationFn: async (data: BlogPostFormData) => {
      // Extract categories from form data
      const { categories, ...postData } = data;
      const postId = post?.id || uuidv4();

      // First, save the blog post
      const { error } = post?.id
        ? await supabase
          .from("blog_posts")
          .update({
            ...postData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", post.id)
        : await supabase.from("blog_posts").insert({
          ...postData,
          id: postId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      // If we have categories, save the relationships
      if (categories && categories.length > 0) {
        // First, delete existing relationships if updating
        if (post?.id) {
          await supabase
            .from("blog_posts_categories")
            .delete()
            .eq("post_id", post.id);
        }

        // Then insert new relationships
        const categoryRelationships = categories.map((categoryId) => ({
          post_id: postId,
          category_id: categoryId,
        }));

        const { error: relationshipError } = await supabase
          .from("blog_posts_categories")
          .insert(categoryRelationships);

        if (relationshipError) throw relationshipError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-posts-count"] });
      onSuccess?.();
      onClose?.();
    },
    onError: (error: Error) => {
      console.error("Error saving blog post:", error);
    },
  });

  const onSubmit = async (data: BlogPostFormData) => {
    try {
      setIsSubmitting(true);

      // Always set published_at when status is published
      if (data.status === "published") {
        data.published_at = new Date().toISOString();
      }

      // Log the data being submitted
      console.log("Submitting blog post:", data);

      await mutation.mutateAsync(data);

      // Force invalidate the cache to ensure the UI updates
      queryClient.invalidateQueries();
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="author_id"
            className="block text-sm font-medium text-gray-700"
          >
            Author *
          </label>
          <select
            id="author_id"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            {...register("author_id", { required: "Author is required" })}
          >
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.full_name}
              </option>
            ))}
          </select>
          {errors.author_id && (
            <p className="mt-1 text-sm text-red-600">
              {errors.author_id.message}
            </p>
          )}
        </div>
      </div>

      {/* Slug Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <input
          type="text"
          {...register("slug", { required: "Slug is required" })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
        />
        {errors.slug && (
          <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
        )}
      </div>

      {/* Excerpt */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Excerpt
        </label>
        <textarea
          {...register("excerpt", { required: "Excerpt is required" })}
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
        />
        {errors.excerpt && (
          <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <Controller
          name="content"
          control={control}
          defaultValue=""
          rules={{ required: "Content is required" }}
          render={({ field }) => (
            <RichTextEditor
              initialContent={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* Featured Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Featured Image
        </label>
        <div className="mt-2 space-y-4">
          <SupabaseImageUpload
            bucket="blog"
            onComplete={handleImageUpload}
            maxFiles={1}
          />
          {featuredImage && (
            <div className="mt-2">
              <div className="relative">
                <img
                  src={getProductImageUrl(featuredImage)}
                  alt="Featured"
                  className="h-48 w-full rounded-md object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFeaturedImage(undefined);
                    setValue("featured_image", undefined);
                  }}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEO Section */}
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Meta Title
          </label>
          <input
            type="text"
            {...register("meta_title")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Meta Description
          </label>
          <textarea
            {...register("meta_description")}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Categories
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                value={category.id}
                {...register("categories")}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
        {categories.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">
            No categories available. Add categories in the Supabase dashboard.
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          {...register("status")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={_onCancel}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? "Saving..." : "Save Post"}
        </button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-600">
          Error saving post:{" "}
          {mutation.error instanceof Error
            ? mutation.error.message
            : typeof mutation.error === "object" &&
              mutation.error !== null &&
              "message" in mutation.error
              ? String((mutation.error as any).message)
              : String(mutation.error ?? "Unknown error")}
        </p>
      )}
    </form>
  );
}
