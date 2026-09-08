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
import { useParams } from "next/navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface ProjectImage { url: string; tipo: string; alt: string | null; }
interface Project {
  id: string; nombre: string; slug: string; descripcion: string; descripcionLarga: string | null;
  lotes: number | null; areaDesde: number | null; reserva: string | null; planPago: string | null;
  estado: string; logo: string | null; imgHero: string | null; ubicacionTexto: string | null;
  googleMapsUrl: string | null; amenidades: string | null; publicado: boolean;
  images: ProjectImage[];
}

export default function ProjectDetail() {
  const params = useParams();
  const container = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects?slug=${params.slug}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find(p => p.slug === params.slug);
          if (found) setProject(found);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Hero animation — runs once on mount
  useEffect(() => {
    gsap.fromTo(".hero-title-line", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", stagger: 0.2 });
    gsap.fromTo(".hero-script", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 2, ease: "power2.out", delay: 0.4 });
  }, []);

  useGSAP(() => {
    if (!project) return;

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
  }, { scope: container, dependencies: [project] });

  if (loading) return <div className="min-h-screen bg-[var(--color-pf-bg)] flex items-center justify-center">Cargando proyecto...</div>;
  if (!project) return <div className="min-h-screen bg-[var(--color-pf-bg)] flex items-center justify-center">Proyecto no encontrado.</div>;

  const amenidadesArr: { texto: string; foto?: string }[] = project.amenidades
    ? JSON.parse(project.amenidades).map((a: any) => typeof a === "string" ? { texto: a } : a)
    : [];
  const galeria = project.images.filter(i => i.tipo === "galeria" || i.tipo === "amenidad");
  const masterplan = project.images.find(i => i.tipo === "masterplan");

  return (
    <div ref={container} className="bg-[var(--color-pf-bg)]">
      <Navigation customLogo={project.logo || undefined} />
      <ScrollBadge />

      <main className="overflow-x-hidden font-sans relative z-10 text-[var(--color-pf-dark)]">

        {/* 1. Hero Inmersivo */}
        <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-32 pb-24 px-8 overflow-hidden bg-[var(--color-pf-navy)]">
          <div data-parallax className="absolute inset-0 z-0">
             <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
               {project.imgHero && <Image src={project.imgHero} alt={project.nombre} fill className="object-cover opacity-80" priority />}
             </div>
             <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80"></div>
          </div>
          
          <div className="relative z-10 text-center w-full max-w-[1400px] mx-auto flex flex-col items-center mt-auto pb-32">
            <div className="overflow-hidden mb-6 flex justify-center">
              <span className="hero-title-line font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--color-pf-gold)]">
                {project.ubicacionTexto || "Ubicación Premium"}
              </span>
            </div>
            
            <h1 className="font-serif text-[clamp(50px,10vw,160px)] uppercase tracking-tighter leading-[0.85] font-normal scale-y-110 text-white drop-shadow-2xl">
              <div className="overflow-hidden"><div className="hero-title-line">{project.nombre}</div></div>
            </h1>
          </div>
        </section>

        {/* 2. Barra de Cifras Clave (Quick Stats) */}
        <section className="bg-[var(--color-pf-bg)] border-b border-[var(--color-pf-gold)]/20 text-[var(--color-pf-navy)] py-12 px-6">
          <div className="max-w-[1400px] mx-auto flex flex-wrap justify-center md:grid md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[var(--color-pf-navy)]/10">
            {project.lotes && (
              <div data-reveal className="text-center px-4 w-full md:w-auto pt-6 md:pt-0">
                <div className="font-serif text-[clamp(24px,3vw,36px)] font-light leading-none mb-2">{project.lotes}</div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-pf-gold)] font-mono">Lotes</div>
              </div>
            )}
            {project.areaDesde && (
              <div data-reveal className="text-center px-4 w-full md:w-auto pt-6 md:pt-0">
                <div className="font-serif text-[clamp(24px,3vw,36px)] font-light leading-none mb-2">{project.areaDesde} m²</div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-pf-gold)] font-mono">Desde</div>
              </div>
            )}
            {project.reserva && (
              <div data-reveal className="text-center px-4 w-full md:w-auto pt-6 md:pt-0">
                <div className="font-serif text-[clamp(24px,3vw,36px)] font-light leading-none mb-2">{project.reserva}</div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-pf-gold)] font-mono">Reserva con</div>
              </div>
            )}
            {project.planPago && (
              <div data-reveal className="text-center px-4 w-full md:w-auto pt-6 md:pt-0">
                <div className="font-serif text-[clamp(24px,3vw,36px)] font-light leading-none mb-2 capitalize">{project.planPago}</div>
                <div className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-pf-gold)] font-mono">Plan de Pago</div>
              </div>
            )}
          </div>
        </section>

        {/* 3. El Concepto (Split Screen) */}
        <section className="py-[clamp(100px,15vw,220px)] px-6 md:px-12 max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
            <div>
              <div data-reveal className="flex items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[rgba(22,32,58,.45)] mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Concepto</span>
                <span>Visión General</span>
              </div>
              <h2 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] tracking-[-0.02em] mb-10 text-[var(--color-pf-navy)]">
                Descripción del Proyecto
              </h2>
              <p data-reveal className="text-[15px] md:text-[17px] leading-[1.8] text-[var(--color-pf-dark)]/70 font-light max-w-[45ch]">
                {project.descripcionLarga || project.descripcion}
              </p>
            </div>
            
            <div data-parallax className="overflow-hidden relative w-full aspect-[4/5] bg-gray-200">
               <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
                 {project.imgHero && <Image src={project.imgHero} alt="Concepto" fill className="object-cover" />}
               </div>
            </div>
          </div>
        </section>

        {/* 4. Galería */}
        {galeria.length > 0 && (
          <section className="py-[clamp(80px,10vw,150px)] px-6 md:px-12 bg-[#F9F7F3] border-t border-[var(--color-pf-gold)]/20">
            <div className="max-w-[1500px] mx-auto text-center mb-16">
               <div data-reveal className="flex justify-center items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[rgba(22,32,58,.45)] mb-[26px]">
                 <span className="text-[var(--color-pf-gold)]">Galería</span>
                 <span>Renders del Proyecto</span>
               </div>
               <h2 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] tracking-[-0.02em] text-[var(--color-pf-navy)]">
                  Espacios Diseñados para Ti
               </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[1500px] mx-auto">
              {galeria.map((img, i) => (
                <div key={i} data-parallax className={`overflow-hidden relative w-full aspect-video ${i % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : ''}`}>
                   <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
                     <Image src={img.url} alt={img.alt || `Galería ${i}`} fill className="object-cover" />
                   </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4.5 Amenidades */}
        {amenidadesArr.length > 0 && (
          <section className="py-[clamp(80px,10vw,150px)] px-6 md:px-12 bg-[#F9F7F3] border-b border-[var(--color-pf-gold)]/20 text-center">
            <div className="max-w-[900px] mx-auto">
               <div data-reveal className="flex justify-center items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[rgba(22,32,58,.45)] mb-[26px]">
                 <span className="text-[var(--color-pf-gold)]">Estilo de Vida</span>
                 <span>Lo que Incluye</span>
               </div>
               <h2 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] tracking-[-0.02em] mb-10 text-[var(--color-pf-navy)]">
                  Amenidades
               </h2>
               <p data-reveal className="text-[15px] md:text-[17px] leading-[1.8] text-[var(--color-pf-dark)]/70 font-light mb-12 max-w-[65ch] mx-auto">
                  Espacios pensados para que la comodidad, la seguridad y el esparcimiento se unan y enriquezcan tu día a día dentro del proyecto.
               </p>
               <div data-reveal className="flex flex-wrap justify-center gap-4">
                  {amenidadesArr.map((am, i) => (
                    <span key={i} className="flex items-center gap-2 pl-2 pr-4 py-2 bg-white border border-[var(--color-pf-gold)]/20 rounded-full text-xs uppercase tracking-widest text-[var(--color-pf-navy)] shadow-sm">
                      {am.foto ? (
                        <span className="w-6 h-6 rounded-full overflow-hidden relative flex-shrink-0">
                          <Image src={am.foto} alt="" fill className="object-cover" />
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-pf-gold)] flex-shrink-0" />
                      )}
                      {am.texto}
                    </span>
                  ))}
               </div>
            </div>
          </section>
        )}

        {/* 5. Plano Maestro */}
        {masterplan && (
          <section className="py-[clamp(100px,15vw,220px)] px-6 md:px-12 max-w-[1200px] mx-auto text-center">
              <div data-reveal className="flex justify-center items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[rgba(22,32,58,.45)] mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Distribución</span>
                <span>Lotes del Proyecto</span>
              </div>
              <h2 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] tracking-[-0.02em] mb-16 text-[var(--color-pf-navy)]">
                Plano Maestro
              </h2>

              {/* TODO (fase 2): reemplazar por el mapa interactivo real calibrado en /admin */}
              <div className="relative w-full aspect-video md:aspect-square lg:aspect-[4/3] bg-white shadow-2xl rounded-2xl overflow-hidden border border-black/5 p-4 md:p-8">
                <Image src={masterplan.url} alt="Plano Maestro" fill className="object-contain p-4 md:p-8" />
              </div>
          </section>
        )}

        {/* 6. Ubicación */}
        {project.googleMapsUrl && (
          <section className={`py-[clamp(100px,15vw,220px)] px-6 md:px-12 max-w-[1200px] mx-auto text-center ${masterplan ? "pt-0" : ""}`}>
              <div data-reveal className="flex justify-center items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[rgba(22,32,58,.45)] mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Ubicación</span>
                <span>Cómo Llegar</span>
              </div>
              <h2 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] tracking-[-0.02em] mb-16 text-[var(--color-pf-navy)]">
                Ubicación del Proyecto
              </h2>

              <div className="relative w-full aspect-video md:aspect-square lg:aspect-[4/3] bg-white shadow-2xl rounded-2xl overflow-hidden border border-black/5 p-4 md:p-8">
                <iframe src={project.googleMapsUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="rounded-xl"></iframe>
              </div>
          </section>
        )}

        {/* 6. Call To Action Final */}
        <section className="relative py-48 px-6 text-center overflow-hidden bg-[var(--color-pf-navy)] text-white">
           <div className="absolute inset-0 z-0">
             {project.imgHero && <Image src={project.imgHero} alt="CTA Background" fill className="object-cover opacity-20 mix-blend-luminosity" />}
             <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-pf-navy)] to-[var(--color-pf-navy)]/50"></div>
           </div>
           
           <div className="relative z-10 max-w-[800px] mx-auto">
             <h2 data-reveal className="font-serif font-light text-[clamp(40px,6vw,90px)] leading-[0.9] tracking-[-0.02em] mb-10 text-[var(--color-pf-gold)]">
                ¿Deseas reservar tu lote?
             </h2>
             <p data-reveal className="text-[16px] leading-[1.8] text-white/80 font-light max-w-[45ch] mx-auto mb-16">
               Conoce los precios y planes de financiación. Nuestro equipo de asesores está listo para brindarte toda la información que necesitas.
             </p>
             <div data-reveal>
               <Link href="/contacto" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-[var(--color-pf-gold)] text-[var(--color-pf-navy)] hover:bg-white transition-colors uppercase tracking-[0.2em] text-[11px] font-semibold">
                 Contactar Asesor
               </Link>
             </div>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
