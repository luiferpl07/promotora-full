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

interface Step {
  id: string; numero: string; titulo: string; texto: string; orden: number;
}

export default function ComoComprar() {
  const container = useRef<HTMLDivElement>(null);
  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    fetch("/api/como-comprar")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSteps(data); })
      .catch(console.error);
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
  }, { scope: container, dependencies: [steps] });

  return (
    <div ref={container} className="bg-[var(--color-pf-navy)]">
      <Navigation />
      <ScrollBadge />
      <main className="overflow-x-hidden font-sans relative z-10 text-[var(--color-pf-bg)]">

        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-24 px-8 overflow-hidden bg-[var(--color-pf-navy)]">
          <div data-parallax className="absolute inset-0 z-0">
             <div data-zoom className="absolute inset-[-10%] w-[120%] h-[120%]">
               <Image src="/assets/real/Escena-4.png" alt="Fondo Cómo Comprar" fill className="object-cover opacity-60 mix-blend-luminosity grayscale-[50%]" priority />
             </div>
             <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-pf-navy)]/80 via-black/50 to-[var(--color-pf-bg)]"></div>
          </div>
          <div className="relative z-10 text-center w-full max-w-[1400px] mx-auto mt-auto pb-[10vh]">
            <div className="overflow-hidden mb-6 flex justify-center">
              <span className="hero-title-line font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--color-pf-gold)]">Guía de Compra</span>
            </div>
            <h1 className="font-serif text-[clamp(40px,8vw,120px)] uppercase tracking-tighter leading-[0.85] font-normal scale-y-110 text-white">
              <div className="overflow-hidden"><div className="hero-title-line">CÓMO</div></div>
              <div className="overflow-hidden"><div className="hero-title-line text-[var(--color-pf-gold)]">COMPRAR</div></div>
            </h1>
            <div className="mt-[-2vh] md:mt-[-4vh] relative z-20">
              <span className="hero-script font-script text-[clamp(50px,7vw,120px)] text-white/90 capitalize drop-shadow-2xl inline-block -rotate-3">Tu inversión segura</span>
            </div>
          </div>
        </section>

        <section className="bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] py-[clamp(100px,15vw,220px)] px-6 md:px-12 relative z-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="overflow-hidden mb-24">
              <div data-reveal className="flex items-baseline gap-[16px] text-[10px] tracking-[0.34em] uppercase text-[var(--color-pf-navy)]/50 mb-[26px]">
                <span className="text-[var(--color-pf-gold)]">Proceso</span>
                <span>Cuatro pasos simples</span>
              </div>
              <h2 data-reveal className="font-serif font-light text-[clamp(36px,5vw,70px)] leading-[1] tracking-[-0.02em] text-[var(--color-pf-navy)]">
                Tu camino hacia el lote<br />de tus sueños
              </h2>
            </div>
            
            <div className="relative">
              {/* Línea vertical */}
              <div className="absolute left-0 md:left-[5%] top-0 bottom-0 w-[1px] bg-[var(--color-pf-navy)]/10 hidden md:block"></div>
              
              <div className="space-y-32 md:space-y-24">
                {steps.map((step, i) => (
                  <div key={step.id} className={`relative grid grid-cols-1 md:grid-cols-12 gap-8 items-start ${i % 2 !== 0 ? "md:text-right" : ""}`}>
                    <div className="md:col-span-2 flex items-center gap-6">
                      <div className="hidden md:block w-4 h-4 rounded-full border-2 border-[var(--color-pf-gold)] bg-white absolute left-[5%] top-0 -translate-x-[7px]"></div>
                      <div data-reveal className="font-serif font-light text-[clamp(80px,10vw,130px)] leading-none text-[var(--color-pf-navy)]/10 md:ml-16">{step.numero}</div>
                    </div>
                    <div className="md:col-span-8">
                      <h3 data-reveal className="font-serif font-light text-[clamp(36px,4vw,60px)] leading-[1.1] text-[var(--color-pf-navy)] mb-8">{step.titulo}</h3>
                      <div data-reveal className="w-8 h-[1px] bg-[var(--color-pf-gold)] mb-8"></div>
                      <p data-reveal className="text-[16px] md:text-[18px] leading-[1.8] text-[var(--color-pf-dark)]/70 font-light max-w-[50ch]">{step.texto}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div data-reveal className="mt-40 text-center">
              <Link href="/contacto" className="inline-flex items-center gap-4 px-12 py-6 rounded-full bg-[var(--color-pf-navy)] !text-white hover:bg-[var(--color-pf-gold)] hover:!text-[var(--color-pf-navy)] transition-colors duration-500 text-[11px] uppercase tracking-[0.3em] font-semibold">
                Agendar mi Visita
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
