import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server"; // Added NextRequest import

export const dynamic = "force-dynamic";

export async function PUT( // Changed GET to PUT
  request: Request, // Changed NextRequest to Request
  { params }: { params: Promise<{ id: string }> }, // Updated params type
) {
  const { id } = await params; // Updated destructuring and awaiting params
  const { status } = await request.json(); // Reintroduced status from request body

  const supabase = await createClient();

  // RLS policies will enforce that only an admin can update orders.
  const { error } = await supabase
    .from("orders") // Added .from('orders')
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: `Failed to update order status: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
