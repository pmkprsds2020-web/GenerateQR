import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /r/{id} - QR codes for trackable types (url, whatsapp) encode this URL
// instead of their raw destination. Visiting it logs a real scan (from a
// phone camera, not the in-app "simulate scan" button) and forwards the
// visitor on to the actual content.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const record = await db.qrCode.update({
      where: { id },
      data: { scanCount: { increment: 1 } },
    });
    return NextResponse.redirect(record.content, { status: 302 });
  } catch {
    // Unknown id or database unreachable - send them home instead of an error.
    return NextResponse.redirect(new URL("/", req.url));
  }
}
