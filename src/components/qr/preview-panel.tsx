"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Download, Copy, ImageIcon, Link2, Save, AlertTriangle, CheckCircle2, Info, Printer, Share2, MoreHorizontal, FileText } from "lucide-react";
import { QrPreview } from "./qr-preview";
import { DownloadDialog } from "./download-dialog";
import { checkQrQuality, copyQrImage, downloadQrCode } from "@/lib/qr/qr-download";
import type { QrCustomization } from "@/lib/qr/qr-types";
import { toast } from "sonner";

interface PreviewPanelProps {
  content: string;
  customization: QrCustomization;
  title: string;
  onSave: () => void;
  saveLabel?: string;
}

export function PreviewPanel({
  content,
  customization,
  title,
  onSave,
  saveLabel = "Simpan ke Riwayat",
}: PreviewPanelProps) {
  const [downloadOpen, setDownloadOpen] = React.useState(false);
  const quality = React.useMemo(() => checkQrQuality(content, customization), [content, customization]);

  const requireContent = () => {
    if (!content) {
      toast.warning("Mohon lengkapi data terlebih dahulu.");
      return false;
    }
    return true;
  };

  const copyContent = async () => {
    if (!requireContent()) return;
    try {
      await navigator.clipboard.writeText(content);
      toast.success("✓ Berhasil disalin.");
    } catch {
      toast.error("Gagal menyalin konten.");
    }
  };

  const copyImage = async () => {
    if (!requireContent()) return;
    const ok = await copyQrImage(content, customization);
    if (ok) {
      toast.success("✓ Gambar QR berhasil disalin.");
    } else {
      toast.error("Browser tidak mendukung copy gambar. Gunakan tombol Download.");
    }
  };

  const copyUrl = async () => {
    if (!requireContent()) return;
    const url = /^https?:\/\//i.test(content) ? content : content.startsWith("mailto:") ? content : null;
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("✓ URL berhasil disalin.");
      } catch {
        toast.error("Gagal menyalin URL.");
      }
    } else {
      toast.info("Konten ini bukan URL.");
    }
  };

  const handlePrint = async () => {
    if (!requireContent()) return;
    try {
      const { generateSvgString } = await import("@/lib/qr/qr-download");
      const svg = await generateSvgString(content, customization, 512);
      const printWindow = window.open("", "_blank", "width=600,height=600");
      if (!printWindow) {
        toast.error("Popup diblokir. Izinkan popup untuk mencetak.");
        return;
      }
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cetak QR Code - ${title || "QR GEN PRO"}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
            .qr-container { width: 400px; height: 400px; }
            .title { margin-top: 24px; font-size: 20px; font-weight: 600; text-align: center; }
            .meta { margin-top: 8px; font-size: 12px; color: #666; text-align: center; }
            .content { margin-top: 16px; font-size: 11px; color: #888; word-break: break-all; max-width: 400px; text-align: center; font-family: monospace; }
            .footer { margin-top: 32px; font-size: 10px; color: #aaa; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="qr-container">${svg}</div>
          <div class="title">${title || "QR Code"}</div>
          <div class="meta">Dibuat dengan QR GEN PRO - ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
          ${content ? `<div class="content">${content.replace(/</g, "&lt;")}</div>` : ""}
          <div class="footer">QR GEN PRO — QR Code Generator</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 300);
      toast.success("✓ Dialog cetak telah dibuka.");
    } catch {
      toast.error("Gagal mencetak QR Code.");
    }
  };

  const handleShare = async () => {
    if (!requireContent()) return;
    const shareData: ShareData = {
      title: title || "QR Code",
      text: "Lihat QR Code ini",
    };
    if (/^https?:\/\//i.test(content)) {
      shareData.url = content;
    } else {
      shareData.text = content;
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("✓ QR Code dibagikan.");
      } else {
        await navigator.clipboard.writeText(content);
        toast.success("✓ Web Share tidak didukung. Konten disalin sebagai gantinya.");
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("Gagal membagikan.");
      }
    }
  };

  return (
    <Card className="sticky top-4 overflow-hidden card-premium">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            Preview
          </CardTitle>
          {quality.ok ? (
            <Badge variant="secondary" className="text-emerald-600 gap-1 bg-emerald-500/10">
              <CheckCircle2 className="h-3 w-3" />
              Siap
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Perlu Perbaikan
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Display */}
        <div className="flex justify-center rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 p-6 border border-border/40">
          <QrPreview content={content} customization={customization} size={300} />
        </div>

        {/* Title */}
        {title && (
          <div className="text-center">
            <p className="text-sm font-medium truncate" title={title}>{title}</p>
          </div>
        )}

        {/* Quality warnings */}
        {(quality.warnings.length > 0 || quality.errors.length > 0) && (
          <div className="space-y-1.5">
            {quality.errors.map((err, i) => (
              <div key={`e${i}`} className="flex items-start gap-2 text-xs text-destructive rounded-md bg-destructive/10 p-2">
                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            ))}
            {quality.warnings.map((w, i) => (
              <div key={`w${i}`} className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500 rounded-md bg-amber-500/10 p-2">
                <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Primary actions */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button onClick={() => setDownloadOpen(true)} disabled={!content} className="flex-1 shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare} disabled={!content} title="Bagikan" className="shadow-sm">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrint} disabled={!content} title="Cetak" className="shadow-sm">
              <Printer className="h-4 w-4" />
            </Button>
          </div>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={copyImage} disabled={!content}>
              <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
              Copy Image
            </Button>
            <Button variant="outline" size="sm" onClick={copyContent} disabled={!content}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy Content
            </Button>
            <Button variant="outline" size="sm" onClick={copyUrl} disabled={!content}>
              <Link2 className="h-3.5 w-3.5 mr-1.5" />
              Copy URL
            </Button>
            <Button variant="default" size="sm" onClick={onSave} disabled={!content}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saveLabel}
            </Button>
          </div>
        </div>

        {/* Content preview */}
        {content && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Konten QR:
            </p>
            <div className="rounded-md bg-muted/50 p-2 text-xs font-mono break-all max-h-24 overflow-y-auto scrollbar-thin">
              {content}
            </div>
          </div>
        )}
      </CardContent>

      <DownloadDialog
        open={downloadOpen}
        onOpenChange={setDownloadOpen}
        content={content}
        customization={customization}
        filename={title || "qr-code"}
      />
    </Card>
  );
}
