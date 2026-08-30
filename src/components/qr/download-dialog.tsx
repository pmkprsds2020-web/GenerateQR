"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Download, Loader2 } from "lucide-react";
import { downloadQrCode, type DownloadFormat } from "@/lib/qr/qr-download";
import type { QrCustomization } from "@/lib/qr/qr-types";
import { toast } from "sonner";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  customization: QrCustomization;
  filename: string;
}

const SIZE_OPTIONS = [
  { value: "256", label: "256 px" },
  { value: "512", label: "512 px" },
  { value: "1024", label: "1024 px" },
  { value: "2048", label: "2048 px" },
];

export function DownloadDialog({
  open,
  onOpenChange,
  content,
  customization,
  filename,
}: DownloadDialogProps) {
  const [format, setFormat] = React.useState<DownloadFormat>("png");
  const [size, setSize] = React.useState("1024");
  const [customSize, setCustomSize] = React.useState("");
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    if (!content) {
      toast.warning("Mohon lengkapi data terlebih dahulu.");
      return;
    }
    setDownloading(true);
    try {
      const finalSize = size === "custom" ? Math.max(64, Math.min(4096, parseInt(customSize) || 1024)) : parseInt(size);
      await downloadQrCode({
        format,
        size: finalSize,
        content,
        customization,
        filename: filename || "qr-code",
      });
      toast.success("✓ QR Code berhasil diunduh");
      onOpenChange(false);
    } catch (err) {
      toast.error("Gagal mengunduh QR Code.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download QR Code</DialogTitle>
          <DialogDescription>Pilih format dan ukuran file QR Code.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Format File</Label>
            <ToggleGroup
              type="single"
              value={format}
              onValueChange={(v) => v && setFormat(v as DownloadFormat)}
              className="grid grid-cols-4 gap-1 w-full"
              variant="outline"
            >
              <ToggleGroupItem value="png" className="flex-col h-auto py-2 gap-0.5">
                <span className="text-xs font-semibold">PNG</span>
                <span className="text-[10px] text-muted-foreground">Raster</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="jpg" className="flex-col h-auto py-2 gap-0.5">
                <span className="text-xs font-semibold">JPG</span>
                <span className="text-[10px] text-muted-foreground">Raster</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="svg" className="flex-col h-auto py-2 gap-0.5">
                <span className="text-xs font-semibold">SVG</span>
                <span className="text-[10px] text-muted-foreground">Vector</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="pdf" className="flex-col h-auto py-2 gap-0.5">
                <span className="text-xs font-semibold">PDF</span>
                <span className="text-[10px] text-muted-foreground">Dokumen</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Ukuran</Label>
            {format === "svg" || format === "pdf" ? (
              <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5">
                {format === "svg"
                  ? "Format SVG adalah vector, ukuran dapat diubah tanpa kehilangan kualitas."
                  : "Format PDF menggunakan ukuran 100x100mm yang optimal untuk cetak."}
              </p>
            ) : (
              <>
                <ToggleGroup
                  type="single"
                  value={size}
                  onValueChange={(v) => v && setSize(v)}
                  className="grid grid-cols-4 gap-1 w-full"
                  variant="outline"
                >
                  {SIZE_OPTIONS.map((opt) => (
                    <ToggleGroupItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <div className="flex items-center gap-2">
                  <ToggleGroup
                    type="single"
                    value={size === "custom" ? "custom" : ""}
                    onValueChange={() => setSize("custom")}
                    variant="outline"
                  >
                    <ToggleGroupItem value="custom" className="text-xs h-9">
                      Custom
                    </ToggleGroupItem>
                  </ToggleGroup>
                  {size === "custom" && (
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        type="number"
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        placeholder="1024"
                        className="h-9"
                        min={64}
                        max={4096}
                      />
                      <span className="text-xs text-muted-foreground">px</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium uppercase">{format}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kualitas:</span>
              <span className="font-medium">
                {format === "svg" ? "Vector (tak terbatas)" : format === "pdf" ? "Cetak 100mm" : `${size === "custom" ? customSize || "1024" : size} × ${size === "custom" ? customSize || "1024" : size} px`}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={downloading}>
            Batal
          </Button>
          <Button onClick={handleDownload} disabled={downloading || !content}>
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
