"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, Field, Icon, LoadingBlock, TextArea, TextInput, Toggle } from "@/components/admin/AdminUI";

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
    titulo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

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

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/novedades" className="text-xs uppercase tracking-widest font-mono text-[var(--color-pf-navy)]/40 hover:text-[var(--color-pf-gold)] transition-colors">← Novedades</Link>
          <h1 className="font-serif font-light text-3xl text-[var(--color-pf-navy)] mt-1">{isNew ? "Nueva Novedad" : "Editar Novedad"}</h1>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      <Card className="p-6 space-y-5">
        <Field label="Título">
          <TextInput type="text" value={form.titulo} onChange={e => { handleChange("titulo", e.target.value); if (isNew) handleChange("slug", autoSlug(e.target.value)); }} />
        </Field>
        <Field label="Slug (URL)">
          <TextInput type="text" value={form.slug} onChange={e => handleChange("slug", e.target.value)} className="font-mono" />
        </Field>
        <Field label="Resumen">
          <TextArea value={form.resumen} onChange={e => handleChange("resumen", e.target.value)} rows={3} />
        </Field>
        <Field label="Contenido completo" hint="Se muestra en la página de detalle de la novedad.">
          <TextArea value={form.contenido} onChange={e => handleChange("contenido", e.target.value)} rows={8} />
        </Field>

        {/* Imagen */}
        <div>
          <div className="block text-[10px] uppercase tracking-[0.2em] font-mono font-medium text-[var(--color-pf-navy)]/50 mb-4">Imagen Destacada</div>
          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-40 h-28 rounded-xl overflow-hidden border-2 border-dashed border-[var(--color-pf-navy)]/15 bg-[var(--color-pf-beige-light)] flex-shrink-0">
              {form.imgDestacada ? <Image src={form.imgDestacada} alt="Preview" width={160} height={112} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[var(--color-pf-navy)]/25 text-sm">Sin imagen</div>}
            </div>
            <div className="space-y-3 flex-1 min-w-[200px]">
              <input type="file" accept="image/*" onChange={handleImgUpload} id="imgInput" className="hidden" />
              <label htmlFor="imgInput" className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--color-pf-navy)] text-[var(--color-pf-navy)] rounded-full text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-[var(--color-pf-navy)] hover:text-white transition-colors">
                <Icon name="upload" className="w-4 h-4" /> Subir Imagen
              </label>
              <TextInput type="text" value={form.imgDestacada} onChange={e => handleChange("imgDestacada", e.target.value)} placeholder="O pega la URL" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-medium text-[var(--color-pf-navy)]/50">Publicada</span>
          <Toggle checked={form.publicado} onChange={() => handleChange("publicado", !form.publicado)} />
        </div>
      </Card>
    </div>
  );
}
