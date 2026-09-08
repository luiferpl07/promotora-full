"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { LOT_ESTADOS, lotEstadoInfo } from "@/lib/lotStatus";
import { imageFractionToLatLng, type MapConfig } from "@/lib/geoTransform";

export interface ShowroomLot {
  id: string;
  codigo: string;
  geometry: string; // JSON array of {lat,lng}
  area: number | null;
  precio: number | null;
  estado: string;
}

function formatPrecio(precio: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(precio);
}

export default function ProjectShowroom({
  imageUrl,
  config,
  aspectRatio,
  lots,
  projectName,
}: {
  imageUrl: string;
  config: MapConfig;
  aspectRatio: number;
  lots: ShowroomLot[];
  projectName: string;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const fitBoundsRef = useRef<any>(null);
  const [selected, setSelected] = useState<ShowroomLot | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/site-config").then(r => r.json()).then(cfg => {
      if (cfg.social_whatsapp) setWhatsapp(cfg.social_whatsapp);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let map: any;
    let cleanup = () => {};

    (async () => {
      const L = (await import("leaflet")).default;
      const { registerRotatedImageOverlay } = await import("@/lib/leafletRotatedOverlay");
      registerRotatedImageOverlay(L);

      if (!mapDivRef.current || mapRef.current) return;

      const corners4 = [
        imageFractionToLatLng(0, 0, aspectRatio, config),
        imageFractionToLatLng(1, 0, aspectRatio, config),
        imageFractionToLatLng(1, 1, aspectRatio, config),
        imageFractionToLatLng(0, 1, aspectRatio, config),
      ];
      const lats = corners4.map(c => c.lat), lngs = corners4.map(c => c.lng);
      const planBounds = L.latLngBounds(
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      );
      const padded = planBounds.pad(0.35);

      map = L.map(mapDivRef.current, {
        zoomControl: false,
        maxBounds: padded,
        maxBoundsViscosity: 1.0,
      });
      mapRef.current = map;
      map.fitBounds(planBounds.pad(0.06));
      fitBoundsRef.current = () => map.flyToBounds(planBounds.pad(0.06), { duration: 0.6 });

      const fitZoom = map.getZoom();
      map.setMinZoom(Math.max(1, fitZoom - 2));
      map.setMaxZoom(22);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 22, maxNativeZoom: 19, attribution: "Esri" }
      ).addTo(map);

      const corners = {
        topleft: imageFractionToLatLng(0, 0, aspectRatio, config),
        topright: imageFractionToLatLng(1, 0, aspectRatio, config),
        bottomleft: imageFractionToLatLng(0, 1, aspectRatio, config),
      };
      (L as any).imageOverlay
        .rotated(imageUrl, corners.topleft, corners.topright, corners.bottomleft, {
          opacity: 0.92, interactive: false,
        })
        .addTo(map);

      const lotsLayer = L.layerGroup().addTo(map);
      const polyByLot = new Map<string, any>();
      const selectedIdRef = { current: null as string | null };

      function selectLot(id: string | null) {
        polyByLot.forEach((p, pid) => {
          if (pid === id) {
            p.setStyle({ weight: 3, fillOpacity: 0.7 });
            p.bringToFront();
          } else {
            p.setStyle({ weight: 1.5, fillOpacity: 0.45 });
          }
        });
        selectedIdRef.current = id;
        setSelected(id ? lots.find(l => l.id === id) || null : null);
      }

      lots.forEach(lot => {
        try {
          const pts = JSON.parse(lot.geometry) as { lat: number; lng: number }[];
          const info = lotEstadoInfo(lot.estado);
          const poly = L.polygon(pts.map(p => [p.lat, p.lng]), {
            color: info.color, weight: 1.5, fillColor: info.color, fillOpacity: 0.45,
          }).addTo(lotsLayer);

          poly.bindTooltip(
            `<div style="font-family:inherit"><strong>${lot.codigo}</strong>${lot.area ? `<br/>${lot.area} m²` : ""}<br/>${info.label}</div>`,
            { sticky: true, direction: "top", className: "pf-lot-tooltip" }
          );

          poly.on("mouseover", () => { if (selectedIdRef.current !== lot.id) poly.setStyle({ weight: 3, fillOpacity: 0.65 }); });
          poly.on("mouseout", () => {
            if (selectedIdRef.current !== lot.id) poly.setStyle({ weight: 1.5, fillOpacity: 0.45 });
          });
          poly.on("click", (e: any) => {
            L.DomEvent.stopPropagation(e);
            selectLot(lot.id);
          });
          polyByLot.set(lot.id, poly);
        } catch {}
      });

      map.on("click", () => selectLot(null));

      cleanup = () => map.remove();
    })();

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, aspectRatio]);

  const whatsappHref = (() => {
    if (!whatsapp || !selected) return null;
    const msg = `Hola, estoy interesado en el ${selected.codigo} del proyecto ${projectName}${selected.area ? ` (${selected.area} m²)` : ""}. ¿Me pueden dar más información?`;
    const sep = whatsapp.includes("?") ? "&" : "?";
    return `${whatsapp}${sep}text=${encodeURIComponent(msg)}`;
  })();

  return (
    <div className="relative w-full h-[75vh] min-h-[480px] rounded-2xl overflow-hidden border border-black/5 shadow-2xl bg-white">
      <div ref={mapDivRef} className="absolute inset-0" />

      {/* Vista general */}
      <button
        onClick={() => fitBoundsRef.current?.()}
        className="absolute top-4 left-4 z-[500] bg-white/95 backdrop-blur px-4 py-2.5 rounded-full text-[10px] uppercase tracking-[0.15em] font-semibold text-[var(--color-pf-navy)] shadow-lg hover:bg-white transition-colors"
      >
        Vista General
      </button>

      {/* Leyenda */}
      <div className="absolute top-4 right-4 z-[500] bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-3 flex flex-col gap-1.5">
        {LOT_ESTADOS.map(e => (
          <div key={e.value} className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--color-pf-navy)]/70">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
            {e.label}
          </div>
        ))}
      </div>

      {/* Panel del lote seleccionado */}
      {selected && (
        <div className="absolute bottom-0 left-0 right-0 md:bottom-4 md:right-4 md:left-auto z-[500] w-full md:w-[340px] bg-white md:rounded-2xl rounded-t-2xl shadow-2xl p-6">
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
            <div className="flex gap-3 flex-wrap">
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 !text-white hover:bg-emerald-700 transition-colors text-[11px] uppercase tracking-[0.15em] font-semibold">
                  Quiero este lote
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
