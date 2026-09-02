import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const advisors = await prisma.advisor.findMany({ orderBy: { orden: "asc" } });
    return NextResponse.json(advisors);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch advisors" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const advisor = await prisma.advisor.create({ data: body });
    return NextResponse.json(advisor, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create advisor" }, { status: 500 });
  }
}
