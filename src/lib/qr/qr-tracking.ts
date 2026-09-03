// Only these types encode a real, fetchable http(s) link as their content
// (a website URL, or a wa.me WhatsApp link) - so only they can be safely
// swapped for our own /r/{id} tracking redirect without breaking the QR's
// native behavior. Types like wifi, vcard, location, event, and payment
// encode special text formats that phones' camera apps parse directly
// (auto-connect wifi, save contact, etc.) - wrapping those in a web link
// would break that native handling, so they're left untouched and stay
// untracked.
const TRACKABLE_TYPES = new Set(["url", "whatsapp"]);

export function isTrackableQrType(type: string): boolean {
  return TRACKABLE_TYPES.has(type);
}

// Returns what should actually be encoded into the visual QR code for a
// saved record: a tracking redirect link for trackable types (so real
// camera scans get counted), or the raw content otherwise/before saving.
export function getScannableQrValue(record: { id?: string; type: string; content: string }): string {
  if (typeof window === "undefined") return record.content;
  if (!record.id) return record.content; // not saved yet - no id to redirect through
  if (!isTrackableQrType(record.type)) return record.content;
  return `${window.location.origin}/r/${record.id}`;
}
