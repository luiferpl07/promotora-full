"use client";

import { useEffect, useState } from "react";
import { Icon, LoadingBlock, PageHeader, Select, TableShell, Thead, EmptyBlock } from "@/components/admin/AdminUI";

interface ContactRequest {
  id: string;
  nombre: string;
  telefono: string;
  proyecto: string;
  fechaVisita: string | null;
  estado: string;
  notas: string | null;
  createdAt: string;
}

const ESTADOS = ["pendiente", "contactado", "cerrado"];
const estadoColor: Record<string, "amber" | "blue" | "green"> = {
  pendiente: "amber",
  contactado: "blue",
  cerrado: "green",
};

export default function AdminContacto() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterProyecto, setFilterProyecto] = useState("todos");

  useEffect(() => {
    fetch("/api/contact-requests").then(r => r.json()).then(setRequests).finally(() => setLoading(false));
  }, []);

  const updateEstado = async (req: ContactRequest, estado: string) => {
    await fetch(`/api/contact-requests/${req.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req, estado }),
    });
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, estado } : r));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta solicitud?")) return;
    await fetch(`/api/contact-requests/${id}`, { method: "DELETE" });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  const proyectos = ["todos", ...Array.from(new Set(requests.map(r => r.proyecto)))];
  const filtered = requests.filter(r =>
    (filterEstado === "todos" || r.estado === filterEstado) &&
    (filterProyecto === "todos" || r.proyecto === filterProyecto)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Concierge"
        title="Solicitudes de Visita"
        subtitle={`${requests.length} solicitudes totales · ${requests.filter(r => r.estado === "pendiente").length} pendientes`}
      />

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <Select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="w-auto">
          <option value="todos">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </Select>
        <Select value={filterProyecto} onChange={e => setFilterProyecto(e.target.value)} className="w-auto">
          {proyectos.map(p => <option key={p} value={p}>{p === "todos" ? "Todos los proyectos" : p}</option>)}
        </Select>
      </div>

      {loading ? (
        <TableShell><tbody><tr><td><LoadingBlock /></td></tr></tbody></TableShell>
      ) : filtered.length === 0 ? (
        <TableShell><tbody><tr><td><EmptyBlock label="Sin solicitudes." /></td></tr></tbody></TableShell>
      ) : (
        <TableShell>
          <Thead cols={["Fecha", "Nombre", "Teléfono", "Proyecto", "Visita", "Estado", "Acciones"]} />
          <tbody className="divide-y divide-[var(--color-pf-navy)]/5">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-[var(--color-pf-beige-light)]/60 transition-colors">
                <td className="px-6 py-4 text-xs text-[var(--color-pf-navy)]/40 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString("es-CO")}</td>
                <td className="px-6 py-4 font-medium text-[var(--color-pf-navy)]">{r.nombre}</td>
                <td className="px-6 py-4">
                  <a href={`tel:${r.telefono}`} className="text-[var(--color-pf-navy)] hover:text-[var(--color-pf-gold)] transition-colors">{r.telefono}</a>
                </td>
                <td className="px-6 py-4">{r.proyecto}</td>
                <td className="px-6 py-4 text-xs">{r.fechaVisita || "—"}</td>
                <td className="px-6 py-4">
                  <select
                    value={r.estado}
                    onChange={e => updateEstado(r, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer capitalize ${{ amber: "bg-amber-100 text-amber-800", blue: "bg-blue-100 text-blue-800", green: "bg-emerald-100 text-emerald-800" }[estadoColor[r.estado]] || "bg-gray-100 text-gray-600"}`}
                  >
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <a href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`} target="_blank" className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition-colors" title="WhatsApp">
                      <Icon name="external" className="w-4 h-4" />
                    </a>
                    <button onClick={() => handleDelete(r.id)} className="w-8 h-8 flex items-center justify-center border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
                      <Icon name="trash" className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </div>
  );
}
