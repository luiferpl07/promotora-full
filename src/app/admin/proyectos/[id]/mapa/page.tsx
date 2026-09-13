"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Button, Card, CardTitle, Field, Icon, LoadingBlock, Select, TextInput,
} from "@/components/admin/AdminUI";
import { LOT_ESTADOS, lotEstadoInfo } from "@/lib/lotStatus";
import { parseLotGeometry, polygonPoints, polygonCentroid, type LotPoint } from "@/lib/lotGeometry";

interface Project {
  id: string;
  nombre: string;
  planoUrl: string | null;
}

interface Lot {
  id: string;
  codigo: string;
  geometry: string;
  area: number | null;
  precio: number | null;
  estado: string;
}

interface LotForm {
  codigo: string;
  area: string;
  precio: string;
  estado: string;
}

interface DxfLot {
  points: LotPoint[];   // 0..1 over the drawing's bounding box
  codigo: string | null;
  area: number;
}

interface DxfData {
  layers: { name: string; polygons: number }[];
  lots: DxfLot[];
  layerUsed: string | null;
  widthUnits: number;
  heightUnits: number;
}

/** The rectangle of the plano image, in %, that the DXF drawing maps onto. */
interface Frame { x0: number; y0: number; x1: number; y1: number; }

type Mode = "draw" | "rect" | "select";

const EMPTY_FORM: LotForm = { codigo: "", area: "", precio: "", estado: "disponible" };
const FULL_FRAME: Frame = { x0: 0, y0: 0, x1: 100, y1: 100 };
const MIN_ZOOM = 1;
const MAX_ZOOM = 12;
const DRAG_THRESHOLD_PX = 4;

/** "MZ1-L07" -> "MZ1-L08", so tracing a row of lots doesn't mean retyping. */
function nextCodigo(previous: string | undefined): string {
  if (!previous) return "";
  const match = previous.match(/^(.*?)(\d+)(\D*)$/);
  if (!match) return previous;
  const [, head, digits, tail] = match;
  return `${head}${String(Number(digits) + 1).padStart(digits.length, "0")}${tail}`;
}

const round = (n: number) => Number(n.toFixed(3));

export default function AdminProyectoPlano() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const [mode, setMode] = useState<Mode>("draw");
  const [draft, setDraft] = useState<LotPoint[]>([]);
  const [rectStart, setRectStart] = useState<LotPoint | null>(null);
  const [pendingPolygon, setPendingPolygon] = useState<LotPoint[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<LotForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // DXF import
  const [dxfFile, setDxfFile] = useState<File | null>(null);
  const [dxf, setDxf] = useState<DxfData | null>(null);
  const [dxfError, setDxfError] = useState<string | null>(null);
  const [frame, setFrame] = useState<Frame>(FULL_FRAME);
  const [frameStart, setFrameStart] = useState<LotPoint | null>(null);
  const [pickingFrame, setPickingFrame] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [importing, setImporting] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dxfInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0, moved: 0 });

  const reloadLots = async () => {
    const l = await fetch(`/api/projects/${projectId}/lots`).then(r => r.json());
    setLots(Array.isArray(l) ? l : []);
  };

  const loadAll = () => {
    Promise.all([
      fetch(`/api/projects/${projectId}`).then(r => r.json()),
      fetch(`/api/projects/${projectId}/lots`).then(r => r.json()),
    ]).then(([p, l]) => {
      setProject(p);
      setLots(Array.isArray(l) ? l : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [projectId]);

  useEffect(() => {
    if (!project?.planoUrl) return;
    const img = new window.Image();
    img.onload = () => setAspectRatio(img.naturalHeight / img.naturalWidth);
    img.src = project.planoUrl;
  }, [project?.planoUrl]);

  /* ------------------------------------------------------------------ */
  /*  Plano                                                              */
  /* ------------------------------------------------------------------ */

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "planos");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const { url } = await res.json();
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planoUrl: url }),
      });
      setAspectRatio(null);
      loadAll();
    } finally {
      setUploading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Importación DXF                                                    */
  /* ------------------------------------------------------------------ */

  const parseDxf = async (file: File, layer?: string) => {
    setDxfError(null);
    const fd = new FormData();
    fd.append("file", file);
    if (layer) fd.append("layer", layer);
    const res = await fetch(`/api/projects/${projectId}/lots/parse-dxf`, { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setDxfError(data?.error ?? "No se pudo leer el DXF");
      setDxf(null);
      return;
    }
    setDxf(data);
  };

  const handleDxfPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDxfFile(file);
    setFrame(FULL_FRAME);
    setFrameStart(null);
    setPickingFrame(false);
    setDraft([]);
    setPendingPolygon(null);
    setSelectedId(null);
    await parseDxf(file);
  };

  const cancelImport = () => {
    setDxf(null);
    setDxfFile(null);
    setDxfError(null);
    setPickingFrame(false);
    setFrameStart(null);
    setFrame(FULL_FRAME);
    if (dxfInputRef.current) dxfInputRef.current.value = "";
  };

  // Maps a DXF point (0..1) into image percentages using the current frame.
  const mapToFrame = ([ux, uy]: LotPoint): LotPoint => [
    round(frame.x0 + ux * (frame.x1 - frame.x0)),
    round(frame.y0 + uy * (frame.y1 - frame.y0)),
  ];

  const confirmImport = async () => {
    if (!dxf) return;
    setImporting(true);
    try {
      if (replaceExisting) {
        await fetch(`/api/projects/${projectId}/lots/bulk`, { method: "DELETE" });
      }
      const payload = dxf.lots.map((lot, i) => ({
        codigo: lot.codigo || `L${String(i + 1).padStart(4, "0")}`,
        geometry: JSON.stringify(lot.points.map(mapToFrame)),
        area: lot.area || null,
      }));
      await fetch(`/api/projects/${projectId}/lots/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lots: payload }),
      });
      cancelImport();
      await reloadLots();
    } finally {
      setImporting(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Zoom / pan                                                         */
  /* ------------------------------------------------------------------ */

  const clampPan = (next: { x: number; y: number }, z: number) => {
    const box = viewportRef.current?.getBoundingClientRect();
    if (!box) return next;
    const maxX = (box.width * (z - 1)) / 2;
    const maxY = (box.height * (z - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  };

  const applyZoom = (nextZoom: number) => {
    const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom));
    setZoom(z);
    setPan(p => clampPan(p, z));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      active: true, startX: e.clientX, startY: e.clientY,
      originX: pan.x, originY: pan.y, moved: 0,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    d.moved = Math.max(d.moved, Math.abs(dx) + Math.abs(dy));
    if (d.moved > DRAG_THRESHOLD_PX) setPan(clampPan({ x: d.originX + dx, y: d.originY + dy }, zoom));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current.active = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  /* ------------------------------------------------------------------ */
  /*  Trazado                                                            */
  /* ------------------------------------------------------------------ */

  const toPercent = (clientX: number, clientY: number): LotPoint | null => {
    const rect = planeRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return [
      round(((clientX - rect.left) / rect.width) * 100),
      round(((clientY - rect.top) / rect.height) * 100),
    ];
  };

  const openFormFor = (polygon: LotPoint[]) => {
    setPendingPolygon(polygon);
    setSelectedId(null);
    setForm({ ...EMPTY_FORM, codigo: nextCodigo(lots[lots.length - 1]?.codigo) });
  };

  const handlePlaneClick = (e: React.MouseEvent) => {
    if (dragRef.current.moved > DRAG_THRESHOLD_PX) return; // fue un desplazamiento
    const point = toPercent(e.clientX, e.clientY);
    if (!point) return;

    if (pickingFrame) {
      if (!frameStart) { setFrameStart(point); return; }
      setFrame({
        x0: Math.min(frameStart[0], point[0]), y0: Math.min(frameStart[1], point[1]),
        x1: Math.max(frameStart[0], point[0]), y1: Math.max(frameStart[1], point[1]),
      });
      setFrameStart(null);
      setPickingFrame(false);
      return;
    }

    if (dxf || pendingPolygon) return;

    if (mode === "draw") {
      setDraft(d => [...d, point]);
      return;
    }

    if (mode === "rect") {
      if (!rectStart) { setRectStart(point); return; }
      const [ax, ay] = rectStart;
      const [bx, by] = point;
      setRectStart(null);
      openFormFor([[ax, ay], [bx, ay], [bx, by], [ax, by]]);
    }
  };

  const closeDraft = () => {
    if (draft.length < 3) return;
    const polygon = draft;
    setDraft([]);
    openFormFor(polygon);
  };

  // Enter cierra el polígono, Esc descarta: trazar con el mouse y una mano en
  // el teclado es mucho más rápido que ir al botón en cada lote.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && mode === "draw") closeDraft();
      if (e.key === "Escape") {
        setDraft([]); setRectStart(null); setPendingPolygon(null);
        setSelectedId(null); setFrameStart(null); setPickingFrame(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [draft, lots, mode]);

  const selectLot = (lot: Lot) => {
    if (dragRef.current.moved > DRAG_THRESHOLD_PX || dxf) return;
    setPendingPolygon(null);
    setDraft([]);
    setRectStart(null);
    setSelectedId(lot.id);
    setForm({
      codigo: lot.codigo,
      area: lot.area?.toString() ?? "",
      precio: lot.precio?.toString() ?? "",
      estado: lot.estado,
    });
  };

  /* ------------------------------------------------------------------ */
  /*  Guardar / borrar                                                   */
  /* ------------------------------------------------------------------ */

  const buildPayload = (geometry?: LotPoint[]) => ({
    codigo: form.codigo.trim(),
    area: form.area ? Number(form.area) : null,
    precio: form.precio ? Number(form.precio) : null,
    estado: form.estado,
    ...(geometry ? { geometry: JSON.stringify(geometry) } : {}),
  });

  const handleSave = async () => {
    if (!form.codigo.trim()) return;
    setSaving(true);
    try {
      if (pendingPolygon) {
        await fetch(`/api/projects/${projectId}/lots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(pendingPolygon)),
        });
        setPendingPolygon(null);
      } else if (selectedId) {
        await fetch(`/api/projects/${projectId}/lots/${selectedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        });
        setSelectedId(null);
      }
      setForm(EMPTY_FORM);
      await reloadLots();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/lots/${selectedId}`, { method: "DELETE" });
      setSelectedId(null);
      setForm(EMPTY_FORM);
      setLots(ls => ls.filter(l => l.id !== selectedId));
    } finally {
      setSaving(false);
    }
  };

  /* ------------------------------------------------------------------ */

  if (loading) return <LoadingBlock />;
  if (!project) return <div className="p-8 text-center text-[var(--color-pf-navy)]/40">Proyecto no encontrado.</div>;

  const editing = pendingPolygon !== null || selectedId !== null;
  const previewLots = dxf ? dxf.lots.map(l => l.points.map(mapToFrame)) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href={`/admin/proyectos/${projectId}`} className="text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-pf-navy)]/40 hover:text-[var(--color-pf-gold)]">← {project.nombre}</Link>
          <h1 className="font-serif font-light text-3xl text-[var(--color-pf-navy)] mt-2">Plano de Lotes</h1>
          <p className="text-[var(--color-pf-navy)]/50 mt-2 text-sm max-w-2xl">
            Importa los lotes desde el DXF del proyecto, o trázalos a mano sobre el plano. Las formas se guardan en porcentaje de la imagen, así que calzan en cualquier pantalla.
          </p>
        </div>
        {project.planoUrl && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-pf-navy)]/50">{lots.length} lotes</span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Icon name="upload" className="w-4 h-4" /> {uploading ? "Subiendo..." : "Cambiar plano"}
            </Button>
          </div>
        )}
      </div>

      {!project.planoUrl ? (
        <Card className="p-6">
          <CardTitle>Sube el plano del loteo</CardTitle>
          <p className="text-sm text-[var(--color-pf-navy)]/50 mb-4 max-w-2xl">
            Recorta la imagen dejando solo el dibujo del loteo (sin rótulo, tabla de áreas, localización ni perfiles viales) y súbela a la mayor resolución posible. Todo lo que se vea aquí es lo que verá el cliente.
          </p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Icon name="upload" className="w-4 h-4" /> {uploading ? "Subiendo..." : "Subir Plano"}
          </Button>
        </Card>
      ) : aspectRatio === null ? (
        <LoadingBlock label="Cargando plano..." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 items-start">
          {/* -------------------- Lienzo -------------------- */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <div className="flex items-center gap-1 bg-black/5 rounded-full p-1">
                {([["draw", "Polígono"], ["rect", "Rectángulo"], ["select", "Seleccionar"]] as const).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setDraft([]); setRectStart(null); }}
                    disabled={!!dxf}
                    className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider transition-colors disabled:opacity-40 ${
                      mode === m ? "bg-white shadow text-[var(--color-pf-navy)]" : "text-[var(--color-pf-navy)]/50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {!dxf && mode === "draw" && draft.length > 0 && (
                  <>
                    <span className="text-xs text-[var(--color-pf-navy)]/50">{draft.length} puntos</span>
                    <Button size="sm" variant="secondary" onClick={() => setDraft(d => d.slice(0, -1))}>Deshacer punto</Button>
                    <Button size="sm" onClick={closeDraft} disabled={draft.length < 3}>Cerrar lote (Enter)</Button>
                  </>
                )}
                <Button size="sm" variant="secondary" onClick={() => applyZoom(zoom / 1.4)}>−</Button>
                <span className="text-xs text-[var(--color-pf-navy)]/40 w-10 text-center">{zoom.toFixed(1)}x</span>
                <Button size="sm" variant="secondary" onClick={() => applyZoom(zoom * 1.4)}>+</Button>
              </div>
            </div>

            <div
              ref={viewportRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="relative w-full overflow-hidden rounded-xl border border-black/10 bg-neutral-100 touch-none"
              style={{ paddingBottom: `${aspectRatio * 100}%` }}
            >
              <div
                ref={planeRef}
                onClick={handlePlaneClick}
                className="absolute inset-0 origin-center"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  cursor: pickingFrame || mode !== "select" ? "crosshair" : "grab",
                }}
              >
                <img src={project.planoUrl} alt="Plano" className="absolute inset-0 w-full h-full object-fill select-none" draggable={false} />

                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                  {/* Lotes guardados */}
                  {lots.map(lot => {
                    const pts = parseLotGeometry(lot.geometry);
                    if (pts.length < 3) return null;
                    const info = lotEstadoInfo(lot.estado);
                    const isSelected = selectedId === lot.id;
                    return (
                      <polygon
                        key={lot.id}
                        points={polygonPoints(pts)}
                        fill={info.color}
                        fillOpacity={dxf ? 0.15 : isSelected ? 0.75 : 0.4}
                        stroke={isSelected ? "#1A2440" : info.color}
                        strokeWidth={isSelected ? 2 : 1}
                        vectorEffect="non-scaling-stroke"
                        className="cursor-pointer"
                        onClick={e => { e.stopPropagation(); selectLot(lot); }}
                      />
                    );
                  })}

                  {/* Vista previa del DXF */}
                  {previewLots.map((pts, i) => (
                    <polygon
                      key={`preview-${i}`}
                      points={polygonPoints(pts)}
                      fill="#C8A23C" fillOpacity={0.35}
                      stroke="#C8A23C" strokeWidth={1} vectorEffect="non-scaling-stroke"
                    />
                  ))}

                  {/* Encuadre del DXF */}
                  {dxf && (
                    <rect
                      x={frame.x0} y={frame.y0}
                      width={frame.x1 - frame.x0} height={frame.y1 - frame.y0}
                      fill="none" stroke="#1A2440" strokeWidth={1.5}
                      strokeDasharray="4 3" vectorEffect="non-scaling-stroke"
                    />
                  )}

                  {/* Polígono pendiente de guardar */}
                  {pendingPolygon && (
                    <polygon
                      points={polygonPoints(pendingPolygon)}
                      fill="#1A2440" fillOpacity={0.45}
                      stroke="#C8A23C" strokeWidth={2} vectorEffect="non-scaling-stroke"
                    />
                  )}

                  {/* Trazado en curso */}
                  {draft.length > 0 && (
                    <>
                      <polyline
                        points={polygonPoints(draft)}
                        fill="none" stroke="#C8A23C" strokeWidth={2} vectorEffect="non-scaling-stroke"
                      />
                      {draft.map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r={0.4} fill="#C8A23C" />
                      ))}
                    </>
                  )}

                  {/* Primera esquina del rectángulo o del encuadre */}
                  {(rectStart || frameStart) && (
                    <circle
                      cx={(rectStart ?? frameStart)![0]} cy={(rectStart ?? frameStart)![1]}
                      r={0.5} fill="#C8A23C"
                    />
                  )}

                  {/* Etiquetas */}
                  {!dxf && lots.map(lot => {
                    const pts = parseLotGeometry(lot.geometry);
                    if (pts.length < 3) return null;
                    const [cx, cy] = polygonCentroid(pts);
                    return (
                      <text
                        key={`${lot.id}-label`}
                        x={cx} y={cy}
                        textAnchor="middle" dominantBaseline="middle"
                        fill="#1A2440" fontSize={0.9} className="pointer-events-none select-none"
                      >
                        {lot.codigo}
                      </text>
                    );
                  })}
                </svg>
              </div>
            </div>

            <p className="text-xs text-[var(--color-pf-navy)]/40 mt-3">
              {pickingFrame
                ? (frameStart ? "Ahora marca la esquina opuesta del loteo" : "Marca una esquina del loteo sobre el plano")
                : dxf
                ? "Revisa que los polígonos calcen con el plano antes de importar"
                : mode === "draw"
                ? "Clic en cada esquina · Enter para cerrar · Esc para descartar · arrastra para desplazarte"
                : mode === "rect"
                ? "Clic en dos esquinas opuestas del lote · Esc para descartar"
                : "Clic en un lote para editarlo · arrastra para desplazarte"}
            </p>
          </Card>

          {/* -------------------- Panel lateral -------------------- */}
          <div className="space-y-4">
            {dxf ? (
              <Card className="p-5">
                <CardTitle>Importar desde DXF</CardTitle>

                <div className="space-y-3">
                  <Field label="Capa de lotes" hint="Normalmente la que más polígonos tiene">
                    <Select
                      value={dxf.layerUsed ?? ""}
                      onChange={e => dxfFile && parseDxf(dxfFile, e.target.value)}
                    >
                      {dxf.layers.map(l => (
                        <option key={l.name} value={l.name}>{l.name} — {l.polygons} polígonos</option>
                      ))}
                    </Select>
                  </Field>

                  <div className="text-sm text-[var(--color-pf-navy)]/60 border-y border-black/5 py-3 space-y-1">
                    <div className="flex justify-between"><span>Lotes detectados</span><strong className="text-[var(--color-pf-navy)]">{dxf.lots.length}</strong></div>
                    <div className="flex justify-between"><span>Con código</span><strong className="text-[var(--color-pf-navy)]">{dxf.lots.filter(l => l.codigo).length}</strong></div>
                    <div className="flex justify-between"><span>Medidas del dibujo</span><strong className="text-[var(--color-pf-navy)]">{dxf.widthUnits} × {dxf.heightUnits}</strong></div>
                  </div>

                  <div>
                    <Button size="sm" variant="secondary" onClick={() => { setPickingFrame(true); setFrameStart(null); }}>
                      {pickingFrame ? "Marcando encuadre..." : "Ajustar encuadre"}
                    </Button>
                    <p className="text-xs text-[var(--color-pf-navy)]/40 mt-2">
                      Si los polígonos no calzan con el plano, marca las dos esquinas opuestas del loteo sobre la imagen.
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-[var(--color-pf-navy)]/70 cursor-pointer">
                    <input type="checkbox" checked={replaceExisting} onChange={e => setReplaceExisting(e.target.checked)} />
                    Borrar los {lots.length} lotes existentes
                  </label>
                </div>

                <div className="flex items-center gap-2 mt-5">
                  <Button onClick={confirmImport} disabled={importing || dxf.lots.length === 0}>
                    {importing ? "Importando..." : `Importar ${dxf.lots.length} lotes`}
                  </Button>
                  <Button variant="secondary" onClick={cancelImport}>Cancelar</Button>
                </div>
              </Card>
            ) : editing ? (
              <Card className="p-5">
                <CardTitle>{pendingPolygon ? "Nuevo lote" : "Editar lote"}</CardTitle>
                <div className="space-y-3">
                  <Field label="Código">
                    <TextInput
                      value={form.codigo}
                      onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                      placeholder="MZ1-L01"
                      autoFocus
                    />
                  </Field>
                  <Field label="Área (m²)">
                    <TextInput type="number" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="600" />
                  </Field>
                  <Field label="Precio (COP)">
                    <TextInput type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} placeholder="85000000" />
                  </Field>
                  <Field label="Estado">
                    <Select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                      {LOT_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </Select>
                  </Field>
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <Button onClick={handleSave} disabled={saving || !form.codigo.trim()}>
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                  <Button variant="secondary" onClick={() => { setPendingPolygon(null); setSelectedId(null); setForm(EMPTY_FORM); }}>
                    Cancelar
                  </Button>
                  {selectedId && (
                    <button onClick={handleDelete} className="ml-auto text-red-500 hover:text-red-600 transition-colors" aria-label="Eliminar lote">
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            ) : (
              <>
                <Card className="p-5">
                  <CardTitle hint="Trae todos los lotes de una vez">Importar DXF</CardTitle>
                  <p className="text-sm text-[var(--color-pf-navy)]/50 mb-4">
                    Sube el DXF del loteo y los polígonos se extraen automáticamente, con su código y su área.
                  </p>
                  <input ref={dxfInputRef} type="file" accept=".dxf" onChange={handleDxfPick} className="hidden" />
                  <Button variant="secondary" onClick={() => dxfInputRef.current?.click()}>
                    <Icon name="upload" className="w-4 h-4" /> Seleccionar DXF
                  </Button>
                  {dxfError && <p className="text-sm text-red-600 mt-3">{dxfError}</p>}
                </Card>

                <Card className="p-5">
                  <CardTitle>Lotes trazados</CardTitle>
                  {lots.length === 0 ? (
                    <p className="text-sm text-[var(--color-pf-navy)]/40">Aún no hay lotes.</p>
                  ) : (
                    <div className="max-h-[420px] overflow-y-auto -mx-1 px-1 divide-y divide-black/5">
                      {lots.map(lot => {
                        const info = lotEstadoInfo(lot.estado);
                        return (
                          <button
                            key={lot.id}
                            onClick={() => selectLot(lot)}
                            className="w-full flex items-center gap-3 py-2.5 text-left hover:bg-black/[0.03] rounded px-1 transition-colors"
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: info.color }} />
                            <span className="text-sm text-[var(--color-pf-navy)] flex-1">{lot.codigo}</span>
                            <span className="text-xs text-[var(--color-pf-navy)]/40">{lot.area ? `${lot.area} m²` : ""}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
