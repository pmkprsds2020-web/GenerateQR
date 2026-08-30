"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { useQrStore } from "@/store/qr-store";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Trash2,
  Download,
  Upload,
  Database,
  Shield,
  Info,
  Github,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const records = useQrStore((s) => s.records);
  const clearHistory = useQrStore((s) => s.clearHistory);
  const [clearOpen, setClearOpen] = React.useState(false);
  const importRef = React.useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = JSON.stringify(records, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-gen-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("✓ Data berhasil diexport");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (!Array.isArray(data)) throw new Error("Invalid format");
        localStorage.setItem("qr-gen-pro-store", JSON.stringify({ state: { records: data, activeView: "generate", editingId: null, setType: null }, version: 0 }));
        toast.success("✓ Data berhasil diimport. Halaman akan dimuat ulang.");
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast.error("File tidak valid.");
      }
    };
    reader.readAsText(file);
    if (importRef.current) importRef.current.value = "";
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Pengaturan
        </h1>
        <p className="text-sm text-muted-foreground">Kelola preferensi dan data aplikasi</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Tampilan
          </CardTitle>
          <CardDescription>Sesuaikan tema aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Mode Gelap</Label>
              <p className="text-xs text-muted-foreground">Aktifkan tema gelap</p>
            </div>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
              />
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" />
            Manajemen Data
          </CardTitle>
          <CardDescription>{records.length} QR Code tersimpan di browser</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Export Data</Label>
              <p className="text-xs text-muted-foreground">Unduh semua data sebagai JSON</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={records.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Import Data</Label>
              <p className="text-xs text-muted-foreground">Muat data dari file JSON</p>
            </div>
            <input ref={importRef} type="file" accept="application/json" onChange={handleImport} className="hidden" id="import-data" />
            <Button variant="outline" size="sm" onClick={() => importRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-destructive">Hapus Semua Data</Label>
              <p className="text-xs text-muted-foreground">Hapus seluruh riwayat QR Code</p>
            </div>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setClearOpen(true)} disabled={records.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Keamanan & Privasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-600" />
            <span>Semua data QR Code disimpan lokal di browser Anda, tidak dikirim ke server.</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-600" />
            <span>QR Code dihasilkan di sisi klien (client-side) untuk privasi maksimal.</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-600" />
            <span>Upload logo divalidasi: format PNG/JPG/SVG, maksimal 2MB.</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-600" />
            <span>Validasi URL untuk deteksi HTTP dan domain mencurigakan.</span>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Tentang Aplikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nama</span>
            <span className="font-medium">QR GEN PRO</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versi</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Teknologi</span>
            <span className="font-medium">Next.js 16, React 19, TypeScript</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Source</span>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Github className="h-4 w-4 mr-1" />
                GitHub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Data?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus semua {records.length} QR Code yang tersimpan. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                clearHistory();
                toast.success("✓ Semua data berhasil dihapus");
                setClearOpen(false);
              }}
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
