"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Calendar, CalendarDays, Star, TrendingUp, Plus, ScanLine } from "lucide-react";
import { useQrStore } from "@/store/qr-store";
import { QR_TYPE_LABELS, QR_TYPE_ICONS, type QrType } from "@/lib/qr/qr-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1", "#14b8a6", "#f97316", "#84cc16", "#06b6d4", "#a855f7"];

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function isThisWeek(date: Date) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  return date >= weekAgo;
}

function isThisMonth(date: Date) {
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function DashboardView() {
  const records = useQrStore((s) => s.records);
  const setActiveView = useQrStore((s) => s.setActiveView);
  const setEditingId = useQrStore((s) => s.setEditingId);

  const stats = React.useMemo(() => {
    const total = records.length;
    const today = records.filter((r) => isSameDay(new Date(r.createdAt), new Date())).length;
    const week = records.filter((r) => isThisWeek(new Date(r.createdAt))).length;
    const month = records.filter((r) => isThisMonth(new Date(r.createdAt))).length;
    const favorites = records.filter((r) => r.favorite).length;
    return { total, today, week, month, favorites };
  }, [records]);

  const byType = React.useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type,
      label: QR_TYPE_LABELS[type as QrType] || type,
      count,
    }));
  }, [records]);

  const last7Days = React.useMemo(() => {
    const days: { label: string; count: number; date: string }[] = [];
    const now = new Date();
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const count = records.filter((r) => isSameDay(new Date(r.createdAt), d)).length;
      days.push({
        label: dayNames[d.getDay()],
        count,
        date: d.toISOString().slice(0, 10),
      });
    }
    return days;
  }, [records]);

  const recent = records.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Ringkasan aktivitas QR Code Anda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveView("scanner")}>
            <ScanLine className="h-4 w-4 mr-2" />
            Scan QR
          </Button>
          <Button size="sm" onClick={() => { setEditingId(null); setActiveView("generate"); }}>
            <Plus className="h-4 w-4 mr-2" />
            Buat QR
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total QR Code"
          value={stats.total}
          icon={QrCode}
          color="text-sky-600"
          bg="bg-sky-500/10"
        />
        <StatCard
          title="Dibuat Hari Ini"
          value={stats.today}
          icon={Calendar}
          color="text-emerald-600"
          bg="bg-emerald-500/10"
        />
        <StatCard
          title="Minggu Ini"
          value={stats.week}
          icon={CalendarDays}
          color="text-violet-600"
          bg="bg-violet-500/10"
        />
        <StatCard
          title="QR Favorit"
          value={stats.favorites}
          icon={Star}
          color="text-amber-600"
          bg="bg-amber-500/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              QR Dibuat (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Berdasarkan Jenis</CardTitle>
            <CardDescription className="text-xs">Distribusi tipe QR Code</CardDescription>
          </CardHeader>
          <CardContent>
            {byType.length === 0 ? (
              <div className="flex items-center justify-center h-[240px] text-sm text-muted-foreground">
                Belum ada data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={byType}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {byType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
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

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">QR Code Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-3">
                <QrCode className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Belum ada QR Code</p>
              <p className="text-xs text-muted-foreground mt-1">Mulai buat QR Code pertama Anda</p>
              <Button size="sm" className="mt-4" onClick={() => setActiveView("generate")}>
                <Plus className="h-4 w-4 mr-2" />
                Buat QR Code
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border p-2.5 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => { setEditingId(r.id); setActiveView("generate"); }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-base shrink-0">
                    {QR_TYPE_ICONS[r.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{QR_TYPE_LABELS[r.type]}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </p>
                    {r.favorite && <Star className="h-3 w-3 text-amber-500 fill-amber-500 ml-auto mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
