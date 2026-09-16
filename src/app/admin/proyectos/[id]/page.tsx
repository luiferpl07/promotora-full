"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [amenidadesList, setAmenidadesList] = useState<string[]>([]);
  const [newAmenidad, setNewAmenidad] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/projects/${params.id}`)
        .then(r => r.json())
        .then((data: Project) => {
          setForm(data);
          setImages(data.images || []);
          setAmenidadesList(data.amenidades ? JSON.parse(data.amenidades) : []);
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
    const updated = [...amenidadesList, newAmenidad.trim()];
    setAmenidadesList(updated);
    setForm(prev => ({ ...prev, amenidades: JSON.stringify(updated) }));
    setNewAmenidad("");
  };

  const removeAmenidad = (i: number) => {
    const updated = amenidadesList.filter((_, idx) => idx !== i);
    setAmenidadesList(updated);
    setForm(prev => ({ ...prev, amenidades: JSON.stringify(updated) }));
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

  if (loading) return <div className="p-12 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/proyectos" className="text-sm text-gray-400 hover:text-gray-600">← Proyectos</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{isNew ? "Nuevo Proyecto" : `Editar: ${form.nombre}`}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-[#16203A] text-white rounded-xl text-sm font-medium hover:bg-[#C8A23C] transition-colors disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Información Básica</h3>
          {[
            { label: "Nombre del Proyecto", field: "nombre" },
            { label: "Slug (URL)", field: "slug", hint: "ej: lagos-del-palmar" },
            { label: "Descripción Corta", field: "descripcion", textarea: true },
            { label: "Descripción Larga", field: "descripcionLarga", textarea: true },
          ].map(({ label, field, hint, textarea }) => (
            <div key={field}>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">{label}</label>
              {textarea ? (
                <textarea
                  value={(form as any)[field] || ""}
                  onChange={e => handleChange(field, e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C] transition-colors"
                />
              ) : (
                <input
                  type="text"
                  value={(form as any)[field] || ""}
                  onChange={e => handleChange(field, e.target.value)}
                  placeholder={hint}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C] transition-colors"
                />
              )}
            </div>
          ))}
        </div>

        {/* Stats & Config */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Estadísticas</h3>
            {[
              { label: "Número de Lotes", field: "lotes", type: "number" },
              { label: "Área Desde (m²)", field: "areaDesde", type: "number" },
              { label: "Precio Reserva", field: "reserva" },
              { label: "Plan de Pago", field: "planPago" },
              { label: "Orden en Portafolio", field: "orden", type: "number" },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">{label}</label>
                <input
                  type={type || "text"}
                  value={(form as any)[field] || ""}
                  onChange={e => handleChange(field, type === "number" ? +e.target.value : e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C] transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Estado</label>
              <select value={form.estado || "activo"} onChange={e => handleChange("estado", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C]">
                <option value="activo">Activo</option>
                <option value="proximamente">Próximamente</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500">Publicado</label>
              <button onClick={() => handleChange("publicado", !form.publicado)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.publicado ? "bg-[#C8A23C]" : "bg-gray-200"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.publicado ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Ubicación</h3>
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Texto de Ubicación</label>
              <input type="text" value={form.ubicacionTexto || ""} onChange={e => handleChange("ubicacionTexto", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">URL Embed de Google Maps</label>
              <textarea value={form.googleMapsUrl || ""} onChange={e => handleChange("googleMapsUrl", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C] font-mono text-xs" />
            </div>
          </div>
        </div>
      </div>

      {/* Logo del Proyecto */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-6">
          Logo del Proyecto <span className="text-xs text-gray-400 font-normal ml-2">(Aparecerá en el header cuando el visitante esté en este proyecto)</span>
        </h3>
        <div className="flex items-center gap-8">
          <div className="w-40 h-40 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden">
            {form.logo ? (
              <Image src={form.logo} alt="Logo" width={160} height={160} className="w-full h-full object-contain p-4" />
            ) : (
              <span className="text-gray-300 text-4xl">🛡️</span>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <p className="text-sm text-gray-500">Sube el escudo o logo oficial del proyecto. Recomendado: PNG con fondo transparente, mínimo 300x300px.</p>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading} className="px-6 py-3 border border-[#16203A] text-[#16203A] rounded-lg text-sm font-medium hover:bg-[#16203A] hover:text-white transition-colors">
              {logoUploading ? "Subiendo..." : "Subir Logo"}
            </button>
            {form.logo && <p className="text-xs text-gray-400 break-all">{form.logo}</p>}
          </div>
        </div>
      </div>

      {/* Imagen Hero */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-6">Imagen Principal (Hero)</h3>
        <div className="flex items-start gap-8">
          <div className="w-64 h-40 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
            {form.imgHero ? (
              <Image src={form.imgHero} alt="Hero" width={256} height={160} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">Sin imagen</div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" id="heroInput" />
            <label htmlFor="heroInput" className="cursor-pointer inline-block px-6 py-3 border border-[#16203A] text-[#16203A] rounded-lg text-sm font-medium hover:bg-[#16203A] hover:text-white transition-colors">
              {uploading ? "Subiendo..." : "Subir Imagen Hero"}
            </label>
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">O pega la URL:</label>
              <input type="text" value={form.imgHero || ""} onChange={e => handleChange("imgHero", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#C8A23C]" />
            </div>
          </div>
        </div>
      </div>

      {/* Galería de Imágenes */}
      {!isNew && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-6">
            Galería de Imágenes <span className="text-xs text-gray-400 font-normal ml-2">({images.length} imágenes)</span>
          </h3>

          {/* Upload zone */}
          <div className="mb-8">
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[#C8A23C] hover:text-[#C8A23C] transition-colors">
              {uploading ? "⏳ Subiendo imágenes..." : "+ Haz clic para subir imágenes (puedes seleccionar varias)"}
            </button>
          </div>

          {/* Grid de imágenes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <div className="aspect-[4/3] relative">
                  <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
                </div>
                <div className="p-2 space-y-2">
                  <select
                    value={img.tipo}
                    onChange={e => updateImageTipo(img, e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#C8A23C]"
                  >
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button onClick={() => deleteImage(img.id)} className="w-full text-xs text-red-400 hover:text-red-600 transition-colors">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenidades */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-6">Amenidades</h3>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newAmenidad}
            onChange={e => setNewAmenidad(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addAmenidad()}
            placeholder="ej: 9 Lagos Naturales"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#C8A23C]"
          />
          <button onClick={addAmenidad} className="px-6 py-2 bg-[#16203A] text-white rounded-lg text-sm hover:bg-[#C8A23C] transition-colors">Agregar</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {amenidadesList.map((a, i) => (
            <span key={i} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
              {a}
              <button onClick={() => removeAmenidad(i)} className="text-gray-400 hover:text-red-500 font-bold">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pb-8">
        <Link href="/admin/proyectos" className="px-6 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm hover:text-gray-700 transition-colors">
          Cancelar
        </Link>
        <button onClick={handleSave} disabled={saving} className="px-10 py-3 bg-[#16203A] text-white rounded-xl text-sm font-medium hover:bg-[#C8A23C] transition-colors disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
