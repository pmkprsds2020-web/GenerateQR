// Form validation utilities
import type { QrType } from "./qr-types";
import type { QrFormData } from "./qr-content";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateQrForm(type: QrType, data: QrFormData): ValidationResult {
  const errors: Record<string, string> = {};

  const require = (field: string, value: string | undefined, message: string) => {
    if (!value || !value.trim()) {
      errors[field] = message;
    }
  };

  switch (type) {
    case "url": {
      require("url", data.url, "URL wajib diisi.");
      if (data.url && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+.*$/i.test(data.url.trim())) {
        errors.url = "Masukkan URL yang valid.";
      }
      break;
    }
    case "text":
      require("text", data.text, "Teks wajib diisi.");
      break;
    case "phone":
      require("phone", data.phone, "Nomor telepon wajib diisi.");
      if (data.phone && !/^[\d+\-\s()]{6,}$/.test(data.phone)) {
        errors.phone = "Masukkan nomor telepon yang valid.";
      }
      break;
    case "whatsapp": {
      require("whatsappNumber", data.whatsappNumber, "Nomor WhatsApp wajib diisi.");
      if (data.whatsappNumber) {
        const digits = data.whatsappNumber.replace(/\D/g, "");
        if (digits.length < 8 || digits.length > 15) {
          errors.whatsappNumber = "Masukkan nomor WhatsApp yang valid (8-15 digit).";
        }
      }
      break;
    }
    case "email": {
      require("emailTo", data.emailTo, "Email tujuan wajib diisi.");
      if (data.emailTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.emailTo)) {
        errors.emailTo = "Format email tidak valid.";
      }
      break;
    }
    case "sms": {
      require("smsNumber", data.smsNumber, "Nomor telepon wajib diisi.");
      if (data.smsNumber && !/^[\d+\-\s()]{6,}$/.test(data.smsNumber)) {
        errors.smsNumber = "Masukkan nomor telepon yang valid.";
      }
      break;
    }
    case "wifi":
      require("wifiSsid", data.wifiSsid, "Nama WiFi (SSID) wajib diisi.");
      if (data.wifiSecurity && data.wifiSecurity !== "nopass") {
        require("wifiPassword", data.wifiPassword, "Password WiFi wajib diisi.");
      }
      break;
    case "vcard":
      require("vcardName", data.vcardName, "Nama lengkap wajib diisi.");
      if (data.vcardEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.vcardEmail)) {
        errors.vcardEmail = "Format email tidak valid.";
      }
      break;
    case "location": {
      if (data.locationLat && data.locationLng) {
        if (!/^-?\d+\.?\d*$/.test(data.locationLat)) errors.locationLat = "Latitude tidak valid.";
        if (!/^-?\d+\.?\d*$/.test(data.locationLng)) errors.locationLng = "Longitude tidak valid.";
      } else if (!data.locationAddress && !data.locationUrl) {
        errors.locationAddress = "Isi alamat, koordinat, atau URL Google Maps.";
      }
      break;
    }
    case "event": {
      require("eventTitle", data.eventTitle, "Judul event wajib diisi.");
      require("eventStart", data.eventStart, "Waktu mulai wajib diisi.");
      if (data.eventEnd && data.eventStart && new Date(data.eventEnd) < new Date(data.eventStart)) {
        errors.eventEnd = "Waktu selesai tidak boleh sebelum waktu mulai.";
      }
      break;
    }
    case "payment":
      require("paymentNumber", data.paymentNumber, "Nomor pembayaran wajib diisi.");
      break;
    case "custom":
      require("customText", data.customText, "Konten custom wajib diisi.");
      break;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
