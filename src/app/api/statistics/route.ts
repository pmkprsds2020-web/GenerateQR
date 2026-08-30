import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/statistics - Get QR code statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const where = userId ? { userId } : {};
    const total = await db.qrCode.count({ where });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [today, week, month, byTypeRaw] = await Promise.all([
      db.qrCode.count({ where: { ...where, createdAt: { gte: todayStart } } }),
      db.qrCode.count({ where: { ...where, createdAt: { gte: weekAgo } } }),
      db.qrCode.count({ where: { ...where, createdAt: { gte: monthStart } } }),
      db.qrCode.groupBy({
        by: ["type"],
        _count: true,
        orderBy: { _count: { type: "desc" } },
      }),
    ]);

    const favorites = await db.favorite.count(userId ? { where: { userId } } : undefined);

    // Last 7 days breakdown
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const count = await db.qrCode.count({
        where: { ...where, createdAt: { gte: dayStart, lt: dayEnd } },
      });
      last7Days.push({ date: dayStart.toISOString().slice(0, 10), count });
    }

    return NextResponse.json({
      total,
      today,
      week,
      month,
      favorites,
      byType: byTypeRaw.map((t) => ({ type: t.type, count: t._count })),
      last7Days,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
