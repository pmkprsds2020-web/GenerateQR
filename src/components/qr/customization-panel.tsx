"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Upload, X, AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QrCustomization, ErrorCorrectionLevel } from "@/lib/qr/qr-types";
import { DEFAULT_CUSTOMIZATION } from "@/lib/qr/qr-types";

interface CustomizationPanelProps {
  customization: QrCustomization;
  onChange: (c: QrCustomization) => void;
}

const PRESET_COLORS = [
  { fg: "#000000", bg: "#ffffff", label: "Klasik" },
  { fg: "#1e293b", bg: "#f8fafc", label: "Slate" },
  { fg: "#059669", bg: "#ecfdf5", label: "Hijau" },
  { fg: "#dc2626", bg: "#fef2f2", label: "Merah" },
  { fg: "#7c3aed", bg: "#f5f3ff", label: "Ungu" },
  { fg: "#ea580c", bg: "#fff7ed", label: "Oranye" },
  { fg: "#ffffff", bg: "#0a0a0a", label: "Invers" },
  { fg: "#0f766e", bg: "#f0fdfa", label: "Teal" },
];

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

export function CustomizationPanel({ customization, onChange }: CustomizationPanelProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [logoWarning, setLogoWarning] = React.useState<string>("");

  const update = (patch: Partial<QrCustomization>) => {
    onChange({ ...customization, ...patch });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE) {
      setLogoWarning("Ukuran logo terlalu besar (maks 2MB).");
      return;
    }

    if (!/image\/(png|jpeg|jpg|svg\+xml)/.test(file.type)) {
      setLogoWarning("Format file tidak didukung. Gunakan PNG, JPG, atau SVG.");
      return;
    }

    setLogoWarning("");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Auto-switch to error correction H when logo is added
      update({
        logoDataUrl: dataUrl,
        errorCorrectionLevel: "H",
        logoSize: customization.logoSize || 20,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    update({ logoDataUrl: undefined });
    setLogoWarning("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const reset = () => {
    onChange({ ...DEFAULT_CUSTOMIZATION });
    setLogoWarning("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Kustomisasi</h3>
        <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs">
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Preset colors */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Preset Warna</Label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => update({ fgColor: preset.fg, bgColor: preset.bg })}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-all hover:shadow-sm",
                customization.fgColor === preset.fg && customization.bgColor === preset.bg
                  ? "border-primary ring-1 ring-primary"
                  : "border-border"
              )}
              title={preset.label}
            >
              <div
                className="h-6 w-full rounded grid grid-cols-3 overflow-hidden"
                style={{ backgroundColor: preset.bg }}
              >
                <div className="col-span-2" style={{ backgroundColor: preset.fg }} />
                <div style={{ backgroundColor: preset.bg }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom colors */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Warna QR</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customization.fgColor}
              onChange={(e) => update({ fgColor: e.target.value })}
              className="h-9 w-9 rounded-md border cursor-pointer"
              aria-label="Warna QR"
            />
            <Input
              value={customization.fgColor}
              onChange={(e) => update({ fgColor: e.target.value })}
              className="h-9 font-mono text-xs"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Background</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customization.bgColor}
              onChange={(e) => update({ bgColor: e.target.value })}
              className="h-9 w-9 rounded-md border cursor-pointer"
              aria-label="Warna background"
            />
            <Input
              value={customization.bgColor}
              onChange={(e) => update({ bgColor: e.target.value })}
              className="h-9 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Error correction */}
      <div className="space-y-1.5">
        <Label className="text-xs">Error Correction Level</Label>
        <Select
          value={customization.errorCorrectionLevel}
          onValueChange={(v) => update({ errorCorrectionLevel: v as ErrorCorrectionLevel })}
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">L — Low (7%)</SelectItem>
            <SelectItem value="M">M — Medium (15%)</SelectItem>
            <SelectItem value="Q">Q — Quartile (25%)</SelectItem>
            <SelectItem value="H">H — High (30%)</SelectItem>
          </SelectContent>
        </Select>
        {customization.logoDataUrl && customization.errorCorrectionLevel !== "H" && (
          <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Disarankan level H saat menggunakan logo.
          </p>
        )}
      </div>

      {/* Pixel shape */}
      <div className="space-y-1.5">
        <Label className="text-xs">Bentuk Pixel</Label>
        <ToggleGroup
          type="single"
          value={customization.pixelShape || "square"}
          onValueChange={(v) => v && update({ pixelShape: v as any })}
          className="justify-start"
        >
          <ToggleGroupItem value="square" className="text-xs h-8">Kotak</ToggleGroupItem>
          <ToggleGroupItem value="rounded" className="text-xs h-8">Membulat</ToggleGroupItem>
          <ToggleGroupItem value="dots" className="text-xs h-8">Titik</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Margin */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">Margin (Quiet Zone)</Label>
          <span className="text-xs text-muted-foreground font-mono">{customization.margin}</span>
        </div>
        <Slider
          value={[customization.margin]}
          onValueChange={([v]) => update({ margin: v })}
          min={0}
          max={8}
          step={1}
        />
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <Label className="text-xs">Logo (opsional)</Label>
        {customization.logoDataUrl ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border p-2">
              <img
                src={customization.logoDataUrl}
                alt="Logo preview"
                className="h-12 w-12 rounded object-contain border bg-white"
              />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Logo terpasang</p>
                <Button variant="ghost" size="sm" onClick={removeLogo} className="h-7 text-xs text-destructive">
                  <X className="h-3 w-3 mr-1" />
                  Hapus
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Ukuran Logo</Label>
                <span className="text-xs text-muted-foreground font-mono">{customization.logoSize}%</span>
              </div>
              <Slider
                value={[customization.logoSize || 20]}
                onValueChange={([v]) => update({ logoSize: v })}
                min={5}
                max={35}
                step={1}
              />
              {(customization.logoSize || 20) > 30 && (
                <p className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Ukuran logo terlalu besar dan dapat mengurangi kemampuan QR untuk dipindai.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
              className="hidden"
              id="logo-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-9 border-dashed"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo (PNG/JPG/SVG)
            </Button>
            {logoWarning && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {logoWarning}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Maks 2MB. Otomatis menggunakan error correction H.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
