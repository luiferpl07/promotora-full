"use client";

import { useState } from "react";
import { Button, Field, Icon, Select, TextInput } from "@/components/admin/AdminUI";
import { LOT_ESTADOS, lotEstadoInfo } from "@/lib/lotStatus";

export interface EditableLot {
  id: string;
  codigo: string;
  x: number;
  y: number;
  area: number | null;
  precio: number | null;
  estado: string;
}

type Draft = {
  id?: string;
  x: number;
  y: number;
  codigo: string;
  area: string;
  precio: string;
  estado: string;
};

export default function LotMapEditor({
  projectId, imageUrl, lots, onLotsChange,
}: {
  projectId: string;
  imageUrl: string;
  lots: EditableLot[];
  onLotsChange: (lots: EditableLot[]) => void;
}) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    setDraft({ x, y, codigo: `Lote ${lots.length + 1}`, area: "", precio: "", estado: "disponible" });
  };

  const editLot = (lot: EditableLot) => {
    setDraft({
      id: lot.id, x: lot.x, y: lot.y, codigo: lot.codigo,
      area: lot.area?.toString() || "", precio: lot.precio?.toString() || "", estado: lot.estado,
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const payload = {
        codigo: draft.codigo,
        x: draft.x,
        y: draft.y,
        area: draft.area ? parseFloat(draft.area) : null,
        precio: draft.precio ? parseFloat(draft.precio) : null,
        estado: draft.estado,
      };
      if (draft.id) {
        const res = await fetch(`/api/projects/${projectId}/lots/${draft.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        const updated = await res.json();
        onLotsChange(lots.map(l => l.id === updated.id ? updated : l));
      } else {
        const res = await fetch(`/api/projects/${projectId}/lots`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        const created = await res.json();
        onLotsChange([...lots, created]);
      }
      setDraft(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft?.id) return;
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/lots/${draft.id}`, { method: "DELETE" });
      onLotsChange(lots.filter(l => l.id !== draft.id));
      setDraft(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-pf-navy)]/50">Haz clic en cualquier punto del plano para agregar un lote ahí. Haz clic en un punto existente para editarlo o eliminarlo.</p>

      <div
        onClick={handleImageClick}
        className="relative w-full rounded-xl overflow-hidden border border-[var(--color-pf-navy)]/15 cursor-crosshair select-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Plano Maestro" className="w-full h-auto block pointer-events-none" draggable={false} />
        {lots.map((lot) => {
          const info = lotEstadoInfo(lot.estado);
          return (
            <button
              key={lot.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); editLot(lot); }}
              style={{ left: `${lot.x}%`, top: `${lot.y}%` }}
              title={lot.codigo}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ring-2 ring-white shadow-md hover:scale-125 transition-transform"
            >
              <span className="block w-full h-full rounded-full" style={{ backgroundColor: info.color }} />
            </button>
          );
        })}
        {draft && !draft.id && (
          <span
            style={{ left: `${draft.x}%`, top: `${draft.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full ring-[3px] ring-[var(--color-pf-gold)] bg-white pointer-events-none"
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        {LOT_ESTADOS.map((e) => (
          <div key={e.value} className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-[var(--color-pf-navy)]/50">
            <span className={`w-2.5 h-2.5 rounded-full ${e.dot}`} />
            {e.label}
          </div>
        ))}
        <span className="text-[11px] text-[var(--color-pf-navy)]/35 ml-auto">{lots.length} lote{lots.length !== 1 ? "s" : ""} ubicado{lots.length !== 1 ? "s" : ""}</span>
      </div>

      {draft && (
        <div className="bg-[var(--color-pf-beige-light)] rounded-xl border border-[var(--color-pf-navy)]/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-lg text-[var(--color-pf-navy)]">{draft.id ? "Editar Lote" : "Nuevo Lote"}</h4>
            <button onClick={() => setDraft(null)} className="text-[var(--color-pf-navy)]/40 hover:text-[var(--color-pf-navy)]" aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="4" y1="4" x2="20" y2="20" /><line x1="20" y1="4" x2="4" y2="20" /></svg>
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Código / Nombre del Lote">
              <TextInput value={draft.codigo} onChange={e => setDraft({ ...draft, codigo: e.target.value })} />
            </Field>
            <Field label="Estado">
              <Select value={draft.estado} onChange={e => setDraft({ ...draft, estado: e.target.value })}>
                {LOT_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </Select>
            </Field>
            <Field label="Área (m²)">
              <TextInput type="number" value={draft.area} onChange={e => setDraft({ ...draft, area: e.target.value })} />
            </Field>
            <Field label="Precio (COP)">
              <TextInput type="number" value={draft.precio} onChange={e => setDraft({ ...draft, precio: e.target.value })} />
            </Field>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving || !draft.codigo}>
              <Icon name="check" className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar"}
            </Button>
            {draft.id && (
              <Button variant="danger" onClick={handleDelete} disabled={saving}>
                <Icon name="trash" className="w-4 h-4" /> Eliminar
              </Button>
            )}
            <Button variant="ghost" onClick={() => setDraft(null)} disabled={saving}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
