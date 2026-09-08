"use client";

import { useState } from "react";
import Link from "next/link";
import { LOT_ESTADOS, lotEstadoInfo } from "@/lib/lotStatus";

export interface MapLot {
  id: string;
  codigo: string;
  x: number;
  y: number;
  area: number | null;
  precio: number | null;
  estado: string;
}

function formatPrecio(precio: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(precio);
}

export default function InteractiveLotMap({ imageUrl, lots }: { imageUrl: string; lots: MapLot[] }) {
  const [selected, setSelected] = useState<MapLot | null>(null);

  return (
    <div>
      <div className="relative w-full rounded-2xl overflow-hidden border border-black/5 bg-white shadow-2xl">
        {/* Natural aspect ratio, edge-to-edge — keeps pin % coordinates aligned with the image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Plano Maestro" className="w-full h-auto block select-none" draggable={false} />

        {lots.map((lot) => {
          const info = lotEstadoInfo(lot.estado);
          const isSelected = selected?.id === lot.id;
          return (
            <button
              key={lot.id}
              type="button"
              onClick={() => setSelected(isSelected ? null : lot)}
              aria-label={`Lote ${lot.codigo}`}
              style={{ left: `${lot.x}%`, top: `${lot.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
            >
              <span
                className={`block rounded-full ring-2 ring-white shadow-md transition-all duration-200 ${isSelected ? "w-5 h-5 ring-[3px] ring-[var(--color-pf-gold)]" : "w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-125"}`}
                style={{ backgroundColor: info.color }}
              />
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8">
        {LOT_ESTADOS.map((e) => (
          <div key={e.value} className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.15em] text-[var(--color-pf-navy)]/60">
            <span className={`w-2.5 h-2.5 rounded-full ${e.dot}`} />
            {e.label}
          </div>
        ))}
      </div>

      {/* Selected lot detail */}
      {selected && (
        <div className="mt-8 max-w-md mx-auto bg-white rounded-2xl border border-black/5 shadow-xl p-6 text-left relative">
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 text-[var(--color-pf-navy)]/30 hover:text-[var(--color-pf-navy)] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </button>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lotEstadoInfo(selected.estado).color }} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-pf-navy)]/50 font-mono">{lotEstadoInfo(selected.estado).label}</span>
          </div>
          <h3 className="font-serif text-2xl text-[var(--color-pf-navy)] mb-4">{selected.codigo}</h3>
          <div className="flex gap-8 mb-6">
            {selected.area && (
              <div>
                <div className="font-serif text-xl font-light text-[var(--color-pf-navy)]">{selected.area} m²</div>
                <div className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-pf-navy)]/40 mt-1">Área</div>
              </div>
            )}
            {selected.precio && (
              <div>
                <div className="font-serif text-xl font-light text-[var(--color-pf-navy)]">{formatPrecio(selected.precio)}</div>
                <div className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-pf-navy)]/40 mt-1">Precio</div>
              </div>
            )}
          </div>
          {selected.estado === "disponible" ? (
            <Link href="/contacto" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--color-pf-navy)] !text-white hover:bg-[var(--color-pf-gold)] hover:!text-[var(--color-pf-navy)] transition-colors text-[11px] uppercase tracking-[0.15em] font-semibold">
              Consultar disponibilidad
            </Link>
          ) : (
            <p className="text-sm text-[var(--color-pf-navy)]/50">Este lote no está disponible actualmente.</p>
          )}
        </div>
      )}
    </div>
  );
}
