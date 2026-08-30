"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Star, Download, Pencil, Trash2, Eye, Star as StarIcon, Plus, LayoutGrid, List } from "lucide-react";
import { useQrStore } from "@/store/qr-store";
import { QR_TYPE_LABELS, QR_TYPE_ICONS } from "@/lib/qr/qr-types";
import { QrPreview } from "./qr-preview";
import { EmptyState } from "./empty-state";
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
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarIcon className="h-5 w-5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Favorit</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">QR Favorit</h1>
          <p className="text-sm text-muted-foreground">{favorites.length} QR Code favorit</p>
        </div>
        {favorites.length > 0 && (
          <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as any)}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </motion.div>

      {favorites.length === 0 ? (
        <Card className="card-premium">
          <CardContent className="py-8">
            <EmptyState
              icon={Star}
              title="Belum ada QR favorit"
              description="Tandai QR Code dengan bintang untuk menyimpannya di favorit dan akses dengan cepat"
              actionLabel="Lihat Riwayat"
              onAction={() => setActiveView("history")}
              variant="favorite"
            />
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favorites.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card key={r.id} className="overflow-hidden hover:shadow-md transition-shadow group card-premium">
                <CardContent className="p-4">
                  <div className="flex justify-center bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-4 mb-3 relative border border-border/40">
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
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="card-premium overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted/30 shrink-0 overflow-hidden">
                      <QrPreview content={r.content} customization={r.customization} size={56} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{QR_TYPE_ICONS[r.type]}</span>
                        <p className="font-medium text-sm truncate">{r.name}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">{QR_TYPE_LABELS[r.type]}</Badge>
                        <p className="text-xs text-muted-foreground truncate font-mono">{r.content}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPreviewId(r.id)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDownload(r)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingId(r.id); setActiveView("generate"); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteQr(r.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
