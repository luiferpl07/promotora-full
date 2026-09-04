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
    const activeText = scrolled ? "text-[var(--color-pf-navy)]" : "text-white";
    const defaultText = scrolled ? "text-[#4a4a4a]" : "text-white/90";
    const hoverText = scrolled ? "hover:text-[var(--color-pf-navy)]" : "hover:text-white";
    return `pb-1 border-b-2 transition-colors ${isActive ? `border-[var(--color-pf-gold)] ${activeText}` : `border-transparent ${defaultText} ${hoverText}`}`;
  };

  useEffect(() => {
    // Transparent for the entire hero (one full viewport height); solid
    // only once it has scrolled completely out of view — no early cutoff.
    const onScroll = () => {
      setScrolled(window.scrollY >= window.innerHeight);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
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
          className={`pointer-events-auto w-full items-center transition-all duration-500 ease-in-out px-5 md:px-12 py-3 md:py-5 ${
            scrolled
              ? "border-b border-[#cba76b]/40 shadow-sm bg-[rgba(247,244,237,.95)] backdrop-blur-md"
              : "border-b border-transparent shadow-none bg-transparent"
          }`}
        >
          {/* Mobile Header */}
          <div className="flex lg:hidden items-center justify-between">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className={`p-2 -ml-2 transition-colors ${scrolled ? "text-[var(--color-pf-navy)]" : "text-white"}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <Link href="/" className="flex items-center justify-center">
              <Image
                src={customLogo || "/assets/real/logo.png"}
                alt="Promotoras Full"
                width={customLogo ? 120 : 280}
                height={customLogo ? 120 : 70}
                className={`w-auto block transition-all duration-500 ease-in-out ${scrolled ? "h-[38px]" : "h-[48px]"}`}
              />
            </Link>

            <Link
              href="/contacto"
              aria-label="Agendar Visita"
              className={`p-2 -mr-2 transition-colors ${scrolled ? "text-[var(--color-pf-navy)]" : "text-white"}`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </Link>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center">
            {/* Left Side */}
            <div className={`flex gap-8 items-center justify-end pr-16 xl:pr-32 text-xs tracking-[0.15em] uppercase font-semibold transition-colors ${scrolled ? "text-[#4a4a4a]" : "text-white/90"}`}>
              <div className="flex gap-10 items-center">
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
                className={`w-auto block transition-all duration-500 ease-in-out origin-center ${scrolled ? (customLogo ? "h-[60px] xl:h-[75px]" : "h-[45px] xl:h-[60px] scale-100") : (customLogo ? "h-[80px] xl:h-[100px]" : "h-[65px] xl:h-[80px] scale-110 xl:scale-125")}`}
              />
            </Link>

            {/* Right Side */}
            <div className={`flex items-center justify-start gap-10 pl-16 xl:pl-32 text-xs tracking-[0.15em] uppercase font-semibold transition-colors ${scrolled ? "text-[#4a4a4a]" : "text-white/90"}`}>
              <div className="flex gap-10 items-center">
                <Link href="/como-comprar" className={getLinkClass('/como-comprar')}>Cómo comprar</Link>
                <Link href="/novedades" className={getLinkClass('/novedades')}>Novedades</Link>
              </div>
              <Link
                href="/contacto"
                className="group flex items-center gap-3 px-8 py-4 rounded-full bg-[var(--color-pf-navy)] !text-white hover:bg-[var(--color-pf-gold)] hover:!text-[var(--color-pf-navy)] transition-colors shadow-lg whitespace-nowrap"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-pf-gold)] group-hover:!text-[var(--color-pf-navy)] transition-colors flex-shrink-0">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Agendar Visita</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`fixed inset-0 z-[95] bg-[var(--color-pf-dark)] text-[var(--color-pf-bg)] flex flex-col justify-center px-[34px] transition-all duration-450 ease-in-out ${
          menuOpen ? "opacity-100 pointer-events-auto visible" : "opacity-0 pointer-events-none invisible"
        }`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
          className="absolute top-6 right-6 p-2 text-[var(--color-pf-bg)] hover:text-[var(--color-pf-gold)] transition-colors"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="4" x2="20" y2="20" />
            <line x1="20" y1="4" x2="4" y2="20" />
          </svg>
        </button>
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
          href="/contacto"
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
