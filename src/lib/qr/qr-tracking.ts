// Only these types encode a real, fetchable http(s) link as their content
// (a website URL, an uploaded PDF file, or a wa.me WhatsApp link) - so only they can be safely
// swapped for our own /r/{id} tracking redirect without breaking the QR's
// native behavior. Types like wifi, vcard, location, event, and payment
// encode special text formats that phones' camera apps parse directly
// (auto-connect wifi, save contact, etc.) - wrapping those in a web link
// would break that native handling, so they're left untouched and stay
// untracked.
const TRACKABLE_TYPES = new Set(["url", "pdf", "whatsapp"]);

export function isTrackableQrType(type: string): boolean {
  return TRACKABLE_TYPES.has(type);
}

// Make sure a destination is an absolute http(s) URL. Users often type
// "drive.google.com/..." without a scheme; a redirect to that would be
// treated as a relative path and break.
export function normalizeDestinationUrl(raw: string): string | null {
  const value = (raw || "").trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

// base64url helpers (UTF-8 safe, work in both browser and Node runtimes)
export function encodeBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeBase64Url(encoded: string): string | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

// Returns what should actually be encoded into the visual QR code for a
// saved record: a tracking redirect link for trackable types (so real
// camera scans get counted), or the raw content otherwise/before saving.
//
// The destination is also embedded in the link (?u=...), so a scan ALWAYS
// reaches the right place even if the database is unreachable or the
// record was never synced to it - the database is only needed for counting.
export function getScannableQrValue(record: { id?: string; type: string; content: string }): string {
  if (typeof window === "undefined") return record.content;
  if (!record.id) return record.content; // not saved yet - no id to redirect through
  if (!isTrackableQrType(record.type)) return record.content;
  const destination = normalizeDestinationUrl(record.content);
  if (!destination) return record.content; // not a valid web link - encode as-is
  return `${window.location.origin}/r/${encodeURIComponent(record.id)}?u=${encodeBase64Url(destination)}`;
}
