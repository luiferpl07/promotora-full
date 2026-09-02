"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon, LinkButton, LoadingBlock, PageHeader, TableShell, Thead, Toggle } from "@/components/admin/AdminUI";

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
      <PageHeader
        kicker="Journal"
        title="Novedades"
        subtitle="Gestiona las noticias y eventos publicados."
        action={<LinkButton href="/admin/novedades/nuevo"><Icon name="plus" className="w-4 h-4" /> Nueva Novedad</LinkButton>}
      />

      {loading ? (
        <TableShell><tbody><tr><td><LoadingBlock /></td></tr></tbody></TableShell>
      ) : (
        <TableShell>
          <Thead cols={["Noticia", "Fecha", "Publicada", "Acciones"]} />
          <tbody className="divide-y divide-[var(--color-pf-navy)]/5">
            {items.map(n => (
              <tr key={n.id} className="hover:bg-[var(--color-pf-beige-light)]/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {n.imgDestacada && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image src={n.imgDestacada} alt={n.titulo} width={48} height={48} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-[var(--color-pf-navy)]">{n.titulo}</div>
                      <div className="text-xs text-[var(--color-pf-navy)]/35 mt-0.5 max-w-xs truncate">{n.resumen}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-[var(--color-pf-navy)]/40">{new Date(n.fecha).toLocaleDateString("es-CO")}</td>
                <td className="px-6 py-4">
                  <Toggle checked={n.publicado} onChange={() => togglePublicado(n)} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/admin/novedades/${n.id}`} className="w-8 h-8 flex items-center justify-center bg-[var(--color-pf-navy)] text-white rounded-lg hover:bg-[var(--color-pf-gold)] hover:text-[var(--color-pf-navy)] transition-colors" title="Editar">
                      <Icon name="pencil" className="w-4 h-4" />
                    </Link>
                    <Link href={`/novedades/${n.slug}`} target="_blank" className="w-8 h-8 flex items-center justify-center border border-[var(--color-pf-navy)]/15 text-[var(--color-pf-navy)]/50 rounded-lg hover:text-[var(--color-pf-navy)] transition-colors" title="Ver en el sitio">
                      <Icon name="external" className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(n.id)} className="w-8 h-8 flex items-center justify-center border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors" title="Eliminar">
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
