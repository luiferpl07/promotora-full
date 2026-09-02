"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge, Icon, LinkButton, LoadingBlock, PageHeader, TableShell, Thead, Toggle } from "@/components/admin/AdminUI";

interface Project {
  id: string;
  nombre: string;
  slug: string;
  estado: string;
  lotes: number | null;
  areaDesde: number | null;
  publicado: boolean;
  imgHero: string | null;
  orden: number;
  images: { url: string; tipo: string }[];
}

const estadoColor: Record<string, "green" | "amber" | "red" | "gray"> = {
  activo: "green",
  proximamente: "amber",
  agotado: "red",
};

export default function AdminProyectos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => fetch("/api/projects").then(r => r.json()).then(setProjects).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const togglePublicado = async (p: Project) => {
    await fetch(`/api/projects/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, publicado: !p.publicado }),
    });
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, publicado: !x.publicado } : x));
  };

  const handleDelete = async (p: Project) => {
    if (!confirm(`¿Eliminar el proyecto "${p.nombre}"? Esta acción no se puede deshacer y borrará también su galería de imágenes.`)) return;
    await fetch(`/api/projects/${p.id}`, { method: "DELETE" });
    setProjects(prev => prev.filter(x => x.id !== p.id));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Portafolio"
        title="Proyectos"
        subtitle="Gestiona los proyectos del portafolio."
        action={<LinkButton href="/admin/proyectos/nuevo"><Icon name="plus" className="w-4 h-4" /> Nuevo Proyecto</LinkButton>}
      />

      {loading ? (
        <TableShell><tbody><tr><td><LoadingBlock /></td></tr></tbody></TableShell>
      ) : (
        <TableShell>
          <Thead cols={["Proyecto", "Lotes", "Área Desde", "Estado", "Publicado", "Acciones"]} />
          <tbody className="divide-y divide-[var(--color-pf-navy)]/5">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--color-pf-beige-light)]/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {p.imgHero && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-pf-beige-light)] flex-shrink-0">
                        <Image src={p.imgHero} alt={p.nombre} width={48} height={48} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-[var(--color-pf-navy)]">{p.nombre}</div>
                      <div className="text-xs text-[var(--color-pf-navy)]/35">/proyectos/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{p.lotes ?? "—"}</td>
                <td className="px-6 py-4">{p.areaDesde ? `${p.areaDesde} m²` : "—"}</td>
                <td className="px-6 py-4">
                  <Badge color={estadoColor[p.estado] || "gray"}>{p.estado}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Toggle checked={p.publicado} onChange={() => togglePublicado(p)} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/proyectos/${p.id}`} className="w-8 h-8 flex items-center justify-center bg-[var(--color-pf-navy)] text-white rounded-lg hover:bg-[var(--color-pf-gold)] hover:text-[var(--color-pf-navy)] transition-colors" title="Editar">
                      <Icon name="pencil" className="w-4 h-4" />
                    </Link>
                    <Link href={`/proyectos/${p.slug}`} target="_blank" className="w-8 h-8 flex items-center justify-center border border-[var(--color-pf-navy)]/15 text-[var(--color-pf-navy)]/50 rounded-lg hover:text-[var(--color-pf-navy)] transition-colors" title="Ver en el sitio">
                      <Icon name="external" className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(p)} className="w-8 h-8 flex items-center justify-center border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
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
