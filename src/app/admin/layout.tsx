import Link from "next/link";
import { ReactNode } from "react";
import { Icon, IconName } from "@/components/admin/AdminUI";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/proyectos", label: "Proyectos", icon: "building" },
  { href: "/admin/novedades", label: "Novedades", icon: "newspaper" },
  { href: "/admin/asesores", label: "Asesores", icon: "users" },
  { href: "/admin/contacto", label: "Solicitudes", icon: "inbox" },
  { href: "/admin/como-comprar", label: "Cómo Comprar", icon: "checklist" },
  { href: "/admin/configuracion", label: "Configuración", icon: "settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-pf-beige-light)] flex font-sans text-[var(--color-pf-navy)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--color-pf-navy)] text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="font-serif text-2xl font-light tracking-wide text-[var(--color-pf-bg)]">
            Promotoras Full
          </div>
          <div className="text-[10px] uppercase tracking-[0.25em] font-mono text-white/40 mt-1">
            Panel de Administración
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 text-sm">
          {NAV.map(({ href, label, icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors">
              <Icon name={icon} className="w-[18px] h-[18px] flex-shrink-0" />
              <span className="tracking-wide">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 text-sm text-white/50 hover:text-[var(--color-pf-gold)] transition-colors">
            <Icon name="external" className="w-[16px] h-[16px]" />
            <span>Ver sitio público</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[var(--color-pf-navy)]/10 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-xs uppercase tracking-[0.2em] font-mono text-[var(--color-pf-navy)]/40">Bienvenido de nuevo</h2>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--color-pf-gold)] text-[var(--color-pf-navy)] flex items-center justify-center font-serif font-semibold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
