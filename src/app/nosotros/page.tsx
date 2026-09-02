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

interface Advisor {
  id: string; nombre: string; rol: string; proyectoAsignado: string | null;
  whatsapp: string | null; img: string | null;
}
interface SiteConfig { [key: string]: string; }

export default function Nosotros() {
  const container = useRef<HTMLDivElement>(null);
  const cifrasRef = useRef<HTMLDivElement>(null);
  const cifrasImgRef = useRef<HTMLDivElement>(null);
  const [asesores, setAsesores] = useState<Advisor[]>([]);
  const [config, setConfig] = useState<SiteConfig>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/advisors").then(r => r.json()),
      fetch("/api/site-config").then(r => r.json()),
    ]).then(([advisorsData, configData]) => {
      if (Array.isArray(advisorsData)) setAsesores(advisorsData);
      setConfig(configData);
    }).catch(console.error);
  }, []);

  useGSAP(() => {
    gsap.fromTo(".hero-title-line", { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", stagger: 0.15 });
    gsap.fromTo(".hero-script", { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 2, ease: "power2.out", delay: 0.5 });
    const revealElements = gsap.utils.toArray("[data-reveal]") as HTMLElement[];
    revealElements.forEach((el) => {
      gsap.fromTo(el, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
    const parallaxElements = gsap.utils.toArray("[data-parallax]") as HTMLElement[];
    parallaxElements.forEach((el) => {
      const img = el.querySelector("[data-zoom]");
      if (img) { gsap.fromTo(img, { scale: 1, y: "-10%" }, { scale: 1.15, y: "10%", ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }); }
    });
    if (cifrasImgRef.current && cifrasRef.current) {
      gsap.to(cifrasImgRef.current, { y: -150, scale: 1.1, ease: "none", scrollTrigger: { trigger: cifrasRef.current, start: "top bottom", end: "bottom top", scrub: true } });
    }
  }, { scope: container, dependencies: [asesores, config] });

  const valores = [
    { titulo: "Transparencia", texto: "Actuamos con integridad y claridad en cada proceso y comunicación." },
    { titulo: "Calidad", texto: "Ofrecemos proyectos que cumplen altos estándares en ubicación y condiciones legales, ambientales y urbanísticas." },
    { titulo: "Compromiso", texto: "Escuchamos, orientamos y acompañamos a nuestros clientes para ofrecer una experiencia confiable y humana." },
    { titulo: "Sostenibilidad", texto: "Promovemos el respeto por la naturaleza y el uso responsable del suelo rural." },
    { titulo: "Innovación", texto: "Buscamos continuamente nuevas formas de mejorar procesos, servicios y propuestas de valor." },
  ];

  const compromisos = [
    { titulo: "Selección estratégica de terrenos", texto: "Evaluamos las condiciones naturales, legales y ecológicas de cada zona para no afectar ecosistemas frágiles ni comunidades locales." },
    { titulo: "Diseño consciente de proyectos", texto: "Planeamos los lotes para integrarse con la geografía, conservar áreas verdes, proteger fuentes hídricas y mantener la biodiversidad." },
    { titulo: "Prácticas constructivas responsables", texto: "Promovemos materiales sostenibles, sistemas de drenaje adecuados y modelos de ocupación respetuosos con el suelo." },
    { titulo: "Educación y conciencia ambiental", texto: "Incentivamos a clientes y aliados a adoptar estilos de vida sostenibles con información y recomendaciones ecológicas." },
    { titulo: "Responsabilidad social", texto: "Trabajamos con comunidades rurales cercanas para impulsar el empleo local y la participación activa en los proyectos." },
    { titulo: "Cumplimiento normativo ambiental", texto: "Cada desarrollo se acoge a la legislación colombiana en uso del suelo, planeación territorial y medio ambiente." },
  ];

  const razones = [
    { num: '01', kicker: 'Ubicación', titulo: config.razon1_titulo || 'Ubicación real', texto: config.razon1_texto || 'Proyectos con acceso pavimentado, cerca de los servicios de la ciudad y rodeados de paisaje abierto: la mezcla justa entre retiro y conexión.' },
    { num: '02', kicker: 'Obra', titulo: config.razon2_titulo || 'Hecho para quedarse', texto: config.razon2_texto || 'Urbanismo, vías internas, portería y zonas verdes ejecutados por etapas, con avance de obra verificable en sitio.' },
    { num: '03', kicker: 'Compra', titulo: config.razon3_titulo || 'Compra sin fricción', texto: config.razon3_texto || 'Reserva desde $1.000.000, cuotas flexibles sin intereses y acompañamiento jurídico hasta la escrituración.' }
  ];

  return (
    <div ref={container} className="bg-[var(--color-pf-navy)]">
      <Navigation />
      <ScrollBadge />
      <main className="overflow-x-hidden font-sans relative z-10 text-[var(--color-pf-bg)]">

        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-24 px-8 overflow-hidden bg-[var(--color-pf-navy)]">
          <div data-parallax className="absolute inset-0 z-0">
             <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
               <Image src="/assets/real/WhatsApp-Image-2025-08-11-at-10.55.24-AM.jpeg" alt="Fondo Nosotros" fill className="object-cover opacity-60 mix-blend-luminosity grayscale-[50%]" priority />
             </div>
             <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-pf-navy)]/80 via-black/50 to-[var(--color-pf-bg)]"></div>
          </div>
          <div className="relative z-10 text-center w-full max-w-[1400px] mx-auto mt-auto pb-[10vh]">
            <div className="overflow-hidden mb-6 flex justify-center">
              <span className="hero-title-line font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--color-pf-gold)]">Sobre Nosotros</span>
            </div>
            <h1 className="font-serif text-[clamp(40px,8vw,120px)] uppercase tracking-tighter leading-[0.85] font-normal scale-y-110 text-white">
              <div className="overflow-hidden"><div className="hero-title-line">PROMOTORAS</div></div>
              <div className="overflow-hidden"><div className="hero-title-line text-[var(--color-pf-gold)]">FULL</div></div>
            </h1>
            <div className="mt-[-2vh] md:mt-[-4vh] relative z-20">
              <span className="hero-script font-script text-[clamp(50px,7vw,120px)] text-white/90 capitalize drop-shadow-2xl inline-block -rotate-3">Nuestra Historia</span>
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] py-24 px-6 md:px-12 text-center border-b border-black/10 relative z-20">
           <div className="max-w-[1000px] mx-auto">
              <h2 data-reveal className="font-serif font-light text-[clamp(30px,4.5vw,54px)] leading-[1.2] tracking-[-0.02em] text-[var(--color-pf-navy)]">
                {config.empresa_descripcion || "Desarrollamos proyectos campestres pensados para el retiro y la inversión, combinando urbanismo de alta calidad con la tranquilidad del entorno natural."}
              </h2>
           </div>
        </section>

        {/* Misión y Visión */}
        <section className="bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] py-[clamp(80px,12vw,160px)] px-6 md:px-12 relative z-20 border-t border-black/10">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20">
            <div>
              <div data-reveal className="flex items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[var(--color-pf-navy)]/50 mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Propósito</span><span>Misión</span>
              </div>
              <h3 data-reveal className="font-serif font-light text-[clamp(30px,4vw,48px)] leading-[1.1] mb-8 text-[var(--color-pf-navy)]">
                Un servicio integral y transparente
              </h3>
              <p data-reveal className="text-[15px] md:text-[16px] leading-[1.8] text-[var(--color-pf-dark)]/70 font-light">
                Brindar un servicio integral, confiable y transparente en la comercialización de lotes campestres exclusivos, ubicados en áreas naturales estratégicas. Acompañamos a nuestros clientes en cada etapa del proceso, promoviendo proyectos sostenibles que armonicen con la naturaleza y generen bienestar social y ambiental para las comunidades donde operamos.
              </p>
            </div>
            <div>
              <div data-reveal className="flex items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[var(--color-pf-navy)]/50 mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Horizonte</span><span>Visión</span>
              </div>
              <h3 data-reveal className="font-serif font-light text-[clamp(30px,4vw,48px)] leading-[1.1] mb-8 text-[var(--color-pf-navy)]">
                Líderes en lotes campestres
              </h3>
              <p data-reveal className="text-[15px] md:text-[16px] leading-[1.8] text-[var(--color-pf-dark)]/70 font-light">
                Ser reconocidos a nivel nacional como la promotora líder en lotes campestres, destacándonos por ofrecer proyectos innovadores, sostenibles y de alta calidad, que conecten a las personas con la naturaleza y transformen el concepto de vida campestre.
              </p>
            </div>
          </div>
        </section>

        {/* Valores Corporativos */}
        <section className="bg-[#F9F7F3] text-[var(--color-pf-dark)] py-[clamp(100px,15vw,200px)] px-6 md:px-12 relative z-20">
          <div className="max-w-[1500px] mx-auto">
            <div className="text-center mb-20">
              <div data-reveal className="flex justify-center items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[var(--color-pf-navy)]/50 mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Principios</span><span>Lo que nos guía</span>
              </div>
              <h3 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] tracking-[-0.02em] text-[var(--color-pf-navy)]">Valores Corporativos</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
              {valores.map((v, i) => (
                <div key={i} data-reveal className="text-center border-t border-[var(--color-pf-navy)]/10 pt-8">
                  <div className="font-serif text-2xl text-[var(--color-pf-navy)] mb-4">{v.titulo}</div>
                  <p className="text-[14px] leading-[1.7] text-[var(--color-pf-dark)]/60 font-light">{v.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] py-[clamp(100px,15vw,200px)] px-6 md:px-12 relative z-20">
          <div className="max-w-[1500px] mx-auto">
            <div className="overflow-hidden mb-20 text-center">
              <h3 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] m-0 tracking-[-0.02em] text-[var(--color-pf-navy)]">Tres razones para elegirnos</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
              {razones.map((r, i) => (
                <div key={i} className="group relative">
                  <div data-reveal className="flex flex-col h-full border border-[var(--color-pf-navy)]/10 p-8 md:p-12 bg-white/50 hover:bg-white transition-colors duration-500 rounded-lg">
                    <div className="flex items-baseline justify-between pb-6 border-b border-[var(--color-pf-navy)]/10">
                      <span className="font-mono text-[14px] tracking-[0.2em] text-[var(--color-pf-gold)]">{r.num}</span>
                      <span className="text-[10px] tracking-[0.3em] uppercase text-[var(--color-pf-navy)]/50">{r.kicker}</span>
                    </div>
                    <div className="font-serif font-light text-[clamp(28px,3vw,40px)] leading-[1.1] mt-12 mb-6 text-[var(--color-pf-navy)] group-hover:text-[var(--color-pf-gold)] transition-colors">{r.titulo}</div>
                    <p className="text-[15px] leading-[1.8] text-[var(--color-pf-dark)]/70 font-light mt-auto">{r.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cifras Corporativas */}
        <section ref={cifrasRef} className="relative min-h-screen bg-[var(--color-pf-navy)] text-white overflow-hidden flex items-center py-32">
          <div ref={cifrasImgRef} className="absolute inset-[-10%] z-0">
             <Image src="/assets/real/Lagos-del-palmar.jpeg" alt="Cifras Background" fill className="object-cover opacity-20 mix-blend-luminosity grayscale" />
          </div>
          <div className="relative z-10 max-w-[1500px] mx-auto w-full px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
               <div className="lg:col-span-4">
                 <div data-reveal className="flex items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-white/50 mb-[26px]">
                    <span className="text-[var(--color-pf-gold)]">Reporte</span><span>La compañía en cifras</span>
                 </div>
                 <h2 data-reveal className="font-serif font-light text-[clamp(40px,5vw,70px)] leading-[1] text-white">
                    Un historial de <br/><span className="text-[var(--color-pf-gold)]">crecimiento sólido</span>
                 </h2>
               </div>
               <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 border-t border-b border-white/20 py-16">
                  {[
                    { val: config.empresa_proyectos || "3", label: "Proyectos activos" },
                    { val: config.empresa_hectareas || "39", label: "Hectáreas en desarrollo" },
                    { val: config.empresa_lotes || "554", label: "Lotes disponibles" },
                    { val: config.empresa_area_desde || "300", label: "m² desde" },
                  ].map((c, i, arr) => (
                    <div key={i} className={`text-center ${i < arr.length - 1 ? "md:border-r border-white/20" : ""} px-4`}>
                      <div data-reveal className="font-serif text-[clamp(50px,6vw,90px)] font-light leading-none mb-4">{c.val}</div>
                      <div data-reveal className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-pf-gold)] font-mono">{c.label}</div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </section>

        {/* Compromiso con el Desarrollo Sostenible */}
        <section className="bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] py-[clamp(100px,15vw,200px)] px-6 md:px-12 relative z-20">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5">
              <div data-reveal className="flex items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[var(--color-pf-navy)]/50 mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Compromiso</span><span>Con el Desarrollo</span>
              </div>
              <h3 data-reveal className="font-serif font-light text-[clamp(32px,4.5vw,56px)] leading-[1.1] mb-8 text-[var(--color-pf-navy)]">
                Responsable <span className="text-[var(--color-pf-gold)]">&</span> Sostenible
              </h3>
              <p data-reveal className="text-[15px] md:text-[16px] leading-[1.8] text-[var(--color-pf-dark)]/70 font-light mb-8">
                Creemos que el desarrollo inmobiliario no debe estar reñido con la conservación del entorno. Aplicamos un enfoque responsable y sostenible en cada proyecto, garantizando armonía entre crecimiento económico, bienestar social y respeto ambiental.
              </p>
              <p data-reveal className="text-[14px] leading-[1.8] text-[var(--color-pf-dark)]/50 font-light italic">
                No solo comercializamos lotes: impulsamos un modelo de vida conectado con la naturaleza.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              {compromisos.map((c, i) => (
                <div key={i} data-reveal className="flex gap-4">
                  <span className="w-6 h-6 rounded-full border border-[var(--color-pf-gold)] flex items-center justify-center flex-shrink-0 mt-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-[var(--color-pf-gold)]"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  <div>
                    <div className="font-serif text-lg text-[var(--color-pf-navy)] mb-1">{c.titulo}</div>
                    <p className="text-[13px] leading-[1.7] text-[var(--color-pf-dark)]/60 font-light">{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Asesores */}
        <section className="bg-[#F9F7F3] text-[var(--color-pf-dark)] py-[clamp(100px,15vw,220px)] px-6 md:px-12 relative z-20">
          <div className="max-w-[1500px] mx-auto text-center mb-24">
             <div data-reveal className="flex justify-center items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[var(--color-pf-navy)]/50 mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Equipo</span><span>Nuestros Asesores</span>
             </div>
             <h2 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] tracking-[-0.02em] text-[var(--color-pf-navy)]">Alguien que conoce cada lote</h2>
             <p data-reveal className="max-w-[700px] mx-auto text-[15px] leading-[1.8] text-[var(--color-pf-dark)]/60 font-light mt-8">
               Contamos con un equipo humano altamente calificado y comprometido: asesores comerciales, ingenieros y arquitectos, abogados, profesionales en administración y finanzas, técnicos de campo y especialistas en sostenibilidad.
             </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-[1200px] mx-auto">
            {asesores.map((a, i) => (
              <div key={i} className="group text-center">
                 <div data-parallax className="overflow-hidden relative w-full aspect-[3/4] mb-8 bg-gray-200">
                    <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
                      {a.img && <Image src={a.img} alt={a.nombre} fill className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" />}
                    </div>
                    <div className="absolute inset-0 bg-[var(--color-pf-navy)]/20 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-700"></div>
                 </div>
                 <h4 data-reveal className="font-serif text-[28px] text-[var(--color-pf-navy)]">{a.nombre}</h4>
                 <div data-reveal className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-pf-gold)] font-mono mt-3">{a.rol}</div>
                 <div data-reveal className="mt-8">
                   <Link href={a.whatsapp || "/contacto"} target={a.whatsapp ? "_blank" : "_self"} className="inline-block border-b border-[var(--color-pf-navy)] pb-1 text-[12px] uppercase tracking-widest text-[var(--color-pf-navy)] hover:text-[var(--color-pf-gold)] hover:border-[var(--color-pf-gold)] transition-colors">
                     Agenda por WhatsApp
                   </Link>
                 </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
