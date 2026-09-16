import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; imgId: string } }
) {
  try {
    await prisma.projectImage.delete({ where: { id: params.imgId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; imgId: string } }
) {
  try {
    const body = await request.json();
    const image = await prisma.projectImage.update({
      where: { id: params.imgId },
      data: body,
    });
    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update image" }, { status: 500 });
  }
}
