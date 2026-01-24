import { createClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { products } = await req.json();

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json(
                { error: "Invalid request: products array is required" },
                { status: 400 },
            );
        }

        const supabase = createClient();

        // 1. Insert products
        const { data: uploadedProducts, error: productsError } = await supabase
            .from("products")
            .insert(
                products.map((p: any) => ({
                    name: p.name,
                    slug: p.slug || p.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
                    description: p.description || "",
                    price: p.price,
                    compare_at_price: p.compare_at_price || null,
                    stock: p.stock ?? 0,
                    category_id: p.category_id || null,
                    status: p.status || "active",
                    is_featured: p.is_featured || false,
                    is_trending: p.is_trending || false,
                    is_deal: p.is_deal || false,
                    images: Array.isArray(p.images) ? p.images : [],
                    sizes: Array.isArray(p.sizes) ? p.sizes : [],
                    tags: Array.isArray(p.tags) ? p.tags : [],
                }))
            )
            .select();

        if (productsError) throw productsError;

        // 2. Handle Junction Table if category_ids are provided
        const junctionInserts: any[] = [];
        products.forEach((p: any, index: number) => {
            if (p.category_ids && Array.isArray(p.category_ids)) {
                const productId = uploadedProducts[index].id;
                p.category_ids.forEach((catId: string) => {
                    junctionInserts.push({ product_id: productId, category_id: catId });
                });
            }
        });

        if (junctionInserts.length > 0) {
            const { error: junctionError } = await supabase
                .from("product_categories")
                .insert(junctionInserts);

            if (junctionError) {
                console.warn("Failed to insert into junction table:", junctionError);
            }
        }

        return NextResponse.json({
            success: true,
            count: uploadedProducts.length,
        });
    } catch (error: any) {
        console.error("Bulk upload error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to bulk upload products" },
            { status: 500 },
        );
    }
}
