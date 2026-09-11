"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DEFAULT_IMG_DIA = "/assets/real/Lagos-del-palmar.jpeg";
const DEFAULT_IMG_NOCHE = "/assets/real/Escena-4.png";

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const titleBlockRef = useRef<HTMLDivElement>(null);
  const titlePromotorasRef = useRef<HTMLHeadingElement>(null);
  const titleFullRef = useRef<HTMLHeadingElement>(null);
  const scriptTextRef = useRef<HTMLSpanElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const decorLineLeftRef = useRef<HTMLDivElement>(null);
  const decorLineRightRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);

  const [isDay, setIsDay] = useState(true);
  const [media, setMedia] = useState({
    imgDia: DEFAULT_IMG_DIA,
    imgNoche: DEFAULT_IMG_NOCHE,
    videoDia: "",
    videoNoche: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Fetch config (unchanged) ──────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/site-config")
      .then(r => r.json())
      .then((cfg: Record<string, string>) => {
        setMedia({
          imgDia: cfg.hero_img_dia || DEFAULT_IMG_DIA,
          imgNoche: cfg.hero_img_noche || DEFAULT_IMG_NOCHE,
          videoDia: cfg.hero_video_dia || "",
          videoNoche: cfg.hero_video_noche || "",
        });
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error(err);
        setIsLoaded(true);
      });
  }, []);

  // ── Cinematic Entry + Scroll Animations ───────────────────────────────────
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      // ── 1. CINEMATIC ENTRY SEQUENCE ──────────────────────────────────────
      if (prefersReducedMotion) {
        // Instant reveal when motion is reduced
        gsap.set(
          [
            overlayRef.current,
            eyebrowRef.current,
            titlePromotorasRef.current,
            titleFullRef.current,
            scriptTextRef.current,
            bottomBarRef.current,
            scrollIndicatorRef.current,
            decorLineLeftRef.current,
            decorLineRightRef.current,
          ],
          { opacity: 1, y: 0, scale: 1, filter: "none" }
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Initial hidden states
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(eyebrowRef.current, { opacity: 0, y: 16 });
      gsap.set(titlePromotorasRef.current, {
        opacity: 0,
        y: 50,
        filter: "blur(8px)",
      });
      gsap.set(titleFullRef.current, {
        opacity: 0,
        y: 40,
        filter: "blur(6px)",
      });
      gsap.set(scriptTextRef.current, {
        opacity: 0,
        y: 30,
        filter: "blur(4px)",
      });
      gsap.set(bottomBarRef.current, { opacity: 0, y: 20 });
      gsap.set(scrollIndicatorRef.current, { opacity: 0, y: 12 });
      gsap.set(decorLineLeftRef.current, { scaleY: 0, transformOrigin: "top" });
      gsap.set(decorLineRightRef.current, {
        scaleY: 0,
        transformOrigin: "top",
      });

      // Sequence
      tl.to(overlayRef.current, { opacity: 1, duration: 1.4 }, 0.3)
        .to(
          eyebrowRef.current,
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
          1.0
        )
        .to(
          [decorLineLeftRef.current, decorLineRightRef.current],
          { scaleY: 1, duration: 1.6, ease: "power2.inOut" },
          1.2
        )
        .to(
          titlePromotorasRef.current,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.6,
            ease: "power3.out",
          },
          1.3
        )
        .to(
          titleFullRef.current,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "power3.out",
          },
          1.7
        )
        .to(
          scriptTextRef.current,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.4,
            ease: "power2.out",
          },
          2.0
        )
        .to(
          bottomBarRef.current,
          { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
          2.3
        )
        .to(
          scrollIndicatorRef.current,
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
          2.7
        );

      // ── 2. SCROLL-DRIVEN EFFECTS ─────────────────────────────────────────
      const hero = container.current;
      if (!hero) return;

      // 2a. Background subtle zoom — "camera enters the project"
      gsap.fromTo(
        bgLayerRef.current,
        { scale: 1.05 },
        {
          scale: 1.10,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
        }
      );

      // 2b. Overlay darkens slightly as user scrolls (landscape gains prominence)
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0.35 },
        {
          opacity: 0.72,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "60% top",
            scrub: 1,
          },
        }
      );

      // 2c. PROMOTORAS fades & rises first (primary text — starts after eyebrow gone)
      gsap.fromTo(
        titlePromotorasRef.current,
        { opacity: 1, y: 0, filter: "blur(0px)" },
        {
          opacity: 0,
          y: -60,
          filter: "blur(4px)",
          ease: "power2.in",
          scrollTrigger: {
            trigger: hero,
            start: "15% top",
            end: "50% top",
            scrub: 1.2,
          },
        }
      );

      // 2d. "FULL" disappears slightly after PROMOTORAS
      gsap.fromTo(
        titleFullRef.current,
        { opacity: 1, y: 0, filter: "blur(0px)" },
        {
          opacity: 0,
          y: -45,
          filter: "blur(3px)",
          ease: "power2.in",
          scrollTrigger: {
            trigger: hero,
            start: "20% top",
            end: "55% top",
            scrub: 1.2,
          },
        }
      );

      // 2e. Script text disappears last (Lotes Campestres)
      gsap.fromTo(
        scriptTextRef.current,
        { opacity: 1, y: 0, filter: "blur(0px)" },
        {
          opacity: 0,
          y: -30,
          filter: "blur(2px)",
          ease: "power2.in",
          scrollTrigger: {
            trigger: hero,
            start: "25% top",
            end: "60% top",
            scrub: 1.2,
          },
        }
      );

      // 2f. Bottom bar disappears early
      gsap.fromTo(
        bottomBarRef.current,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: 20,
          ease: "power2.in",
          scrollTrigger: {
            trigger: hero,
            start: "10% top",
            end: "35% top",
            scrub: 1,
          },
        }
      );

      // 2g. Decor lines collapse
      gsap.fromTo(
        [decorLineLeftRef.current, decorLineRightRef.current],
        { scaleY: 1 },
        {
          scaleY: 0,
          ease: "power2.in",
          scrollTrigger: {
            trigger: hero,
            start: "8% top",
            end: "30% top",
            scrub: 1,
          },
        }
      );

      // 2h. Eyebrow fades first
      gsap.fromTo(
        eyebrowRef.current,
        { opacity: 1, y: 0 },
        {
          opacity: 0,
          y: -10,
          ease: "power2.in",
          scrollTrigger: {
            trigger: hero,
            start: "5% top",
            end: "25% top",
            scrub: 1,
          },
        }
      );

      // 2i. Scroll indicator disappears immediately on first scroll
      gsap.fromTo(
        scrollIndicatorRef.current,
        { opacity: 1 },
        {
          opacity: 0,
          ease: "power2.in",
          scrollTrigger: {
            trigger: hero,
            start: "3% top",
            end: "18% top",
            scrub: 1,
          },
        }
      );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={container}
      className="relative h-screen w-full overflow-hidden bg-[var(--color-pf-navy)] text-white font-sans"
    >
      {/* ── Background Media Layer (Day / Night — UNCHANGED) ────────────── */}
      <div
        ref={bgLayerRef}
        className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ willChange: "transform" }}
      >
        {/* DAY */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            isDay ? "opacity-100" : "opacity-0"
          }`}
        >
          {media.videoDia ? (
            <video
              src={media.videoDia}
              className="w-full h-full object-cover scale-105"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat scale-105"
              style={{ backgroundImage: `url('${media.imgDia}')` }}
            />
          )}
        </div>

        {/* NIGHT */}
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            !isDay ? "opacity-100" : "opacity-0"
          }`}
        >
          {media.videoNoche ? (
            <video
              src={media.videoNoche}
              className="w-full h-full object-cover scale-105"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat scale-105"
              style={{ backgroundImage: `url('${media.imgNoche}')` }}
            />
          )}
        </div>

        {/* Base overlay for video transparency */}
        <div
          className={`absolute inset-0 transition-colors duration-1000 ${
            (isDay && media.videoDia) || (!isDay && media.videoNoche)
              ? "bg-transparent"
              : "bg-black/20"
          }`}
        />
      </div>

      {/* ── Cinematic gradient overlay (animated on scroll) ─────────────── */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(22,32,58,0.55) 0%, rgba(22,32,58,0.10) 45%, rgba(22,32,58,0.40) 85%, rgba(22,32,58,0.75) 100%)",
          opacity: 0,
        }}
      />

      {/* ── Vertical decorative lines ───────────────────────────────────── */}
      <div
        ref={decorLineLeftRef}
        className="absolute left-8 md:left-14 top-[18%] bottom-[22%] z-10 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/25 to-transparent" />
      </div>
      <div
        ref={decorLineRightRef}
        className="absolute right-8 md:right-14 top-[18%] bottom-[22%] z-10 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/25 to-transparent" />
      </div>

      {/* ── UI Overlay ──────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">

        {/* Eyebrow / location label */}
        <div
          ref={eyebrowRef}
          className="absolute top-[18vh] left-1/2 -translate-x-1/2 z-10 flex items-center gap-4"
          style={{ opacity: 0 }}
        >
          <div className="w-8 h-[1px] bg-[var(--color-pf-gold)]/70" />
          <span className="font-mono text-[9px] md:text-[10px] tracking-[0.45em] uppercase text-[var(--color-pf-gold)]/90">
            Lotes Campestres
          </span>
          <div className="w-8 h-[1px] bg-[var(--color-pf-gold)]/70" />
        </div>

        {/* Top bar spacer (Navigation is fixed on top — no content needed here) */}
        <div className="h-24" />

        {/* ── Main Title Block ─────────────────────────────────────────── */}
        <div
          ref={titleBlockRef}
          className="text-center relative flex-1 flex flex-col items-center justify-center mt-[-6vh]"
        >
          {/* PROMOTORAS */}
          <h1
            ref={titlePromotorasRef}
            className="font-serif text-[clamp(52px,13vw,190px)] uppercase tracking-[-0.02em] leading-[0.82] drop-shadow-2xl font-normal"
            style={{ opacity: 0, willChange: "transform, opacity, filter" }}
          >
            PROMOTORAS
          </h1>

          {/* FULL — slightly smaller to create hierarchy */}
          <h1
            ref={titleFullRef}
            className="font-serif text-[clamp(44px,11vw,160px)] uppercase tracking-[-0.01em] leading-[0.88] drop-shadow-2xl font-normal text-white mt-1"
            style={{ opacity: 0, willChange: "transform, opacity, filter" }}
          >
            FULL
          </h1>

          {/* Script overlay — Lotes Campestres */}
          <span
            ref={scriptTextRef}
            className="font-script text-[clamp(28px,6.5vw,100px)] text-[var(--color-pf-gold)] mt-3 md:mt-1 z-20 pointer-events-none drop-shadow-xl block"
            style={{
              textShadow: "2px 4px 12px rgba(0,0,0,0.45)",
              opacity: 0,
              willChange: "transform, opacity, filter",
            }}
          >
            Lotes Campestres
          </span>
        </div>

        {/* ── Bottom bar: Tagline + Day/Night Toggle ───────────────────── */}
        <div
          ref={bottomBarRef}
          className="pointer-events-auto w-full px-8 md:px-16 pb-8 md:pb-12"
          style={{ opacity: 0 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 md:gap-0">
            {/* Left tagline */}
            <div className="hidden md:flex flex-col gap-1 w-1/3">
              <span className="font-serif uppercase tracking-[0.35em] text-white/75 text-[11px] leading-relaxed">
                CONSTRUYE TU
              </span>
              <span className="font-serif uppercase tracking-[0.35em] text-white/75 text-[11px]">
                PATRIMONIO
              </span>
            </div>

            {/* Day/Night Toggle — centered */}
            <div className="flex items-center gap-5 w-full md:w-auto justify-center">
              <button
                onClick={() => setIsDay(true)}
                className={`font-mono text-[9px] tracking-[0.35em] uppercase transition-all duration-700 pb-1 border-b ${
                  isDay
                    ? "text-white border-white"
                    : "text-white/40 border-transparent hover:text-white/70"
                }`}
              >
                DÍA
              </button>
              <span className="text-white/25 font-light text-xs">—</span>
              <button
                onClick={() => setIsDay(false)}
                className={`font-mono text-[9px] tracking-[0.35em] uppercase transition-all duration-700 pb-1 border-b ${
                  !isDay
                    ? "text-white border-white"
                    : "text-white/40 border-transparent hover:text-white/70"
                }`}
              >
                NOCHE
              </button>
            </div>

            {/* Right — empty balancer on desktop */}
            <div className="hidden md:block w-1/3" />
          </div>
        </div>
      </div>

      {/* ── Scroll Indicator ────────────────────────────────────────────── */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <span className="font-mono text-[8px] tracking-[0.5em] uppercase text-white/50">
          SCROLL
        </span>
        <div className="relative w-[1px] h-12 overflow-hidden">
          <div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-transparent via-white/70 to-transparent"
            style={{
              height: "200%",
              animation: "heroScrollLine 1.8s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* ── Inline keyframes for scroll indicator ───────────────────────── */}
      <style>{`
        @keyframes heroScrollLine {
          0%   { transform: translateY(-100%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [ref="scrollIndicatorRef"] { display: none; }
        }
      `}</style>
    </section>
  );
}
