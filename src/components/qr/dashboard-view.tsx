"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Calendar, CalendarDays, Star, TrendingUp, Plus, ScanLine, ArrowUpRight, Sparkles, Zap } from "lucide-react";
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
  Area,
  AreaChart,
} from "recharts";

const PIE_COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#f97316", "#84cc16", "#06b6d4", "#a855f7"];

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Selamat datang di <span className="text-gradient">QR GEN PRO</span>
          </h1>
          <p className="text-sm text-muted-foreground">Ringkasan aktivitas QR Code Anda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setActiveView("scanner")} className="shadow-sm">
            <ScanLine className="h-4 w-4 mr-2" />
            Scan QR
          </Button>
          <Button size="sm" onClick={() => { setEditingId(null); setActiveView("generate"); }} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Buat QR
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total QR Code"
          value={stats.total}
          icon={QrCode}
          gradient="from-sky-500 to-blue-600"
          subtitle="Sepanjang waktu"
        />
        <StatCard
          title="Dibuat Hari Ini"
          value={stats.today}
          icon={Calendar}
          gradient="from-emerald-500 to-teal-600"
          subtitle={new Date().toLocaleDateString("id-ID", { weekday: "long" })}
        />
        <StatCard
          title="Minggu Ini"
          value={stats.week}
          icon={CalendarDays}
          gradient="from-violet-500 to-purple-600"
          subtitle="7 hari terakhir"
        />
        <StatCard
          title="QR Favorit"
          value={stats.favorites}
          icon={Star}
          gradient="from-amber-500 to-orange-600"
          subtitle=" Ditandai bintang"
        />
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-premium overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              QR Dibuat (7 Hari Terakhir)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "var(--shadow-md)",
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2.5} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-premium overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <QrCode className="h-4 w-4 text-primary" />
              </div>
              Berdasarkan Jenis
            </CardTitle>
            <CardDescription className="text-xs">Distribusi tipe QR Code</CardDescription>
          </CardHeader>
          <CardContent>
            {byType.length === 0 ? (
              <EmptyChartState />
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
                    innerRadius={45}
                    paddingAngle={3}
                  >
                    {byType.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="var(--card)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                      boxShadow: "var(--shadow-md)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent activity */}
      <motion.div variants={itemVariants}>
        <Card className="card-premium overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                QR Code Terbaru
              </CardTitle>
              {recent.length > 0 && (
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveView("history")}>
                  Lihat Semua
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <EmptyState
                icon={QrCode}
                title="Belum ada QR Code"
                description="Mulai buat QR Code pertama Anda dan kelola semua di satu tempat"
                actionLabel="Buat QR Code"
                onAction={() => setActiveView("generate")}
              />
            ) : (
              <div className="space-y-2">
                {recent.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center gap-3 rounded-xl border p-2.5 hover:bg-accent/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => { setEditingId(r.id); setActiveView("generate"); }}
                  >
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 text-lg shrink-0 group-hover:scale-105 transition-transform">
                      {QR_TYPE_ICONS[r.type]}
                      {r.favorite && (
                        <Star className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-500 fill-amber-500 drop-shadow-sm" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{QR_TYPE_LABELS[r.type]}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70">
                        {new Date(r.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  subtitle,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  gradient: string;
  subtitle?: string;
}) {
  return (
    <Card className="card-premium overflow-hidden relative group">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-4 pt-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1 tabular-nums">{value}</p>
            {subtitle && <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md shrink-0 group-hover:scale-110 transition-transform`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChartState() {
  return (
    <div className="flex flex-col items-center justify-center h-[240px] text-center">
      <div className="relative">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-3">
          <QrCode className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <div className="absolute -inset-2 border-2 border-dashed border-muted-foreground/20 rounded-3xl animate-pulse-soft" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">Belum ada data</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Grafik akan muncul setelah Anda membuat QR Code</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="relative mb-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
          <Icon className="h-8 w-8 text-primary/60" />
        </div>
        <div className="absolute -inset-3 border-2 border-dashed border-primary/10 rounded-3xl animate-pulse-soft" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
      <Button size="sm" className="mt-4 shadow-sm" onClick={onAction}>
        <Plus className="h-4 w-4 mr-2" />
        {actionLabel}
      </Button>
    </div>
  );
}
