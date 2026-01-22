import { supabase } from "./client";

/**
 * Functions to manage product-category relationships
 */
export const productCategoryQueries = {
  /**
   * Get all categories for a specific product
   */
  async getProductCategories(productId: string) {
    const { data, error } = await supabase
      .from("product_categories")
      .select(
        `
        category:categories(
          id,
          name,
          slug,
          description,
          image_url
        )
      `,
      )
      .eq("product_id", productId);

    if (error) {
      console.error("Error fetching product categories:", error);
      return [];
    }

    // Extract categories from the nested structure
    return data
      .map((item) => item.category)
      .filter((category) => category !== null);
  },

  /**
   * Add a product to a category
   */
  async addProductToCategory(productId: string, categoryId: string) {
    const { data, error } = await supabase
      .from("product_categories")
      .insert({ product_id: productId, category_id: categoryId })
      .select();

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

  /**
   * Remove a product from a category
   */
  async removeProductFromCategory(productId: string, categoryId: string) {
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

  /**
   * Update all categories for a product (replace existing)
   */
  async updateProductCategories(productId: string, categoryIds: string[]) {
    // First, remove all existing categories for this product
    const { error: deleteError } = await supabase
      .from("product_categories")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("Error removing existing product categories:", deleteError);
      throw deleteError;
    }

    // If no categories to add, just return success
    if (categoryIds.length === 0) {
      return { success: true };
    }

    // Add all the new categories
    const categoryEntries = categoryIds.map((categoryId) => ({
      product_id: productId,
      category_id: categoryId,
    }));

    const { error: insertError } = await supabase
      .from("product_categories")
      .insert(categoryEntries);

    if (insertError) {
      console.error("Error adding product categories:", insertError);
      throw insertError;
    }

    return { success: true };
  },

  /**
   * Get all products in a specific category
   */
  async getCategoryProducts(categoryId: string, limit = 20, page = 1) {
    const offset = (page - 1) * limit;

    const { data, count, error } = await supabase
      .from("product_categories")
      .select(
        `
        product:products(
          id,
          name,
          slug,
          description,
          price,
          stock,
          status,
          is_featured,
          is_trending,
          is_deal,
          sku,
          images,
          is_published,
          created_at
        )
      `,
        { count: "exact" },
      )
      .eq("category_id", categoryId)
      .eq("products.is_published", true)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching category products:", error);
      return { products: [], totalCount: 0 };
    }

    // Extract products from the nested structure
    const products = data
      .map((item) => item.product)
      .filter((product) => product !== null);

    return {
      products,
      totalCount: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0,
    };
  },
};
