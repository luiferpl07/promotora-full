import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id, createdAt, ...data } = body;
    const advisor = await prisma.advisor.update({ where: { id: params.id }, data });
    return NextResponse.json(advisor);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update advisor" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.advisor.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete advisor" }, { status: 500 });
  }
}
