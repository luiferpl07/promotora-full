"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button, Card, CardTitle, Field, Icon, LinkButton, LoadingBlock, TextArea, TextInput, Select, Toggle } from "@/components/admin/AdminUI";

interface ProjectImage {
  id: string;
  url: string;
  alt: string | null;
  tipo: string;
  orden: number;
}

interface Project {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  descripcionLarga: string | null;
  lotes: number | null;
  areaDesde: number | null;
  reserva: string | null;
  planPago: string | null;
  estado: string;
  logo: string | null;
  imgHero: string | null;
  ubicacionTexto: string | null;
  googleMapsUrl: string | null;
  amenidades: string | null;
  orden: number;
  publicado: boolean;
  images: ProjectImage[];
}

const TIPOS = ["hero", "galeria", "masterplan", "amenidad"];

interface Amenidad {
  texto: string;
  foto?: string;
}

function normalizeAmenidades(raw: string | null): Amenidad[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((a: any) => typeof a === "string" ? { texto: a } : a);
  } catch {
    return [];
  }
}

export default function AdminProyectoEditor() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "nuevo";
  const [form, setForm] = useState<Partial<Project>>({
    nombre: "", slug: "", descripcion: "", estado: "activo", publicado: true, orden: 1
  });
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [masterplanUploading, setMasterplanUploading] = useState(false);
  const [amenidadesList, setAmenidadesList] = useState<Amenidad[]>([]);
  const [newAmenidad, setNewAmenidad] = useState("");
  const [newAmenidadFoto, setNewAmenidadFoto] = useState<string | undefined>(undefined);
  const [amenidadFotoUploading, setAmenidadFotoUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const masterplanInputRef = useRef<HTMLInputElement>(null);
  const amenidadFotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/projects/${params.id}`)
        .then(r => r.json())
        .then((data: Project) => {
          setForm(data);
          setImages(data.images || []);
          setAmenidadesList(normalizeAmenidades(data.amenidades));
        })
        .finally(() => setLoading(false));
    }
  }, [params.id, isNew]);

  const handleChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const url = await uploadFile(file, "logos");
      setForm(prev => ({ ...prev, logo: url }));
    } finally {
      setLogoUploading(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, "projects");
      setForm(prev => ({ ...prev, imgHero: url }));
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const projectId = form.id!;
      for (const file of files) {
        const url = await uploadFile(file, "projects");
        const res = await fetch(`/api/projects/${projectId}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, alt: file.name, tipo: "galeria", orden: images.length }),
        });
        const newImg = await res.json();
        setImages(prev => [...prev, newImg]);
      }
    } finally {
      setUploading(false);
    }
  };

  const masterplanImage = images.find(i => i.tipo === "masterplan");

  const handleMasterplanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form.id) return;
    setMasterplanUploading(true);
    try {
      const url = await uploadFile(file, "projects");
      if (masterplanImage) {
        await fetch(`/api/projects/${form.id}/images/${masterplanImage.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        setImages(prev => prev.map(i => i.id === masterplanImage.id ? { ...i, url } : i));
      } else {
        const res = await fetch(`/api/projects/${form.id}/images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, alt: "Plano Maestro", tipo: "masterplan", orden: images.length }),
        });
        const newImg = await res.json();
        setImages(prev => [...prev, newImg]);
      }
    } finally {
      setMasterplanUploading(false);
    }
  };

  const removeMasterplan = async () => {
    if (!masterplanImage) return;
    await fetch(`/api/projects/${form.id}/images/${masterplanImage.id}`, { method: "DELETE" });
    setImages(prev => prev.filter(i => i.id !== masterplanImage.id));
  };

  const deleteImage = async (imgId: string) => {
    await fetch(`/api/projects/${form.id}/images/${imgId}`, { method: "DELETE" });
    setImages(prev => prev.filter(i => i.id !== imgId));
  };

  const updateImageTipo = async (img: ProjectImage, tipo: string) => {
    await fetch(`/api/projects/${form.id}/images/${img.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo }),
    });
    setImages(prev => prev.map(i => i.id === img.id ? { ...i, tipo } : i));
  };

  const addAmenidad = () => {
    if (!newAmenidad.trim()) return;
    const updated = [...amenidadesList, { texto: newAmenidad.trim(), foto: newAmenidadFoto }];
    setAmenidadesList(updated);
    setForm(prev => ({ ...prev, amenidades: JSON.stringify(updated) }));
    setNewAmenidad("");
    setNewAmenidadFoto(undefined);
  };

  const removeAmenidad = (i: number) => {
    const updated = amenidadesList.filter((_, idx) => idx !== i);
    setAmenidadesList(updated);
    setForm(prev => ({ ...prev, amenidades: JSON.stringify(updated) }));
  };

  const handleAmenidadFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAmenidadFotoUploading(true);
    try {
      const url = await uploadFile(file, "projects");
      setNewAmenidadFoto(url);
    } finally {
      setAmenidadFotoUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, amenidades: JSON.stringify(amenidadesList) };
      if (isNew) {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        router.push(`/admin/proyectos/${data.id}`);
      } else {
        await fetch(`/api/projects/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (!confirm(`¿Eliminar el proyecto "${form.nombre}"? Esta acción no se puede deshacer y borrará también su galería de imágenes.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/projects/${form.id}`, { method: "DELETE" });
      router.push("/admin/proyectos");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Link href="/admin/proyectos" className="text-xs uppercase tracking-widest font-mono text-[var(--color-pf-navy)]/40 hover:text-[var(--color-pf-gold)] transition-colors">← Proyectos</Link>
          <h1 className="font-serif font-light text-3xl text-[var(--color-pf-navy)] mt-1">{isNew ? "Nuevo Proyecto" : `Editar: ${form.nombre}`}</h1>
        </div>
        <div className="flex gap-3">
          {!isNew && (
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              <Icon name="trash" className="w-4 h-4" /> {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <Card className="p-6 space-y-5">
          <CardTitle>Información Básica</CardTitle>
          {[
            { label: "Nombre del Proyecto", field: "nombre" },
            { label: "Slug (URL)", field: "slug", hint: "ej: lagos-del-palmar" },
            { label: "Descripción Corta", field: "descripcion", textarea: true },
            { label: "Descripción Larga", field: "descripcionLarga", textarea: true },
          ].map(({ label, field, hint, textarea }) => (
            <Field key={field} label={label}>
              {textarea ? (
                <TextArea value={(form as any)[field] || ""} onChange={e => handleChange(field, e.target.value)} rows={3} />
              ) : (
                <TextInput type="text" value={(form as any)[field] || ""} onChange={e => handleChange(field, e.target.value)} placeholder={hint} />
              )}
            </Field>
          ))}
        </Card>

        {/* Stats & Config */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <CardTitle>Estadísticas</CardTitle>
            {[
              { label: "Número de Lotes", field: "lotes", type: "number" },
              { label: "Área Desde (m²)", field: "areaDesde", type: "number" },
              { label: "Precio Reserva", field: "reserva" },
              { label: "Plan de Pago", field: "planPago" },
              { label: "Orden en Portafolio", field: "orden", type: "number" },
            ].map(({ label, field, type }) => (
              <Field key={field} label={label}>
                <TextInput
                  type={type || "text"}
                  value={(form as any)[field] || ""}
                  onChange={e => handleChange(field, type === "number" ? +e.target.value : e.target.value)}
                />
              </Field>
            ))}
            <Field label="Estado">
              <Select value={form.estado || "activo"} onChange={e => handleChange("estado", e.target.value)}>
                <option value="activo">Activo</option>
                <option value="proximamente">Próximamente</option>
                <option value="agotado">Agotado</option>
              </Select>
            </Field>
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-medium text-[var(--color-pf-navy)]/50">Publicado</span>
              <Toggle checked={!!form.publicado} onChange={() => handleChange("publicado", !form.publicado)} />
            </div>
          </Card>

          {/* Ubicación */}
          <Card className="p-6 space-y-5">
            <CardTitle>Ubicación</CardTitle>
            <Field label="Texto de Ubicación">
              <TextInput type="text" value={form.ubicacionTexto || ""} onChange={e => handleChange("ubicacionTexto", e.target.value)} />
            </Field>
            <Field label="URL Embed de Google Maps">
              <TextArea value={form.googleMapsUrl || ""} onChange={e => handleChange("googleMapsUrl", e.target.value)} rows={3} className="font-mono text-xs" />
            </Field>
          </Card>
        </div>
      </div>

      {/* Logo del Proyecto */}
      <Card className="p-6">
        <CardTitle hint="(Aparecerá en el header cuando el visitante esté en este proyecto)">Logo del Proyecto</CardTitle>
        <div className="flex items-center gap-8">
          <div className="w-40 h-40 border-2 border-dashed border-[var(--color-pf-navy)]/15 rounded-xl flex items-center justify-center bg-[var(--color-pf-beige-light)] flex-shrink-0 overflow-hidden">
            {form.logo ? (
              <Image src={form.logo} alt="Logo" width={160} height={160} className="w-full h-full object-contain p-4" />
            ) : (
              <Icon name="shield" className="w-10 h-10 text-[var(--color-pf-navy)]/20" />
            )}
          </div>
          <div className="flex-1 space-y-4">
            <p className="text-sm text-[var(--color-pf-navy)]/50">Sube el escudo o logo oficial del proyecto. Recomendado: PNG con fondo transparente, mínimo 300x300px.</p>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <Button variant="outline" onClick={() => logoInputRef.current?.click()} disabled={logoUploading}>
              <Icon name="upload" className="w-4 h-4" /> {logoUploading ? "Subiendo..." : "Subir Logo"}
            </Button>
            {form.logo && <p className="text-xs text-[var(--color-pf-navy)]/30 break-all">{form.logo}</p>}
          </div>
        </div>
      </Card>

      {/* Imagen Hero */}
      <Card className="p-6">
        <CardTitle>Imagen Principal (Hero)</CardTitle>
        <div className="flex items-start gap-8 flex-wrap">
          <div className="w-64 h-40 border-2 border-dashed border-[var(--color-pf-navy)]/15 rounded-xl overflow-hidden bg-[var(--color-pf-beige-light)] flex-shrink-0">
            {form.imgHero ? (
              <Image src={form.imgHero} alt="Hero" width={256} height={160} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--color-pf-navy)]/20 text-sm">Sin imagen</div>
            )}
          </div>
          <div className="flex-1 space-y-4 min-w-[240px]">
            <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" id="heroInput" />
            <label htmlFor="heroInput" className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 border border-[var(--color-pf-navy)] text-[var(--color-pf-navy)] rounded-full text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-[var(--color-pf-navy)] hover:text-white transition-colors">
              <Icon name="upload" className="w-4 h-4" /> {uploading ? "Subiendo..." : "Subir Imagen Hero"}
            </label>
            <Field label="O pega la URL">
              <TextInput type="text" value={form.imgHero || ""} onChange={e => handleChange("imgHero", e.target.value)} />
            </Field>
          </div>
        </div>
      </Card>

      {/* Plano Maestro */}
      {!isNew && (
        <Card className="p-6">
          <CardTitle hint="(Se muestra en la sección “Plano Maestro” de la página del proyecto; si no se sube, se muestra el mapa en su lugar)">Plano Maestro</CardTitle>
          <div className="flex items-start gap-8 flex-wrap">
            <div className="w-64 h-40 border-2 border-dashed border-[var(--color-pf-navy)]/15 rounded-xl overflow-hidden bg-[var(--color-pf-beige-light)] flex-shrink-0">
              {masterplanImage ? (
                <Image src={masterplanImage.url} alt="Plano Maestro" width={256} height={160} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-pf-navy)]/20 text-sm text-center px-4">Sin plano subido</div>
              )}
            </div>
            <div className="flex-1 space-y-4 min-w-[240px]">
              <input ref={masterplanInputRef} type="file" accept="image/*" onChange={handleMasterplanUpload} className="hidden" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => masterplanInputRef.current?.click()} disabled={masterplanUploading}>
                  <Icon name="upload" className="w-4 h-4" /> {masterplanUploading ? "Subiendo..." : masterplanImage ? "Reemplazar Plano" : "Subir Plano"}
                </Button>
                {masterplanImage && (
                  <Button variant="danger" onClick={removeMasterplan}>
                    <Icon name="trash" className="w-4 h-4" /> Quitar
                  </Button>
                )}
              </div>
              <p className="text-sm text-[var(--color-pf-navy)]/50">Sube el plano maestro o de distribución de lotes del proyecto (imagen o escaneo del plano).</p>
            </div>
          </div>
        </Card>
      )}

      {/* Mapa Interactivo (ubicación real + lotes) */}
      {!isNew && (
        <Card className="p-6">
          <CardTitle hint="(Ubica el plano sobre el mapa satelital real y marca cada lote con su estado)">Mapa Interactivo</CardTitle>
          <p className="text-sm text-[var(--color-pf-navy)]/50 mb-4">Calibra la posición real del proyecto sobre un mapa satelital y ubica cada lote con su estado (disponible/reservado/vendido).</p>
          <LinkButton href={`/admin/proyectos/${form.id}/mapa`} variant="outline">
            <Icon name="external" className="w-4 h-4" /> Abrir Editor de Mapa
          </LinkButton>
        </Card>
      )}

      {/* Galería de Imágenes */}
      {!isNew && (
        <Card className="p-6">
          <CardTitle hint={`(${images.length} imágenes)`}>Galería de Imágenes</CardTitle>

          {/* Upload zone */}
          <div className="mb-8">
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full py-8 border-2 border-dashed border-[var(--color-pf-navy)]/15 rounded-xl text-sm text-[var(--color-pf-navy)]/40 hover:border-[var(--color-pf-gold)] hover:text-[var(--color-pf-gold)] transition-colors flex items-center justify-center gap-2">
              <Icon name="upload" className="w-4 h-4" />
              {uploading ? "Subiendo imágenes..." : "Haz clic para subir imágenes (puedes seleccionar varias)"}
            </button>
          </div>

          {/* Grid de imágenes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden border border-[var(--color-pf-navy)]/10 bg-[var(--color-pf-beige-light)]">
                <div className="aspect-[4/3] relative">
                  <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                </div>
                <div className="p-2 space-y-2">
                  <Select value={img.tipo} onChange={e => updateImageTipo(img, e.target.value)} className="!text-xs !py-1.5">
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                  <button onClick={() => deleteImage(img.id)} className="w-full text-xs text-red-400 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5 py-1">
                    <Icon name="trash" className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Amenidades */}
      <Card className="p-6">
        <CardTitle hint="(la foto es opcional; se muestra como ícono de la amenidad en el sitio)">Amenidades</CardTitle>
        <div className="flex gap-3 mb-2 flex-wrap items-start">
          <TextInput
            type="text"
            value={newAmenidad}
            onChange={e => setNewAmenidad(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addAmenidad()}
            placeholder="ej: 9 Lagos Naturales"
            className="flex-1 min-w-[200px]"
          />
          <input ref={amenidadFotoInputRef} type="file" accept="image/*" onChange={handleAmenidadFotoUpload} className="hidden" />
          <Button variant="outline" onClick={() => amenidadFotoInputRef.current?.click()} disabled={amenidadFotoUploading}>
            {newAmenidadFoto ? (
              <Image src={newAmenidadFoto} alt="" width={20} height={20} className="w-5 h-5 rounded object-cover" />
            ) : (
              <Icon name="image" className="w-4 h-4" />
            )}
            {amenidadFotoUploading ? "Subiendo..." : newAmenidadFoto ? "Foto lista" : "Foto (opcional)"}
          </Button>
          <Button onClick={addAmenidad}>Agregar</Button>
        </div>
        {newAmenidadFoto && (
          <button onClick={() => setNewAmenidadFoto(undefined)} className="text-xs text-[var(--color-pf-navy)]/40 hover:text-red-500 mb-4">Quitar foto seleccionada ×</button>
        )}
        <div className="flex flex-wrap gap-3 mt-4">
          {amenidadesList.map((a, i) => (
            <span key={i} className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-[var(--color-pf-beige-light)] rounded-full text-sm text-[var(--color-pf-navy)]">
              {a.foto ? (
                <Image src={a.foto} alt="" width={24} height={24} className="w-6 h-6 rounded-full object-cover" />
              ) : (
                <span className="w-6 h-6 rounded-full bg-[var(--color-pf-navy)]/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="check" className="w-3 h-3 text-[var(--color-pf-navy)]/40" />
                </span>
              )}
              {a.texto}
              <button onClick={() => removeAmenidad(i)} className="text-[var(--color-pf-navy)]/40 hover:text-red-500 font-bold">×</button>
            </span>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pb-8">
        <Link href="/admin/proyectos" className="px-6 py-3 border border-[var(--color-pf-navy)]/15 text-[var(--color-pf-navy)]/50 rounded-full text-[11px] uppercase tracking-[0.15em] font-semibold hover:text-[var(--color-pf-navy)] transition-colors flex items-center">
          Cancelar
        </Link>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
