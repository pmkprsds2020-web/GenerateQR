"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TypeSelector } from "./type-selector";
import { QrForm } from "./qr-form";
import { CustomizationPanel } from "./customization-panel";
import { PreviewPanel } from "./preview-panel";
import { DEFAULT_CUSTOMIZATION, QR_TYPE_ICONS, type QrType, type QrCustomization } from "@/lib/qr/qr-types";
import { generateQrContent, type QrFormData } from "@/lib/qr/qr-content";
import { validateQrForm } from "@/lib/qr/qr-validation";
import { useQrStore } from "@/store/qr-store";
import { toast } from "sonner";
import { Sparkles, Settings2, Bookmark } from "lucide-react";

export function GenerateView() {
  const [type, setType] = React.useState<QrType>("url");
  const [data, setData] = React.useState<QrFormData>({});
  const [customization, setCustomization] = React.useState<QrCustomization>(DEFAULT_CUSTOMIZATION);

  const saveQr = useQrStore((s) => s.saveQr);
  const saveCustomTemplate = useQrStore((s) => s.saveCustomTemplate);
  const editingId = useQrStore((s) => s.editingId);
  const setEditingId = useQrStore((s) => s.setEditingId);
  const records = useQrStore((s) => s.records);
  const setSetType = useQrStore((s) => s.setSetType);
  const setTypeFromStore = useQrStore((s) => s.setType);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [templateName, setTemplateName] = React.useState("");

  // Load editing record
  React.useEffect(() => {
    if (editingId) {
      const rec = records.find((r) => r.id === editingId);
      if (rec) {
        setType(rec.type);
        setData(rec.data as QrFormData);
        setCustomization(rec.customization);
        toast.info(`Mengedit: ${rec.name}`);
      }
    }
  }, [editingId, records]);

  // Load from template picker
  React.useEffect(() => {
    if (setTypeFromStore) {
      setType(setTypeFromStore as QrType);
      setSetType(null);
      setData({});
      setCustomization(DEFAULT_CUSTOMIZATION);
    }
  }, [setTypeFromStore, setSetType]);

  const errors = React.useMemo(() => validateQrForm(type, data).errors, [type, data]);
  const content = React.useMemo(() => generateQrContent(type, data), [type, data]);

  const handleSave = () => {
    if (!content) {
      toast.warning("⚠ Mohon lengkapi data terlebih dahulu.");
      return;
    }
    const name = (data as any).name || `QR ${type} ${new Date().toLocaleDateString("id-ID")}`;
    const record = saveQr({
      id: editingId || undefined,
      name,
      type,
      content,
      data: data as Record<string, unknown>,
      customization,
    });
    toast.success("✓ QR Code berhasil disimpan");
    setEditingId(null);
    // Clear name field after save
    setData({ ...data, name: "" });
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.warning("Masukkan nama template.");
      return;
    }
    saveCustomTemplate({
      name: templateName.trim(),
      type,
      icon: QR_TYPE_ICONS[type],
      data: data as Record<string, unknown>,
      customization,
    });
    toast.success("✓ Template kustom berhasil disimpan");
    setTemplateName("");
    setTemplateDialogOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6">
      {/* Left: Form */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Buat QR Code
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Pilih jenis QR Code dan isi data. Preview diperbarui secara real-time.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTemplateDialogOpen(true)}
                className="shrink-0"
                title="Simpan sebagai template kustom"
              >
                <Bookmark className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Save Template</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Jenis QR Code</label>
                <TypeSelector value={type} onChange={setType} />
              </div>
              <QrForm type={type} data={data} errors={errors} onChange={setData} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Kustomisasi & Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="style">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="style">Warna & Bentuk</TabsTrigger>
                <TabsTrigger value="logo">Logo</TabsTrigger>
              </TabsList>
              <TabsContent value="style" className="mt-4">
                <CustomizationPanel customization={customization} onChange={setCustomization} />
              </TabsContent>
              <TabsContent value="logo" className="mt-4">
                <CustomizationPanel customization={customization} onChange={setCustomization} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right: Preview */}
      <div>
        <PreviewPanel
          content={content}
          customization={customization}
          title={(data as any).name || ""}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Simpan ke Riwayat"}
        />
      </div>

      {/* Save Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Simpan sebagai Template</DialogTitle>
            <DialogDescription>
              Simpan konfigurasi QR Code saat ini (jenis, data, dan kustomisasi) sebagai template kustom yang dapat digunakan kembali.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="template-name">Nama Template</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="contoh: QR Menu Restoran"
                onKeyDown={(e) => e.key === "Enter" && handleSaveTemplate()}
                autoFocus
              />
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jenis:</span>
                <span className="font-medium">{QR_TYPE_ICONS[type]} {type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kustomisasi:</span>
                <span className="font-medium">
                  {customization.gradientEnabled ? "Gradient" : customization.fgColor}
                  {customization.logoDataUrl ? " + Logo" : ""}
                  {customization.frameEnabled ? " + Frame" : ""}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
              <Bookmark className="h-4 w-4 mr-2" />
              Simpan Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
