"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, ImageIcon, Link2, Save, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { QrPreview } from "./qr-preview";
import { DownloadDialog } from "./download-dialog";
import { checkQrQuality, copyQrImage } from "@/lib/qr/qr-download";
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

  const copyContent = async () => {
    if (!content) {
      toast.warning("Mohon lengkapi data terlebih dahulu.");
      return;
    }
    try {
      await navigator.clipboard.writeText(content);
      toast.success("✓ Berhasil disalin.");
    } catch {
      toast.error("Gagal menyalin konten.");
    }
  };

  const copyImage = async () => {
    if (!content) {
      toast.warning("Mohon lengkapi data terlebih dahulu.");
      return;
    }
    const ok = await copyQrImage(content, customization);
    if (ok) {
      toast.success("✓ Gambar QR berhasil disalin.");
    } else {
      toast.error("Browser tidak mendukung copy gambar. Gunakan tombol Download.");
    }
  };

  const copyUrl = async () => {
    if (!content) {
      toast.warning("Mohon lengkapi data terlebih dahulu.");
      return;
    }
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

  return (
    <Card className="sticky top-4 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Preview</CardTitle>
          {quality.ok ? (
            <Badge variant="secondary" className="text-emerald-600 gap-1">
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
        <div className="flex justify-center rounded-xl bg-muted/30 p-6">
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

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => setDownloadOpen(true)} disabled={!content} className="col-span-2">
            <Download className="h-4 w-4 mr-2" />
            Download QR Code
          </Button>
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

        {/* Content preview */}
        {content && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Konten QR:</p>
            <div className="rounded-md bg-muted/50 p-2 text-xs font-mono break-all max-h-24 overflow-y-auto">
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
