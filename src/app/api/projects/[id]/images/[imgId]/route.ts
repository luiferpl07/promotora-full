import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imgId: string }> }
) {
  try {
    const { imgId } = await params;
    await prisma.projectImage.delete({ where: { id: imgId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imgId: string }> }
) {
  try {
    const { imgId } = await params;
    const body = await request.json();
    const image = await prisma.projectImage.update({
      where: { id: imgId },
      data: body,
    });
    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}
