import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decodeBase64Url, normalizeDestinationUrl } from "@/lib/qr/qr-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Don't make someone holding a phone wait on a slow/unreachable database.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

function redirectTo(url: string) {
  const res = NextResponse.redirect(url, { status: 302 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

// GET /r/{id}?u={base64url destination}
// QR codes for trackable types (url, whatsapp) encode this URL instead of
// their raw destination. Visiting it logs a real scan and forwards the
// visitor to the actual content.
//
// Resolution order:
//  1. Record found in the database -> count the scan, use its content
//     (so editing the URL later still updates where old prints go).
//  2. Database down / record missing -> use the destination embedded in ?u=
//  3. Nothing usable -> home page.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const record = await withTimeout(
      db.qrCode.update({
        where: { id },
        data: { scanCount: { increment: 1 } },
      }),
      4000
    );
    const destination = normalizeDestinationUrl(record.content);
    if (destination) return redirectTo(destination);
  } catch (error) {
    console.error(`[r/${id}] database lookup failed, using embedded destination:`, error);
  }

  const embedded = req.nextUrl.searchParams.get("u");
  if (embedded) {
    const decoded = decodeBase64Url(embedded);
    const destination = decoded ? normalizeDestinationUrl(decoded) : null;
    if (destination) return redirectTo(destination);
  }

  return redirectTo(new URL("/", req.url).toString());
}
