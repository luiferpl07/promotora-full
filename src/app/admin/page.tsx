"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Icon, IconName, LoadingBlock, PageHeader, TableShell, Thead, EmptyBlock } from "@/components/admin/AdminUI";

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

  const estadoBadge = (estado: string): "amber" | "blue" | "green" | "gray" => {
    const colors: Record<string, "amber" | "blue" | "green"> = {
      pendiente: "amber",
      contactado: "blue",
      cerrado: "green",
    };
    return colors[estado] || "gray";
  };

  const cards: { label: string; value: number; href: string; icon: IconName }[] = [
    { label: "Proyectos", value: stats.proyectos, href: "/admin/proyectos", icon: "building" },
    { label: "Solicitudes", value: stats.solicitudes, href: "/admin/contacto", icon: "inbox" },
    { label: "Novedades", value: stats.novedades, href: "/admin/novedades", icon: "newspaper" },
    { label: "Asesores", value: stats.asesores, href: "/admin/asesores", icon: "users" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader kicker="Panel" title="Dashboard" subtitle="Resumen general de Promotoras Full." />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {cards.map((s) => (
          <Link key={s.label} href={s.href} className="bg-[var(--color-pf-navy)] text-white p-6 rounded-2xl flex flex-col gap-4 hover:bg-[var(--color-pf-navy-dark)] transition-colors">
            <Icon name={s.icon} className="w-6 h-6 text-[var(--color-pf-gold)]" />
            <div>
              <div className="text-4xl font-light font-serif">{loading ? "–" : s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-mono opacity-60 mt-1">{s.label}</div>
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
          <Link key={a.label} href={a.href} className="border border-dashed border-[var(--color-pf-navy)]/20 rounded-2xl p-4 text-xs uppercase tracking-widest font-mono text-center text-[var(--color-pf-navy)]/50 hover:border-[var(--color-pf-gold)] hover:text-[var(--color-pf-gold)] transition-colors">
            + {a.label}
          </Link>
        ))}
      </div>

      {/* Recent Contact Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-[var(--color-pf-navy)]">Últimas Solicitudes de Visita</h2>
          <Link href="/admin/contacto" className="text-xs uppercase tracking-widest font-mono text-[var(--color-pf-gold)] hover:underline">Ver todas →</Link>
        </div>
        <TableShell>
          <Thead cols={["Fecha", "Nombre", "Proyecto", "Visita", "Estado"]} />
          <tbody className="divide-y divide-[var(--color-pf-navy)]/5">
            {loading ? (
              <tr><td colSpan={5}><LoadingBlock /></td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5}><EmptyBlock label="Sin solicitudes aún." /></td></tr>
            ) : requests.map((r) => (
              <tr key={r.id} className="hover:bg-[var(--color-pf-beige-light)]/60 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-[var(--color-pf-navy)]/40">
                  {new Date(r.createdAt).toLocaleDateString("es-CO")}
                </td>
                <td className="px-6 py-4 font-medium text-[var(--color-pf-navy)]">{r.nombre}</td>
                <td className="px-6 py-4">{r.proyecto}</td>
                <td className="px-6 py-4 text-xs">{r.fechaVisita || "—"}</td>
                <td className="px-6 py-4">
                  <Badge color={estadoBadge(r.estado)}>{r.estado}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </div>
    </div>
  );
}
