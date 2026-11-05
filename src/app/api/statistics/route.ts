import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/statistics - Get QR code statistics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const supabase = getSupabase();

    // Pull just the columns needed and aggregate in JS (fine for this app's scale).
    let query = supabase.from("qr_codes").select("type, created_at").limit(10000);
    if (userId) query = query.eq("user_id", userId);
    const { data: rows, error } = await query;
    if (error) throw error;

    let favQuery = supabase.from("favorites").select("id", { count: "exact", head: true });
    if (userId) favQuery = favQuery.eq("user_id", userId);
    const { count: favorites, error: favError } = await favQuery;
    if (favError) throw favError;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = (rows ?? []).map((r) => ({ type: r.type as string, created: new Date(r.created_at as string) }));

    const byTypeMap = new Map<string, number>();
    for (const r of records) byTypeMap.set(r.type, (byTypeMap.get(r.type) ?? 0) + 1);

    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      last7Days.push({
        date: dayStart.toISOString().slice(0, 10),
        count: records.filter((r) => r.created >= dayStart && r.created < dayEnd).length,
      });
    }

    return NextResponse.json({
      total: records.length,
      today: records.filter((r) => r.created >= todayStart).length,
      week: records.filter((r) => r.created >= weekAgo).length,
      month: records.filter((r) => r.created >= monthStart).length,
      favorites: favorites ?? 0,
      byType: [...byTypeMap.entries()]
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
      last7Days,
    });
  } catch (error) {
    console.error("[api/statistics] Failed to fetch statistics:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
