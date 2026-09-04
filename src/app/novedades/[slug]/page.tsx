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

interface NewsItem {
  id: string;
  titulo: string;
  slug: string;
  resumen: string;
  contenido: string | null;
  imgDestacada: string | null;
  publicado: boolean;
  fecha: string;
}

export default function NovedadDetail() {
  const params = useParams();
  const container = useRef<HTMLDivElement>(null);
  const [novedad, setNovedad] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news")
      .then(r => r.json())
      .then((data: NewsItem[]) => {
        if (Array.isArray(data)) {
          const found = data.find(n => n.slug === params.slug && n.publicado);
          if (found) setNovedad(found);
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
    if (!novedad) return;

    const revealElements = gsap.utils.toArray("[data-reveal]") as HTMLElement[];
    revealElements.forEach((el) => {
      gsap.fromTo(el, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
  }, { scope: container, dependencies: [novedad] });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  };

  if (loading) return <div className="min-h-screen bg-[var(--color-pf-bg)] flex items-center justify-center">Cargando...</div>;
  if (!novedad) return <div className="min-h-screen bg-[var(--color-pf-bg)] flex items-center justify-center">Novedad no encontrada.</div>;

  return (
    <div ref={container} className="bg-[var(--color-pf-navy)]">
      <Navigation />
      <ScrollBadge />
      <main className="overflow-x-hidden font-sans relative z-10 text-[var(--color-pf-bg)]">

        <section className="relative min-h-[80vh] flex flex-col items-center justify-center pt-32 pb-24 px-8 overflow-hidden bg-[var(--color-pf-navy)]">
          <div className="absolute inset-0 z-0">
            {novedad.imgDestacada && (
              <Image src={novedad.imgDestacada} alt={novedad.titulo} fill className="object-cover opacity-60 mix-blend-luminosity grayscale-[50%]" priority />
            )}
             <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-pf-navy)]/80 via-black/50 to-black/80"></div>
          </div>

          <div className="relative z-10 text-center w-full max-w-[1000px] mx-auto mt-auto pb-[10vh]">
            <div className="overflow-hidden mb-6 flex justify-center">
              <span className="hero-title-line font-mono text-[11px] tracking-[0.4em] uppercase text-[var(--color-pf-gold)]">{formatDate(novedad.fecha)}</span>
            </div>
            <h1 className="font-serif text-[clamp(32px,6vw,80px)] uppercase tracking-tighter leading-[0.95] font-normal text-white drop-shadow-2xl">
              <div className="overflow-hidden"><div className="hero-title-line">{novedad.titulo}</div></div>
            </h1>
          </div>
        </section>

        <section className="bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] py-[clamp(80px,10vw,150px)] px-6 md:px-12 relative z-20">
          <div className="max-w-[800px] mx-auto">
            <p data-reveal className="text-[18px] leading-[1.9] text-[var(--color-pf-navy)]/80 font-light mb-12">
              {novedad.resumen}
            </p>
            {novedad.contenido && (
              <div data-reveal className="text-[16px] leading-[1.9] text-[var(--color-pf-dark)]/70 font-light whitespace-pre-line">
                {novedad.contenido}
              </div>
            )}

            <div data-reveal className="mt-20 pt-10 border-t border-[var(--color-pf-navy)]/10 flex justify-between items-center flex-wrap gap-6">
              <Link href="/novedades" className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-pf-navy)]/60 hover:text-[var(--color-pf-gold)] transition-colors">← Todas las novedades</Link>
              <Link href="/contacto" className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-[var(--color-pf-navy)] !text-white hover:bg-[var(--color-pf-gold)] hover:!text-[var(--color-pf-navy)] transition-colors text-[11px] uppercase tracking-[0.2em] font-semibold">
                Agenda tu visita
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
