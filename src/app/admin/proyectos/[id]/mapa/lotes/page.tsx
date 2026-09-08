"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardTitle, Field, Icon, LoadingBlock, Select, TextInput } from "@/components/admin/AdminUI";
import MapAligner, { MapAlignerHandle, MapConfig } from "@/components/admin/MapAligner";
import { LOT_ESTADOS, lotEstadoInfo } from "@/lib/lotStatus";

interface Lot {
  id: string;
  codigo: string;
  geometry: string;
  area: number | null;
  precio: number | null;
  estado: string;
}

interface Project {
  id: string;
  nombre: string;
  mapImageUrl: string | null;
  mapCenterLat: number | null;
  mapCenterLng: number | null;
  mapRotationDeg: number | null;
  mapWidthMeters: number | null;
}

type LatLng = { lat: number; lng: number };
type EditForm = { id?: string; codigo: string; area: string; precio: string; estado: string; points?: LatLng[] };

export default function AdminProyectoMapaLotes() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState<string | null>(null);
  const [lotMode, setLotMode] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const [form, setForm] = useState<EditForm | null>(null);
  const [savingLot, setSavingLot] = useState(false);
  const alignerRef = useRef<MapAlignerHandle>(null);

  const loadProject = () => {
    fetch(`/api/projects/${projectId}`).then(r => r.json()).then(setProject).finally(() => setLoading(false));
  };
  const loadLots = () => {
    fetch(`/api/projects/${projectId}/lots`).then(r => r.json()).then(d => { if (Array.isArray(d)) setLots(d); });
  };

  useEffect(() => { loadProject(); loadLots(); }, [projectId]);

  useEffect(() => {
    if (!project?.mapImageUrl) return;
    const img = new window.Image();
    img.onload = () => setAspectRatio(img.naturalHeight / img.naturalWidth);
    img.src = project.mapImageUrl;
  }, [project?.mapImageUrl]);

  const handleAutoDetect = async (force = false) => {
    setDetecting(true);
    setDetectMsg(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/lots/auto-detect`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setDetectMsg(`Ya hay ${data.existingCount} lotes ubicados. Si quieres detectar de nuevo (reemplaza todos), usa el botón de abajo.`);
        } else {
          setDetectMsg(data.error || "No se pudo detectar los lotes.");
        }
        return;
      }
      setDetectMsg(`Se detectaron ${data.count} lotes automáticamente.`);
      loadLots();
    } finally {
      setDetecting(false);
    }
  };

  const handleLotClick = (lotId: string) => {
    const lot = lots.find(l => l.id === lotId);
    if (!lot) return;
    setForm({
      id: lot.id, codigo: lot.codigo,
      area: lot.area?.toString() || "", precio: lot.precio?.toString() || "", estado: lot.estado,
    });
  };

  const handleLotComplete = (points: LatLng[]) => {
    setForm({ codigo: `Lote ${lots.length + 1}`, area: "", precio: "", estado: "disponible", points });
  };

  const handleSaveForm = async () => {
    if (!form) return;
    setSavingLot(true);
    try {
      const payload: any = {
        codigo: form.codigo,
        area: form.area ? parseFloat(form.area) : null,
        precio: form.precio ? parseFloat(form.precio) : null,
        estado: form.estado,
      };
      if (form.points) payload.geometry = JSON.stringify(form.points);

      if (form.id) {
        await fetch(`/api/projects/${projectId}/lots/${form.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/projects/${projectId}/lots`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
      }
      setForm(null);
      loadLots();
    } finally {
      setSavingLot(false);
    }
  };

  const handleDelete = async () => {
    if (!form?.id) return;
    setSavingLot(true);
    try {
      await fetch(`/api/projects/${projectId}/lots/${form.id}`, { method: "DELETE" });
      setForm(null);
      loadLots();
    } finally {
      setSavingLot(false);
    }
  };

  if (loading) return <LoadingBlock />;
  if (!project) return <div className="p-8 text-center text-[var(--color-pf-navy)]/40">Proyecto no encontrado.</div>;

  const config: MapConfig | null =
    project.mapCenterLat != null && project.mapCenterLng != null
      ? {
          lat: project.mapCenterLat, lng: project.mapCenterLng,
          rotationDeg: project.mapRotationDeg || 0, widthMeters: project.mapWidthMeters || 500,
        }
      : null;

  if (!project.mapImageUrl || !config) {
    return (
      <div className="max-w-2xl">
        <Link href={`/admin/proyectos/${projectId}/mapa`} className="text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-pf-navy)]/40 hover:text-[var(--color-pf-gold)]">← Volver</Link>
        <Card className="p-6 mt-4">
          <CardTitle>Primero ubica el plano</CardTitle>
          <p className="text-sm text-[var(--color-pf-navy)]/50 mb-4">Antes de trabajar los lotes, ve al Paso 1 y ubica el plano sobre el mapa satelital.</p>
          <Link href={`/admin/proyectos/${projectId}/mapa`} className="text-[var(--color-pf-gold)] text-sm font-medium">Ir al Paso 1 →</Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href={`/admin/proyectos/${projectId}/mapa`} className="text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-pf-navy)]/40 hover:text-[var(--color-pf-gold)]">← Paso 1: Ubicar Plano</Link>
        <h1 className="font-serif font-light text-3xl text-[var(--color-pf-navy)] mt-2">Paso 2 · Trabajar Lotes</h1>
        <p className="text-[var(--color-pf-navy)]/50 mt-2 text-sm">El plano ya está ubicado. Detecta los lotes automáticamente, o márcalos a mano. Haz clic en un lote para editar su estado, área y precio.</p>
      </div>

      {aspectRatio === null ? (
        <LoadingBlock label="Cargando plano..." />
      ) : (
        <>
          {lots.length === 0 && (
            <Card className="p-6">
              <CardTitle hint="(Analiza la imagen del plano y ubica cada lote automáticamente sobre el mapa)">Detección Automática</CardTitle>
              <p className="text-sm text-[var(--color-pf-navy)]/50 mb-4">Recomendado: detecta los 554 lotes de una vez a partir del plano, y luego solo ajusta el estado/precio de cada uno.</p>
              <Button onClick={() => handleAutoDetect(false)} disabled={detecting}>
                <Icon name="checklist" className="w-4 h-4" /> {detecting ? "Detectando..." : "Detectar Lotes Automáticamente"}
              </Button>
              {detectMsg && <p className="text-sm text-[var(--color-pf-navy)]/60 mt-3">{detectMsg}</p>}
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <CardTitle hint={`(${lots.length} lote${lots.length !== 1 ? "s" : ""})`}>Mapa de Lotes</CardTitle>
              <div className="flex gap-2">
                {lots.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => handleAutoDetect(true)} disabled={detecting}>
                    {detecting ? "Detectando..." : "Re-detectar (reemplaza todos)"}
                  </Button>
                )}
                <Button variant={lotMode ? "primary" : "outline"} onClick={() => setLotMode(v => !v)}>
                  {lotMode ? "Agregar lote: ACTIVO" : "Agregar lote a mano"}
                </Button>
              </div>
            </div>

            {lotMode && !form && (
              <div className="flex items-center gap-3 mb-4 flex-wrap bg-[var(--color-pf-beige-light)] rounded-xl border border-[var(--color-pf-navy)]/10 px-4 py-3">
                <span className="text-sm text-[var(--color-pf-navy)]/60">
                  {drawCount === 0 ? "Haz clic en cada esquina del lote." : `${drawCount} puntos marcados.`}
                </span>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={() => alignerRef.current?.undoPoint()} disabled={drawCount === 0}>Deshacer</Button>
                  <Button size="sm" onClick={() => alignerRef.current?.finishDrawing()} disabled={drawCount < 3}>Finalizar ({drawCount})</Button>
                  {drawCount > 0 && <Button variant="ghost" size="sm" onClick={() => alignerRef.current?.cancelDrawing()}>Cancelar</Button>}
                </div>
              </div>
            )}

            <MapAligner
              ref={alignerRef}
              imageUrl={project.mapImageUrl}
              aspectRatio={aspectRatio}
              initialConfig={config}
              showAlignHandles={false}
              lotMode={lotMode}
              onDrawingChange={setDrawCount}
              onLotComplete={handleLotComplete}
              existingLots={lots}
              onLotClick={handleLotClick}
              heightClassName="h-[700px]"
            />

            {form && (
              <div className="bg-[var(--color-pf-beige-light)] rounded-xl border border-[var(--color-pf-navy)]/10 p-5 space-y-4 mt-4">
                <h4 className="font-serif text-lg text-[var(--color-pf-navy)]">{form.id ? "Editar Lote" : `Nuevo Lote (${form.points?.length} puntos)`}</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Código / Nombre"><TextInput value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} /></Field>
                  <Field label="Estado">
                    <Select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                      {LOT_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </Select>
                  </Field>
                  <Field label="Área (m²)"><TextInput type="number" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} /></Field>
                  <Field label="Precio (COP)"><TextInput type="number" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} /></Field>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveForm} disabled={savingLot || !form.codigo}>{savingLot ? "Guardando..." : "Guardar"}</Button>
                  {form.id && <Button variant="danger" onClick={handleDelete} disabled={savingLot}>Eliminar</Button>}
                  <Button variant="ghost" onClick={() => setForm(null)}>Cancelar</Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
