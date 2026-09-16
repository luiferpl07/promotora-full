"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asesores Comerciales</h1>
          <p className="text-gray-500 mt-1">Gestiona el equipo de asesores.</p>
        </div>
        <button onClick={() => setEditing({ nombre: "", rol: "", orden: advisors.length + 1 })} className="px-6 py-3 bg-[#16203A] text-white rounded-xl text-sm font-medium hover:bg-[#C8A23C] transition-colors">
          + Nuevo Asesor
        </button>
      </div>

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-5">
            <h2 className="text-xl font-bold text-gray-900">{editing.id ? "Editar Asesor" : "Nuevo Asesor"}</h2>
            {[
              { label: "Nombre", field: "nombre" },
              { label: "Rol / Proyecto", field: "rol" },
              { label: "Proyecto (slug)", field: "proyectoAsignado" },
              { label: "WhatsApp URL", field: "whatsapp" },
              { label: "Orden", field: "orden", type: "number" },
            ].map(({ label, field, type }) => (
              <div key={field}>
                <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">{label}</label>
                <input type={type || "text"} value={(editing as any)[field] || ""} onChange={e => setEditing(prev => prev ? { ...prev, [field]: type === "number" ? +e.target.value : e.target.value } : prev)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C]" />
              </div>
            ))}
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Foto</label>
              {editing.img && <Image src={editing.img} alt="" width={80} height={80} className="w-20 h-20 object-cover rounded-full mb-3" />}
              <input type="file" accept="image/*" onChange={uploadImg} className="text-sm" />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button onClick={() => setEditing(null)} className="px-5 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm hover:text-gray-700 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-8 py-2 bg-[#16203A] text-white rounded-lg text-sm hover:bg-[#C8A23C] transition-colors disabled:opacity-50">{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? <p className="text-gray-400">Cargando...</p> : advisors.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {a.img ? <Image src={a.img} alt={a.nombre} width={80} height={80} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">👤</div>}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{a.nombre}</div>
              <div className="text-sm text-[#C8A23C] font-mono uppercase tracking-widest">{a.rol}</div>
              {a.proyectoAsignado && <div className="text-xs text-gray-400 mt-1">{a.proyectoAsignado}</div>}
            </div>
            <div className="flex gap-2 w-full">
              <button onClick={() => setEditing(a)} className="flex-1 py-2 text-xs border border-[#16203A] text-[#16203A] rounded-lg hover:bg-[#16203A] hover:text-white transition-colors">Editar</button>
              <button onClick={() => handleDelete(a.id)} className="flex-1 py-2 text-xs border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
