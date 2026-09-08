"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Button, Field, TextInput } from "@/components/admin/AdminUI";
import { lotEstadoInfo } from "@/lib/lotStatus";

export interface MapConfig {
  lat: number;
  lng: number;
  rotationDeg: number;
  widthMeters: number;
}

export interface ExistingLot {
  id: string;
  geometry: string; // JSON array of {lat,lng}
  estado: string;
  codigo: string;
}

export interface MapAlignerHandle {
  finishDrawing: () => void;
  undoPoint: () => void;
  cancelDrawing: () => void;
}

const DEFAULT_CONFIG: MapConfig = { lat: 4.5709, lng: -74.2973, rotationDeg: 0, widthMeters: 500 };
const METERS_PER_DEG_LAT = 111320;
const metersPerDegLng = (lat: number) => 111320 * Math.cos((lat * Math.PI) / 180);

function metersToLatLng(center: { lat: number; lng: number }, eastM: number, northM: number) {
  return {
    lat: center.lat + northM / METERS_PER_DEG_LAT,
    lng: center.lng + eastM / metersPerDegLng(center.lat),
  };
}
function latLngToMeters(center: { lat: number; lng: number }, p: { lat: number; lng: number }) {
  return {
    eastM: (p.lng - center.lng) * metersPerDegLng(center.lat),
    northM: (p.lat - center.lat) * METERS_PER_DEG_LAT,
  };
}
function rotateCW(x: number, y: number, deg: number) {
  const t = (deg * Math.PI) / 180;
  return { x: x * Math.cos(t) + y * Math.sin(t), y: -x * Math.sin(t) + y * Math.cos(t) };
}

const MapAligner = forwardRef<MapAlignerHandle, {
  imageUrl: string;
  initialConfig: MapConfig | null;
  aspectRatio: number; // height / width of the source image
  onSave: (config: MapConfig) => void;
  lotMode?: boolean;
  onDrawingChange?: (pointCount: number) => void;
  onLotComplete?: (points: { lat: number; lng: number }[]) => void;
  existingLots?: ExistingLot[];
}>(function MapAligner(
  { imageUrl, initialConfig, aspectRatio, onSave, lotMode, onDrawingChange, onLotComplete, existingLots },
  ref
) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const LRef = useRef<any>(null);
  const overlayRef = useRef<any>(null);
  const centerMarkerRef = useRef<any>(null);
  const rotateMarkerRef = useRef<any>(null);
  const scaleMarkerRef = useRef<any>(null);
  const cfgRef = useRef<MapConfig>(initialConfig || DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [ready, setReady] = useState(false);

  const lotModeRef = useRef(lotMode);
  lotModeRef.current = lotMode;
  const onDrawingChangeRef = useRef(onDrawingChange);
  onDrawingChangeRef.current = onDrawingChange;
  const onLotCompleteRef = useRef(onLotComplete);
  onLotCompleteRef.current = onLotComplete;

  const drawPointsRef = useRef<{ lat: number; lng: number }[]>([]);
  const drawLayerRef = useRef<any>(null);
  const lotsLayerRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    finishDrawing() {
      if (drawPointsRef.current.length >= 3 && onLotCompleteRef.current) {
        onLotCompleteRef.current([...drawPointsRef.current]);
      }
      drawPointsRef.current = [];
      drawLayerRef.current?.setLatLngs([]);
      onDrawingChangeRef.current?.(0);
    },
    undoPoint() {
      drawPointsRef.current = drawPointsRef.current.slice(0, -1);
      drawLayerRef.current?.setLatLngs(drawPointsRef.current.map(p => [p.lat, p.lng]));
      onDrawingChangeRef.current?.(drawPointsRef.current.length);
    },
    cancelDrawing() {
      drawPointsRef.current = [];
      drawLayerRef.current?.setLatLngs([]);
      onDrawingChangeRef.current?.(0);
    },
  }));

  useEffect(() => {
    let map: any;
    let cleanup = () => {};

    (async () => {
      const L = (await import("leaflet")).default;
      const { registerRotatedImageOverlay } = await import("@/lib/leafletRotatedOverlay");
      registerRotatedImageOverlay(L);
      LRef.current = L;

      if (!mapDivRef.current || mapRef.current) return;

      map = L.map(mapDivRef.current, { zoomControl: true }).setView(
        [cfgRef.current.lat, cfgRef.current.lng],
        17
      );
      mapRef.current = map;

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Esri World Imagery" }
      ).addTo(map);

      const computeCorners = () => {
        const { lat, lng, rotationDeg, widthMeters } = cfgRef.current;
        const heightMeters = widthMeters * aspectRatio;
        const tl0 = rotateCW(-widthMeters / 2, heightMeters / 2, rotationDeg);
        const tr0 = rotateCW(widthMeters / 2, heightMeters / 2, rotationDeg);
        const bl0 = rotateCW(-widthMeters / 2, -heightMeters / 2, rotationDeg);
        return {
          topleft: metersToLatLng({ lat, lng }, tl0.x, tl0.y),
          topright: metersToLatLng({ lat, lng }, tr0.x, tr0.y),
          bottomleft: metersToLatLng({ lat, lng }, bl0.x, bl0.y),
        };
      };

      const rotateHandlePos = () => {
        const { lat, lng, rotationDeg, widthMeters } = cfgRef.current;
        const heightMeters = widthMeters * aspectRatio;
        const p = rotateCW(0, heightMeters / 2 + Math.max(20, widthMeters * 0.12), rotationDeg);
        return metersToLatLng({ lat, lng }, p.x, p.y);
      };
      const scaleHandlePos = () => {
        const { lat, lng, rotationDeg, widthMeters } = cfgRef.current;
        const p = rotateCW(widthMeters / 2, 0, rotationDeg);
        return metersToLatLng({ lat, lng }, p.x, p.y);
      };

      const corners = computeCorners();
      const overlay = (L as any).imageOverlay
        .rotated(imageUrl, corners.topleft, corners.topright, corners.bottomleft, {
          opacity: 0.85,
          interactive: false,
        })
        .addTo(map);
      overlayRef.current = overlay;

      const recompute = () => {
        const c = computeCorners();
        overlay.reposition(c.topleft, c.topright, c.bottomleft);
        rotateMarkerRef.current?.setLatLng(rotateHandlePos());
        scaleMarkerRef.current?.setLatLng(scaleHandlePos());
      };

      const dot = (color: string, label: string) =>
        L.divIcon({
          className: "",
          html: `<div title="${label}" style="width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5);cursor:grab"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

      const centerMarker = L.marker([cfgRef.current.lat, cfgRef.current.lng], {
        draggable: true,
        icon: dot("#16203A", "Mover"),
        zIndexOffset: 1000,
      }).addTo(map);
      centerMarkerRef.current = centerMarker;
      centerMarker.on("drag", (e: any) => {
        const p = e.target.getLatLng();
        cfgRef.current = { ...cfgRef.current, lat: p.lat, lng: p.lng };
        recompute();
      });

      const rotateMarker = L.marker(rotateHandlePos(), {
        draggable: true,
        icon: dot("#C8A23C", "Rotar"),
        zIndexOffset: 1000,
      }).addTo(map);
      rotateMarkerRef.current = rotateMarker;
      rotateMarker.on("drag", (e: any) => {
        const p = e.target.getLatLng();
        const { eastM, northM } = latLngToMeters(cfgRef.current, p);
        const deg = (Math.atan2(eastM, northM) * 180) / Math.PI;
        cfgRef.current = { ...cfgRef.current, rotationDeg: deg };
        recompute();
      });

      const scaleMarker = L.marker(scaleHandlePos(), {
        draggable: true,
        icon: dot("#1F4E9C", "Escalar"),
        zIndexOffset: 1000,
      }).addTo(map);
      scaleMarkerRef.current = scaleMarker;
      scaleMarker.on("drag", (e: any) => {
        const p = e.target.getLatLng();
        const { eastM, northM } = latLngToMeters(cfgRef.current, p);
        const dist = Math.sqrt(eastM * eastM + northM * northM);
        cfgRef.current = { ...cfgRef.current, widthMeters: Math.max(20, dist * 2) };
        recompute();
      });

      // in-progress lot polygon while drawing
      const drawLayer = L.polygon([], {
        color: "#C8A23C", weight: 2, fillColor: "#C8A23C", fillOpacity: 0.25, dashArray: "6,4",
      }).addTo(map);
      drawLayerRef.current = drawLayer;

      lotsLayerRef.current = L.layerGroup().addTo(map);

      map.on("click", (e: any) => {
        if (!lotModeRef.current) return;
        drawPointsRef.current = [...drawPointsRef.current, { lat: e.latlng.lat, lng: e.latlng.lng }];
        drawLayer.setLatLngs(drawPointsRef.current.map(p => [p.lat, p.lng]));
        onDrawingChangeRef.current?.(drawPointsRef.current.length);
      });

      setReady(true);
      cleanup = () => map.remove();
    })();

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, aspectRatio]);

  // keep existing lots rendered as colored polygons
  useEffect(() => {
    if (!ready || !lotsLayerRef.current) return;
    const layer = lotsLayerRef.current;
    layer.clearLayers();
    const L = LRef.current;
    (existingLots || []).forEach(lot => {
      try {
        const pts = JSON.parse(lot.geometry) as { lat: number; lng: number }[];
        const info = lotEstadoInfo(lot.estado);
        L.polygon(pts.map(p => [p.lat, p.lng]), {
          color: info.color, weight: 2, fillColor: info.color, fillOpacity: 0.45,
        }).bindTooltip(lot.codigo).addTo(layer);
      } catch {}
    });
  }, [ready, existingLots]);

  const handleSearch = async () => {
    if (!search.trim() || !mapRef.current) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(search)}`);
      const results = await res.json();
      if (results?.[0]) {
        mapRef.current.setView([parseFloat(results[0].lat), parseFloat(results[0].lon)], 17);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSave = () => {
    setSaving(true);
    onSave(cfgRef.current);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[240px]">
          <Field label="Buscar ubicación">
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ej: Chinú, Córdoba, Colombia"
            />
          </Field>
        </div>
        <Button variant="outline" onClick={handleSearch} disabled={searching}>
          {searching ? "Buscando..." : "Buscar"}
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar posición"}
        </Button>
      </div>
      <p className="text-[11px] text-[var(--color-pf-navy)]/40">
        <span className="inline-flex items-center gap-1.5 mr-4"><span className="w-2.5 h-2.5 rounded-full bg-[#16203A] inline-block" /> Mover</span>
        <span className="inline-flex items-center gap-1.5 mr-4"><span className="w-2.5 h-2.5 rounded-full bg-[#C8A23C] inline-block" /> Rotar</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1F4E9C] inline-block" /> Escalar</span>
        {lotMode && <span className="ml-4 text-[var(--color-pf-gold)]">Modo lotes: clic para marcar cada esquina del lote</span>}
      </p>
      <div ref={mapDivRef} className="w-full h-[600px] rounded-xl overflow-hidden border border-[var(--color-pf-navy)]/15" />
    </div>
  );
});

export default MapAligner;
