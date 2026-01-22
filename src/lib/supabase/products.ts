import { supabase } from "./config";
import { Database } from "@/types/supabase";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

const PRODUCTS_PER_PAGE = 12;

export interface GetProductsParams {
  page?: number;
  categorySlug?: string;
  featured?: boolean;
  deals?: boolean;
  trending?: boolean;
  search?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "newest";
  viewMode?: "card" | "full";
}

export const productQueries = {
  // Fetch published products with pagination and optional filters
  getProducts: async ({
    page = 1,
    categorySlug,
    featured,
    deals,
    trending,
    search,
    tag,
    minPrice,
    maxPrice,
    sort = "newest",
    viewMode = "full",
  }: GetProductsParams = {}) => {
    const selectFull = `
      id,
      name,
      description,
      price,
      stock,
      status,
      is_featured,
      is_trending,
      sku,
      slug,
      category_id,
      images,
      is_published,
      created_at,
      category:categories!products_category_id_fkey(name, slug),
      tags
    `;

    const selectCard = `
      id,
      name,
      price,
      slug,
      images,
      is_featured,
      is_trending,
      category:categories!products_category_id_fkey(name, slug),
      tags
    `;

    let query = supabase
      .from("products")
      .select(viewMode === "card" ? selectCard : selectFull, { count: "exact" })
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    // Apply filters
    if (categorySlug) {
      // Filter by the joined category table slug
      query = query.eq("category.slug" as any, categorySlug);
    }
    if (featured) {
      query = query.eq("is_featured", true);
    }
    if (deals) {
      query = query.gt("compare_at_price", 0).not("compare_at_price", "is", null);
    }
    if (trending) {
      query = query.eq("is_trending", true);
    }
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (minPrice !== undefined) {
      query = query.gte("price", minPrice);
    }
    if (maxPrice !== undefined) {
      query = query.lte("price", maxPrice);
    }

    // Apply sorting
    if (sort === "price-asc") {
      query = query.order("price", { ascending: true });
    } else if (sort === "price-desc") {
      query = query.order("price", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    // Filter by tag if provided
    if (tag) {
      query = query.contains("tags", [tag]);
    }

    // Apply pagination
    const start = (page - 1) * PRODUCTS_PER_PAGE;
    query = query.range(start, start + PRODUCTS_PER_PAGE - 1);

    const { data: products, count, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }

    return {
      products,
      totalPages: count ? Math.ceil(count / PRODUCTS_PER_PAGE) : 0,
      totalProducts: count || 0,
    };
  },

  // Get a single product by slug
  getProductBySlug: async (slug: string) => {
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        stock,
        status,
        is_featured,
        is_trending,
        sku,
        slug,
        category_id,
        images,
        is_published,
        created_at,
        category:categories!products_category_id_fkey(name, slug),
        categories:product_categories(
          category:categories(id, name, slug)
        )
      `,
      )
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      throw error;
    }

    return product;
  },

  // Get new arrivals (most recent products)
  getNewArrivals: async (limit = 8) => {
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        compare_at_price,
        stock,
        status,
        is_featured,
        is_trending,
        sku,
        slug,
        category_id,
        images,
        is_published,
        created_at,
        category:categories!products_category_id_fkey(name, slug)
      `,
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching new arrivals:", error);
      throw error;
    }

    return products;
  },

  // Get products on sale/deals - Automated by discount
  getDeals: async (limit = 8) => {
    // We select products where compare_at_price > price
    // Note: PostgREST doesn't support complex calculations in ORDER BY easily via the JS client
    // for calculated columns unless defined in the view or using raw SQL.
    // However, we can sort by compare_at_price DESC as a proxy or fetch and sort in memory if limit is small.
    // Given Supabase free tier, let's keep it simple: fetch products marked as deals or with compare_at_price.

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        compare_at_price,
        stock,
        status,
        is_featured,
        is_trending,
        sku,
        slug,
        category_id,
        images,
        is_published,
        created_at,
        category:categories!products_category_id_fkey(name, slug)
      `,
      )
      .eq("is_published", true)
      .gt("compare_at_price", 0) // Ensure there's a comparison price
      .not("compare_at_price", "is", null)
      .order("compare_at_price", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching deals:", error);
      throw error;
    }

    return (products || []).sort((a: any, b: any) => {
      const discA = a.compare_at_price ? (a.compare_at_price - a.price) / a.compare_at_price : 0;
      const discB = b.compare_at_price ? (b.compare_at_price - b.price) / b.compare_at_price : 0;
      return discB - discA;
    }) as any;
  },

  // Get trending products
  getTrendingProducts: async (limit = 8) => {
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        stock,
        status,
        is_featured,
        is_trending,
        sku,
        slug,
        category_id,
        images,
        is_published,
        created_at,
        category:categories!products_category_id_fkey(name, slug),
        categories:product_categories(
          category:categories(id, name, slug)
        )
      `,
      )
      .eq("is_published", true)
      .eq("is_trending", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching trending products:", error);
      throw error;
    }

    return products;
  },

  // Search products
  searchProducts: async (query: string, limit = 10) => {
    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        price,
        slug,
        images,
        category:categories!products_category_id_fkey(name, slug)
      `,
      )
      .eq("is_published", true)
      .textSearch("search_vector", query)
      .limit(limit);

    if (error) {
      console.error("Error searching products:", error);
      throw error;
    }

    return products;
  },
};

export const productMutations = {
  // Create a new product (admin only)
  createProduct: async (product: ProductInsert) => {
    const { data, error } = await supabase
      .from("products")
      .insert(product as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw error;
    }

    return data;
  },

  // Update a product (admin only)
  updateProduct: async (id: string, updates: ProductUpdate) => {
    const { data, error } = await supabase
      .from("products")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      throw error;
    }

    return data;
  },

  // Delete a product (admin only)
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // Add a product to a category
  addProductToCategory: async (productId: string, categoryId: string) => {
    const { data, error } = await (supabase.from("product_categories") as any)
      .insert({ product_id: productId, category_id: categoryId })
      .select()
      .single();

    if (error) {
      // If it's a duplicate entry error, just ignore it
      if (error.code === "23505") {
        // Unique violation
        return { success: true, message: "Product already in this category" };
      }
      console.error("Error adding product to category:", error);
      throw error;
    }

    return { success: true, data };
  },

  // Remove a product from a category
  removeProductFromCategory: async (productId: string, categoryId: string) => {
    const { error } = await supabase
      .from("product_categories")
      .delete()
      .match({ product_id: productId, category_id: categoryId });

    if (error) {
      console.error("Error removing product from category:", error);
      throw error;
    }

    return { success: true };
  },

  // Set all categories for a product (replaces existing categories)
  setProductCategories: async (productId: string, categoryIds: string[]) => {
    // First, remove all existing categories for this product
    const { error: deleteError } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("Error removing existing product categories:", deleteError);
      throw deleteError;
    }

    // Then add all the new categories
    if (categoryIds.length > 0) {
      const categoryEntries = categoryIds.map((categoryId) => ({
        product_id: productId,
        category_id: categoryId,
      }));

      const { error: insertError } = await (supabase.from("product_categories") as any)
        .insert(categoryEntries);

      if (insertError) {
        console.error("Error adding product categories:", insertError);
        throw insertError;
      }
    }

    return { success: true };
  },

  // Get all categories for a product
  getProductCategories: async (productId: string) => {
    const { data, error } = await supabase.rpc("get_product_categories", {
      product_id: productId,
    });

    if (error) {
      console.error("Error getting product categories:", error);
      throw error;
    }

    return data || [];
  },
};
