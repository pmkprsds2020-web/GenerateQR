"use client";

import * as React from "react";
import { useQrStore } from "@/store/qr-store";
import { DEFAULT_CUSTOMIZATION, type QrRecord, type QrType } from "@/lib/qr/qr-types";

// Local storage is scoped per-domain, so it resets to empty on every new
// preview URL Vercel generates, or on a different device/browser - even
// though the data is safely sitting in Supabase. On first load, pull QR
// codes from the database and merge in any the local store doesn't have,
// so history survives redeploys and works across devices.
export function SupabaseSync() {
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    fetch("/api/qr?limit=200")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!json?.data || !Array.isArray(json.data)) return;
        const localIds = new Set(useQrStore.getState().records.map((r) => r.id));
        const fromDb: QrRecord[] = json.data
          .filter((row: any) => !localIds.has(row.id))
          .map((row: any) => ({
            id: row.id,
            name: row.name,
            type: row.type as QrType,
            content: row.content,
            data: {},
            customization: row.customization ? JSON.parse(row.customization) : DEFAULT_CUSTOMIZATION,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            favorite: false,
          }));
        if (fromDb.length === 0) return;
        useQrStore.setState((state) => ({
          records: [...fromDb, ...state.records].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
        }));
      })
      .catch(() => {});
  }, []);

  return null;
}
