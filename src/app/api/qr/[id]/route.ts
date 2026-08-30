import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/qr/{id}
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await db.qrCode.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: record });
  } catch {
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

    const record = await db.qrCode.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: String(name).slice(0, 255) }),
        ...(type !== undefined && { type: String(type) }),
        ...(content !== undefined && { content: String(content).slice(0, 4000) }),
        ...(customization !== undefined && {
          customization: JSON.stringify(customization),
        }),
      },
    });
    return NextResponse.json({ data: record });
  } catch {
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
    await db.qrCode.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
