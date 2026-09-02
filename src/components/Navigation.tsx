"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface NavigationProps {
  customLogo?: string;
}

export default function Navigation({ customLogo }: NavigationProps = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [config, setConfig] = useState<Record<string, string>>({});
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/site-config").then(r => r.json()).then(setConfig).catch(console.error);
  }, []);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path || (path !== '/' && pathname?.startsWith(path));
    return `pb-1 border-b-2 transition-colors ${isActive ? 'border-[var(--color-pf-gold)] text-[var(--color-pf-navy)]' : 'border-transparent hover:text-[var(--color-pf-navy)]'}`;
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[90] flex justify-center w-full pointer-events-none">
        <nav
          className={`pointer-events-auto w-full grid grid-cols-[1fr_auto_1fr] items-center transition-all duration-500 ease-in-out border-b border-[#cba76b]/40 shadow-sm bg-[rgba(247,244,237,.95)] backdrop-blur-md px-6 md:px-12 py-4 md:py-5`}
        >
          {/* Left Side */}
          <div className="flex gap-8 items-center justify-end pr-16 md:pr-32 text-[10px] md:text-xs tracking-[0.15em] uppercase font-semibold text-[#4a4a4a]">
            <div className="hidden lg:flex gap-10 items-center">
              <Link href="/" className={getLinkClass('/')}>Inicio</Link>
              <Link href="/proyectos" className={getLinkClass('/proyectos')}>Proyectos</Link>
              <Link href="/nosotros" className={getLinkClass('/nosotros')}>Nosotros</Link>
            </div>
          </div>

          {/* Center Logo */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src={customLogo || "/assets/real/logo.png"}
              alt="Promotoras Full"
              width={customLogo ? 150 : 400}
              height={customLogo ? 150 : 100}
              className={`w-auto block transition-all duration-500 ease-in-out origin-center ${scrolled ? (customLogo ? "h-[60px] lg:h-[75px]" : "h-[45px] lg:h-[60px] scale-100") : (customLogo ? "h-[80px] lg:h-[100px]" : "h-[65px] lg:h-[80px] scale-110 lg:scale-125")}`}
            />
          </Link>

          {/* Right Side */}
          <div className="flex items-center justify-start gap-10 pl-16 md:pl-32 text-[10px] md:text-xs tracking-[0.15em] uppercase font-semibold text-[#4a4a4a]">
            <div className="hidden lg:flex gap-10 items-center">
              <Link href="/como-comprar" className={getLinkClass('/como-comprar')}>Cómo comprar</Link>
              <Link href="/novedades" className={getLinkClass('/novedades')}>Novedades</Link>
              <Link href="/contacto" className={getLinkClass('/contacto')}>Contacto</Link>
            </div>
            <Link
              href="/contacto"
              className="group flex items-center gap-3 px-8 py-4 rounded-full bg-[var(--color-pf-navy)] !text-white hover:bg-[var(--color-pf-gold)] hover:!text-[var(--color-pf-navy)] transition-colors shadow-lg"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-pf-gold)] group-hover:!text-[var(--color-pf-navy)] transition-colors">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Agendar Visita</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`fixed inset-0 z-[85] bg-[var(--color-pf-dark)] text-[var(--color-pf-bg)] flex flex-col justify-center px-[34px] transition-all duration-450 ease-in-out ${
          menuOpen ? "opacity-100 pointer-events-auto visible" : "opacity-0 pointer-events-none invisible"
        }`}
      >
        <div className="grid gap-[4px]">
          {["Inicio", "Proyectos", "Nosotros", "Cómo comprar", "Novedades"].map((item) => (
            <Link
              key={item}
              href={item === "Inicio" ? "/" : `/${item.toLowerCase().replace(" ", "-").replace("ó", "o")}`}
              onClick={() => setMenuOpen(false)}
              className="font-serif font-light text-[clamp(38px,7vw,88px)] leading-[1.06] text-[var(--color-pf-bg)] hover:text-[var(--color-pf-gold)] transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
        <Link
          href="#contacto"
          onClick={() => setMenuOpen(false)}
          className="justify-self-start mt-[38px] px-[30px] py-[15px] rounded-full bg-[var(--color-pf-gold)] text-[var(--color-pf-dark)] text-[10px] tracking-[0.24em] uppercase w-max hover:bg-[var(--color-pf-bg)] transition-colors"
        >
          Agendar visita
        </Link>
        <div className="absolute left-[34px] bottom-[38px] text-[10px] tracking-[0.24em] uppercase opacity-45">
          {config.contacto_horario || "Lunes a domingo · 8:00 a.m. — 5:00 p.m."}
        </div>
      </div>
    </>
  );
}
