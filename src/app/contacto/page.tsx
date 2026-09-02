"use client";

import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollBadge from "@/components/ScrollBadge";
import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Contacto() {
  const container = useRef<HTMLDivElement>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [fecha, setFecha] = useState("");
  const [sent, setSent] = useState(false);
  const [proyectos, setProyectos] = useState<{nombre: string; slug: string}[]>([]);
  const [config, setConfig] = useState<Record<string,string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/site-config").then(r => r.json()),
    ]).then(([projs, cfg]) => {
      if (Array.isArray(projs)) setProyectos(projs.filter((p: any) => p.publicado));
      setConfig(cfg);
    }).catch(console.error);
  }, []);

  useGSAP(() => {
    // Hero Text Reveal
    gsap.fromTo(
      ".hero-title-line",
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", stagger: 0.15 }
    );
    gsap.fromTo(
      ".hero-script",
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 2, ease: "power2.out", delay: 0.5 }
    );

    // Fade up texts
    const revealElements = gsap.utils.toArray("[data-reveal]") as HTMLElement[];
    revealElements.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    // Parallax
    const parallaxElements = gsap.utils.toArray("[data-parallax]") as HTMLElement[];
    parallaxElements.forEach((el) => {
      const img = el.querySelector("[data-zoom]");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1, y: "-10%" },
          {
            scale: 1.15,
            y: "10%",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    });

  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/contact-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, proyecto, fechaVisita: fecha }),
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={container} className="bg-[var(--color-pf-navy)]">
      <Navigation />
      <ScrollBadge />

      <main className="overflow-x-hidden font-sans relative z-10 text-[var(--color-pf-bg)]">

        {/* Dark Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-24 px-8 overflow-hidden bg-[var(--color-pf-navy)]">
          <div data-parallax className="absolute inset-0 z-0">
             <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
               <Image 
                 src="/assets/real/WhatsApp-Image-2025-08-11-at-11.27.53-AM.jpeg" 
                 alt="Fondo Contacto" 
                 fill 
                 className="object-cover opacity-70 mix-blend-luminosity grayscale-[30%]" 
                 priority
               />
             </div>
             <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-pf-navy)]/80 via-black/50 to-[var(--color-pf-bg)]"></div>
          </div>
          
          <div className="relative z-10 text-center w-full max-w-[1400px] mx-auto mt-auto pb-[10vh]">
            <div className="overflow-hidden mb-6 flex justify-center">
              <span className="hero-title-line font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--color-pf-gold)]">
                Sala de Ventas
              </span>
            </div>
            
            <h1 className="font-serif text-[clamp(40px,8vw,120px)] uppercase tracking-tighter leading-[0.85] font-normal scale-y-110 text-white">
              <div className="overflow-hidden"><div className="hero-title-line">AGENDA TU</div></div>
              <div className="overflow-hidden"><div className="hero-title-line text-[var(--color-pf-gold)]">VISITA</div></div>
            </h1>
            
            <div className="mt-[-2vh] md:mt-[-4vh] relative z-20">
              <span className="hero-script font-script text-[clamp(50px,7vw,120px)] text-white/90 capitalize drop-shadow-2xl inline-block -rotate-3">
                Experiencia Concierge
              </span>
            </div>
          </div>
          
        </section>

        {/* Concierge Form & Map */}
        <section id="contacto" className="relative bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] py-32 px-6 md:px-12 overflow-hidden">
          
          <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-6 relative z-10">
              <div className="overflow-hidden mb-6">
                <div data-reveal className="flex items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[var(--color-pf-navy)]/50">
                  <span className="text-[var(--color-pf-gold)]">Concierge</span>
                  <span>Agenda Privada</span>
                </div>
              </div>
              
              <h2 data-reveal className="font-serif font-light text-[clamp(40px,6vw,90px)] leading-[0.9] m-0 tracking-[-0.02em] text-[var(--color-pf-navy)] mb-10">
                Ven a caminar <br/>el proyecto
              </h2>
              
              <div data-reveal className="bg-white p-10 md:p-12 rounded-2xl shadow-[0_20px_50px_rgba(22,32,58,0.05)] border border-black/5 text-[var(--color-pf-navy)]">
                {sent ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <div className="w-20 h-20 rounded-full border border-[var(--color-pf-gold)] flex items-center justify-center mb-8">
                       <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[var(--color-pf-gold)]">
                         <polyline points="20 6 9 17 4 12"></polyline>
                       </svg>
                    </div>
                    <div className="font-serif text-[40px] font-light mb-4 text-[var(--color-pf-navy)]">Solicitud Recibida</div>
                    <p className="text-[14px] leading-[1.8] text-[var(--color-pf-navy)]/60 max-w-[30ch] mx-auto">
                      Gracias {nombre.split(' ')[0] || ''}, nuestro equipo concierge te contactará a la brevedad para confirmar tu cita.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="grid gap-8">
                    
                    <div className="relative group">
                      <input 
                        type="text"
                        required
                        value={nombre} 
                        onChange={(e) => setNombre(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-[var(--color-pf-navy)]/20 py-4 text-[16px] text-[var(--color-pf-navy)] outline-none focus:border-[var(--color-pf-gold)] transition-colors peer placeholder-transparent"
                        placeholder="Nombre Completo"
                      />
                      <label className="absolute left-0 top-4 text-[12px] uppercase tracking-[0.2em] font-mono text-[var(--color-pf-navy)]/40 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[9px] peer-focus:text-[var(--color-pf-gold)] peer-valid:-top-4 peer-valid:text-[9px] peer-valid:text-[var(--color-pf-gold)]">
                        Nombre completo
                      </label>
                    </div>
                    
                    <div className="relative group mt-2">
                      <input 
                        type="tel"
                        required
                        value={telefono} 
                        onChange={(e) => setTelefono(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-[var(--color-pf-navy)]/20 py-4 text-[16px] text-[var(--color-pf-navy)] outline-none focus:border-[var(--color-pf-gold)] transition-colors peer placeholder-transparent"
                        placeholder="Teléfono"
                      />
                      <label className="absolute left-0 top-4 text-[12px] uppercase tracking-[0.2em] font-mono text-[var(--color-pf-navy)]/40 pointer-events-none transition-all peer-focus:-top-4 peer-focus:text-[9px] peer-focus:text-[var(--color-pf-gold)] peer-valid:-top-4 peer-valid:text-[9px] peer-valid:text-[var(--color-pf-gold)]">
                        Teléfono
                      </label>
                    </div>
                    
                    <div className="relative group mt-2">
                      <select 
                        required
                        value={proyecto} 
                        onChange={(e) => setProyecto(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-[var(--color-pf-navy)]/20 py-4 text-[16px] text-[var(--color-pf-navy)] outline-none focus:border-[var(--color-pf-gold)] transition-colors peer appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="text-gray-400">Seleccionar Proyecto</option>
                        {proyectos.map(p => (
                          <option key={p.slug} value={p.nombre}>{p.nombre}</option>
                        ))}
                      </select>
                      <label className="absolute left-0 -top-4 text-[9px] uppercase tracking-[0.2em] font-mono text-[var(--color-pf-gold)] pointer-events-none">
                        Proyecto de Interés
                      </label>
                      <svg className="absolute right-0 top-6 pointer-events-none text-[var(--color-pf-navy)]/40" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    
                    <div className="relative group mt-2">
                      <input 
                        type="date"
                        required
                        value={fecha} 
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-[var(--color-pf-navy)]/20 py-4 text-[16px] text-[var(--color-pf-navy)] outline-none focus:border-[var(--color-pf-gold)] transition-colors peer"
                      />
                      <label className="absolute left-0 -top-4 text-[9px] uppercase tracking-[0.2em] font-mono text-[var(--color-pf-gold)] pointer-events-none">
                        Fecha Estimada
                      </label>
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="mt-8 w-full py-5 rounded-full bg-[var(--color-pf-navy)] text-white hover:bg-[var(--color-pf-gold)] hover:text-[var(--color-pf-navy)] transition-colors duration-500 text-[11px] uppercase tracking-[0.3em] font-semibold disabled:opacity-50"
                    >
                      {submitting ? "Enviando..." : "Confirmar Reserva"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Map Column */}
            <div className="lg:col-span-6 flex flex-col gap-12">
               
               <p data-reveal className="text-[15px] leading-[1.8] text-[var(--color-pf-dark)]/70 max-w-[45ch]">
                  Cuéntanos qué proyecto te interesa y un asesor especializado te recibirá en nuestra sala de ventas o directamente en la obra.
               </p>
               
               <div data-reveal className="grid gap-6 text-[11px] tracking-[0.2em] uppercase font-mono text-[var(--color-pf-navy)]/50">
                  <div className="pb-6 border-b border-[var(--color-pf-navy)]/10 flex flex-col gap-2">
                    <span className="text-[var(--color-pf-gold)]">Horario de Atención</span>
                    <span className="text-[var(--color-pf-navy)]">{config.contacto_horario || "Lunes a domingo · 8:00 a.m. — 5:00 p.m."}</span>
                  </div>
                  <div className="pb-6 border-b border-[var(--color-pf-navy)]/10 flex flex-col gap-2">
                    <span className="text-[var(--color-pf-gold)]">Ubicación (Principal)</span>
                    <span className="text-[var(--color-pf-navy)]">{config.contacto_direccion || "TR 34 Cl 36-2, Barrio Boston"}</span>
                  </div>
               </div>

               <div data-reveal className="relative w-full aspect-[4/3] bg-gray-200 rounded-2xl overflow-hidden shadow-lg grayscale hover:grayscale-0 transition-all duration-700">
                  {/* Google Maps iframe (Sincelejo, Sucre generic) */}
                  <iframe 
                    src={config.contacto_mapa || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15764.577583626242!2d-75.3995!3d9.2985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e5914fa6163351b%3A0xc392fa94179e8e4a!2sSincelejo%2C%20Sucre!5e0!3m2!1sen!2sco!4v1700000000000!5m2!1sen!2sco"} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
               </div>

            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
