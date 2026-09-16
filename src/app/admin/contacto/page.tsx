"use client";

import { useEffect, useState } from "react";

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
const estadoColor: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  contactado: "bg-blue-100 text-blue-800",
  cerrado: "bg-green-100 text-green-800",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Visita</h1>
          <p className="text-gray-500 mt-1">{requests.length} solicitudes totales · {requests.filter(r => r.estado === "pendiente").length} pendientes</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 flex-wrap">
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#C8A23C]">
          <option value="todos">Todos los estados</option>
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filterProyecto} onChange={e => setFilterProyecto(e.target.value)} className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#C8A23C]">
          {proyectos.map(p => <option key={p} value={p}>{p === "todos" ? "Todos los proyectos" : p}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Sin solicitudes.</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Teléfono</th>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Visita</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString("es-CO")}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{r.nombre}</td>
                  <td className="px-6 py-4">
                    <a href={`tel:${r.telefono}`} className="text-[#16203A] hover:text-[#C8A23C] transition-colors">{r.telefono}</a>
                  </td>
                  <td className="px-6 py-4">{r.proyecto}</td>
                  <td className="px-6 py-4 text-xs">{r.fechaVisita || "—"}</td>
                  <td className="px-6 py-4">
                    <select
                      value={r.estado}
                      onChange={e => updateEstado(r, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${estadoColor[r.estado] || "bg-gray-100 text-gray-600"}`}
                    >
                      {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <a href={`https://wa.me/${r.telefono.replace(/\D/g, "")}`} target="_blank" className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">WhatsApp</a>
                      <button onClick={() => handleDelete(r.id)} className="px-3 py-1 text-xs border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
