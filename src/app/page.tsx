"use client";

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ScrollBadge from "@/components/ScrollBadge";
import CloudsDrift from "@/components/CloudsDrift";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import Link from "next/link";
import SmoothScrolling from "@/components/SmoothScrolling";
import Footer from "@/components/Footer";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [novedades, setNovedades] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/news").then(r => r.json())
    ]).then(([projs, news]) => {
      if (Array.isArray(projs)) setProyectos(projs.filter((p: any) => p.publicado).slice(0, 6));
      if (Array.isArray(news)) setNovedades(news.filter((n: any) => n.publicado).slice(0, 3));
    }).catch(console.error);
  }, []);
  const archSectionRef = useRef<HTMLDivElement>(null);
  const archMaskRef = useRef<HTMLDivElement>(null);
  const curvedTextRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  const locationSectionRef = useRef<HTMLDivElement>(null);
  const locationTextRef = useRef<HTMLDivElement>(null);
  const palmLeftRef = useRef<HTMLDivElement>(null);
  const palmRightRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);
  const ctaMaskRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 0. Smooth Background Color Transitions
    // We will tween the body background color based on section presence
    const bgSections = gsap.utils.toArray("[data-bg-color]") as HTMLElement[];
    bgSections.forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => gsap.to(document.body, { backgroundColor: sec.dataset.bgColor, duration: 1 }),
        onEnterBack: () => gsap.to(document.body, { backgroundColor: sec.dataset.bgColor, duration: 1 }),
      });
    });

    // 0.5 Section Tracker
    const scrollSections = gsap.utils.toArray("[data-section-index]") as HTMLElement[];
    scrollSections.forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => setCurrentSection(Number(sec.dataset.sectionIndex)),
        onEnterBack: () => setCurrentSection(Number(sec.dataset.sectionIndex)),
      });
    });

    // 1. Smooth Arch Reveal (Pinned Clip-Path)
    if (archSectionRef.current && archMaskRef.current) {
      gsap.fromTo(
        archMaskRef.current,
        { clipPath: "circle(5% at 50% 100%)" },
        {
          clipPath: "circle(150% at 50% 100%)",
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: archSectionRef.current,
            start: "top top",
            end: "+=80%",
            pin: true,
            scrub: 1,
            refreshPriority: 10,
          },
        }
      );
    }

    // 1.5. CTA Reveal (Pinned Clip-Path, inverse of the Arch reveal)
    if (ctaSectionRef.current && ctaMaskRef.current) {
      gsap.fromTo(
        ctaMaskRef.current,
        { clipPath: "circle(4% at 50% 0%)" },
        {
          clipPath: "circle(150% at 50% 0%)",
          ease: "power1.out",
          scrollTrigger: {
            trigger: ctaSectionRef.current,
            start: "top top",
            end: "+=30%",
            pin: true,
            scrub: 0.5,
            refreshPriority: -1,
          },
        }
      );
    }

    // 2. Parallax & Image Zoom (Scale Progressive)
    const parallaxImages = gsap.utils.toArray(".parallax-zoom") as HTMLElement[];
    parallaxImages.forEach((img) => {
      gsap.fromTo(
        img,
        { scale: 1 },
        {
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    // 3. Parallax Proyectos Destacados (Text & Palms)
    if (locationSectionRef.current && locationTextRef.current) {
      ScrollTrigger.create({
        trigger: locationSectionRef.current,
        start: "top top",
        end: "+=150%",
        pin: locationTextRef.current,
        scrub: true,
        refreshPriority: 9,
      });

      if (palmLeftRef.current) {
        gsap.to(palmLeftRef.current, {
          yPercent: -20,
          rotation: -3,
          ease: "none",
          scrollTrigger: {
            trigger: locationSectionRef.current,
            start: "top top",
            end: "+=150%",
            scrub: true,
          },
        });
      }
      
      if (palmRightRef.current) {
        gsap.fromTo(palmRightRef.current, 
          { yPercent: 10, rotation: 2 },
          {
            yPercent: -30,
            rotation: -2,
            ease: "none",
            scrollTrigger: {
              trigger: locationSectionRef.current,
              start: "top top",
              end: "+=150%",
              scrub: true,
            },
          }
        );
      }
    }

    // 4. Elegant Text Reveals (Stagger Slide from Bottom)
    const revealElements = gsap.utils.toArray("[data-reveal]") as HTMLElement[];
    revealElements.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 100, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
          },
        }
      );
    });

  }, { scope: container });

  // 5. Horizontal Scroll Projects
  const horizontalSectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!horizontalSectionRef.current || !horizontalScrollRef.current || proyectos.length < 1) return;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray(horizontalScrollRef.current!.children) as HTMLElement[];

      gsap.to(sections, {
        xPercent: -100 * (sections.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: horizontalSectionRef.current,
          pin: true,
          scrub: 1,
          snap: sections.length > 1 ? 1 / (sections.length - 1) : undefined,
          start: () => "top top",
          end: () => "+=" + window.innerWidth * sections.length,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      // Wait for pin-spacers from sections above to settle, then recalculate
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });
      });
    });

    return () => ctx.revert();
  }, [proyectos]);



  const testimonios = [
    { text: "Los lotes son simplemente espectaculares, rodeados de naturaleza y con vistas que enamoran.", author: "Luz Díaz" },
    { text: "Me encantó que pude comprar mi lote con cuotas cómodas, sin trámites complicados.", author: "Alberto Sierra" },
    { text: "Promotora Full cumplió con todo lo prometido, un trato serio y transparente.", author: "María Rios" },
    { text: "El lote que adquirí está cerca de todo, pero con la tranquilidad del campo.", author: "Carlos Méndez" },
    { text: "Desde el primer contacto me sentí acompañada, todo el proceso fue rápido y claro.", author: "Diana Patiño" }
  ];

  return (
    <div ref={container} className="bg-[var(--color-pf-bg)] relative transition-colors duration-1000">
      <Navigation />
      <ScrollBadge />

      <main className="overflow-x-hidden font-sans relative z-10">
        <div data-bg-color="var(--color-pf-bg)" data-section-index="0">
          <Hero />
        </div>

        {/* 1. Dynamic Arch Section: ¿Por qué elegirnos? */}
        <section data-section-index="1" data-bg-color="var(--color-pf-navy)" ref={archSectionRef} className="h-screen w-full relative bg-[var(--color-pf-navy)] overflow-hidden">
          <div 
            ref={archMaskRef} 
            className="absolute inset-0 bg-[var(--color-pf-beige)] flex flex-col items-center justify-center pt-20"
          >
            <h2 data-reveal className="font-serif text-[clamp(28px,5vw,64px)] uppercase tracking-[0.2em] text-[var(--color-pf-navy)] text-center max-w-[1000px] leading-[1.2] font-light px-6 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p data-reveal className="text-center max-w-[800px] text-lg opacity-70 mb-16 px-6 font-light">
              Estamos comprometidos a brindar un servicio excepcional y ayudarlo a encontrar la propiedad perfecta. Estas son algunas razones para elegirnos:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[1200px] px-6" data-reveal>
              <div className="text-center border-t border-black/10 pt-8 transition-all hover:-translate-y-2">
                <h3 className="font-serif text-2xl uppercase tracking-widest mb-4">Confianza y Respaldo</h3>
                <p className="text-sm opacity-70 leading-relaxed font-light">Años de experiencia ofreciendo proyectos legales, transparentes y con acompañamiento en todo el proceso.</p>
              </div>
              <div className="text-center border-t border-black/10 pt-8 transition-all hover:-translate-y-2 delay-100">
                <h3 className="font-serif text-2xl uppercase tracking-widest mb-4">Ubicaciones Estratégicas</h3>
                <p className="text-sm opacity-70 leading-relaxed font-light">Lotes campestres en zonas de alta valorización, con acceso a vías principales y rodeados de naturaleza.</p>
              </div>
              <div className="text-center border-t border-black/10 pt-8 transition-all hover:-translate-y-2 delay-200">
                <h3 className="font-serif text-2xl uppercase tracking-widest mb-4">Facilidades de Pago</h3>
                <p className="text-sm opacity-70 leading-relaxed font-light">Planes flexibles que se adaptan a su presupuesto, para que invertir en su lote soñado sea posible hoy.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Proyectos Destacados (Parallax Intro) */}
        <section data-section-index="2" data-bg-color="#5F8FC4" ref={locationSectionRef} className="h-[250vh] w-full bg-[linear-gradient(to_bottom,var(--color-pf-beige)_0%,#3E6EA0_14%,#8EB6DC_55%,var(--color-pf-beige)_100%)] relative isolate">
          <div ref={locationTextRef} className="h-screen w-full flex flex-col items-center justify-center absolute top-0 left-0 z-10 pointer-events-none">

            <CloudsDrift className="z-0 opacity-90" />

            {/* Left Palm Tree */}
            <div 
              ref={palmLeftRef}
              className="absolute top-[-5%] left-[-5%] w-[60vw] md:w-[42vw] h-[110vh] md:h-[130vh] z-0 origin-bottom-left mix-blend-multiply"
            >
              <div className="w-full h-full relative sway-animation origin-bottom-left">
                <Image src="/assets/palms/palm_left_v2.png" alt="Palmera" fill className="object-contain object-top object-left" />
              </div>
            </div>

            {/* Right Palm Tree */}
            <div 
              ref={palmRightRef}
              className="absolute bottom-[-10%] right-[-5%] w-[70vw] md:w-[45vw] h-[60vh] md:h-[70vh] opacity-90 z-0 origin-bottom-right"
            >
              <div className="w-full h-full relative sway-animation-alt origin-bottom-right">
                <Image src="/assets/palms/palm_bottom_right.png" alt="Palmera" fill className="object-contain object-bottom object-right" />
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center px-6 mt-[-10vh]">
              <h2 className="font-serif text-[clamp(50px,12vw,200px)] uppercase tracking-tight leading-[0.8] font-light text-[var(--color-pf-navy)] drop-shadow-2xl opacity-90 text-center">
                Proyectos
              </h2>
              <h2 className="font-script text-[clamp(80px,15vw,250px)] leading-[0.5] text-[var(--color-pf-gold)] mt-[-20px] md:mt-[-40px] drop-shadow-2xl text-center">
                Destacados
              </h2>
              
              <div className="mt-16 max-w-[450px] text-center text-[var(--color-pf-navy)] text-[10px] md:text-[11px] uppercase tracking-[0.25em] leading-relaxed font-mono opacity-70">
                Inspirado en la naturaleza y diseñado para tu bienestar. Lotes campestres exclusivos que combinan privacidad y conexión total con el entorno.
              </div>
            </div>
          </div>
          {/* Gradient fade at bottom to smooth transition to next section */}
          <div className="absolute bottom-0 left-0 w-full h-64 pointer-events-none z-20" style={{ background: 'linear-gradient(to bottom, transparent, var(--color-pf-bg))' }} />
        </section>

        {/* 3. Horizontal Scroll Projects Grid */}
        <section ref={horizontalSectionRef} data-section-index="3" data-bg-color="var(--color-pf-bg)" className="bg-[var(--color-pf-bg)] text-[var(--color-pf-navy)] overflow-hidden h-screen">
          <div className="flex flex-row h-full" style={{ width: `${Math.max(1, proyectos.length) * 100}vw` }} ref={horizontalScrollRef}>
            {proyectos.map((p, i) => {
              const num = String(i + 1).padStart(2, '0');
              return (
                <div key={p.id} className="w-[100vw] h-full flex flex-col md:flex-row items-center justify-center px-6 md:px-20 gap-10 md:gap-24 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none font-serif text-[30vw] font-bold text-center leading-[100vh] whitespace-nowrap">
                    {num}
                  </div>
                  <div className="w-full md:w-1/2 h-[50vh] md:h-[70vh] overflow-hidden shadow-2xl relative order-2 md:order-1 rounded-sm">
                    <div className="parallax-zoom absolute inset-[-10%] bg-cover bg-center" style={{ backgroundImage: `url(${p.imgHero})` }} />
                  </div>
                  <div className="w-full md:w-1/2 order-1 md:order-2 text-center md:text-left z-10">
                    <div className="font-mono text-[12px] tracking-[0.24em] uppercase mb-6 text-[var(--color-pf-gold)]">{num} — {p.ubicacionTexto || 'Ubicación Premium'}</div>
                    <h3 className="font-serif text-[clamp(32px,4vw,70px)] leading-[1] uppercase tracking-tight mb-8 font-light">
                      {p.nombre}
                    </h3>
                    <p className="text-base md:text-xl opacity-70 mb-12 max-w-[460px] mx-auto md:mx-0 leading-relaxed font-light">
                      {p.descripcion}
                    </p>
                    <Link href={`/proyectos/${p.slug}`} className="inline-block border border-[var(--color-pf-navy)] rounded-full px-10 py-4 text-[11px] tracking-[0.2em] uppercase hover:bg-[var(--color-pf-navy)] hover:text-[var(--color-pf-bg)] transition-colors duration-500">
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Opiniones de Clientes */}
        <section data-section-index="4" data-bg-color="var(--color-pf-navy)" className="bg-[var(--color-pf-navy)] text-[var(--color-pf-bg)] py-32 px-6 border-t border-white/10">
          <div className="max-w-[1400px] mx-auto">
            <h2 data-reveal className="font-serif text-[clamp(30px,5vw,60px)] uppercase tracking-tight leading-[1] font-light text-center mb-24">
              Opiniones de nuestros <span className="font-script text-[var(--color-pf-gold)] text-[clamp(60px,9vw,120px)] lowercase">clientes</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {testimonios.map((t, i) => (
                <div key={i} data-reveal className="border border-white/10 p-10 rounded-sm hover:bg-white/5 transition-colors duration-500 hover:-translate-y-2">
                  <div className="text-[var(--color-pf-gold)] text-6xl font-serif mb-2 leading-[0]">"</div>
                  <p className="font-light text-lg opacity-80 leading-relaxed mb-8 italic">{t.text}</p>
                  <div className="font-mono text-xs tracking-widest uppercase opacity-50 flex items-center gap-4">
                    <div className="w-8 h-[1px] bg-white/50"></div>
                    {t.author}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Novedades */}
        <section data-section-index="5" data-bg-color="var(--color-pf-beige)" className="bg-[var(--color-pf-beige)] text-[var(--color-pf-navy)] py-32 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex justify-between items-end mb-16 border-b border-[rgba(22,32,58,.1)] pb-8" data-reveal>
              <h2 className="font-serif text-[clamp(40px,6vw,70px)] uppercase tracking-tight leading-[1] font-light">
                Novedades
              </h2>
              <a href="/novedades" className="font-mono text-[10px] tracking-widest uppercase hover:text-[var(--color-pf-gold)] transition-colors">Ver todas ↗</a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {novedades.map((n) => {
                const date = new Date(n.fecha).toLocaleDateString('es-CO', { month: 'long', day: 'numeric', year: 'numeric' });
                return (
                  <Link href={`/novedades/${n.slug}`} key={n.id} data-reveal className="group cursor-pointer">
                    <div className="overflow-hidden mb-8 rounded-sm">
                      <div className="h-[200px] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" style={{backgroundImage: `url('${n.imgDestacada}')`}}></div>
                    </div>
                    <div className="font-mono text-xs tracking-widest uppercase text-[var(--color-pf-gold)] mb-4">{date}</div>
                    <h3 className="font-serif text-3xl uppercase leading-tight mb-6 group-hover:text-[var(--color-pf-gold)] transition-colors">{n.titulo}</h3>
                    <p className="opacity-70 font-light leading-relaxed mb-6">{n.resumen}</p>
                    <span className="font-mono text-[10px] tracking-widest uppercase border-b border-[var(--color-pf-navy)] pb-1">Leer más</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 6. Elegant CTA / Footer Typography */}
        <section data-section-index="6" data-bg-color="var(--color-pf-bg)" ref={ctaSectionRef} className="h-screen w-full relative bg-[var(--color-pf-bg)] overflow-hidden">
          <div
            ref={ctaMaskRef}
            className="absolute inset-0 bg-[var(--color-pf-navy)] flex flex-col items-center justify-center px-6"
          >
            <div className="max-w-[1400px] mx-auto text-center relative z-10">
              <h2 data-reveal className="font-serif text-[clamp(36px,7vw,90px)] uppercase tracking-tight leading-[1] font-light text-white">
                ¿Deseas reservar <br/>
                <span className="font-script text-[var(--color-pf-gold)] text-[clamp(70px,12vw,140px)] lowercase -mt-4 block drop-shadow-sm">tu lote?</span>
              </h2>
              <p data-reveal className="mt-12 text-sm md:text-base tracking-[0.1em] uppercase font-light text-white/70 max-w-lg mx-auto leading-relaxed">
                Conoce los pasos que debes realizar para adquirir el lote de tus sueños.
              </p>
              <Link href="/contacto" data-reveal className="mt-12 mx-auto w-max px-12 py-5 rounded-full bg-[var(--color-pf-gold)] !text-[var(--color-pf-navy)] text-[11px] tracking-[0.2em] uppercase font-semibold hover:bg-white transition-colors duration-500 shadow-xl flex items-center justify-center">
                <span>Más Información</span>
              </Link>
            </div>
          </div>
        </section>
          <Footer />
      </main>
    </div>
  );
}
