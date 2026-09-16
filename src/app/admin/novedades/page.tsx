"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface NewsItem {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string | null;
  imgDestacada: string | null;
  publicado: boolean;
  fecha: string;
}

export default function AdminNovedadesList() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news").then(r => r.json()).then(setItems).finally(() => setLoading(false));
  }, []);

  const togglePublicado = async (n: NewsItem) => {
    await fetch(`/api/news/${n.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...n, publicado: !n.publicado }),
    });
    setItems(prev => prev.map(x => x.id === n.id ? { ...x, publicado: !x.publicado } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta novedad?")) return;
    await fetch(`/api/news/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novedades</h1>
          <p className="text-gray-500 mt-1">Gestiona las noticias y eventos publicados.</p>
        </div>
        <Link href="/admin/novedades/nuevo" className="px-6 py-3 bg-[#16203A] text-white rounded-xl text-sm font-medium hover:bg-[#C8A23C] transition-colors">
          + Nueva Novedad
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Cargando...</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs font-medium">
              <tr>
                <th className="px-6 py-4">Noticia</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Publicada</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map(n => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {n.imgDestacada && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={n.imgDestacada} alt={n.titulo} width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{n.titulo}</div>
                        <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{n.resumen}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">{new Date(n.fecha).toLocaleDateString("es-CO")}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => togglePublicado(n)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${n.publicado ? "bg-[#C8A23C]" : "bg-gray-200"}`}>
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${n.publicado ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/novedades/${n.id}`} className="px-3 py-1 text-xs bg-[#16203A] text-white rounded-lg hover:bg-[#C8A23C] transition-colors">Editar</Link>
                      <button onClick={() => handleDelete(n.id)} className="px-3 py-1 text-xs border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors">Eliminar</button>
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
