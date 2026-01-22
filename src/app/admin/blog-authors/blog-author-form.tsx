"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { SupabaseImageUpload } from "@/components/shared/SupabaseImageUpload/SupabaseImageUpload";
import { getProductImageUrl } from "@/utils/product-images";

export interface BlogAuthorFormData {
  id?: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
}

interface BlogAuthorFormProps {
  author?: BlogAuthorFormData | null;
  onClose: () => void;
}

export default function BlogAuthorForm({
  author,
  onClose,
}: BlogAuthorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>(author?.avatar_url);

  const supabase = createClient();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BlogAuthorFormData>({
    defaultValues: {
      full_name: author?.full_name || "",
      email: author?.email || "",
      bio: author?.bio || "",
      avatar_url: author?.avatar_url || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BlogAuthorFormData) => {
      setIsSubmitting(true);
      try {
        if (author?.id) {
          // Update existing author
          const { error } = await supabase
            .from("blog_authors")
            .update({
              full_name: data.full_name,
              email: data.email,
              bio: data.bio,
              avatar_url: avatar,
              updated_at: new Date().toISOString(),
            })
            .eq("id", author.id);

          if (error) throw error;
          return { id: author.id };
        } else {
          // Create new author
          const newAuthor = {
            id: uuidv4(),
            full_name: data.full_name,
            email: data.email,
            bio: data.bio,
            avatar_url: avatar,
          };

          const { error } = await supabase
            .from("blog_authors")
            .insert(newAuthor);

          if (error) throw error;
          return newAuthor;
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-authors"] });
      onClose();
    },
  });

  const onSubmit = (data: BlogAuthorFormData) => {
    mutation.mutate({
      ...data,
      avatar_url: avatar,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name *
          </label>
          <Controller
            name="full_name"
            control={control}
            rules={{ required: "Full name is required" }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                id="full_name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            )}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.full_name.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Avatar
          </label>
          <div className="mt-1">
            <SupabaseImageUpload
              bucket="blog-authors"
              onComplete={(urls) => setAvatar(`blog-authors/${urls.webp}`)}
              maxFiles={1}
            />
            {avatar && (
              <div className="mt-2">
                <img
                  src={getProductImageUrl(avatar)}
                  alt="Author avatar"
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700"
          >
            Bio
          </label>
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="bio"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Save Author"}
        </button>
      </div>
    </form>
  );
}
