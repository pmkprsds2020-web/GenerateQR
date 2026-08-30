"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  records: { createdAt: string }[];
  weeks?: number;
}

interface DayCell {
  date: Date;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const LEVEL_COLORS = [
  "bg-muted/40",
  "bg-emerald-500/30",
  "bg-emerald-500/55",
  "bg-emerald-500/80",
  "bg-emerald-500",
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAY_LABELS = ["Sen", "Rab", "Jum"];

export function ActivityHeatmap({ records, weeks = 20 }: ActivityHeatmapProps) {
  const cells = React.useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const countMap = new Map<string, number>();
    records.forEach((r) => {
      const d = new Date(r.createdAt);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    const grid: DayCell[][] = [];
    for (let w = 0; w < weeks; w++) {
      const week: DayCell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + w * 7 + d);
        const key = date.toISOString().slice(0, 10);
        const count = countMap.get(key) || 0;
        week.push({ date, count, level: getLevel(count) });
      }
      grid.push(week);
    }
    return grid;
  }, [records, weeks]);

  const totalActivities = React.useMemo(() => {
    return records.filter((r) => {
      const d = new Date(r.createdAt);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - weeks * 7);
      return d >= cutoff;
    }).length;
  }, [records, weeks]);

  const monthLabels = React.useMemo(() => {
    const labels: { month: string; col: number }[] = [];
    let lastMonth = -1;
    cells.forEach((week, col) => {
      const midDay = week[3];
      const m = midDay.date.getMonth();
      if (m !== lastMonth) {
        labels.push({ month: MONTH_LABELS[m], col });
        lastMonth = m;
      }
    });
    return labels;
  }, [cells]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {totalActivities} aktivitas dalam {weeks} minggu terakhir
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {LEVEL_COLORS.map((color, i) => (
            <div key={i} className={cn("h-2.5 w-2.5 rounded-sm", color)} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin pb-2">
        <div className="inline-flex flex-col gap-1 min-w-fit">
          {/* Month labels */}
          <div className="flex gap-1 pl-7">
            {cells.map((_, col) => {
              const label = monthLabels.find((l) => l.col === col);
              return (
                <div key={col} className="w-3 text-[9px] text-muted-foreground h-3">
                  {label ? label.month : ""}
                </div>
              );
            })}
          </div>
          {/* Grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 pr-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-3 text-[9px] text-muted-foreground flex items-center">
                  {i % 2 === 1 ? DAY_LABELS[Math.floor(i / 2)] : ""}
                </div>
              ))}
            </div>
            {/* Cells - using native title for tooltip (lighter than Radix Tooltip) */}
            {cells.map((week, col) => (
              <div key={col} className="flex flex-col gap-1">
                {week.map((cell, row) => {
                  const isFuture = cell.date > new Date();
                  const title = `${cell.date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} — ${cell.count > 0 ? `${cell.count} QR Code` : "Tidak ada aktivitas"}`;
                  return (
                    <div
                      key={row}
                      title={title}
                      className={cn(
                        "h-3 w-3 rounded-sm transition-all hover:ring-1 hover:ring-ring cursor-default",
                        isFuture ? "opacity-0" : LEVEL_COLORS[cell.level]
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
