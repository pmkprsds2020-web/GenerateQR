import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/qr - List all QR codes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where = type && type !== "all" ? { type } : {};
    const [records, total] = await Promise.all([
      db.qrCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.qrCode.count({ where }),
    ]);

    return NextResponse.json({ data: records, total, limit, offset });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch QR codes" }, { status: 500 });
  }
}

// POST /api/qr/generate - Create a new QR code
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

    // Basic validation
    if (typeof content !== "string" || content.length > 4000) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }

    const record = await db.qrCode.upsert({
      where: { id: id || "__none__" },
      create: {
        ...(id ? { id: String(id) } : {}),
        name: String(name).slice(0, 255),
        type: String(type),
        content: String(content).slice(0, 4000),
        customization: customization ? JSON.stringify(customization) : null,
        userId: userId || null,
        isPublic: isPublic !== false,
      },
      update: {
        name: String(name).slice(0, 255),
        type: String(type),
        content: String(content).slice(0, 4000),
        customization: customization ? JSON.stringify(customization) : null,
      },
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create QR code" }, { status: 500 });
  }
}
