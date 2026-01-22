import { supabase } from "./config";
import { Database } from "@/types/supabase";

// Only import types we actually use
type BlogPostInsert = Database["public"]["Tables"]["blog_posts"]["Insert"];
type BlogPostUpdate = Database["public"]["Tables"]["blog_posts"]["Update"];

const POSTS_PER_PAGE = 9;

const blogPostListSelect = `
  id,
  title,
  featured_image,
  published_at,
  slug,
  author:profiles(email),
  category:categories(name, slug)
`;

const blogPostDetailSelect = `
  id,
  title,
  content,
  featured_image,
  meta_title,
  meta_description,
  published_at,
  is_published,
  slug,
  author_id,
  category_id,
  author:profiles(email),
  category:categories(name, slug)
`;

export const blogPostQueries = {
  // Get published blog posts with pagination
  getBlogPosts: async ({
    page = 1,
    categorySlug,
    search,
  }: {
    page?: number;
    categorySlug?: string;
    search?: string;
  }) => {
    let query = supabase
      .from("blog_posts")
      .select(blogPostListSelect, { count: "exact" })
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (categorySlug) {
      query = query.eq("categories.slug", categorySlug);
    }

    if (search) {
      query = query.textSearch("search_vector", search);
    }

    // Apply pagination
    const start = (page - 1) * POSTS_PER_PAGE;
    query = query.range(start, start + POSTS_PER_PAGE - 1);

    const { data: posts, count, error } = await query;

    if (error) {
      console.error("Error fetching blog posts:", error);
      throw error;
    }

    return {
      posts,
      totalPages: count ? Math.ceil(count / POSTS_PER_PAGE) : 0,
      totalPosts: count || 0,
    };
  },

  // Get a single blog post by slug
  getBlogPostBySlug: async (slug: string) => {
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select(blogPostDetailSelect)
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching blog post:", error);
      throw error;
    }

    return post;
  },

  // Get recent blog posts
  getRecentPosts: async (limit = 4) => {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select(blogPostListSelect)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching recent posts:", error);
      throw error;
    }

    return posts;
  },

  // Search blog posts
  searchBlogPosts: async (query: string, limit = 10) => {
    const { data: posts, error } = await supabase
      .from("blog_posts")
      .select(blogPostListSelect)
      .eq("is_published", true)
      .textSearch("search_vector", query)
      .limit(limit);

    if (error) {
      console.error("Error searching blog posts:", error);
      throw error;
    }

    return posts;
  },
};

export const blogPostMutations = {
  // Create a new blog post (admin only)
  createBlogPost: async (post: BlogPostInsert) => {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert(post)
      .select()
      .single();

    if (error) {
      console.error("Error creating blog post:", error);
      throw error;
    }

    return data;
  },

  // Update a blog post (admin only)
  updateBlogPost: async (id: string, updates: BlogPostUpdate) => {
    const { data, error } = await supabase
      .from("blog_posts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating blog post:", error);
      throw error;
    }

    return data;
  },

  // Delete a blog post (admin only)
  deleteBlogPost: async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);

    if (error) {
      console.error("Error deleting blog post:", error);
      throw error;
    }
  },
};
