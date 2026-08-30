import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/qr/generate - alias for listing (used when path is /api/qr/generate without id)
export async function GET() {
  try {
    const records = await db.qrCode.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ data: records });
  } catch {
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

    const record = await db.qrCode.create({
      data: {
        name: String(name).slice(0, 255),
        type: String(type),
        content: String(content).slice(0, 4000),
        customization: customization ? JSON.stringify(customization) : null,
        userId: userId || null,
      },
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create QR code" }, { status: 500 });
  }
}
