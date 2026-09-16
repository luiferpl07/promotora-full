"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  proyectos: number;
  solicitudes: number;
  novedades: number;
  asesores: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ proyectos: 0, solicitudes: 0, novedades: 0, asesores: 0 });
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/contact-requests").then(r => r.json()),
      fetch("/api/news").then(r => r.json()),
      fetch("/api/advisors").then(r => r.json()),
    ]).then(([projects, contactReqs, news, advisors]) => {
      setStats({
        proyectos: Array.isArray(projects) ? projects.length : 0,
        solicitudes: Array.isArray(contactReqs) ? contactReqs.length : 0,
        novedades: Array.isArray(news) ? news.length : 0,
        asesores: Array.isArray(advisors) ? advisors.length : 0,
      });
      setRequests(Array.isArray(contactReqs) ? contactReqs.slice(0, 8) : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const estadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: "bg-yellow-100 text-yellow-800",
      contactado: "bg-blue-100 text-blue-800",
      cerrado: "bg-green-100 text-green-800",
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumen general de Promotoras Full.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Proyectos", value: stats.proyectos, href: "/admin/proyectos", color: "bg-[#16203A]", icon: "🏗️" },
          { label: "Solicitudes", value: stats.solicitudes, href: "/admin/contacto", color: "bg-amber-600", icon: "📋" },
          { label: "Novedades", value: stats.novedades, href: "/admin/novedades", color: "bg-emerald-700", icon: "📰" },
          { label: "Asesores", value: stats.asesores, href: "/admin/asesores", color: "bg-purple-700", icon: "👥" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className={`${s.color} text-white p-6 rounded-xl flex flex-col gap-3 hover:opacity-90 transition-opacity`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="text-4xl font-light font-serif">{loading ? "–" : s.value}</div>
              <div className="text-xs uppercase tracking-widest opacity-70 mt-1">{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Nuevo Proyecto", href: "/admin/proyectos/nuevo" },
          { label: "Nueva Novedad", href: "/admin/novedades/nuevo" },
          { label: "Nuevo Asesor", href: "/admin/asesores" },
          { label: "Configuración", href: "/admin/configuracion" },
        ].map((a) => (
          <Link key={a.label} href={a.href} className="border border-dashed border-gray-300 rounded-xl p-4 text-sm text-center text-gray-500 hover:border-[#C8A23C] hover:text-[#C8A23C] transition-colors">
            + {a.label}
          </Link>
        ))}
      </div>

      {/* Recent Contact Requests */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Últimas Solicitudes de Visita</h2>
          <Link href="/admin/contacto" className="text-sm text-[#C8A23C] hover:underline">Ver todas →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Visita</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Cargando...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Sin solicitudes aún.</td></tr>
              ) : requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{r.nombre}</td>
                  <td className="px-6 py-4">{r.proyecto}</td>
                  <td className="px-6 py-4 text-xs">{r.fechaVisita || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${estadoBadge(r.estado)}`}>
                      {r.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
