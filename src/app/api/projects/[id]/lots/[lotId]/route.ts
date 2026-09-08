import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lotId: string }> }
) {
  try {
    const { lotId } = await params;
    const body = await request.json();
    const lot = await prisma.projectLot.update({
      where: { id: lotId },
      data: body,
    });
    return NextResponse.json(lot);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lot" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; lotId: string }> }
) {
  try {
    const { lotId } = await params;
    await prisma.projectLot.delete({ where: { id: lotId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lot" }, { status: 500 });
  }
}
