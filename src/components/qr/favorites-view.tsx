"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Download, Pencil, Trash2, Eye, Star as StarIcon, Plus } from "lucide-react";
import { useQrStore } from "@/store/qr-store";
import { QR_TYPE_LABELS, QR_TYPE_ICONS } from "@/lib/qr/qr-types";
import { QrPreview } from "./qr-preview";
import { downloadQrCode } from "@/lib/qr/qr-download";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function FavoritesView() {
  const records = useQrStore((s) => s.records);
  const toggleFavorite = useQrStore((s) => s.toggleFavorite);
  const deleteQr = useQrStore((s) => s.deleteQr);
  const setActiveView = useQrStore((s) => s.setActiveView);
  const setEditingId = useQrStore((s) => s.setEditingId);
  const [previewId, setPreviewId] = React.useState<string | null>(null);

  const favorites = records.filter((r) => r.favorite);
  const previewRecord = previewId ? records.find((r) => r.id === previewId) : null;

  const handleDownload = async (r: typeof records[0]) => {
    await downloadQrCode({
      format: "png",
      size: 1024,
      content: r.content,
      customization: r.customization,
      filename: r.name,
    });
    toast.success("✓ Berhasil diunduh");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <StarIcon className="h-6 w-6 text-amber-500 fill-amber-500" />
            QR Favorit
          </h1>
          <p className="text-sm text-muted-foreground">{favorites.length} QR Code favorit</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 mb-3">
                <Star className="h-7 w-7 text-amber-500" />
              </div>
              <p className="text-sm font-medium">Belum ada QR favorit</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Tandai QR Code dengan bintang untuk menyimpannya di favorit
              </p>
              <Button size="sm" className="mt-4" onClick={() => setActiveView("history")}>
                Lihat Riwayat
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map((r) => (
            <Card key={r.id} className="overflow-hidden hover:shadow-md transition-shadow group">
              <CardContent className="p-4">
                <div className="flex justify-center bg-muted/30 rounded-xl p-4 mb-3 relative">
                  <QrPreview content={r.content} customization={r.customization} size={180} />
                  <button
                    onClick={() => toggleFavorite(r.id)}
                    className="absolute top-1 right-1 p-1.5 rounded-lg bg-background/80 backdrop-blur hover:bg-background"
                    title="Hapus dari favorit"
                  >
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{QR_TYPE_ICONS[r.type]}</span>
                    <p className="font-medium text-sm truncate flex-1" title={r.name}>{r.name}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{QR_TYPE_LABELS[r.type]}</Badge>
                  <div className="flex gap-1 pt-1">
                    <Button variant="outline" size="sm" className="h-8 flex-1" onClick={() => setPreviewId(r.id)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 flex-1" onClick={() => handleDownload(r)}>
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 flex-1" onClick={() => { setEditingId(r.id); setActiveView("generate"); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 flex-1 text-destructive" onClick={() => deleteQr(r.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!previewId} onOpenChange={(o) => !o && setPreviewId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{previewRecord?.name}</DialogTitle>
          </DialogHeader>
          {previewRecord && (
            <div className="space-y-3">
              <div className="flex justify-center bg-muted/30 rounded-xl p-6">
                <QrPreview content={previewRecord.content} customization={previewRecord.customization} size={280} />
              </div>
              <div className="rounded-md bg-muted/50 p-2 text-xs font-mono break-all max-h-32 overflow-y-auto">
                {previewRecord.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
