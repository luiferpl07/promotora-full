import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const configs = await prisma.siteConfig.findMany();
    // Convert array to key-value object for easy use
    const result: Record<string, string> = {};
    for (const c of configs) {
      result[c.key] = c.value;
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, string>;
    const updates = Object.entries(body).map(([key, value]) =>
      prisma.siteConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    );
    await Promise.all(updates);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
