"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CameraOff, Copy, Download, ExternalLink, CheckCircle2, Trash2, ScanLine, Zap, Clock } from "lucide-react";
import { detectQrType } from "@/lib/qr/qr-content";
import { toast } from "sonner";

interface ScanResult {
  content: string;
  type: string;
  label: string;
  timestamp: string;
}

export function ScannerView() {
  const [scanning, setScanning] = React.useState(false);
  const [result, setResult] = React.useState<ScanResult | null>(null);
  const [error, setError] = React.useState<string>("");
  const [history, setHistory] = React.useState<ScanResult[]>([]);
  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setError("");
    setResult(null);
    try {
      const scanner = new Html5Qrcode(containerId, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanResult(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err: any) {
      setError("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan dan tidak digunakan aplikasi lain.");
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
      setScanning(false);
    }
  };

  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleScanResult = (text: string) => {
    const detected = detectQrType(text);
    const res: ScanResult = {
      content: text,
      type: detected.type,
      label: detected.label,
      timestamp: new Date().toISOString(),
    };
    setResult(res);
    setHistory((h) => [res, ...h].slice(0, 20));
    stopCamera();
    toast.success("✓ QR Code berhasil dipindai!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setResult(null);

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }

    const scanner = new Html5Qrcode("file-reader", { verbose: false });
    scanner
      .scanFile(file, true)
      .then((text) => {
        handleScanResult(text);
      })
      .catch(() => {
        setError("Tidak ada QR Code terdeteksi pada gambar. Coba gambar lain yang lebih jelas.");
      })
      .finally(() => {
        scanner.clear().catch(() => {});
      });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyContent = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.content);
    toast.success("✓ Berhasil disalin.");
  };

  const openUrl = () => {
    if (!result) return;
    if (/^https?:\/\//i.test(result.content)) {
      window.open(result.content, "_blank", "noopener,noreferrer");
    } else {
      toast.info("Konten ini bukan URL yang bisa dibuka.");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <ScanLine className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Scanner</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">QR Scanner</h1>
        <p className="text-sm text-muted-foreground">
          Pindai QR Code menggunakan kamera atau upload gambar.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Camera className="h-4 w-4 text-primary" />
              </div>
              Pindai dengan Kamera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-border shadow-lg">
              <div id={containerId} className="w-full h-full" />
              {!scanning && !result && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70 gap-3 pointer-events-none">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <CameraOff className="h-8 w-8" />
                  </motion.div>
                  <p className="text-sm font-medium">Kamera tidak aktif</p>
                  <p className="text-xs text-white/50">Klik tombol di bawah untuk memulai</p>
                </div>
              )}
              {scanning && (
                <>
                  <div className="absolute inset-8 border-2 border-white/70 rounded-xl pointer-events-none" />
                  <motion.div
                    className="absolute left-8 right-8 h-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] pointer-events-none"
                    initial={{ top: "15%" }}
                    animate={{ top: ["15%", "85%", "15%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl pointer-events-none" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl pointer-events-none" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl pointer-events-none" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl pointer-events-none" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1 pointer-events-none">
                    <motion.div
                      className="h-2 w-2 rounded-full bg-red-500"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="text-[10px] text-white font-medium">SCANNING</span>
                  </div>
                </>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={startCamera} className="flex-1 shadow-sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Mulai Kamera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="destructive" className="flex-1 shadow-sm">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Kamera
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Separator />
              <span className="text-xs text-muted-foreground px-2 font-medium">ATAU</span>
              <Separator />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="qr-file-upload"
            />
            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Gambar QR
            </Button>
            <div id="file-reader" className="hidden" />
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="card-premium">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              Hasil Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                    <Camera className="h-8 w-8 text-primary/60" />
                  </div>
                  <div className="absolute -inset-3 border-2 border-dashed border-primary/10 rounded-3xl animate-pulse-soft" />
                </div>
                <p className="text-sm font-semibold">Belum ada hasil</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Hasil scan akan muncul di sini setelah QR Code terdeteksi
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span className="font-medium text-sm">QR Code terdeteksi</span>
                  <Badge variant="secondary" className="ml-auto bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">{result.label}</Badge>
                </div>

                <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-4 border border-border/40">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    Isi QR:
                  </p>
                  <p className="text-sm font-mono break-all">{result.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={copyContent} className="shadow-sm">
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={openUrl} className="shadow-sm">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Buka URL
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Dipindai: {new Date(result.timestamp).toLocaleString("id-ID")}
                </div>

                {history.length > 1 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium">Riwayat Scan:</p>
                    <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
                      {history.slice(1).map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                          <Badge variant="outline" className="text-[10px]">{h.label}</Badge>
                          <span className="flex-1 truncate font-mono">{h.content}</span>
                          <button onClick={() => setResult(h)} className="text-muted-foreground hover:text-foreground">
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="flex-1 h-px bg-border" />;
}
