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
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Star, Eye, Pencil, Copy, Trash2, Download, ChevronLeft, ChevronRight, History as HistoryIcon, Plus, FileSpreadsheet, BarChart3, Tag, X, Archive, ArrowUpDown } from "lucide-react";
import { useQrStore } from "@/store/qr-store";
import { QR_TYPE_LABELS, QR_TYPE_ICONS, type QrType } from "@/lib/qr/qr-types";
import { QrPreview } from "./qr-preview";
import { TagInput } from "./tag-input";
import { EmptyState } from "./empty-state";
import { downloadQrCode } from "@/lib/qr/qr-download";
import { getScannableQrValue, isTrackableQrType } from "@/lib/qr/qr-tracking";
import { toast } from "sonner";

const PAGE_SIZE = 8;

export function HistoryView() {
  const records = useQrStore((s) => s.records);
  const deleteQr = useQrStore((s) => s.deleteQr);
  const duplicateQr = useQrStore((s) => s.duplicateQr);
  const toggleFavorite = useQrStore((s) => s.toggleFavorite);
  const setActiveView = useQrStore((s) => s.setActiveView);
  const setEditingId = useQrStore((s) => s.setEditingId);
  const logScan = useQrStore((s) => s.logScan);
  const scanLogs = useQrStore((s) => s.scanLogs);
  const updateTags = useQrStore((s) => s.updateTags);
  const recentSearches = useQrStore((s) => s.recentSearches);
  const addRecentSearch = useQrStore((s) => s.addRecentSearch);
  const clearRecentSearches = useQrStore((s) => s.clearRecentSearches);

  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [dateFilter, setDateFilter] = React.useState<string>("all");
  const [tagFilter, setTagFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("newest");
  const [page, setPage] = React.useState(1);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const [remoteScanCount, setRemoteScanCount] = React.useState<number | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);
  const [showRecentSearches, setShowRecentSearches] = React.useState(false);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSearchSubmit = () => {
    if (search.trim()) {
      addRecentSearch(search.trim());
      setShowRecentSearches(false);
    }
  };

  const handleRecentSearchClick = (query: string) => {
    setSearch(query);
    setShowRecentSearches(false);
  };

  // Collect all unique tags from records
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    records.forEach((r) => r.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [records]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === pageItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageItems.map((r) => r.id)));
    }
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => deleteQr(id));
    toast.success(`✓ ${selectedIds.size} QR Code berhasil dihapus`);
    setSelectedIds(new Set());
    setBulkDeleteOpen(false);
  };

  const handleBulkDownloadZip = async () => {
    const selected = records.filter((r) => selectedIds.has(r.id));
    if (selected.length === 0) return;
    toast.info(`Mengunduh ${selected.length} QR Code sebagai ZIP...`);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const { generateSvgString } = await import("@/lib/qr/qr-download");

      for (let i = 0; i < selected.length; i++) {
        const r = selected[i];
        try {
          const svg = await generateSvgString(r.content, r.customization, 512);
          zip.file(`${r.name || `qr-${i + 1}`}.svg`, svg);
        } catch {
          // ignore
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-selected-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`✓ ${selected.length} QR Code berhasil diunduh sebagai ZIP`);
    } catch {
      toast.error("Gagal membuat ZIP.");
    }
  };

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
    if (tagFilter !== "all") {
      list = list.filter((r) => r.tags?.includes(tagFilter));
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
    // Sort
    const sorted = [...list];
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "most-scanned":
        sorted.sort((a, b) => getScanCount(b.id) - getScanCount(a.id));
        break;
    }
    return sorted;
  }, [records, search, typeFilter, tagFilter, dateFilter, sortBy, scanLogs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  React.useEffect(() => {
    setPage(1);
  }, [search, typeFilter, tagFilter, dateFilter, sortBy]);

  const previewRecord = previewId ? records.find((r) => r.id === previewId) : null;

  // Pull the real scan count (from actual camera scans via /r/[id]) whenever
  // the preview opens. Falls back to null (shows the local simulated count
  // instead) if the API/database isn't reachable.
  React.useEffect(() => {
    if (!previewId) {
      setRemoteScanCount(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/qr/${previewId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.data?.scanCount !== undefined) {
          setRemoteScanCount(json.data.scanCount);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [previewId]);

  const handleDownload = async (record: typeof records[0]) => {
    try {
      await downloadQrCode({
        format: "png",
        size: 1024,
        content: getScannableQrValue(record),
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

  const getScanCount = (qrId: string) => scanLogs.filter((s) => s.qrId === qrId).length;

  const handleLogScan = (qrId: string, name: string, type: QrType) => {
    logScan(qrId, name, type);
    toast.success("✓ Scan tercatat");
  };

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.warning("Tidak ada data untuk diexport.");
      return;
    }
    const headers = ["No", "Nama", "Jenis", "Isi", "Favorit", "Tanggal Dibuat", "Tanggal Update"];
    const rows = filtered.map((r, i) => [
      i + 1,
      r.name,
      QR_TYPE_LABELS[r.type] || r.type,
      r.content,
      r.favorite ? "Ya" : "Tidak",
      new Date(r.createdAt).toLocaleString("id-ID"),
      new Date(r.updatedAt).toLocaleString("id-ID"),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`✓ ${filtered.length} data berhasil diexport ke CSV`);
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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExportCSV} disabled={records.length === 0}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" onClick={() => { setEditingId(null); setActiveView("generate"); }}>
            <Plus className="h-4 w-4 mr-2" />
            Buat QR Baru
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau isi QR..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowRecentSearches(true)}
                onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                className="pl-9"
              />
              {showRecentSearches && recentSearches.length > 0 && !search && (
                <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-popover border rounded-lg shadow-lg overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <span className="text-xs font-semibold text-muted-foreground">Pencarian Terbaru</span>
                    <button
                      onClick={() => clearRecentSearches()}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Hapus
                    </button>
                  </div>
                  {recentSearches.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleRecentSearchClick(s)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{s}</span>
                    </button>
                  ))}
                </div>
              )}
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
            {allTags.length > 0 && (
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Semua Tag" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tag</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="name-asc">Nama A-Z</SelectItem>
                <SelectItem value="name-desc">Nama Z-A</SelectItem>
                <SelectItem value="most-scanned">Paling Sering Dipindai</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {pageItems.length === 0 ? (
            <EmptyState
              icon={HistoryIcon}
              title={records.length === 0 ? "Belum ada QR Code" : "Tidak ada hasil ditemukan"}
              description={records.length === 0
                ? "QR Code yang Anda buat akan tersimpan di sini secara otomatis"
                : "Coba ubah kata kunci atau filter untuk menemukan yang Anda cari"}
              actionLabel={records.length === 0 ? "Buat QR Code" : undefined}
              onAction={records.length === 0 ? () => setActiveView("generate") : undefined}
              variant={records.length === 0 ? "default" : "search"}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                {selectedIds.size > 0 && (
                  <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <Checkbox checked={true} onCheckedChange={toggleSelectAll} />
                      <span className="text-sm font-medium">{selectedIds.size} dipilih</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleBulkDownloadZip}>
                        <Archive className="h-3.5 w-3.5 mr-1.5" />
                        Download ZIP
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                        Batal
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Hapus Terpilih
                      </Button>
                    </div>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={pageItems.length > 0 && selectedIds.size === pageItems.length}
                          onCheckedChange={toggleSelectAll}
                          aria-label="Pilih semua"
                        />
                      </TableHead>
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
                      <TableRow key={r.id} className={selectedIds.has(r.id) ? "bg-primary/5" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(r.id)}
                            onCheckedChange={() => toggleSelect(r.id)}
                            aria-label={`Pilih ${r.name}`}
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {(currentPage - 1) * PAGE_SIZE + i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{QR_TYPE_ICONS[r.type]}</span>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[180px]">{r.name}</p>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {r.favorite && (
                                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                )}
                                {getScanCount(r.id) > 0 && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 gap-0.5">
                                    <BarChart3 className="h-2.5 w-2.5" />
                                    {getScanCount(r.id)}
                                  </Badge>
                                )}
                                {r.tags?.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    <Tag className="h-2.5 w-2.5 mr-0.5" />
                                    {tag}
                                  </Badge>
                                ))}
                                {r.tags && r.tags.length > 2 && (
                                  <span className="text-[10px] text-muted-foreground">+{r.tags.length - 2}</span>
                                )}
                              </div>
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
                <QrPreview content={getScannableQrValue(previewRecord)} customization={previewRecord.customization} size={280} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Jenis:</span>
                  <Badge variant="secondary">{QR_TYPE_LABELS[previewRecord.type]}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" />
                    Total Scan:
                  </span>
                  <Badge variant="outline" className="font-mono">
                    {remoteScanCount ?? getScanCount(previewRecord.id)}
                  </Badge>
                </div>
                {!isTrackableQrType(previewRecord.type) && (
                  <p className="text-xs text-muted-foreground">
                    Scan asli dari HP belum bisa dilacak untuk tipe {QR_TYPE_LABELS[previewRecord.type]}.
                  </p>
                )}
                <div className="rounded-md bg-muted/50 p-2 text-xs font-mono break-all max-h-32 overflow-y-auto">
                  {previewRecord.content}
                </div>
                {/* Tags */}
                <TagInput
                  tags={previewRecord.tags || []}
                  onChange={(tags) => updateTags(previewRecord.id, tags)}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleDownload(previewRecord)}>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleLogScan(previewRecord.id, previewRecord.name, previewRecord.type)}>
                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                  Scan
                </Button>
                <Button size="sm" onClick={() => { setPreviewId(null); handleEdit(previewRecord.id); }}>
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selectedIds.size} QR Code?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini akan menghapus {selectedIds.size} QR Code terpilih secara permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleBulkDelete}
            >
              Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
