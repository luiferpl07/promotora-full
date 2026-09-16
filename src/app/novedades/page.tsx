"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface NewsItem {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  imgDestacada: string | null;
  publicado: boolean;
  fecha: string;
}

export default function Novedades() {
  const container = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLSpanElement>(null);
  const [novedades, setNovedades] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch("/api/news")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setNovedades(data.filter(n => n.publicado));
      })
      .catch(console.error);
  }, []);

  useGSAP(() => {
    const updateScrollProgress = () => {
      if (scrollProgressRef.current) {
        const max = ScrollTrigger.maxScroll(window);
        const current = window.scrollY || document.documentElement.scrollTop;
        scrollProgressRef.current.textContent = max > 0 ? Math.min(100, Math.round((current / max) * 100)).toString().padStart(2, '0') : '00';
      }
    };
    gsap.ticker.add(updateScrollProgress);

    gsap.fromTo(".hero-title-line", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", stagger: 0.15 });
    gsap.fromTo(".hero-script", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 2, ease: "power2.out", delay: 0.5 });

    const revealElements = gsap.utils.toArray("[data-reveal]") as HTMLElement[];
    revealElements.forEach((el) => {
      gsap.fromTo(el, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });

    const parallaxElements = gsap.utils.toArray("[data-parallax]") as HTMLElement[];
    parallaxElements.forEach((el) => {
      const img = el.querySelector("[data-zoom]");
      if (img) {
        gsap.fromTo(img, { scale: 1, y: "-10%" }, { scale: 1.15, y: "10%", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      }
    });

    return () => gsap.ticker.remove(updateScrollProgress);
  }, { scope: container, dependencies: [novedades] });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CO", { month: "long", year: "numeric" }).replace(/^\w/, c => c.toUpperCase());
  };

  return (
    <div ref={container} className="bg-[var(--color-pf-navy)]">
      <Navigation />
      <main className="overflow-x-hidden font-sans relative z-10 text-[var(--color-pf-bg)]">
        
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-24 px-8 overflow-hidden bg-[var(--color-pf-navy)]">
          <div data-parallax className="absolute inset-0 z-0">
             <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
               <Image src="/assets/real/Lagos-del-palmar.jpeg" alt="Fondo Novedades" fill className="object-cover opacity-60 mix-blend-luminosity grayscale-[50%]" priority />
             </div>
             <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-pf-navy)]/80 via-black/50 to-[var(--color-pf-bg)]"></div>
          </div>
          
          <div className="relative z-10 text-center w-full max-w-[1400px] mx-auto mt-auto pb-[10vh]">
            <div className="overflow-hidden mb-6 flex justify-center">
              <span className="hero-title-line font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--color-pf-gold)]">Journal</span>
            </div>
            <h1 className="font-serif text-[clamp(40px,8vw,120px)] uppercase tracking-tighter leading-[0.85] font-normal scale-y-110 text-white">
              <div className="overflow-hidden"><div className="hero-title-line">NOTICIAS Y</div></div>
              <div className="overflow-hidden"><div className="hero-title-line text-[var(--color-pf-gold)]">NOVEDADES</div></div>
            </h1>
            <div className="mt-[-2vh] md:mt-[-4vh] relative z-20">
              <span className="hero-script font-script text-[clamp(50px,7vw,120px)] text-white/90 capitalize drop-shadow-2xl inline-block -rotate-3">Desde la obra</span>
            </div>
          </div>
          
          <div className="absolute bottom-12 left-12 flex flex-col items-center gap-4 text-[var(--color-pf-navy)]">
             <div className="w-[1px] h-10 bg-current opacity-40"></div>
             <span ref={scrollProgressRef} className="text-[12px] tracking-[0.2em] font-sans font-bold">00</span>
             <div className="w-[1px] h-48 md:h-64 bg-current opacity-20"></div>
             <span className="text-[9px] tracking-[0.4em] font-mono uppercase" style={{ writingMode: 'vertical-rl' }}>SCROLL</span>
             <svg width="10" height="30" viewBox="0 0 10 30" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-60"><path d="M5 0 L5 30 M1 26 L5 30 L9 26" /></svg>
          </div>
        </section>

        <section className="bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] py-[clamp(100px,15vw,220px)] px-6 md:px-12 relative z-20">
          <div className="max-w-[1500px] mx-auto">
            <div className="overflow-hidden mb-20">
              <div data-reveal className="flex items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[var(--color-pf-navy)]/50 mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Actualidad</span>
                <span>Avances y Eventos</span>
              </div>
              <h2 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] tracking-[-0.02em] text-[var(--color-pf-navy)]">
                Lo que pasa en Promotoras Full
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-24">
              {novedades.map((n) => (
                <Link key={n.id} href="#" className="group block">
                  <div data-parallax className="overflow-hidden relative w-full aspect-[4/3] bg-gray-200 mb-8">
                     <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
                       {n.imgDestacada && <Image src={n.imgDestacada} alt={n.titulo} fill className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />}
                     </div>
                     <div className="absolute inset-0 bg-[var(--color-pf-navy)]/20 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700"></div>
                  </div>
                  <div data-reveal className="flex items-center justify-between border-b border-[var(--color-pf-navy)]/10 pb-4 mb-6">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-pf-navy)]/50">{formatDate(n.fecha)}</span>
                    <span className="text-[var(--color-pf-gold)] transition-transform duration-500 group-hover:translate-x-2">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </span>
                  </div>
                  <h3 data-reveal className="font-serif font-light text-[clamp(28px,3vw,40px)] leading-[1.1] text-[var(--color-pf-navy)] mb-6 group-hover:text-[var(--color-pf-gold)] transition-colors">
                    {n.titulo}
                  </h3>
                  <p data-reveal className="text-[15px] leading-[1.8] text-[var(--color-pf-dark)]/70 font-light max-w-[50ch]">{n.resumen}</p>
                </Link>
              ))}
              {novedades.length === 0 && (
                <div className="col-span-2 text-center py-20 text-[var(--color-pf-dark)]/50">Cargando novedades...</div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
