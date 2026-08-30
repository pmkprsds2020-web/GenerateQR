import { NextRequest, NextResponse } from "next/server";
import { detectQrType } from "@/lib/qr/qr-content";

// POST /api/scanner/decode - Decode QR from content (server-side type detection)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const detected = detectQrType(content);
    const isUrl = /^https?:\/\//i.test(content);
    const isHttp = /^http:\/\//i.test(content);

    return NextResponse.json({
      content,
      type: detected.type,
      label: detected.label,
      isUrl,
      isSecure: isUrl && !isHttp,
      warnings: isHttp ? ["URL menggunakan HTTP (tidak aman)"] : [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to decode" }, { status: 500 });
  }
}
