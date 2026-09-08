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
type Draft = { points: LatLng[]; codigo: string; area: string; precio: string; estado: string };

export default function AdminProyectoMapa() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [lotMode, setLotMode] = useState(false);
  const [drawCount, setDrawCount] = useState(0);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [savingLot, setSavingLot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "map-plans");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const { url } = await res.json();
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mapImageUrl: url }),
      });
      loadProject();
    } finally {
      setUploading(false);
    }
  };

  const handleSaveConfig = async (config: MapConfig) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mapCenterLat: config.lat, mapCenterLng: config.lng,
        mapRotationDeg: config.rotationDeg, mapWidthMeters: config.widthMeters,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLotComplete = (points: LatLng[]) => {
    setDraft({ points, codigo: `Lote ${lots.length + 1}`, area: "", precio: "", estado: "disponible" });
  };

  const handleSaveLot = async () => {
    if (!draft) return;
    setSavingLot(true);
    try {
      await fetch(`/api/projects/${projectId}/lots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: draft.codigo,
          geometry: JSON.stringify(draft.points),
          area: draft.area ? parseFloat(draft.area) : null,
          precio: draft.precio ? parseFloat(draft.precio) : null,
          estado: draft.estado,
        }),
      });
      setDraft(null);
      loadLots();
    } finally {
      setSavingLot(false);
    }
  };

  const handleDeleteLot = async (id: string) => {
    await fetch(`/api/projects/${projectId}/lots/${id}`, { method: "DELETE" });
    loadLots();
  };

  if (loading) return <LoadingBlock />;
  if (!project) return <div className="p-8 text-center text-[var(--color-pf-navy)]/40">Proyecto no encontrado.</div>;

  const initialConfig: MapConfig | null =
    project.mapCenterLat != null && project.mapCenterLng != null
      ? {
          lat: project.mapCenterLat, lng: project.mapCenterLng,
          rotationDeg: project.mapRotationDeg || 0, widthMeters: project.mapWidthMeters || 500,
        }
      : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href={`/admin/proyectos/${projectId}`} className="text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-pf-navy)]/40 hover:text-[var(--color-pf-gold)]">← {project.nombre}</Link>
          <h1 className="font-serif font-light text-3xl text-[var(--color-pf-navy)] mt-2">Editor de Mapa</h1>
        </div>
        {saved && <span className="text-emerald-600 text-sm flex items-center gap-1.5"><Icon name="check" className="w-4 h-4" /> Posición guardada</span>}
      </div>

      {!project.mapImageUrl ? (
        <Card className="p-6">
          <CardTitle>Sube el plano a calibrar</CardTitle>
          <p className="text-sm text-[var(--color-pf-navy)]/50 mb-4">Sube la imagen del plano (CAD, dibujo, o cualquier plano del proyecto) que vas a ubicar sobre el mapa satelital real.</p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Icon name="upload" className="w-4 h-4" /> {uploading ? "Subiendo..." : "Subir Plano"}
          </Button>
        </Card>
      ) : aspectRatio === null ? (
        <LoadingBlock label="Cargando plano..." />
      ) : (
        <>
          <Card className="p-6">
            <CardTitle hint="(Arrastra los puntos para mover, rotar y escalar el plano hasta que calce con la foto satelital)">Alinear Plano</CardTitle>
            <MapAligner
              ref={alignerRef}
              imageUrl={project.mapImageUrl}
              aspectRatio={aspectRatio}
              initialConfig={initialConfig}
              onSave={handleSaveConfig}
              lotMode={lotMode}
              onDrawingChange={setDrawCount}
              onLotComplete={handleLotComplete}
              existingLots={lots}
            />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
              <CardTitle hint={`(${lots.length} lote${lots.length !== 1 ? "s" : ""} ubicado${lots.length !== 1 ? "s" : ""})`}>Lotes</CardTitle>
              <Button variant={lotMode ? "primary" : "outline"} onClick={() => setLotMode(v => !v)}>
                {lotMode ? "Modo lotes: ACTIVO" : "Activar modo lotes"}
              </Button>
            </div>

            {lotMode && !draft && (
              <div className="flex items-center gap-3 mb-6 flex-wrap bg-[var(--color-pf-beige-light)] rounded-xl border border-[var(--color-pf-navy)]/10 px-4 py-3">
                <span className="text-sm text-[var(--color-pf-navy)]/60">
                  {drawCount === 0
                    ? "Haz clic en cada esquina del lote sobre el plano."
                    : `${drawCount} punto${drawCount !== 1 ? "s" : ""} marcado${drawCount !== 1 ? "s" : ""} — sigue marcando las esquinas.`}
                </span>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" onClick={() => alignerRef.current?.undoPoint()} disabled={drawCount === 0}>
                    Deshacer punto
                  </Button>
                  <Button size="sm" onClick={() => alignerRef.current?.finishDrawing()} disabled={drawCount < 3}>
                    Finalizar Lote ({drawCount})
                  </Button>
                  {drawCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => alignerRef.current?.cancelDrawing()}>Cancelar</Button>
                  )}
                </div>
              </div>
            )}

            {draft && (
              <div className="bg-[var(--color-pf-beige-light)] rounded-xl border border-[var(--color-pf-navy)]/10 p-5 space-y-4 mb-6">
                <h4 className="font-serif text-lg text-[var(--color-pf-navy)]">Nuevo Lote ({draft.points.length} puntos)</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Código / Nombre"><TextInput value={draft.codigo} onChange={e => setDraft({ ...draft, codigo: e.target.value })} /></Field>
                  <Field label="Estado">
                    <Select value={draft.estado} onChange={e => setDraft({ ...draft, estado: e.target.value })}>
                      {LOT_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </Select>
                  </Field>
                  <Field label="Área (m²)"><TextInput type="number" value={draft.area} onChange={e => setDraft({ ...draft, area: e.target.value })} /></Field>
                  <Field label="Precio (COP)"><TextInput type="number" value={draft.precio} onChange={e => setDraft({ ...draft, precio: e.target.value })} /></Field>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSaveLot} disabled={savingLot || !draft.codigo}>{savingLot ? "Guardando..." : "Guardar Lote"}</Button>
                  <Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button>
                </div>
              </div>
            )}

            {lots.length === 0 ? (
              <p className="text-sm text-[var(--color-pf-navy)]/40">Aún no has ubicado lotes. Activa el modo lotes y marca las esquinas de cada lote sobre el plano.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {lots.map(lot => {
                  const info = lotEstadoInfo(lot.estado);
                  return (
                    <div key={lot.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-[var(--color-pf-navy)]/10">
                      <div className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                        <div>
                          <div className="text-sm font-medium text-[var(--color-pf-navy)]">{lot.codigo}</div>
                          <div className="text-[11px] text-[var(--color-pf-navy)]/40">{info.label}{lot.area ? ` · ${lot.area} m²` : ""}</div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteLot(lot.id)} className="text-red-400 hover:text-red-600">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
