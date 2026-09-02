"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button, Card, Field, Icon, LoadingBlock, TextInput } from "@/components/admin/AdminUI";

interface Advisor {
  id: string;
  nombre: string;
  rol: string;
  proyectoAsignado: string | null;
  whatsapp: string | null;
  img: string | null;
  orden: number;
}

export default function AdminAsesores() {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Advisor> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/advisors").then(r => r.json()).then(setAdvisors).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este asesor?")) return;
    await fetch(`/api/advisors/${id}`, { method: "DELETE" });
    setAdvisors(prev => prev.filter(a => a.id !== id));
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await fetch(`/api/advisors/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
      } else {
        await fetch("/api/advisors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
      }
      await load();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const uploadImg = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "advisors");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setEditing(prev => prev ? { ...prev, img: data.url } : prev);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-pf-navy)]/40 mb-2">
            <span className="text-[var(--color-pf-gold)]">Equipo</span>
          </div>
          <h1 className="font-serif font-light text-3xl md:text-[34px] text-[var(--color-pf-navy)]">Asesores Comerciales</h1>
          <p className="text-[var(--color-pf-navy)]/50 mt-2 text-sm">Gestiona el equipo de asesores.</p>
        </div>
        <Button onClick={() => setEditing({ nombre: "", rol: "", orden: advisors.length + 1 })}>
          <Icon name="plus" className="w-4 h-4" /> Nuevo Asesor
        </Button>
      </div>

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 bg-[var(--color-pf-navy)]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-5">
            <h2 className="font-serif text-2xl text-[var(--color-pf-navy)]">{editing.id ? "Editar Asesor" : "Nuevo Asesor"}</h2>
            {[
              { label: "Nombre", field: "nombre" },
              { label: "Rol / Proyecto", field: "rol" },
              { label: "Proyecto (slug)", field: "proyectoAsignado" },
              { label: "WhatsApp URL", field: "whatsapp" },
              { label: "Orden", field: "orden", type: "number" },
            ].map(({ label, field, type }) => (
              <Field key={field} label={label}>
                <TextInput type={type || "text"} value={(editing as any)[field] || ""} onChange={e => setEditing(prev => prev ? { ...prev, [field]: type === "number" ? +e.target.value : e.target.value } : prev)} />
              </Field>
            ))}
            <div>
              <div className="block text-[10px] uppercase tracking-[0.2em] font-mono font-medium text-[var(--color-pf-navy)]/50 mb-2">Foto</div>
              {editing.img && <Image src={editing.img} alt="" width={80} height={80} className="w-20 h-20 object-cover rounded-full mb-3" />}
              <input type="file" accept="image/*" onChange={uploadImg} className="text-sm" />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? <LoadingBlock /> : advisors.map(a => (
          <Card key={a.id} className="p-6 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[var(--color-pf-beige-light)]">
              {a.img ? <Image src={a.img} alt={a.nombre} width={80} height={80} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Icon name="user" className="w-8 h-8 text-[var(--color-pf-navy)]/25" /></div>}
            </div>
            <div>
              <div className="font-semibold text-[var(--color-pf-navy)]">{a.nombre}</div>
              <div className="text-sm text-[var(--color-pf-gold)] font-mono uppercase tracking-widest">{a.rol}</div>
              {a.proyectoAsignado && <div className="text-xs text-[var(--color-pf-navy)]/35 mt-1">{a.proyectoAsignado}</div>}
            </div>
            <div className="flex gap-2 w-full">
              <button onClick={() => setEditing(a)} className="flex-1 py-2 text-xs uppercase tracking-widest font-mono border border-[var(--color-pf-navy)] text-[var(--color-pf-navy)] rounded-full hover:bg-[var(--color-pf-navy)] hover:text-white transition-colors">Editar</button>
              <button onClick={() => handleDelete(a.id)} className="flex-1 py-2 text-xs uppercase tracking-widest font-mono border border-red-200 text-red-400 rounded-full hover:bg-red-50 transition-colors">Eliminar</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
