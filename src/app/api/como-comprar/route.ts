import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const steps = await prisma.comoComprarStep.findMany({ orderBy: { orden: "asc" } });
    return NextResponse.json(steps);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch steps" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const step = await prisma.comoComprarStep.create({ data: body });
    return NextResponse.json(step, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create step" }, { status: 500 });
  }
}
