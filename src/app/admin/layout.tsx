import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#16203A] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="font-serif text-2xl font-light tracking-wide text-[#F7F4ED]">
            Promotoras Full
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/50 mt-1">
            Panel de Administración
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 text-sm">
          {[
            { href: "/admin", label: "Dashboard", icon: "📊" },
            { href: "/admin/proyectos", label: "Proyectos", icon: "🏗️" },
            { href: "/admin/novedades", label: "Novedades", icon: "📰" },
            { href: "/admin/asesores", label: "Asesores", icon: "👥" },
            { href: "/admin/contacto", label: "Solicitudes", icon: "📋" },
            { href: "/admin/como-comprar", label: "Cómo Comprar", icon: "📋" },
            { href: "/admin/configuracion", label: "Configuración", icon: "⚙️" },
          ].map(({ href, label, icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors">
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-sm font-medium text-gray-500">Bienvenido de nuevo</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C8A23C] text-[#16203A] flex items-center justify-center font-bold text-xs">
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
