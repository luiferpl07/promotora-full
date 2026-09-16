import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const images = await prisma.projectImage.findMany({
      where: { projectId: params.id },
      orderBy: { orden: "asc" },
    });
    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const image = await prisma.projectImage.create({
      data: { ...body, projectId: params.id },
    });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}
