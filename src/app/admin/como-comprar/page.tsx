"use client";

import { useEffect, useState } from "react";

interface Step {
  id: string;
  numero: string;
  titulo: string;
  texto: string;
  orden: number;
}

export default function AdminComoComprar() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Step> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/como-comprar").then(r => r.json()).then(setSteps).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este paso?")) return;
    await fetch(`/api/como-comprar/${id}`, { method: "DELETE" });
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await fetch(`/api/como-comprar/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
      } else {
        await fetch("/api/como-comprar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editing, numero: String(steps.length + 1).padStart(2, "0"), orden: steps.length + 1 }),
        });
      }
      await load();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cómo Comprar — Pasos</h1>
          <p className="text-gray-500 mt-1">Edita los pasos del proceso de compra de un lote.</p>
        </div>
        <button onClick={() => setEditing({ titulo: "", texto: "" })} className="px-6 py-3 bg-[#16203A] text-white rounded-xl text-sm font-medium hover:bg-[#C8A23C] transition-colors">
          + Nuevo Paso
        </button>
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-5">
            <h2 className="text-xl font-bold text-gray-900">{editing.id ? "Editar Paso" : "Nuevo Paso"}</h2>
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Número (ej: 01)</label>
              <input type="text" value={editing.numero || ""} onChange={e => setEditing(prev => prev ? { ...prev, numero: e.target.value } : prev)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Título</label>
              <input type="text" value={editing.titulo || ""} onChange={e => setEditing(prev => prev ? { ...prev, titulo: e.target.value } : prev)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">Descripción</label>
              <textarea value={editing.texto || ""} onChange={e => setEditing(prev => prev ? { ...prev, texto: e.target.value } : prev)} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C]" />
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button onClick={() => setEditing(null)} className="px-5 py-2 border border-gray-200 text-gray-500 rounded-lg text-sm">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-8 py-2 bg-[#16203A] text-white rounded-lg text-sm hover:bg-[#C8A23C] transition-colors disabled:opacity-50">{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? <p className="text-gray-400">Cargando...</p> : (
        <div className="space-y-4">
          {steps.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex items-start gap-6">
              <div className="font-serif text-5xl font-light text-gray-200 flex-shrink-0">{s.numero}</div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg">{s.titulo}</div>
                <div className="text-sm text-gray-500 mt-2 leading-relaxed">{s.texto}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditing(s)} className="px-3 py-1 text-xs border border-[#16203A] text-[#16203A] rounded-lg hover:bg-[#16203A] hover:text-white transition-colors">Editar</button>
                <button onClick={() => handleDelete(s.id)} className="px-3 py-1 text-xs border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
