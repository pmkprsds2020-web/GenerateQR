import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/templates - List all templates
export async function GET() {
  try {
    const templates = await db.template.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ data: templates });
  } catch {
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

    const template = await db.template.create({
      data: {
        name: String(name).slice(0, 255),
        type: String(type),
        configuration: configuration ? JSON.stringify(configuration) : "{}",
      },
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}
