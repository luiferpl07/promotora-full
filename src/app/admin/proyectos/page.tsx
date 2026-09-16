"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

export default function AdminProyectos() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const togglePublicado = async (p: Project) => {
    await fetch(`/api/projects/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, publicado: !p.publicado }),
    });
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, publicado: !x.publicado } : x));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500 mt-1">Gestiona los proyectos del portafolio.</p>
        </div>
        <Link href="/admin/proyectos/nuevo" className="px-6 py-3 bg-[#16203A] text-white rounded-xl text-sm font-medium hover:bg-[#C8A23C] transition-colors">
          + Nuevo Proyecto
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando...</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium">
              <tr>
                <th className="px-6 py-4">Proyecto</th>
                <th className="px-6 py-4">Lotes</th>
                <th className="px-6 py-4">Área Desde</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Publicado</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {p.imgHero && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <Image src={p.imgHero} alt={p.nombre} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{p.nombre}</div>
                        <div className="text-xs text-gray-400">/proyectos/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{p.lotes ?? "—"}</td>
                  <td className="px-6 py-4">{p.areaDesde ? `${p.areaDesde} m²` : "—"}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">{p.estado}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublicado(p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${p.publicado ? "bg-[#C8A23C]" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${p.publicado ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/proyectos/${p.id}`} className="px-3 py-1 text-xs bg-[#16203A] text-white rounded-lg hover:bg-[#C8A23C] transition-colors">
                        Editar
                      </Link>
                      <Link href={`/proyectos/${p.slug}`} target="_blank" className="px-3 py-1 text-xs border border-gray-200 text-gray-500 rounded-lg hover:text-[#16203A] transition-colors">
                        Ver →
                      </Link>
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
