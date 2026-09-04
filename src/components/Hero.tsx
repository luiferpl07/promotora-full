"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";

const DEFAULT_IMG_DIA = "/assets/real/Lagos-del-palmar.jpeg";
const DEFAULT_IMG_NOCHE = "/assets/real/Escena-4.png";

export default function Hero() {
  const container = useRef<HTMLDivElement>(null);
  const [isDay, setIsDay] = useState(true);
  const [media, setMedia] = useState({
    imgDia: DEFAULT_IMG_DIA,
    imgNoche: DEFAULT_IMG_NOCHE,
    videoDia: "",
    videoNoche: "",
  });

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
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gentle floating animation for the entire hero text block
      gsap.fromTo(
        ".hero-text-block",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 2, ease: "power3.out", stagger: 0.2 }
      );
    }, container);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={container} className="relative h-screen w-full overflow-hidden bg-[var(--color-pf-navy)] text-white font-sans">
      
      {/* Background Media Layer (Day / Night Toggleable) */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${isDay ? 'opacity-100' : 'opacity-0'}`}>
          {media.videoDia ? (
            <video src={media.videoDia} className="w-full h-full object-cover scale-105" autoPlay muted loop playsInline />
          ) : (
            <div className="w-full h-full bg-cover bg-center bg-no-repeat scale-105" style={{ backgroundImage: `url('${media.imgDia}')` }} />
          )}
        </div>
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${!isDay ? 'opacity-100' : 'opacity-0'}`}>
          {media.videoNoche ? (
            <video src={media.videoNoche} className="w-full h-full object-cover scale-105" autoPlay muted loop playsInline />
          ) : (
            <div className="w-full h-full bg-cover bg-center bg-no-repeat scale-105" style={{ backgroundImage: `url('${media.imgNoche}')` }} />
          )}
        </div>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* UI Controls Overlay */}
      <div className="relative z-10 flex flex-col justify-between h-[90vh] md:h-full p-8 md:p-12 pointer-events-none">
        
        {/* Top Bar (Empty now as per user request to remove right links and move circle) */}
        <div className="flex justify-between items-start hero-text-block pointer-events-auto h-24">
        </div>

        {/* Center Main Title Block */}
        <div className="text-center relative my-auto hero-text-block mt-[5vh] md:mt-[8vh]">
          <h1 className="font-serif text-[clamp(60px,12vw,180px)] uppercase tracking-tighter leading-[0.8] drop-shadow-2xl font-normal scale-y-110">
            PROMOTORAS
          </h1>
          <h1 className="font-serif text-[clamp(60px,12vw,180px)] uppercase tracking-tighter leading-[0.8] drop-shadow-2xl font-normal scale-y-110 text-white mt-2">
            FULL
          </h1>
          {/* Script Overlay */}
          <span className="font-script text-[clamp(50px,8vw,120px)] text-[var(--color-pf-gold)] capitalize absolute left-1/2 -translate-x-1/2 -bottom-[10%] md:-bottom-[15%] z-20 pointer-events-none drop-shadow-xl" style={{ textShadow: '2px 4px 10px rgba(0,0,0,0.5)'}}>
            Lotes Campestres
          </span>
        </div>

        {/* Sub-row / Tagline + Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end text-sm hero-text-block pointer-events-auto w-full px-4 md:px-12 pb-4">
          <span className="font-serif uppercase tracking-[0.3em] text-white/90 hidden md:block text-base w-1/3 text-left">
            CONSTRUYE TU
          </span>

          {/* Day/Night Toggle */}
          <div className="flex items-center gap-4 mx-auto w-1/3 justify-center">
            <button 
              onClick={() => setIsDay(true)} 
              className={`font-mono text-[10px] tracking-[0.3em] uppercase transition-all duration-500 pb-1 border-b-2 ${isDay ? 'text-white border-white' : 'text-white/50 border-transparent hover:text-white/80'}`}
            >
              DÍA
            </button>
            <span className="text-white/30 font-light">—</span>
            <button 
              onClick={() => setIsDay(false)}
              className={`font-mono text-[10px] tracking-[0.3em] uppercase transition-all duration-500 pb-1 border-b-2 ${!isDay ? 'text-white border-white' : 'text-white/50 border-transparent hover:text-white/80'}`}
            >
              NOCHE
            </button>
          </div>

          <span className="font-serif uppercase tracking-[0.3em] text-white/90 hidden md:block text-base w-1/3 text-right">
            PATRIMONIO
          </span>
        </div>
      </div>

      {/* Left Side Scroll Indicator */}
      <div className="absolute left-8 bottom-1/4 -rotate-90 origin-left text-[9px] tracking-[0.4em] uppercase text-white/70 flex items-center gap-4 hero-text-block">
        <span>SCROLL</span>
        <span className="w-12 h-[1px] bg-white/50"></span>
      </div>

    </section>
  );
}
