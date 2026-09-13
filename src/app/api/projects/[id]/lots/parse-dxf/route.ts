import { NextRequest, NextResponse } from "next/server";
import { parseDxfLots } from "@/lib/dxfToLots";

/**
 * Reads an uploaded DXF and returns the lot polygons it contains. Nothing is
 * saved here — the admin previews the result over the plano and only then
 * confirms the import.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const layer = (formData.get("layer") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No se recibió el archivo DXF" }, { status: 400 });
    }

    const text = await file.text();
    const result = parseDxfLots(text, layer);

    if (result.layers.length === 0) {
      return NextResponse.json(
        { error: "El archivo no contiene polilíneas cerradas. Revisa que los lotes estén dibujados como polilíneas cerradas." },
        { status: 422 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("DXF parse error:", error);
    return NextResponse.json({ error: "No se pudo leer el archivo DXF" }, { status: 500 });
  }
}
