import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface IncomingLot {
  codigo?: string | null;
  geometry: string;
  area?: number | null;
  precio?: number | null;
  estado?: string | null;
}

const ESTADOS = new Set(["disponible", "reservado", "vendido"]);

/** Creates many lots in one call — importing a DXF means hundreds at a time. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const incoming: IncomingLot[] = Array.isArray(body?.lots) ? body.lots : [];

    if (incoming.length === 0) {
      return NextResponse.json({ error: "No se recibió ningún lote" }, { status: 400 });
    }

    const data = incoming
      .filter(lot => typeof lot?.geometry === "string" && lot.geometry.length > 0)
      .map((lot, i) => ({
        projectId: id,
        codigo: lot.codigo?.trim() || `L${String(i + 1).padStart(4, "0")}`,
        geometry: lot.geometry,
        area: typeof lot.area === "number" ? lot.area : null,
        precio: typeof lot.precio === "number" ? lot.precio : null,
        estado: lot.estado && ESTADOS.has(lot.estado) ? lot.estado : "disponible",
      }));

    if (data.length === 0) {
      return NextResponse.json({ error: "Ningún lote traía geometría válida" }, { status: 400 });
    }

    const result = await prisma.projectLot.createMany({ data });
    return NextResponse.json({ created: result.count }, { status: 201 });
  } catch (error) {
    console.error("Bulk lot import error:", error);
    return NextResponse.json({ error: "No se pudieron guardar los lotes" }, { status: 500 });
  }
}

/** Clears every lot of the project — used before re-importing a corrected DXF. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await prisma.projectLot.deleteMany({ where: { projectId: id } });
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    return NextResponse.json({ error: "No se pudieron eliminar los lotes" }, { status: 500 });
  }
}
