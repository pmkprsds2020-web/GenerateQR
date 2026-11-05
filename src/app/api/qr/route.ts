import { NextRequest, NextResponse } from "next/server";
import { getSupabase, mapQrCode, type QrCodeRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/qr - List all QR codes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50") || 50, 1), 1000);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0") || 0, 0);

    let query = getSupabase()
      .from("qr_codes")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (type && type !== "all") query = query.eq("type", type);

    const { data, count, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      data: (data as QrCodeRow[]).map(mapQrCode),
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[api/qr] Failed to fetch QR codes:", error);
    return NextResponse.json({ error: "Failed to fetch QR codes" }, { status: 500 });
  }
}

// POST /api/qr - Create or update (upsert) a QR code
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, type, content, customization, userId, isPublic } = body;

    if (!name || !type || !content) {
      return NextResponse.json(
        { error: "Missing required fields: name, type, content" },
        { status: 400 }
      );
    }
    if (typeof content !== "string" || content.length > 4000) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }

    const row: Record<string, unknown> = {
      name: String(name).slice(0, 255),
      type: String(type),
      content: String(content).slice(0, 4000),
      customization: customization ? JSON.stringify(customization) : null,
    };
    if (id) row.id = String(id);
    if (userId) row.user_id = String(userId);
    if (isPublic !== undefined) row.is_public = isPublic !== false;

    const { data, error } = await getSupabase()
      .from("qr_codes")
      .upsert(row, { onConflict: "id" })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ data: mapQrCode(data as QrCodeRow) }, { status: 201 });
  } catch (error) {
    console.error("[api/qr] Failed to create QR code:", error);
    return NextResponse.json({ error: "Failed to create QR code" }, { status: 500 });
  }
}
