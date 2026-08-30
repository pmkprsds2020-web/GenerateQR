import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const existing = await db.favorite.findUnique({
      where: { userId_qrCodeId: { userId, qrCodeId: id } },
    });

    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, favorite: false });
    } else {
      await db.favorite.create({ data: { userId, qrCodeId: id } });
      return NextResponse.json({ success: true, favorite: true });
    }
  } catch {
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
