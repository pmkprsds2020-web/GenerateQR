// QR Code content generators for each type
import type { QrType } from "./qr-types";

export interface QrFormData {
  // URL
  url?: string;
  // Text
  text?: string;
  // Phone
  phone?: string;
  // WhatsApp
  whatsappNumber?: string;
  whatsappMessage?: string;
  // Email
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  // SMS
  smsNumber?: string;
  smsMessage?: string;
  // WiFi
  wifiSsid?: string;
  wifiPassword?: string;
  wifiSecurity?: "WPA" | "WEP" | "nopass";
  wifiHidden?: boolean;
  // vCard
  vcardName?: string;
  vcardOrg?: string;
  vcardTitle?: string;
  vcardPhone?: string;
  vcardEmail?: string;
  vcardUrl?: string;
  vcardAddress?: string;
  // Location
  locationAddress?: string;
  locationLat?: string;
  locationLng?: string;
  locationUrl?: string;
  // Event
  eventTitle?: string;
  eventStart?: string;
  eventEnd?: string;
  eventLocation?: string;
  eventDescription?: string;
  // Payment
  paymentType?: "qris" | "gopay" | "ovo" | "dana" | "shopeepay";
  paymentNumber?: string;
  paymentAmount?: string;
  paymentNote?: string;
  // Custom
  customText?: string;
}

function escapeWifi(s: string): string {
  return s.replace(/([\\;,:"])/g, "\\$1");
}

function escapeVcard(s: string): string {
  return s.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
}

function escapeIcal(s: string): string {
  return s.replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");
}

function formatIcalDate(dt: string): string {
  if (!dt) return "";
  const d = new Date(dt);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

/**
 * Generate the content string for a QR code based on its type and form data.
 */
export function generateQrContent(type: QrType, data: QrFormData): string {
  switch (type) {
    case "url": {
      let url = (data.url || "").trim();
      if (!url) return "";
      if (!/^https?:\/\//i.test(url) && !/^ftp:\/\//i.test(url)) {
        url = "https://" + url;
      }
      return url;
    }

    case "text":
      return (data.text || "").trim();

    case "phone":
      return "tel:" + (data.phone || "").replace(/[^\d+*#]/g, "");

    case "whatsapp": {
      const num = (data.whatsappNumber || "").replace(/[^\d]/g, "");
      const msg = (data.whatsappMessage || "").trim();
      if (!num) return "";
      const base = `https://wa.me/${num}`;
      return msg ? `${base}?text=${encodeURIComponent(msg)}` : base;
    }

    case "email": {
      const to = (data.emailTo || "").trim();
      if (!to) return "";
      const params: string[] = [];
      if (data.emailSubject) params.push("subject=" + encodeURIComponent(data.emailSubject));
      if (data.emailBody) params.push("body=" + encodeURIComponent(data.emailBody));
      return params.length ? `mailto:${to}?${params.join("&")}` : `mailto:${to}`;
    }

    case "sms": {
      const num = (data.smsNumber || "").replace(/[^\d+]/g, "");
      if (!num) return "";
      const msg = (data.smsMessage || "").trim();
      return msg ? `SMSTO:${num}:${msg}` : `sms:${num}`;
    }

    case "wifi": {
      const ssid = data.wifiSsid || "";
      if (!ssid) return "";
      const security = data.wifiSecurity || "WPA";
      const password = data.wifiPassword || "";
      const hidden = data.wifiHidden ? "true" : "false";
      if (security === "nopass") {
        return `WIFI:T:nopass;S:${escapeWifi(ssid)};H:${hidden};;`;
      }
      return `WIFI:T:${security};S:${escapeWifi(ssid)};P:${escapeWifi(password)};H:${hidden};;`;
    }

    case "vcard": {
      const name = data.vcardName || "";
      if (!name) return "";
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${escapeVcard(name)};;;;`,
        `FN:${escapeVcard(name)}`,
      ];
      if (data.vcardOrg) lines.push(`ORG:${escapeVcard(data.vcardOrg)}`);
      if (data.vcardTitle) lines.push(`TITLE:${escapeVcard(data.vcardTitle)}`);
      if (data.vcardPhone) lines.push(`TEL;TYPE=CELL:${data.vcardPhone.replace(/[^\d+]/g, "")}`);
      if (data.vcardEmail) lines.push(`EMAIL:${data.vcardEmail}`);
      if (data.vcardUrl) lines.push(`URL:${data.vcardUrl}`);
      if (data.vcardAddress) lines.push(`ADR:;;${escapeVcard(data.vcardAddress)};;;;`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }

    case "location": {
      const lat = data.locationLat?.trim();
      const lng = data.locationLng?.trim();
      if (lat && lng) {
        return `https://www.google.com/maps?q=${lat},${lng}`;
      }
      if (data.locationUrl) return data.locationUrl.trim();
      if (data.locationAddress) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.locationAddress)}`;
      }
      return "";
    }

    case "event": {
      const title = data.eventTitle || "";
      if (!title || !data.eventStart) return "";
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//QR GEN PRO//ID//EN",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@qrgenpro`,
        `DTSTAMP:${formatIcalDate(new Date().toISOString())}`,
        `SUMMARY:${escapeIcal(title)}`,
        `DTSTART:${formatIcalDate(data.eventStart)}`,
      ];
      if (data.eventEnd) lines.push(`DTEND:${formatIcalDate(data.eventEnd)}`);
      if (data.eventLocation) lines.push(`LOCATION:${escapeIcal(data.eventLocation)}`);
      if (data.eventDescription) lines.push(`DESCRIPTION:${escapeIcal(data.eventDescription)}`);
      lines.push("END:VEVENT", "END:VCALENDAR");
      return lines.join("\n");
    }

    case "payment": {
      const num = (data.paymentNumber || "").replace(/[^\d]/g, "");
      const type = data.paymentType || "qris";
      if (!num && type === "qris") return "";
      switch (type) {
        case "qris":
          return `https://qris.id/${num}`;
        case "gopay":
          return `https://gojek.com/gojek-link/id?phone=${num}`;
        case "ovo":
          return `https://ovo.id/pay/${num}`;
        case "dana":
          return `https://link.dana.id/qa/${num}`;
        case "shopeepay":
          return `https://shopee.co.id/universal-link?path=shopeepay&phone=${num}`;
        default:
          return "";
      }
    }

    case "custom":
      return (data.customText || "").trim();

    default:
      return "";
  }
}

/**
 * Detect QR content type from a decoded string.
 */
export function detectQrType(content: string): { type: QrType; label: string } {
  const c = content.trim();
  if (!c) return { type: "text", label: "Kosong" };

  if (/^https?:\/\//i.test(c)) {
    if (/wa\.me|whatsapp/i.test(c)) return { type: "whatsapp", label: "WhatsApp" };
    if (/google\.com\/maps/i.test(c)) return { type: "location", label: "Lokasi" };
    if (/qris\.id|gojek|ovo\.id|link\.dana|shopee/i.test(c)) return { type: "payment", label: "Pembayaran" };
    return { type: "url", label: "URL / Website" };
  }
  if (/^mailto:/i.test(c)) return { type: "email", label: "Email" };
  if (/^tel:/i.test(c)) return { type: "phone", label: "Nomor Telepon" };
  if (/^sms/i.test(c)) return { type: "sms", label: "SMS" };
  if (/^WIFI:/i.test(c)) return { type: "wifi", label: "WiFi" };
  if (/^BEGIN:VCARD/i.test(c)) return { type: "vcard", label: "Kontak / vCard" };
  if (/^BEGIN:VCALENDAR/i.test(c)) return { type: "event", label: "Event" };
  return { type: "text", label: "Teks" };
}
