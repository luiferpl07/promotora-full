import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { extractLotPolygons } from "@/lib/extractLotPolygons";
import { imageFractionToLatLng } from "@/lib/geoTransform";
import sharp from "sharp";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const force = (await request.json().catch(() => ({})))?.force === true;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (!project.mapImageUrl) {
      return NextResponse.json({ error: "El proyecto no tiene un plano subido" }, { status: 400 });
    }
    if (
      project.mapCenterLat == null || project.mapCenterLng == null ||
      project.mapRotationDeg == null || project.mapWidthMeters == null
    ) {
      return NextResponse.json({ error: "Primero debes alinear y guardar la posición del plano" }, { status: 400 });
    }

    const existingCount = await prisma.projectLot.count({ where: { projectId: id } });
    if (existingCount > 0 && !force) {
      return NextResponse.json(
        { error: "Ya existen lotes para este proyecto", existingCount },
        { status: 409 }
      );
    }

    const imagePath = path.join(process.cwd(), "public", project.mapImageUrl);
    const meta = await sharp(imagePath).metadata();
    const aspectRatio = (meta.height || 1) / (meta.width || 1);

    const detected = await extractLotPolygons(imagePath);
    if (detected.length === 0) {
      return NextResponse.json({ error: "No se detectaron lotes en la imagen" }, { status: 422 });
    }

    const config = {
      lat: project.mapCenterLat, lng: project.mapCenterLng,
      rotationDeg: project.mapRotationDeg, widthMeters: project.mapWidthMeters,
    };

    if (force) await prisma.projectLot.deleteMany({ where: { projectId: id } });

    const data = detected.map((lot, i) => {
      const geometry = lot.corners.map(c => imageFractionToLatLng(c.fx, c.fy, aspectRatio, config));
      return {
        projectId: id,
        codigo: `Lote ${i + 1}`,
        geometry: JSON.stringify(geometry),
        estado: "disponible",
      };
    });

    await prisma.projectLot.createMany({ data });

    return NextResponse.json({ ok: true, count: data.length });
  } catch (error) {
    console.error("auto-detect error:", error);
    return NextResponse.json({ error: "Failed to auto-detect lots" }, { status: 500 });
  }
}
