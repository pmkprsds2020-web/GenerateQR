"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { QrType } from "@/lib/qr/qr-types";
import type { QrFormData } from "@/lib/qr/qr-content";

interface QrFormProps {
  type: QrType;
  data: QrFormData;
  errors: Record<string, string>;
  onChange: (data: QrFormData) => void;
}

function Field({
  label,
  error,
  children,
  required,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <span aria-hidden>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

export function QrForm({ type, data, errors, onChange }: QrFormProps) {
  const update = (patch: Partial<QrFormData>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-4">
      {/* Name field - common to all */}
      <Field label="Judul QR Code" required>
        <Input
          value={(data as any).name || ""}
          onChange={(e) => update({ name: e.target.value } as any)}
          placeholder="contoh: QR Website Toko"
        />
      </Field>

      {type === "url" && (
        <Field label="URL" required error={errors.url} hint="Contoh: https://example.com">
          <Input
            value={data.url || ""}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="https://example.com"
            inputMode="url"
          />
        </Field>
      )}

      {type === "text" && (
        <Field label="Teks" required error={errors.text}>
          <Textarea
            value={data.text || ""}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Masukkan teks apa saja..."
            rows={4}
          />
        </Field>
      )}

      {type === "phone" && (
        <Field label="Nomor Telepon" required error={errors.phone} hint="Contoh: +628123456789">
          <Input
            value={data.phone || ""}
            onChange={(e) => update({ phone: e.target.value })}
            placeholder="+628123456789"
            inputMode="tel"
          />
        </Field>
      )}

      {type === "whatsapp" && (
        <>
          <Field
            label="Nomor WhatsApp"
            required
            error={errors.whatsappNumber}
            hint="Format internasional tanpa +, contoh: 628123456789"
          >
            <Input
              value={data.whatsappNumber || ""}
              onChange={(e) => update({ whatsappNumber: e.target.value })}
              placeholder="628123456789"
              inputMode="numeric"
            />
          </Field>
          <Field label="Pesan Otomatis" hint="Pesan yang akan otomatis terisi di WhatsApp">
            <Textarea
              value={data.whatsappMessage || ""}
              onChange={(e) => update({ whatsappMessage: e.target.value })}
              placeholder="Halo, saya ingin mendapatkan informasi lebih lanjut."
              rows={3}
            />
          </Field>
          {data.whatsappNumber && (
            <Alert className="bg-muted/50">
              <AlertDescription className="text-xs break-all">
                Preview URL:{" "}
                <span className="font-mono">
                  https://wa.me/{data.whatsappNumber.replace(/\D/g, "")}
                  {data.whatsappMessage
                    ? `?text=${encodeURIComponent(data.whatsappMessage)}`
                    : ""}
                </span>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {type === "email" && (
        <>
          <Field label="Email Tujuan" required error={errors.emailTo}>
            <Input
              value={data.emailTo || ""}
              onChange={(e) => update({ emailTo: e.target.value })}
              placeholder="admin@example.com"
              inputMode="email"
            />
          </Field>
          <Field label="Subject">
            <Input
              value={data.emailSubject || ""}
              onChange={(e) => update({ emailSubject: e.target.value })}
              placeholder="Informasi"
            />
          </Field>
          <Field label="Isi Pesan">
            <Textarea
              value={data.emailBody || ""}
              onChange={(e) => update({ emailBody: e.target.value })}
              placeholder="Saya ingin mendapatkan informasi mengenai layanan."
              rows={3}
            />
          </Field>
        </>
      )}

      {type === "sms" && (
        <>
          <Field label="Nomor Telepon" required error={errors.smsNumber}>
            <Input
              value={data.smsNumber || ""}
              onChange={(e) => update({ smsNumber: e.target.value })}
              placeholder="+628123456789"
              inputMode="tel"
            />
          </Field>
          <Field label="Pesan SMS">
            <Textarea
              value={data.smsMessage || ""}
              onChange={(e) => update({ smsMessage: e.target.value })}
              placeholder="Isi pesan SMS..."
              rows={3}
            />
          </Field>
        </>
      )}

      {type === "wifi" && (
        <>
          <Field label="Nama WiFi (SSID)" required error={errors.wifiSsid}>
            <Input
              value={data.wifiSsid || ""}
              onChange={(e) => update({ wifiSsid: e.target.value })}
              placeholder="MyWiFiNetwork"
            />
          </Field>
          <Field label="Security">
            <Select
              value={data.wifiSecurity || "WPA"}
              onValueChange={(v) => update({ wifiSecurity: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA / WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">None / Tanpa Password</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {data.wifiSecurity !== "nopass" && (
            <Field label="Password" required error={errors.wifiPassword}>
              <Input
                value={data.wifiPassword || ""}
                onChange={(e) => update({ wifiPassword: e.target.value })}
                placeholder="Password WiFi"
                type="text"
              />
            </Field>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id="wifi-hidden"
              checked={data.wifiHidden || false}
              onCheckedChange={(v) => update({ wifiHidden: v === true })}
            />
            <Label htmlFor="wifi-hidden" className="text-sm cursor-pointer">
              Jaringan tersembunyi (Hidden Network)
            </Label>
          </div>
        </>
      )}

      {type === "vcard" && (
        <>
          <Field label="Nama Lengkap" required error={errors.vcardName}>
            <Input
              value={data.vcardName || ""}
              onChange={(e) => update({ vcardName: e.target.value })}
              placeholder="Budi Santoso"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Organisasi">
              <Input
                value={data.vcardOrg || ""}
                onChange={(e) => update({ vcardOrg: e.target.value })}
                placeholder="PT. Contoh"
              />
            </Field>
            <Field label="Jabatan">
              <Input
                value={data.vcardTitle || ""}
                onChange={(e) => update({ vcardTitle: e.target.value })}
                placeholder="Manager"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nomor Telepon">
              <Input
                value={data.vcardPhone || ""}
                onChange={(e) => update({ vcardPhone: e.target.value })}
                placeholder="+628123456789"
                inputMode="tel"
              />
            </Field>
            <Field label="Email" error={errors.vcardEmail}>
              <Input
                value={data.vcardEmail || ""}
                onChange={(e) => update({ vcardEmail: e.target.value })}
                placeholder="budi@example.com"
                inputMode="email"
              />
            </Field>
          </div>
          <Field label="Website">
            <Input
              value={data.vcardUrl || ""}
              onChange={(e) => update({ vcardUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </Field>
          <Field label="Alamat">
            <Textarea
              value={data.vcardAddress || ""}
              onChange={(e) => update({ vcardAddress: e.target.value })}
              placeholder="Jl. Contoh No. 123, Jakarta"
              rows={2}
            />
          </Field>
        </>
      )}

      {type === "location" && (
        <>
          <Field label="Alamat" error={errors.locationAddress}>
            <Textarea
              value={data.locationAddress || ""}
              onChange={(e) => update({ locationAddress: e.target.value })}
              placeholder="Jl. Contoh No. 123, Jakarta"
              rows={2}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Latitude" error={errors.locationLat}>
              <Input
                value={data.locationLat || ""}
                onChange={(e) => update({ locationLat: e.target.value })}
                placeholder="-6.2088"
                inputMode="decimal"
              />
            </Field>
            <Field label="Longitude" error={errors.locationLng}>
              <Input
                value={data.locationLng || ""}
                onChange={(e) => update({ locationLng: e.target.value })}
                placeholder="106.8456"
                inputMode="decimal"
              />
            </Field>
          </div>
          <Field label="URL Google Maps" hint="Opsional - jika sudah punya link maps">
            <Input
              value={data.locationUrl || ""}
              onChange={(e) => update({ locationUrl: e.target.value })}
              placeholder="https://maps.app.goo.gl/..."
            />
          </Field>
        </>
      )}

      {type === "event" && (
        <>
          <Field label="Judul Event" required error={errors.eventTitle}>
            <Input
              value={data.eventTitle || ""}
              onChange={(e) => update({ eventTitle: e.target.value })}
              placeholder="Rapat Tahunan 2025"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Waktu Mulai" required error={errors.eventStart}>
              <Input
                type="datetime-local"
                value={data.eventStart || ""}
                onChange={(e) => update({ eventStart: e.target.value })}
              />
            </Field>
            <Field label="Waktu Selesai" error={errors.eventEnd}>
              <Input
                type="datetime-local"
                value={data.eventEnd || ""}
                onChange={(e) => update({ eventEnd: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Lokasi">
            <Input
              value={data.eventLocation || ""}
              onChange={(e) => update({ eventLocation: e.target.value })}
              placeholder="Gedung A, Lt. 3"
            />
          </Field>
          <Field label="Deskripsi">
            <Textarea
              value={data.eventDescription || ""}
              onChange={(e) => update({ eventDescription: e.target.value })}
              placeholder="Detail event..."
              rows={3}
            />
          </Field>
        </>
      )}

      {type === "payment" && (
        <>
          <Field label="Jenis Pembayaran">
            <Select
              value={data.paymentType || "qris"}
              onValueChange={(v) => update({ paymentType: v as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qris">QRIS</SelectItem>
                <SelectItem value="gopay">GoPay</SelectItem>
                <SelectItem value="ovo">OVO</SelectItem>
                <SelectItem value="dana">DANA</SelectItem>
                <SelectItem value="shopeepay">ShopeePay</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nomor Pembayaran" required error={errors.paymentNumber}>
            <Input
              value={data.paymentNumber || ""}
              onChange={(e) => update({ paymentNumber: e.target.value })}
              placeholder="Nomor virtual account / e-wallet"
              inputMode="numeric"
            />
          </Field>
          <Field label="Jumlah (opsional)">
            <Input
              value={data.paymentAmount || ""}
              onChange={(e) => update({ paymentAmount: e.target.value })}
              placeholder="50000"
              inputMode="numeric"
            />
          </Field>
          <Field label="Catatan (opsional)">
            <Input
              value={data.paymentNote || ""}
              onChange={(e) => update({ paymentNote: e.target.value })}
              placeholder="Pembayaran pesanan #123"
            />
          </Field>
        </>
      )}

      {type === "custom" && (
        <Field label="Konten Custom" required error={errors.customText}>
          <Textarea
            value={data.customText || ""}
            onChange={(e) => update({ customText: e.target.value })}
            placeholder="Masukkan teks atau URL apa saja..."
            rows={5}
          />
        </Field>
      )}
    </div>
  );
}
