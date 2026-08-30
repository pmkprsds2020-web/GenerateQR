// QR Code type definitions

export type QrType =
  | "url"
  | "text"
  | "phone"
  | "whatsapp"
  | "email"
  | "sms"
  | "wifi"
  | "vcard"
  | "location"
  | "event"
  | "payment"
  | "custom";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QrCustomization {
  fgColor: string;
  bgColor: string;
  margin: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
  logoDataUrl?: string;
  logoSize?: number; // percentage 0-40
  pixelShape?: "square" | "dots" | "rounded";
  gradientEnabled?: boolean;
  gradientColor1?: string;
  gradientColor2?: string;
  gradientDirection?: number; // degrees 0-360
  frameEnabled?: boolean;
  frameStyle?: "rounded" | "square" | "circle";
  frameColor?: string;
  frameText?: string;
}

export interface QrRecord {
  id: string;
  name: string;
  type: QrType;
  content: string;
  data: Record<string, unknown>;
  customization: QrCustomization;
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
}

export const QR_TYPE_LABELS: Record<QrType, string> = {
  url: "URL / Website",
  text: "Teks",
  phone: "Nomor Telepon",
  whatsapp: "WhatsApp",
  email: "Email",
  sms: "SMS",
  wifi: "WiFi",
  vcard: "Kontak / vCard",
  location: "Lokasi / Maps",
  event: "Event / Kalender",
  payment: "Pembayaran",
  custom: "Custom QR Code",
};

export const QR_TYPE_ICONS: Record<QrType, string> = {
  url: "🔗",
  text: "📝",
  phone: "📞",
  whatsapp: "💬",
  email: "✉️",
  sms: "📱",
  wifi: "📶",
  vcard: "👤",
  location: "📍",
  event: "📅",
  payment: "💳",
  custom: "⚙️",
};

export const DEFAULT_CUSTOMIZATION: QrCustomization = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  margin: 2,
  errorCorrectionLevel: "H",
  logoSize: 20,
  pixelShape: "square",
};
