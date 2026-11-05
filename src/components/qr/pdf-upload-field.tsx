"use client";

import * as React from "react";
import { FileText, UploadCloud, Loader2, ExternalLink, RefreshCw, X, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { QrFormData } from "@/lib/qr/qr-content";
import { uploadPdf, validatePdfFile, formatFileSize, PDF_MAX_BYTES } from "@/lib/qr/pdf-upload";

interface PdfUploadFieldProps {
  data: QrFormData;
  error?: string;
  onChange: (patch: Partial<QrFormData>) => void;
  onTouched: () => void;
}

export function PdfUploadField({ data, error, onChange, onTouched }: PdfUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const [mode, setMode] = React.useState<"upload" | "link">(
    data.pdfUrl && !data.pdfFileName ? "link" : "upload"
  );

  const hasUploadedFile = Boolean(data.pdfUrl && data.pdfFileName);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    onTouched();
    const problem = validatePdfFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadPdf(file);
      const patch: Partial<QrFormData> & { name?: string } = {
        pdfUrl: uploaded.url,
        pdfFileName: uploaded.fileName,
        pdfFileSize: uploaded.size,
      };
      // Pre-fill the QR title from the file name if the user hasn't typed one
      if (!(data as any).name) patch.name = uploaded.fileName.replace(/\.pdf$/i, "");
      onChange(patch);
      toast.success("PDF berhasil diupload.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clearFile = () => {
    onChange({ pdfUrl: "", pdfFileName: undefined, pdfFileSize: undefined });
  };

  return (
    <div className="space-y-1.5">
      <div className="text-sm font-medium flex items-center gap-1">
        File PDF <span className="text-destructive">*</span>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "upload" | "link")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-1.5">
            <UploadCloud className="h-3.5 w-3.5" /> Upload PDF
          </TabsTrigger>
          <TabsTrigger value="link" className="gap-1.5">
            <Link2 className="h-3.5 w-3.5" /> Link PDF
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {hasUploadedFile ? (
            <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium" title={data.pdfFileName}>
                  {data.pdfFileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(data.pdfFileSize)} · tersimpan di Supabase
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button type="button" variant="ghost" size="icon" asChild title="Buka PDF">
                  <a href={data.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Ganti file"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
                <Button type="button" variant="ghost" size="icon" title="Hapus" onClick={clearFile} disabled={uploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40",
                uploading && "cursor-wait opacity-70"
              )}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm font-medium">Mengupload PDF...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium">Klik atau seret file PDF ke sini</span>
                  <span className="text-xs text-muted-foreground">
                    Maksimal {formatFileSize(PDF_MAX_BYTES)} · QR akan langsung membuka PDF saat di-scan
                  </span>
                </>
              )}
            </button>
          )}
        </TabsContent>

        <TabsContent value="link" className="mt-3 space-y-1.5">
          <Input
            value={hasUploadedFile ? "" : data.pdfUrl || ""}
            onChange={(e) => onChange({ pdfUrl: e.target.value, pdfFileName: undefined, pdfFileSize: undefined })}
            onBlur={onTouched}
            placeholder="https://drive.google.com/file/d/.../view"
            inputMode="url"
          />
          <p className="text-xs text-muted-foreground">
            Tempel link PDF yang sudah online (Google Drive, website, dll). Pastikan aksesnya publik.
          </p>
        </TabsContent>
      </Tabs>

      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 animate-fade-in">
          <span aria-hidden>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
