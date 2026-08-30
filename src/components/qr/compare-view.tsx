"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GitCompare, ArrowRight, Check, X, Minus } from "lucide-react";
import { useQrStore } from "@/store/qr-store";
import { QR_TYPE_LABELS, QR_TYPE_ICONS } from "@/lib/qr/qr-types";
import { QrPreview } from "./qr-preview";
import { EmptyState } from "./empty-state";

export function CompareView() {
  const records = useQrStore((s) => s.records);
  const [leftId, setLeftId] = React.useState<string>("");
  const [rightId, setRightId] = React.useState<string>("");

  const leftRecord = records.find((r) => r.id === leftId);
  const rightRecord = records.find((r) => r.id === rightId);

  const differences = React.useMemo(() => {
    if (!leftRecord || !rightRecord) return [];
    const diffs: { field: string; left: string; right: string; same: boolean }[] = [];
    const fields = [
      { key: "name", label: "Nama" },
      { key: "type", label: "Jenis" },
      { key: "content", label: "Konten" },
    ];
    fields.forEach(({ key, label }) => {
      const lVal = String((leftRecord as any)[key] || "");
      const rVal = String((rightRecord as any)[key] || "");
      diffs.push({ field: label, left: lVal, right: rVal, same: lVal === rVal });
    });
    // Customization comparison
    const lC = leftRecord.customization;
    const rC = rightRecord.customization;
    diffs.push({
      field: "Warna QR",
      left: lC.fgColor,
      right: rC.fgColor,
      same: lC.fgColor === rC.fgColor,
    });
    diffs.push({
      field: "Background",
      left: lC.bgColor,
      right: rC.bgColor,
      same: lC.bgColor === rC.bgColor,
    });
    diffs.push({
      field: "Error Correction",
      left: lC.errorCorrectionLevel,
      right: rC.errorCorrectionLevel,
      same: lC.errorCorrectionLevel === rC.errorCorrectionLevel,
    });
    diffs.push({
      field: "Bentuk Pixel",
      left: lC.pixelShape || "square",
      right: rC.pixelShape || "square",
      same: (lC.pixelShape || "square") === (rC.pixelShape || "square"),
    });
    diffs.push({
      field: "Logo",
      left: lC.logoDataUrl ? "Ada" : "Tidak",
      right: rC.logoDataUrl ? "Ada" : "Tidak",
      same: !!lC.logoDataUrl === !!rC.logoDataUrl,
    });
    diffs.push({
      field: "Gradient",
      left: lC.gradientEnabled ? "Aktif" : "Tidak",
      right: rC.gradientEnabled ? "Aktif" : "Tidak",
      same: !!lC.gradientEnabled === !!rC.gradientEnabled,
    });
    diffs.push({
      field: "Favorit",
      left: leftRecord.favorite ? "Ya" : "Tidak",
      right: rightRecord.favorite ? "Ya" : "Tidak",
      same: leftRecord.favorite === rightRecord.favorite,
    });
    return diffs;
  }, [leftRecord, rightRecord]);

  const sameCount = differences.filter((d) => d.same).length;
  const diffCount = differences.length - sameCount;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Compare</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Bandingkan QR Code</h1>
        <p className="text-sm text-muted-foreground">
          Bandingkan dua QR Code untuk melihat perbedaan konfigurasi
        </p>
      </motion.div>

      {records.length < 2 ? (
        <Card className="card-premium">
          <CardContent className="py-8">
            <EmptyState
              icon={GitCompare}
              title="Butuh minimal 2 QR Code"
              description={`Buat dan simpan minimal 2 QR Code untuk menggunakan fitur perbandingan. Saat ini ada: ${records.length} QR Code`}
              variant="default"
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <Card className="card-premium">
              <CardContent className="p-4">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">QR Code Pertama</label>
                <Select value={leftId} onValueChange={setLeftId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih QR Code..." />
                  </SelectTrigger>
                  <SelectContent>
                    {records.map((r) => (
                      <SelectItem key={r.id} value={r.id} disabled={r.id === rightId}>
                        {QR_TYPE_ICONS[r.type]} {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </div>

            <Card className="card-premium">
              <CardContent className="p-4">
                <label className="text-xs font-medium text-muted-foreground mb-2 block">QR Code Kedua</label>
                <Select value={rightId} onValueChange={setRightId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih QR Code..." />
                  </SelectTrigger>
                  <SelectContent>
                    {records.map((r) => (
                      <SelectItem key={r.id} value={r.id} disabled={r.id === leftId}>
                        {QR_TYPE_ICONS[r.type]} {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {leftRecord && rightRecord && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Summary */}
              <div className="flex items-center justify-center gap-3">
                <Badge variant="outline" className="gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                  <Check className="h-3 w-3" />
                  {sameCount} Sama
                </Badge>
                <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                  <Minus className="h-3 w-3" />
                  {diffCount} Berbeda
                </Badge>
              </div>

              {/* Side by side preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="card-premium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-base">{QR_TYPE_ICONS[leftRecord.type]}</span>
                      <span className="truncate">{leftRecord.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-6 border border-border/40">
                      <QrPreview content={leftRecord.content} customization={leftRecord.customization} size={200} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-premium">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="text-base">{QR_TYPE_ICONS[rightRecord.type]}</span>
                      <span className="truncate">{rightRecord.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-6 border border-border/40">
                      <QrPreview content={rightRecord.content} customization={rightRecord.customization} size={200} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Diff table */}
              <Card className="card-premium">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Perbandingan Detail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {/* Header */}
                    <div className="grid grid-cols-[120px_1fr_1fr_32px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                      <div>Field</div>
                      <div>Kiri</div>
                      <div>Kanan</div>
                      <div className="text-center">Status</div>
                    </div>
                    {differences.map((diff, i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-[120px_1fr_1fr_32px] gap-2 px-3 py-2.5 text-sm rounded-lg items-center ${
                          diff.same ? "bg-emerald-500/5" : "bg-amber-500/5"
                        }`}
                      >
                        <div className="font-medium text-muted-foreground">{diff.field}</div>
                        <div className="font-mono text-xs truncate" title={diff.left}>{diff.left}</div>
                        <div className="font-mono text-xs truncate" title={diff.right}>{diff.right}</div>
                        <div className="flex items-center justify-center">
                          {diff.same ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-amber-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
