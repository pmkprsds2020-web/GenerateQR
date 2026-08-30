"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Star, Eye, Pencil, Copy, Trash2, Download, ChevronLeft, ChevronRight, History as HistoryIcon, Plus } from "lucide-react";
import { useQrStore } from "@/store/qr-store";
import { QR_TYPE_LABELS, QR_TYPE_ICONS, type QrType } from "@/lib/qr/qr-types";
import { QrPreview } from "./qr-preview";
import { downloadQrCode } from "@/lib/qr/qr-download";
import { toast } from "sonner";

const PAGE_SIZE = 8;

export function HistoryView() {
  const records = useQrStore((s) => s.records);
  const deleteQr = useQrStore((s) => s.deleteQr);
  const duplicateQr = useQrStore((s) => s.duplicateQr);
  const toggleFavorite = useQrStore((s) => s.toggleFavorite);
  const setActiveView = useQrStore((s) => s.setActiveView);
  const setEditingId = useQrStore((s) => s.setEditingId);

  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");
  const [page, setPage] = React.useState(1);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [previewId, setPreviewId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    let list = records;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      list = list.filter((r) => r.type === typeFilter);
    }
    if (dateFilter !== "all") {
      const now = new Date();
      list = list.filter((r) => {
        const d = new Date(r.createdAt);
        if (dateFilter === "today") return d.toDateString() === now.toDateString();
        if (dateFilter === "week") {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d >= weekAgo;
        }
        if (dateFilter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        return true;
      });
    }
    return list;
  }, [records, search, typeFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [search, typeFilter, dateFilter]);

  const previewRecord = previewId ? records.find((r) => r.id === previewId) : null;

  const handleDownload = async (record: typeof records[0]) => {
    try {
      await downloadQrCode({
        format: "png",
        size: 1024,
        content: record.content,
        customization: record.customization,
        filename: record.name || "qr-code",
      });
      toast.success("✓ QR Code berhasil diunduh");
    } catch {
      toast.error("Gagal mengunduh.");
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateQr(id);
    toast.success("✓ QR Code berhasil diduplikasi.");
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setActiveView("generate");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <HistoryIcon className="h-6 w-6" />
            Riwayat QR Code
          </h1>
          <p className="text-sm text-muted-foreground">{records.length} QR Code tersimpan</p>
        </div>
        <Button size="sm" onClick={() => { setEditingId(null); setActiveView("generate"); }}>
          <Plus className="h-4 w-4 mr-2" />
          Buat QR Baru
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau isi QR..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                {Object.entries(QR_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Semua Tanggal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="week">Minggu Ini</SelectItem>
                <SelectItem value="month">Bulan Ini</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <HistoryIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">
                {records.length === 0 ? "Belum ada QR Code" : "Tidak ada hasil ditemukan"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {records.length === 0
                  ? "QR Code yang Anda buat akan tersimpan di sini"
                  : "Coba ubah kata kunci atau filter"}
              </p>
              {records.length === 0 && (
                <Button size="sm" className="mt-4" onClick={() => setActiveView("generate")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat QR Code
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Isi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((r, i) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-muted-foreground text-xs">
                          {(currentPage - 1) * PAGE_SIZE + i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{QR_TYPE_ICONS[r.type]}</span>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[180px]">{r.name}</p>
                              {r.favorite && (
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{QR_TYPE_LABELS[r.type]}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="text-xs font-mono truncate">{r.content}</p>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <IconBtn icon={Eye} title="Preview" onClick={() => setPreviewId(r.id)} />
                            <IconBtn icon={Pencil} title="Edit" onClick={() => handleEdit(r.id)} />
                            <IconBtn icon={Copy} title="Duplikasi" onClick={() => handleDuplicate(r.id)} />
                            <IconBtn icon={Star} title="Favorit" active={r.favorite} onClick={() => toggleFavorite(r.id)} />
                            <IconBtn icon={Download} title="Download" onClick={() => handleDownload(r)} />
                            <IconBtn icon={Trash2} title="Hapus" danger onClick={() => setDeleteId(r.id)} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {pageItems.map((r, i) => (
                  <div key={r.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl">{QR_TYPE_ICONS[r.type]}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("id-ID")}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleFavorite(r.id)}>
                        <Star className={`h-4 w-4 ${r.favorite ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                    <p className="text-xs font-mono truncate bg-muted/50 p-2 rounded">{r.content}</p>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setPreviewId(r.id)}>
                        <Eye className="h-3 w-3 mr-1" /> Lihat
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleEdit(r.id)}>
                        <Pencil className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleDuplicate(r.id)}>
                        <Copy className="h-3 w-3 mr-1" /> Duplikasi
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleDownload(r)}>
                        <Download className="h-3 w-3 mr-1" /> Unduh
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={() => setDeleteId(r.id)}>
                        <Trash2 className="h-3 w-3 mr-1" /> Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-muted-foreground">
                    Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus QR Code?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. QR Code akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteQr(deleteId);
                  toast.success("✓ QR Code berhasil dihapus.");
                  setDeleteId(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview dialog */}
      <Dialog open={!!previewId} onOpenChange={(o) => !o && setPreviewId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{previewRecord?.name}</DialogTitle>
          </DialogHeader>
          {previewRecord && (
            <div className="space-y-4">
              <div className="flex justify-center bg-muted/30 rounded-xl p-6">
                <QrPreview content={previewRecord.content} customization={previewRecord.customization} size={280} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Jenis:</span>
                  <Badge variant="secondary">{QR_TYPE_LABELS[previewRecord.type]}</Badge>
                </div>
                <div className="rounded-md bg-muted/50 p-2 text-xs font-mono break-all max-h-32 overflow-y-auto">
                  {previewRecord.content}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownload(previewRecord)}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
                <Button size="sm" className="flex-1" onClick={() => { setPreviewId(null); handleEdit(previewRecord.id); }}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IconBtn({
  icon: Icon,
  title,
  onClick,
  danger,
  active,
}: {
  icon: React.ElementType;
  title: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-md transition-colors hover:bg-accent ${
        danger
          ? "text-muted-foreground hover:text-destructive"
          : active
          ? "text-amber-500"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
