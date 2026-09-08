import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { mkdir } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { cleanPlanImage } from "@/lib/cleanPlanImage";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (!project.mapImageUrl) {
      return NextResponse.json({ error: "El proyecto no tiene un plano subido" }, { status: 400 });
    }

    const inputPath = path.join(process.cwd(), "public", project.mapImageUrl);
    const outDir = path.join(process.cwd(), "public", "uploads", "map-plans", "clean");
    await mkdir(outDir, { recursive: true });
    const outFile = `${Date.now()}.png`;
    const outputPath = path.join(outDir, outFile);

    await cleanPlanImage(inputPath, outputPath);

    const url = `/uploads/map-plans/clean/${outFile}`;
    await prisma.project.update({ where: { id }, data: { mapImageUrl: url } });

    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("clean plan image error:", error);
    return NextResponse.json({ error: "Failed to clean plan image" }, { status: 500 });
  }
}
