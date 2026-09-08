"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardTitle, Icon, LinkButton, LoadingBlock } from "@/components/admin/AdminUI";
import MapAligner, { MapConfig } from "@/components/admin/MapAligner";

interface Project {
  id: string;
  nombre: string;
  mapImageUrl: string | null;
  mapCenterLat: number | null;
  mapCenterLng: number | null;
  mapRotationDeg: number | null;
  mapWidthMeters: number | null;
}

export default function AdminProyectoMapa() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProject = () => {
    fetch(`/api/projects/${projectId}`).then(r => r.json()).then(setProject).finally(() => setLoading(false));
  };

  useEffect(() => { loadProject(); }, [projectId]);

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
      // strip title block/table/compass/etc. so only the actual site plan shows
      await fetch(`/api/projects/${projectId}/map-image/clean`, { method: "POST" });
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
          <h1 className="font-serif font-light text-3xl text-[var(--color-pf-navy)] mt-2">Paso 1 · Ubicar el Plano</h1>
          <p className="text-[var(--color-pf-navy)]/50 mt-2 text-sm">Coloca el plano sobre su ubicación real. Cuando quede bien puesto, guarda y pasa al Paso 2 para trabajar los lotes con más zoom.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-emerald-600 text-sm flex items-center gap-1.5"><Icon name="check" className="w-4 h-4" /> Guardado</span>}
          {initialConfig && (
            <LinkButton href={`/admin/proyectos/${projectId}/mapa/lotes`}>
              Paso 2: Trabajar Lotes →
            </LinkButton>
          )}
        </div>
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
        <Card className="p-6">
          <CardTitle hint="(Arrastra los puntos para mover, rotar y escalar el plano hasta que calce con la foto satelital)">Alinear Plano</CardTitle>
          <MapAligner
            imageUrl={project.mapImageUrl}
            aspectRatio={aspectRatio}
            initialConfig={initialConfig}
            onSave={handleSaveConfig}
          />
        </Card>
      )}
    </div>
  );
}
