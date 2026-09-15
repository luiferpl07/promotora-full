"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LOT_ESTADOS, lotEstadoInfo } from "@/lib/lotStatus";
import { parseLotGeometry, polygonPoints, polygonCentroid } from "@/lib/lotGeometry";

export interface ShowroomLot {
  id: string;
  codigo: string;
  geometry: string; // JSON array of [x,y] in percent of the plano image
  area: number | null;
  precio: number | null;
  estado: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const DRAG_THRESHOLD_PX = 5;

function formatPrecio(precio: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(precio);
}

// Best-effort "Manzana X" / "Parque" label from codes like "MZ-A-07" or
// "M122-06" — purely cosmetic, falls back to nothing if the code doesn't fit.
function zonaFromCodigo(codigo: string): string | null {
  const match = codigo.match(/^(.*)-\d+$/);
  if (!match) return null;
  const prefix = match[1].replace(/^MZ-?/i, "").trim();
  if (!prefix) return null;
  if (/^C$/i.test(prefix)) return "Parque Central";
  return `Manzana ${prefix}`;
}

export default function ProjectShowroom({
  imageUrl,
  aspectRatio,
  lots,
  projectName,
}: {
  imageUrl: string;
  aspectRatio: number; // height / width
  lots: ShowroomLot[];
  projectName: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<ShowroomLot | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);

  const dragRef = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0, moved: 0 });

  useEffect(() => {
    fetch("/api/site-config").then(r => r.json()).then(cfg => {
      if (cfg.social_whatsapp) setWhatsapp(cfg.social_whatsapp);
    }).catch(() => {});
  }, []);

  // Keeps the plano from being dragged off screen: at zoom z the image can
  // travel at most half of its overflow in each direction.
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

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: pan.x,
      originY: pan.y,
      moved: 0,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    d.moved = Math.max(d.moved, Math.abs(dx) + Math.abs(dy));
    setPan(clampPan({ x: d.originX + dx, y: d.originY + dy }, zoom));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current.active = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    // Pointer capture on this container retargets the native click event to
    // itself, so a polygon's own onClick never fires — resolve the lot from
    // the real element under the cursor instead.
    if (dragRef.current.moved > DRAG_THRESHOLD_PX) return;
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const lotId = target?.getAttribute("data-lot-id");
    if (lotId) {
      const lot = lots.find(l => l.id === lotId);
      if (lot) setSelected(lot);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    applyZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
  };

  const whatsappHref = (() => {
    if (!whatsapp || !selected) return null;
    const msg = `Hola, estoy interesado en el ${selected.codigo} del proyecto ${projectName}${selected.area ? ` (${selected.area} m²)` : ""}. ¿Me pueden dar más información?`;
    const sep = whatsapp.includes("?") ? "&" : "?";
    return `${whatsapp}${sep}text=${encodeURIComponent(msg)}`;
  })();

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-black/5 shadow-2xl bg-white">
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        className="relative w-full overflow-hidden touch-none"
        style={{ paddingBottom: `${aspectRatio * 100}%`, cursor: zoom > 1 ? "grab" : "default" }}
      >
        <div
          className="absolute inset-0 origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: dragRef.current.active ? "none" : "transform 0.25s ease-out",
          }}
        >
          <img src={imageUrl} alt={`Plano de ${projectName}`} className="absolute inset-0 w-full h-full object-fill select-none" draggable={false} />

          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {lots.map(lot => {
              const pts = parseLotGeometry(lot.geometry);
              if (pts.length < 3) return null;
              const info = lotEstadoInfo(lot.estado);
              const isActive = selected?.id === lot.id || hovered === lot.id;
              const [cx, cy] = polygonCentroid(pts);
              return (
                <g
                  key={lot.id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHovered(lot.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Real lot shape: invisible hit-area, outlined only on hover/selection */}
                  <polygon
                    data-lot-id={lot.id}
                    points={polygonPoints(pts)}
                    fill="transparent"
                    stroke={info.color}
                    strokeWidth={isActive ? 0.3 : 0}
                    strokeOpacity={0.9}
                    vectorEffect="non-scaling-stroke"
                    className="transition-[stroke-width] duration-150"
                  />
                  {/* Pin marker at the lot's center */}
                  <circle
                    data-lot-id={lot.id}
                    cx={cx}
                    cy={cy}
                    r={isActive ? 0.85 : 0.55}
                    fill={info.color}
                    stroke="white"
                    strokeWidth={0.2}
                    vectorEffect="non-scaling-stroke"
                    className="transition-[r] duration-150"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Vista general */}
      <button
        onClick={resetView}
        className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-2.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold text-[var(--color-pf-navy)] shadow-lg hover:bg-white transition-colors"
      >
        Vista General
      </button>

      {/* Zoom */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5">
        <button
          onClick={() => applyZoom(zoom * 1.4)}
          aria-label="Acercar"
          className="w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow-lg text-[var(--color-pf-navy)] text-lg leading-none hover:bg-white transition-colors"
        >+</button>
        <button
          onClick={() => applyZoom(zoom / 1.4)}
          aria-label="Alejar"
          className="w-9 h-9 rounded-full bg-white/95 backdrop-blur shadow-lg text-[var(--color-pf-navy)] text-lg leading-none hover:bg-white transition-colors"
        >−</button>
      </div>

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-3 flex flex-col gap-1.5">
        {LOT_ESTADOS.map(e => (
          <div key={e.value} className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--color-pf-navy)]/70">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
            {e.label}
          </div>
        ))}
      </div>

      {/* Panel del lote seleccionado */}
      {selected && (
        <div className="fixed z-50 bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto md:top-auto w-full md:w-[340px] max-h-[80vh] overflow-y-auto bg-white md:rounded-2xl rounded-t-2xl shadow-2xl p-6 text-left">
          <button
            onClick={() => setSelected(null)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 text-[var(--color-pf-navy)]/30 hover:text-[var(--color-pf-navy)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></svg>
          </button>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lotEstadoInfo(selected.estado).color }} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-pf-navy)]/50 font-mono">{lotEstadoInfo(selected.estado).label}</span>
          </div>
          <h3 className="font-serif text-2xl text-[var(--color-pf-navy)] mb-1">{selected.codigo}</h3>
          {selected.precio && (
            <div className="font-serif text-2xl font-medium text-[var(--color-pf-navy)] mb-4">{formatPrecio(selected.precio)}</div>
          )}
          <div className="flex flex-col mb-6">
            {selected.area && (
              <div className="flex items-center justify-between text-sm border-t border-black/5 py-3">
                <span className="flex items-center gap-2 text-[var(--color-pf-navy)]/50">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="1" /><path d="M4 9h16M9 4v16" /></svg>
                  Superficie total
                </span>
                <span className="font-medium text-[var(--color-pf-navy)]">{selected.area} m²</span>
              </div>
            )}
            {zonaFromCodigo(selected.codigo) && (
              <div className="flex items-center justify-between text-sm border-t border-black/5 py-3">
                <span className="flex items-center gap-2 text-[var(--color-pf-navy)]/50">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
                  Ubicación
                </span>
                <span className="font-medium text-[var(--color-pf-navy)]">{zonaFromCodigo(selected.codigo)}</span>
              </div>
            )}
          </div>
          {selected.estado === "disponible" ? (
            <div className="flex gap-3 flex-wrap">
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 !text-white hover:bg-emerald-700 transition-colors text-[11px] uppercase tracking-[0.15em] font-semibold">
                  Solicitar información
                </a>
              )}
              <Link href="/contacto" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--color-pf-navy)] text-[var(--color-pf-navy)] hover:bg-[var(--color-pf-navy)] hover:!text-white transition-colors text-[11px] uppercase tracking-[0.15em] font-semibold">
                Más información
              </Link>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-pf-navy)]/50">Este lote no está disponible actualmente.</p>
          )}
        </div>
      )}
    </div>
  );
}
