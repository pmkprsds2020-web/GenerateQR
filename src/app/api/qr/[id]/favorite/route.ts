import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST /api/qr/{id}/favorite - Toggle favorite
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const userId = body.userId;

    // If no user, just return success (client-side favorite handled in store)
    if (!userId) {
      return NextResponse.json({ success: true, message: "Favorite toggled client-side" });
    }

    const supabase = getSupabase();
    const { data: existing, error: findError } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("qr_code_id", id)
      .maybeSingle();
    if (findError) throw findError;

    if (existing) {
      const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
      if (error) throw error;
      return NextResponse.json({ success: true, favorite: false });
    }

    const { error } = await supabase.from("favorites").insert({ user_id: userId, qr_code_id: id });
    if (error) throw error;
    return NextResponse.json({ success: true, favorite: true });
  } catch (error) {
    console.error("[api/qr/id/favorite] Failed to toggle favorite:", error);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
