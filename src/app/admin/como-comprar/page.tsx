"use client";

import { useEffect, useState } from "react";
import { Button, Card, Field, Icon, LoadingBlock, TextArea, TextInput } from "@/components/admin/AdminUI";

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
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-pf-navy)]/40 mb-2">
            <span className="text-[var(--color-pf-gold)]">Proceso</span>
          </div>
          <h1 className="font-serif font-light text-3xl md:text-[34px] text-[var(--color-pf-navy)]">Cómo Comprar — Pasos</h1>
          <p className="text-[var(--color-pf-navy)]/50 mt-2 text-sm">Edita los pasos del proceso de compra de un lote.</p>
        </div>
        <Button onClick={() => setEditing({ titulo: "", texto: "" })}>
          <Icon name="plus" className="w-4 h-4" /> Nuevo Paso
        </Button>
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 bg-[var(--color-pf-navy)]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 space-y-5">
            <h2 className="font-serif text-2xl text-[var(--color-pf-navy)]">{editing.id ? "Editar Paso" : "Nuevo Paso"}</h2>
            <Field label="Número (ej: 01)">
              <TextInput type="text" value={editing.numero || ""} onChange={e => setEditing(prev => prev ? { ...prev, numero: e.target.value } : prev)} />
            </Field>
            <Field label="Título">
              <TextInput type="text" value={editing.titulo || ""} onChange={e => setEditing(prev => prev ? { ...prev, titulo: e.target.value } : prev)} />
            </Field>
            <Field label="Descripción">
              <TextArea value={editing.texto || ""} onChange={e => setEditing(prev => prev ? { ...prev, texto: e.target.value } : prev)} rows={4} />
            </Field>
            <div className="flex gap-3 justify-end pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
            </div>
          </div>
        </div>
      )}

      {loading ? <LoadingBlock /> : (
        <div className="space-y-4">
          {steps.map(s => (
            <Card key={s.id} className="p-6 flex items-start gap-6">
              <div className="font-serif text-5xl font-light text-[var(--color-pf-navy)]/10 flex-shrink-0">{s.numero}</div>
              <div className="flex-1">
                <div className="font-semibold text-[var(--color-pf-navy)] text-lg">{s.titulo}</div>
                <div className="text-sm text-[var(--color-pf-navy)]/50 mt-2 leading-relaxed">{s.texto}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditing(s)} className="px-3 py-1 text-xs uppercase tracking-widest font-mono border border-[var(--color-pf-navy)] text-[var(--color-pf-navy)] rounded-full hover:bg-[var(--color-pf-navy)] hover:text-white transition-colors">Editar</button>
                <button onClick={() => handleDelete(s.id)} className="px-3 py-1 text-xs uppercase tracking-widest font-mono border border-red-200 text-red-400 rounded-full hover:bg-red-50 transition-colors">Eliminar</button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
