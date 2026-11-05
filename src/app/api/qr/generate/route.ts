import { NextRequest, NextResponse } from "next/server";
import { getSupabase, mapQrCode, type QrCodeRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/qr/generate - alias for listing
export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("qr_codes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ data: (data as QrCodeRow[]).map(mapQrCode) });
  } catch (error) {
    console.error("[api/qr/generate] Failed to fetch:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// POST /api/qr/generate - Generate (save) a QR code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, content, customization, userId } = body;

    if (!name || !type || !content) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, content" },
        { status: 400 }
      );
    }
    if (typeof content !== "string" || content.length > 4000) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from("qr_codes")
      .insert({
        name: String(name).slice(0, 255),
        type: String(type),
        content: String(content).slice(0, 4000),
        customization: customization ? JSON.stringify(customization) : null,
        user_id: userId || null,
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ data: mapQrCode(data as QrCodeRow) }, { status: 201 });
  } catch (error) {
    console.error("[api/qr/generate] Failed to create QR code:", error);
    return NextResponse.json({ error: "Failed to create QR code" }, { status: 500 });
  }
}
