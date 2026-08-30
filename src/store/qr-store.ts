// QR store - manages QR records, favorites, templates via localStorage
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QrRecord, QrType, QrCustomization } from "@/lib/qr/qr-types";
import { DEFAULT_CUSTOMIZATION } from "@/lib/qr/qr-types";

export interface CustomTemplate {
  id: string;
  name: string;
  type: QrType;
  icon: string;
  data: Record<string, unknown>;
  customization: QrCustomization;
  createdAt: string;
}

export interface ScanLog {
  id: string;
  qrId: string;
  qrName: string;
  qrType: QrType;
  timestamp: string;
}

interface QrStoreState {
  records: QrRecord[];
  customTemplates: CustomTemplate[];
  scanLogs: ScanLog[];
  recentTypes: QrType[];
  recentSearches: string[];
  activeView: string;
  editingId: string | null;
  setType: string | null; // when picking a template
  loadTemplateData: { type: QrType; data: Record<string, unknown>; customization: QrCustomization } | null;

  setActiveView: (view: string) => void;
  setEditingId: (id: string | null) => void;
  setSetType: (type: string | null) => void;
  setLoadTemplateData: (data: { type: QrType; data: Record<string, unknown>; customization: QrCustomization } | null) => void;
  addRecentType: (type: QrType) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  saveQr: (record: Omit<QrRecord, "id" | "createdAt" | "updatedAt" | "favorite"> & { id?: string }) => QrRecord;
  deleteQr: (id: string) => void;
  duplicateQr: (id: string) => QrRecord | null;
  toggleFavorite: (id: string) => void;
  updateTags: (id: string, tags: string[]) => void;
  getQr: (id: string) => QrRecord | undefined;

  saveCustomTemplate: (tpl: Omit<CustomTemplate, "id" | "createdAt">) => CustomTemplate;
  deleteCustomTemplate: (id: string) => void;

  logScan: (qrId: string, qrName: string, qrType: QrType) => void;
  clearScanLogs: () => void;

  clearHistory: () => void;
}

export const useQrStore = create<QrStoreState>()(
  persist(
    (set, get) => ({
      records: [],
      customTemplates: [],
      scanLogs: [],
      recentTypes: [],
      recentSearches: [],
      activeView: "generate",
      editingId: null,
      setType: null,
      loadTemplateData: null,

      setActiveView: (view) => set({ activeView: view }),
      setEditingId: (id) => set({ editingId: id }),
      setSetType: (type) => set({ setType: type }),
      setLoadTemplateData: (data) => set({ loadTemplateData: data }),
      addRecentType: (type) => set((state) => ({
        recentTypes: [type, ...state.recentTypes.filter(t => t !== type)].slice(0, 6),
      })),
      addRecentSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => ({
          recentSearches: [trimmed, ...state.recentSearches.filter(s => s !== trimmed)].slice(0, 8),
        }));
      },
      clearRecentSearches: () => set({ recentSearches: [] }),

      saveQr: (record) => {
        const now = new Date().toISOString();
        if (record.id) {
          // Update existing
          const updated: QrRecord = {
            ...(get().records.find((r) => r.id === record.id) as QrRecord),
            ...record,
            id: record.id,
            updatedAt: now,
          } as QrRecord;
          set((state) => ({
            records: state.records.map((r) => (r.id === record.id ? updated : r)),
          }));
          return updated;
        }
        // Create new
        const newRecord: QrRecord = {
          ...record,
          id: `qr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          createdAt: now,
          updatedAt: now,
          favorite: false,
        } as QrRecord;
        set((state) => ({ records: [newRecord, ...state.records] }));
        return newRecord;
      },

      deleteQr: (id) => {
        set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
      },

      duplicateQr: (id) => {
        const original = get().records.find((r) => r.id === id);
        if (!original) return null;
        const now = new Date().toISOString();
        const copy: QrRecord = {
          ...original,
          id: `qr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          name: original.name + " (Salinan)",
          createdAt: now,
          updatedAt: now,
          favorite: false,
        };
        set((state) => ({ records: [copy, ...state.records] }));
        return copy;
      },

      toggleFavorite: (id) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, favorite: !r.favorite } : r
          ),
        }));
      },

      updateTags: (id, tags) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, tags, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },

      getQr: (id) => get().records.find((r) => r.id === id),

      saveCustomTemplate: (tpl) => {
        const newTpl: CustomTemplate = {
          ...tpl,
          id: `tpl_custom_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ customTemplates: [newTpl, ...state.customTemplates] }));
        return newTpl;
      },

      deleteCustomTemplate: (id) => {
        set((state) => ({ customTemplates: state.customTemplates.filter((t) => t.id !== id) }));
      },

      logScan: (qrId, qrName, qrType) => {
        const log: ScanLog = {
          id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          qrId,
          qrName,
          qrType,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({ scanLogs: [log, ...state.scanLogs].slice(0, 500) }));
      },

      clearScanLogs: () => set({ scanLogs: [] }),

      clearHistory: () => set({ records: [] }),
    }),
    {
      name: "qr-gen-pro-store",
    }
  )
);

// Built-in templates
export interface QrTemplate {
  id: string;
  name: string;
  type: QrType;
  icon: string;
  description: string;
  data: Record<string, unknown>;
  customization: QrCustomization;
}

export const BUILTIN_TEMPLATES: QrTemplate[] = [
  {
    id: "tpl_website",
    name: "QR Website",
    type: "url",
    icon: "🌐",
    description: "Arahkan ke halaman website",
    data: { url: "https://", name: "QR Website" },
    customization: { ...DEFAULT_CUSTOMIZATION },
  },
  {
    id: "tpl_whatsapp",
    name: "QR WhatsApp",
    type: "whatsapp",
    icon: "💬",
    description: "Chat WhatsApp dengan pesan otomatis",
    data: {
      whatsappNumber: "62",
      whatsappMessage: "Halo, saya tertarik dengan layanan Anda.",
      name: "QR WhatsApp",
    },
    customization: { ...DEFAULT_CUSTOMIZATION, fgColor: "#25D366" },
  },
  {
    id: "tpl_wifi",
    name: "QR WiFi",
    type: "wifi",
    icon: "📶",
    description: "Bagikan akses WiFi",
    data: { wifiSsid: "", wifiPassword: "", wifiSecurity: "WPA", wifiHidden: false, name: "QR WiFi" },
    customization: { ...DEFAULT_CUSTOMIZATION },
  },
  {
    id: "tpl_vcard",
    name: "QR Kontak",
    type: "vcard",
    icon: "👤",
    description: "Bagikan kontak bisnis",
    data: {
      vcardName: "",
      vcardOrg: "",
      vcardTitle: "",
      vcardPhone: "",
      vcardEmail: "",
      vcardUrl: "",
      name: "QR Kontak",
    },
    customization: { ...DEFAULT_CUSTOMIZATION },
  },
  {
    id: "tpl_maps",
    name: "QR Google Maps",
    type: "location",
    icon: "📍",
    description: "Arahkan ke lokasi",
    data: { locationAddress: "", locationLat: "", locationLng: "", name: "QR Lokasi" },
    customization: { ...DEFAULT_CUSTOMIZATION },
  },
  {
    id: "tpl_instagram",
    name: "QR Instagram",
    type: "url",
    icon: "📸",
    description: "Arahkan ke profil Instagram",
    data: { url: "https://instagram.com/", name: "QR Instagram" },
    customization: { ...DEFAULT_CUSTOMIZATION, fgColor: "#E1306C" },
  },
  {
    id: "tpl_facebook",
    name: "QR Facebook",
    type: "url",
    icon: "📘",
    description: "Arahkan ke halaman Facebook",
    data: { url: "https://facebook.com/", name: "QR Facebook" },
    customization: { ...DEFAULT_CUSTOMIZATION, fgColor: "#1877F2" },
  },
  {
    id: "tpl_youtube",
    name: "QR YouTube",
    type: "url",
    icon: "▶️",
    description: "Arahkan ke channel YouTube",
    data: { url: "https://youtube.com/", name: "QR YouTube" },
    customization: { ...DEFAULT_CUSTOMIZATION, fgColor: "#FF0000" },
  },
  {
    id: "tpl_tiktok",
    name: "QR TikTok",
    type: "url",
    icon: "🎵",
    description: "Arahkan ke akun TikTok",
    data: { url: "https://tiktok.com/@", name: "QR TikTok" },
    customization: { ...DEFAULT_CUSTOMIZATION, fgColor: "#010101" },
  },
  {
    id: "tpl_email",
    name: "QR Email",
    type: "email",
    icon: "✉️",
    description: "Kirim email dengan template",
    data: {
      emailTo: "",
      emailSubject: "Halo",
      emailBody: "",
      name: "QR Email",
    },
    customization: { ...DEFAULT_CUSTOMIZATION },
  },
  {
    id: "tpl_payment",
    name: "QR Pembayaran",
    type: "payment",
    icon: "💳",
    description: "Terima pembayaran QRIS",
    data: { paymentType: "qris", paymentNumber: "", name: "QR Pembayaran" },
    customization: { ...DEFAULT_CUSTOMIZATION },
  },
  {
    id: "tpl_event",
    name: "QR Event",
    type: "event",
    icon: "📅",
    description: "Bagikan event kalender",
    data: { eventTitle: "", eventStart: "", eventEnd: "", eventLocation: "", name: "QR Event" },
    customization: { ...DEFAULT_CUSTOMIZATION },
  },
];
