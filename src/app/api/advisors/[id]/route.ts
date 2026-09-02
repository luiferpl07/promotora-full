import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id: _id, createdAt, ...data } = body;
    const advisor = await prisma.advisor.update({ where: { id }, data });
    return NextResponse.json(advisor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update advisor" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.advisor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete advisor" }, { status: 500 });
  }
}
