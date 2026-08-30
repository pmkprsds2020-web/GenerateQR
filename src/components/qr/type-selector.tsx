"use client";

import { cn } from "@/lib/utils";
import { QR_TYPE_LABELS, QR_TYPE_ICONS, type QrType } from "@/lib/qr/qr-types";
import type { QrType as QRTypeValue } from "@/lib/qr/qr-types";

const TYPES: QrType[] = [
  "url",
  "text",
  "phone",
  "whatsapp",
  "email",
  "sms",
  "wifi",
  "vcard",
  "location",
  "event",
  "payment",
  "custom",
];

interface TypeSelectorProps {
  value: QrType;
  onChange: (type: QrType) => void;
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {TYPES.map((type) => {
        const active = value === type;
        const icon = QR_TYPE_ICONS[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all hover:shadow-sm",
              active
                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                : "border-border bg-card hover:border-foreground/20"
            )}
            aria-pressed={active}
          >
            <span className="text-2xl leading-none" aria-hidden>
              {icon}
            </span>
            <span
              className={cn(
                "text-xs font-medium leading-tight",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {QR_TYPE_LABELS[type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
