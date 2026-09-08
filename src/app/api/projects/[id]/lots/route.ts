import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const lots = await prisma.projectLot.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(lots);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lots" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const lot = await prisma.projectLot.create({
      data: { ...body, projectId: id },
    });
    return NextResponse.json(lot, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add lot" }, { status: 500 });
  }
}
