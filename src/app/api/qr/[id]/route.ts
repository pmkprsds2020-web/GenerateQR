import { NextRequest, NextResponse } from "next/server";
import { getSupabase, mapQrCode, type QrCodeRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/qr/{id}
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await getSupabase()
      .from("qr_codes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: mapQrCode(data as QrCodeRow) });
  } catch (error) {
    console.error("[api/qr/id] Failed to fetch:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// PUT /api/qr/{id}
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, type, content, customization } = body;

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = String(name).slice(0, 255);
    if (type !== undefined) updates.type = String(type);
    if (content !== undefined) updates.content = String(content).slice(0, 4000);
    if (customization !== undefined) updates.customization = JSON.stringify(customization);

    const { data, error } = await getSupabase()
      .from("qr_codes")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: mapQrCode(data as QrCodeRow) });
  } catch (error) {
    console.error("[api/qr/id] Failed to update:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/qr/{id}
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await getSupabase().from("qr_codes").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/qr/id] Failed to delete:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
