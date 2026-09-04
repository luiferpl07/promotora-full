"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollBadge from "@/components/ScrollBadge";
import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface Project {
  id: string; nombre: string; slug: string; descripcion: string;
  lotes: number | null; areaDesde: number | null; imgHero: string | null;
  orden: number; publicado: boolean;
  images: { url: string; tipo: string; alt: string | null }[];
}

export default function Proyectos() {
  const container = useRef<HTMLDivElement>(null);
  const [proyectos, setProyectos] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setProyectos(data.filter(p => p.publicado));
      })
      .catch(console.error);
  }, []);

  // Hero animation — runs once on mount
  useEffect(() => {
    gsap.fromTo(".hero-title-line", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", stagger: 0.2 });
    gsap.fromTo(".hero-script", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 2, ease: "power2.out", delay: 0.4 });
  }, []);

  useGSAP(() => {
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
  }, { scope: container, dependencies: [proyectos] });


  const getHeroImg = (p: Project) => p.images?.find(i => i.tipo === "hero")?.url || p.imgHero;

  return (
    <div ref={container} className="bg-[var(--color-pf-navy)]">
      <Navigation />
      <ScrollBadge />
      <main className="overflow-x-hidden font-sans relative z-10 text-[var(--color-pf-bg)]">

        {/* Dark Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-24 px-8 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <Image src="/assets/real/Escena-4.png" alt="Fondo Portafolio" fill className="object-cover opacity-90 scale-105" priority />
             <div className="absolute inset-0 bg-[var(--color-pf-navy)]/40 mix-blend-multiply"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/80"></div>
          </div>
          
          <div className="relative z-10 text-center w-full max-w-[1400px] mx-auto">
            <div className="overflow-hidden mb-6 flex justify-center">
              <span className="hero-title-line font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--color-pf-gold)]">Colección Exclusiva</span>
            </div>
            <h1 className="font-serif text-[clamp(50px,10vw,150px)] uppercase tracking-tighter leading-[0.85] font-normal scale-y-110 text-white drop-shadow-2xl">
              <div className="overflow-hidden"><div className="hero-title-line">NUESTROS</div></div>
              <div className="overflow-hidden"><div className="hero-title-line text-[var(--color-pf-gold)]">PROYECTOS</div></div>
            </h1>
            <div className="mt-[-4vh] md:mt-[-8vh] relative z-20">
              <span className="hero-script font-script text-[clamp(60px,8vw,140px)] text-white/90 capitalize drop-shadow-2xl inline-block -rotate-2">
                Portafolio de Inversión
              </span>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] py-[clamp(100px,15vw,220px)] relative rounded-t-[40px] md:rounded-t-[80px] shadow-2xl">
          <div className="max-w-[1500px] mx-auto px-[5%]">
            <div className="grid gap-[150px] md:gap-[250px] relative">
              {proyectos.map((p, i) => {
                const align = i === 0 ? "center" : i % 2 !== 0 ? "left" : "right";
                const heroImg = getHeroImg(p);
                const num = String(i + 1).padStart(2, "0");
                return (
                  <div key={p.id} className={`relative group ${align === "center" ? "w-full max-w-[1200px] mx-auto" : align === "left" ? "w-full md:w-[60%] mr-auto" : "w-full md:w-[60%] ml-auto md:-mt-[200px] z-10"}`}>
                    <Link href={`/proyectos/${p.slug}`} className="block relative">
                      <div data-reveal className="flex items-center gap-6 mb-8">
                        <span className="font-mono text-[14px] tracking-[0.2em] text-[var(--color-pf-gold)]">{num}</span>
                        <div className="h-[1px] bg-black/10 flex-grow"></div>
                      </div>
                      <div data-parallax className="overflow-hidden relative w-full aspect-[4/3] md:aspect-[16/10] bg-gray-200">
                        <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
                          {heroImg && <Image src={heroImg} alt={p.nombre} fill className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 group-hover:brightness-90" />}
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                          <div className="w-32 h-32 rounded-full border border-white/50 backdrop-blur-md bg-white/10 text-white flex items-center justify-center transform scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-700 delay-100 font-mono text-[10px] tracking-widest uppercase">Ver Más</div>
                        </div>
                      </div>
                      <div className={`mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-start ${align === "right" ? "md:pl-12" : ""}`}>
                        <div className="md:col-span-7">
                          <h2 data-reveal className="font-serif font-light text-[clamp(40px,5vw,70px)] leading-[1] tracking-[-0.02em] group-hover:text-[var(--color-pf-gold)] transition-colors duration-500">{p.nombre}</h2>
                          <p data-reveal className="text-[14px] md:text-[16px] leading-[1.8] text-[var(--color-pf-dark)]/70 mt-6 max-w-[45ch] font-light">{p.descripcion}</p>
                        </div>
                        <div data-reveal className="md:col-span-5 flex gap-12 mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-black/10">
                          {p.lotes && <div><div className="font-serif text-[32px] md:text-[40px] font-light leading-none">{p.lotes}</div><div className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-pf-gold)] mt-3 font-mono">Lotes</div></div>}
                          {p.areaDesde && <div><div className="font-serif text-[32px] md:text-[40px] font-light leading-none">{p.areaDesde} m²</div><div className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-pf-gold)] mt-3 font-mono">Desde</div></div>}
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
              {proyectos.length === 0 && (
                <div className="text-center py-20 text-[var(--color-pf-dark)]/50">Cargando proyectos...</div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

