import { supabase } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import { generateSlug } from "@/utils/strings";

// Define the expected shape of a product when selected within a category
interface ProductInCategory {
  id: string;
  name: string | null;
  slug: string | null;
  price: number | null;
  images: any; // Supabase Json type can be 'any' or a more specific type if known
  is_featured: boolean | null;
}

// Define the expected shape of an item from product_categories join
interface ItemWithProduct {
  product: ProductInCategory | null;
}

// User-defined type guard to check if an item has the 'product' property of the expected shape
function isItemWithProduct(item: any): item is ItemWithProduct {
  return (
    item && typeof item === "object" && typeof item.product !== "undefined"
  ); // Check for product property existence
}

type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export const categoryQueries = {
  async getCategoryBySlug(slug: string) {
    // First get the category details
    const { data: category, error } = await supabase
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        image_url,
        is_active,
        metadata
      `,
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching category by slug:", error);
      return null;
    }

    if (!category) return null;

    // Then get all products in this category using the junction table
    const { data: productsData, error: productsError } = await supabase
      .from("product_categories")
      .select(
        `
        product:products(
          id,
          name,
          slug,
          price,       // Leaner selection for category product list
          images,
          is_featured
        )
      `,
      )
      .eq("category_id", category.id)
      .eq("products.status", "active");

    if (productsError) {
      console.error("Error fetching products for category:", productsError);
      return category; // Return category without products
    }

    // Extract products from the nested structure using the type guard
    const mappedProducts = productsData
      ? productsData.map((item) => {
        if (isItemWithProduct(item)) {
          return item.product; // item.product is ProductInCategory | null
        }
        return null;
      })
      : [];

    // Filter out null products and assert the type for the final array
    const formattedProducts: ProductInCategory[] = mappedProducts.filter(
      (p): p is ProductInCategory => p !== null,
    );

    // Add products to the category object
    return {
      ...category,
      products: formattedProducts,
    };
  },

  async getCategories() {
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        id,
        name,
        slug,
        description,
        image_url,
        is_active,
        metadata
      `,
      )
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return null;
    }

    return data;
  },

  // Get all categories with product counts
  async getCategoriesWithCount() {
    const { data, error } = await supabase.rpc(
      "get_categories_with_product_counts",
    );

    if (error) {
      console.error("Error fetching categories with product counts:", error);
      return null;
    }
    return data;
  },

  async createCategory(category: CategoryInsert) {
    const slug = generateSlug(category.name);
    const metaTitle = category.name;
    const metaDescription = category.description || category.name;

    const { data, error } = await supabase
      .from("categories")
      .insert({
        ...category,
        slug,
        metadata: {
          meta_title: metaTitle,
          meta_description: metaDescription,
        },
      })
      .select(
        `
        id,
        name,
        slug,
        description,
        image_url,
        is_active
      `,
      )
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return null;
    }

    return data;
  },

  async updateCategory(
    id: string,
    updates: CategoryUpdate & { name?: string },
  ) {
    const slug = updates.name ? generateSlug(updates.name) : undefined;

    const { data, error } = await supabase
      .from("categories")
      .update({
        ...updates,
        ...(updates.name
          ? {
            slug,
            metadata: {
              meta_title: updates.name,
              meta_description: updates.description || updates.name,
            },
          }
          : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        id,
        name,
        slug,
        description,
        image_url,
        is_active
      `,
      )
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return null;
    }

    return data;
  },
};
