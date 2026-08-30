"use client";

import * as React from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, CameraOff, Copy, Download, ExternalLink, CheckCircle2, Trash2 } from "lucide-react";
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">QR Scanner</h1>
        <p className="text-sm text-muted-foreground">
          Pindai QR Code menggunakan kamera atau upload gambar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Pindai dengan Kamera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-xl overflow-hidden bg-black/90 border-2 border-border">
              <div id={containerId} className="w-full h-full" />
              {!scanning && !result && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-3 pointer-events-none">
                  <CameraOff className="h-10 w-10" />
                  <p className="text-sm">Kamera tidak aktif</p>
                </div>
              )}
              {scanning && (
                <div className="absolute inset-8 border-2 border-white/70 rounded-lg pointer-events-none">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Mulai Kamera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="destructive" className="flex-1">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Kamera
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Separator />
              <span className="text-xs text-muted-foreground px-2">ATAU</span>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Hasil Scan</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Belum ada hasil</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Hasil scan akan muncul di sini
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium">QR Code terdeteksi</span>
                  <Badge variant="secondary" className="ml-auto">{result.label}</Badge>
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground mb-1">Isi QR:</p>
                  <p className="text-sm font-mono break-all">{result.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={copyContent}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={openUrl}>
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Buka URL
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Dipindai: {new Date(result.timestamp).toLocaleString("id-ID")}
                </div>

                {history.length > 1 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-xs font-medium">Riwayat Scan:</p>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {history.slice(1).map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30">
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
              </div>
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
