"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AdminNovedadEditor() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "nuevo";
  const [form, setForm] = useState({
    titulo: "", slug: "", resumen: "", contenido: "", imgDestacada: "", publicado: true,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/news/${params.id}`).then(r => r.json()).then(data => {
        setForm({ ...data, imgDestacada: data.imgDestacada || "", contenido: data.contenido || "" });
      }).finally(() => setLoading(false));
    }
  }, [params.id, isNew]);

  const handleChange = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const uploadImage = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "news");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url;
  };

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    setForm(prev => ({ ...prev, imgDestacada: url }));
  };

  const autoSlug = (titulo: string) =>
    titulo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, slug: form.slug || autoSlug(form.titulo) }),
        });
        const data = await res.json();
        router.push(`/admin/novedades/${data.id}`);
      } else {
        await fetch(`/api/news/${params.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/novedades" className="text-sm text-gray-400 hover:text-gray-600">← Novedades</Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{isNew ? "Nueva Novedad" : "Editar Novedad"}</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-[#16203A] text-white rounded-xl text-sm font-medium hover:bg-[#C8A23C] transition-colors disabled:opacity-50">
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Título</label>
          <input type="text" value={form.titulo} onChange={e => { handleChange("titulo", e.target.value); if (isNew) handleChange("slug", autoSlug(e.target.value)); }} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C]" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Slug (URL)</label>
          <input type="text" value={form.slug} onChange={e => handleChange("slug", e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#C8A23C]" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Resumen</label>
          <textarea value={form.resumen} onChange={e => handleChange("resumen", e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C]" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Contenido completo</label>
          <textarea value={form.contenido} onChange={e => handleChange("contenido", e.target.value)} rows={8} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C]" />
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-4">Imagen Destacada</label>
          <div className="flex items-start gap-6">
            <div className="w-40 h-28 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex-shrink-0">
              {form.imgDestacada ? <Image src={form.imgDestacada} alt="Preview" width={160} height={112} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Sin imagen</div>}
            </div>
            <div className="space-y-3">
              <input type="file" accept="image/*" onChange={handleImgUpload} id="imgInput" className="hidden" />
              <label htmlFor="imgInput" className="cursor-pointer inline-block px-5 py-2 border border-[#16203A] text-[#16203A] rounded-lg text-sm hover:bg-[#16203A] hover:text-white transition-colors">Subir Imagen</label>
              <input type="text" value={form.imgDestacada} onChange={e => handleChange("imgDestacada", e.target.value)} placeholder="O pega la URL" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C8A23C]" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="block text-xs uppercase tracking-widest font-medium text-gray-500">Publicada</label>
          <button onClick={() => handleChange("publicado", !form.publicado)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.publicado ? "bg-[#C8A23C]" : "bg-gray-200"}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.publicado ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
