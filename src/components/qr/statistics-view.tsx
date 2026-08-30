"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQrStore } from "@/store/qr-store";
import { QR_TYPE_LABELS, QR_TYPE_ICONS, type QrType } from "@/lib/qr/qr-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { BarChart3, TrendingUp, PieChart as PieIcon, Calendar, Zap, Eye } from "lucide-react";

const COLORS = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#14b8a6", "#f97316", "#84cc16", "#06b6d4", "#a855f7"];

export function StatisticsView() {
  const records = useQrStore((s) => s.records);
  const scanLogs = useQrStore((s) => s.scanLogs);

  const byType = React.useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([type, count]) => ({
        type,
        label: QR_TYPE_LABELS[type as QrType] || type,
        icon: QR_TYPE_ICONS[type as QrType] || "",
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [records]);

  const last30Days = React.useMemo(() => {
    const days: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const count = records.filter((r) => new Date(r.createdAt).toDateString() === d.toDateString()).length;
      days.push({
        label: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        count,
      });
    }
    return days;
  }, [records]);

  const total = records.length;
  const favorites = records.filter((r) => r.favorite).length;
  const thisMonth = records.filter((r) => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const totalScans = scanLogs.length;
  const scansToday = scanLogs.filter((s) => {
    const d = new Date(s.timestamp);
    return d.toDateString() === new Date().toDateString();
  }).length;

  const mostScanned = React.useMemo(() => {
    const counts: Record<string, { count: number; name: string; type: string }> = {};
    scanLogs.forEach((s) => {
      if (!counts[s.qrId]) {
        counts[s.qrId] = { count: 0, name: s.qrName, type: s.qrType };
      }
      counts[s.qrId].count++;
    });
    return Object.entries(counts)
      .map(([qrId, info]) => {
        const record = records.find((r) => r.id === qrId);
        return {
          qrId,
          name: record?.name || info.name,
          type: (record?.type || info.type) as QrType,
          count: info.count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [scanLogs, records]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Statistik
        </h1>
        <p className="text-sm text-muted-foreground">Analisis penggunaan QR Code Anda</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Dibuat</p>
              <BarChart3 className="h-4 w-4 text-primary/60" />
            </div>
            <p className="text-2xl font-bold mt-1 tabular-nums">{total}</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Bulan Ini</p>
              <Calendar className="h-4 w-4 text-violet-500/60" />
            </div>
            <p className="text-2xl font-bold mt-1 tabular-nums">{thisMonth}</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Favorit</p>
              <TrendingUp className="h-4 w-4 text-amber-500/60" />
            </div>
            <p className="text-2xl font-bold mt-1 tabular-nums">{favorites}</p>
          </CardContent>
        </Card>
        <Card className="card-premium">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Total Scan</p>
              <Zap className="h-4 w-4 text-emerald-500/60" />
            </div>
            <p className="text-2xl font-bold mt-1 tabular-nums">{totalScans}</p>
            <p className="text-[10px] text-muted-foreground">{scansToday} hari ini</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tren 30 Hari Terakhir
            </CardTitle>
            <CardDescription className="text-xs">Jumlah QR Code dibuat per hari</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={last30Days}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="url(#colorCount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieIcon className="h-4 w-4" />
              Distribusi Jenis
            </CardTitle>
            <CardDescription className="text-xs">Persentase per tipe QR</CardDescription>
          </CardHeader>
          <CardContent>
            {byType.length === 0 ? (
              <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
                Belum ada data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={byType}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ count }) => count}
                  >
                    {byType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Type breakdown bar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Breakdown per Jenis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {byType.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
              Belum ada data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byType} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={120} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {byType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Most Scanned QR Codes */}
      <Card className="card-premium">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
              <Eye className="h-4 w-4 text-emerald-600" />
            </div>
            QR Paling Sering Dipindai
          </CardTitle>
          <CardDescription className="text-xs">Top 5 berdasarkan jumlah scan</CardDescription>
        </CardHeader>
        <CardContent>
          {mostScanned.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50 mb-3">
                <Eye className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Belum ada data scan</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Buka QR dari Riwayat dan klik "Scan" untuk melacak aktivitas
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {mostScanned.map((item, i) => {
                const maxCount = mostScanned[0].count;
                const pct = (item.count / maxCount) * 100;
                return (
                  <div key={item.qrId} className="flex items-center gap-3 p-2.5 rounded-xl border hover:bg-accent/30 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-sm font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <span className="text-xs font-mono text-muted-foreground shrink-0">{item.count}x</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-base shrink-0">{QR_TYPE_ICONS[item.type]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
