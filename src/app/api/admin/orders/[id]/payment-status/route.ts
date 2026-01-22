import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { status } = await request.json();
  const supabase = await createClient();

  // RLS will enforce that only an admin can perform this action.
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: status })
    .eq("id", id);

  if (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json(
      { error: `Failed to update payment status: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
