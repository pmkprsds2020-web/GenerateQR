import { NextRequest, NextResponse } from "next/server";
import { getSupabase, mapTemplate, type TemplateRow } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// GET /api/templates - List all templates
export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("templates")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ data: (data as TemplateRow[]).map(mapTemplate) });
  } catch (error) {
    console.error("[api/templates] Failed to fetch templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// POST /api/templates - Create a template
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, configuration } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from("templates")
      .insert({
        name: String(name).slice(0, 255),
        type: String(type),
        configuration: configuration ? JSON.stringify(configuration) : "{}",
      })
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json({ data: mapTemplate(data as TemplateRow) }, { status: 201 });
  } catch (error) {
    console.error("[api/templates] Failed to create template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
