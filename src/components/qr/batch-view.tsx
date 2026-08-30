"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, FileSpreadsheet, Download, Trash2, Plus, CheckCircle2, AlertCircle, FileDown } from "lucide-react";
import { useQrStore } from "@/store/qr-store";
import { QR_TYPE_LABELS, QR_TYPE_ICONS, DEFAULT_CUSTOMIZATION, type QrType, type QrCustomization } from "@/lib/qr/qr-types";
import { generateQrContent, type QrFormData } from "@/lib/qr/qr-content";
import { QrPreview } from "./qr-preview";
import { downloadQrCode } from "@/lib/qr/qr-download";
import { toast } from "sonner";

interface BatchItem {
  id: string;
  name: string;
  content: string;
  valid: boolean;
  error?: string;
}

export function BatchView() {
  const [batchType, setBatchType] = React.useState<QrType>("url");
  const [inputText, setInputText] = React.useState("");
  const [items, setItems] = React.useState<BatchItem[]>([]);
  const [customization] = React.useState<QrCustomization>({ ...DEFAULT_CUSTOMIZATION });
  const saveQr = useQrStore((s) => s.saveQr);

  const parseInput = () => {
    const lines = inputText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      toast.warning("Masukkan minimal satu baris data.");
      return;
    }

    const parsed: BatchItem[] = lines.map((line, idx) => {
      // Support CSV format: name,value or just value
      const parts = line.includes(",") ? line.split(",", 2) : [line, line];
      const name = parts[0].trim();
      const value = parts[1]?.trim() || parts[0].trim();

      const data: QrFormData = buildDataForType(batchType, value, name);
      const content = generateQrContent(batchType, data);

      return {
        id: `batch_${Date.now()}_${idx}`,
        name,
        content,
        valid: !!content,
        error: content ? undefined : "Konten tidak valid",
      };
    });

    setItems(parsed);
    const validCount = parsed.filter((i) => i.valid).length;
    toast.success(`✓ ${validCount} dari ${parsed.length} QR Code berhasil diproses.`);
  };

  const buildDataForType = (type: QrType, value: string, name: string): QrFormData => {
    switch (type) {
      case "url":
        return { url: value, name };
      case "text":
        return { text: value, name };
      case "phone":
        return { phone: value, name };
      case "whatsapp":
        return { whatsappNumber: value, name };
      case "email":
        return { emailTo: value, name };
      case "sms":
        return { smsNumber: value, name };
      case "wifi":
        return { wifiSsid: value, name };
      case "custom":
        return { customText: value, name };
      default:
        return { url: value, name };
    }
  };

  const handleDownloadAll = async () => {
    const validItems = items.filter((i) => i.valid);
    if (validItems.length === 0) {
      toast.warning("Tidak ada QR Code valid untuk diunduh.");
      return;
    }
    toast.info(`Mengunduh ${validItems.length} QR Code sebagai ZIP...`);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const { generateSvgString } = await import("@/lib/qr/qr-download");

      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        try {
          const svg = await generateSvgString(item.content, customization, 512);
          const svgBlob = new Blob([svg], { type: "image/svg+xml" });
          const svgText = await svgBlob.text();
          zip.file(`${item.name || `qr-${i + 1}`}.svg`, svgText);
        } catch {
          // ignore individual errors
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-batch-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`✓ ${validItems.length} QR Code berhasil diunduh sebagai ZIP`);
    } catch {
      toast.error("Gagal membuat ZIP. Mencoba unduh individual...");
      // Fallback to sequential download
      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        setTimeout(async () => {
          try {
            await downloadQrCode({
              format: "png",
              size: 512,
              content: item.content,
              customization,
              filename: item.name || `qr-${i + 1}`,
            });
          } catch {
            // ignore
          }
        }, i * 300);
      }
    }
  };

  const handleSaveAll = () => {
    const validItems = items.filter((i) => i.valid);
    if (validItems.length === 0) {
      toast.warning("Tidak ada QR Code valid untuk disimpan.");
      return;
    }
    validItems.forEach((item) => {
      const data = buildDataForType(batchType, item.content, item.name);
      saveQr({
        name: item.name,
        type: batchType,
        content: item.content,
        data: data as Record<string, unknown>,
        customization,
      });
    });
    toast.success(`✓ ${validItems.length} QR Code berhasil disimpan ke riwayat.`);
  };

  const handleClear = () => {
    setItems([]);
    setInputText("");
  };

  const handleRemoveItem = (id: string) => {
    setItems((items) => items.filter((i) => i.id !== id));
  };

  const handleDownloadItem = async (item: BatchItem) => {
    try {
      await downloadQrCode({
        format: "png",
        size: 512,
        content: item.content,
        customization,
        filename: item.name || "qr-code",
      });
      toast.success("✓ QR Code berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh.");
    }
  };

  const validCount = items.filter((i) => i.valid).length;

  const examples: Record<QrType, string> = {
    url: "Toko A,https://toko-a.com\nToko B,https://toko-b.com\nToko C,https://toko-c.com",
    text: "Pesan 1\nPesan 2\nPesan 3",
    phone: "Kantor A,0211234567\nKantor B,0217654321",
    whatsapp: "Sales A,628123456789\nSales B,628987654321",
    email: "Budi,budi@mail.com\nSiti,siti@mail.com",
    sms: "Departemen A,0211112222\nDepartemen B,0213334444",
    wifi: "WiFi Lobby,MyLobbyNet\nWiFi Office,MyOfficeNet",
    vcard: "Budi\nSiti\nAndi",
    location: "Kantor Pusat,Jakarta\nCabang Bandung,Bandung",
    event: "Rapat 1\nRapat 2",
    payment: "QRIS 1,123456\nQRIS 2,789012",
    custom: "Data 1\nData 2\nData 3",
  };

  const loadExample = () => {
    setInputText(examples[batchType] || examples.url);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Layers className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Batch</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Batch QR Generator</h1>
        <p className="text-sm text-muted-foreground">
          Buat banyak QR Code sekaligus dari daftar. Format: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">Nama,Konten</code> (satu per baris)
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input side */}
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Input Data</CardTitle>
            <CardDescription className="text-xs">Pilih jenis QR dan masukkan data (satu per baris)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Jenis QR Code</Label>
              <Select value={batchType} onValueChange={(v) => setBatchType(v as QrType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QR_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {QR_TYPE_ICONS[key as QrType]} {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Data (satu per baris)</Label>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={loadExample}>
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  Contoh
                </Button>
              </div>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={"Format: Nama,Konten\nContoh:\nToko A,https://toko-a.com\nToko B,https://toko-b.com"}
                rows={10}
                className="font-mono text-xs scrollbar-thin"
              />
              <p className="text-xs text-muted-foreground">
                {inputText.split("\n").filter(Boolean).length} baris terdeteksi
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={parseInput} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Generate Batch
              </Button>
              <Button variant="outline" onClick={handleClear} disabled={!items.length && !inputText}>
                <Trash2 className="h-4 w-4 mr-2" />
                Bersihkan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results side */}
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Hasil ({items.length})</CardTitle>
                <CardDescription className="text-xs">
                  {validCount > 0 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {validCount} valid
                    </span>
                  ) : (
                    "Belum ada data"
                  )}
                </CardDescription>
              </div>
              {items.length > 0 && (
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={handleSaveAll} disabled={validCount === 0}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Simpan Semua
                  </Button>
                  <Button size="sm" onClick={handleDownloadAll} disabled={validCount === 0}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download All
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                    <Layers className="h-8 w-8 text-primary/60" />
                  </div>
                  <div className="absolute -inset-3 border-2 border-dashed border-primary/10 rounded-3xl animate-pulse-soft" />
                </div>
                <p className="text-sm font-semibold">Belum ada QR Code</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Masukkan data di sebelah kiri lalu klik Generate Batch untuk membuat banyak QR sekaligus
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 rounded-xl border p-2.5 hover:bg-accent/30 transition-colors group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50 shrink-0 overflow-hidden">
                      {item.valid ? (
                        <QrPreview content={item.content} customization={customization} size={40} />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        {item.content || item.error}
                      </p>
                    </div>
                    <Badge variant={item.valid ? "secondary" : "destructive"} className="text-[10px] shrink-0">
                      {item.valid ? "Valid" : "Error"}
                    </Badge>
                    <button
                      onClick={() => handleDownloadItem(item)}
                      disabled={!item.valid}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all disabled:opacity-30"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
