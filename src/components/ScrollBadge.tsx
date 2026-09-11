"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollBadge() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Live scroll progress counter
    const updateScrollProgress = () => {
      if (scrollProgressRef.current) {
        const max = ScrollTrigger.maxScroll(window);
        const current = window.scrollY || document.documentElement.scrollTop;
        const progress =
          max > 0
            ? Math.min(100, Math.max(0, Math.round((current / max) * 100)))
            : 0;
        scrollProgressRef.current.textContent = progress
          .toString()
          .padStart(2, "0");
      }
    };
    gsap.ticker.add(updateScrollProgress);

    // Fade badge out while inside the hero, back in once past it
    const fadeOut = ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: () => `${window.innerHeight}px top`,
      scrub: 0.8,
      onUpdate: (self) => {
        if (badgeRef.current) {
          // Fade out from 0% to 40% of hero scroll, then remain hidden until past hero
          const opacity = self.progress < 0.4
            ? 1 - self.progress / 0.4
            : 0;
          gsap.set(badgeRef.current, { opacity, pointerEvents: opacity > 0.1 ? "auto" : "none" });
        }
      },
      onLeave: () => {
        // Once past the hero bring it back (progress counter becomes useful)
        if (badgeRef.current) {
          gsap.to(badgeRef.current, { opacity: 1, duration: 0.6, ease: "power2.out", pointerEvents: "auto" });
        }
      },
      onEnterBack: () => {
        // Re-entering hero from below — fade it out again
        if (badgeRef.current) {
          gsap.to(badgeRef.current, { opacity: 0, duration: 0.4, ease: "power2.in", pointerEvents: "none" });
        }
      },
    });

    return () => {
      gsap.ticker.remove(updateScrollProgress);
      fadeOut.kill();
    };
  }, []);

  return (
    <div
      ref={badgeRef}
      className="fixed top-24 left-8 md:top-32 md:left-12 z-50 text-[var(--color-pf-gold)] drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] flex flex-col items-center gap-6 pointer-events-none"
    >
      {/* Circular spinning badge */}
      <div className="relative w-28 h-28 md:w-36 md:h-36">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-current animate-[spin_15s_linear_infinite]"
        >
          <path
            id="scrollBadgeCirclePath"
            d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
            fill="none"
          />
          <text fontSize="10" letterSpacing="4.5" fill="currentColor" className="font-mono uppercase">
            <textPath href="#scrollBadgeCirclePath" startOffset="0%">
              PROMOTORAS • FULL •{" "}
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-16 h-16 md:w-24 md:h-24 bg-current"
            style={{
              maskImage: "url(/assets/real/logo-f.webp)",
              maskSize: "contain",
              maskPosition: "center",
              maskRepeat: "no-repeat",
              WebkitMaskImage: "url(/assets/real/logo-f.webp)",
              WebkitMaskSize: "contain",
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
            }}
          />
        </div>
      </div>

      {/* Vertical progress line + counter */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="w-[1px] h-10 bg-current opacity-40" />
        <span
          ref={scrollProgressRef}
          className="text-[12px] tracking-[0.2em] font-sans font-bold"
        >
          00
        </span>
        <div className="w-[1px] h-48 md:h-64 bg-current opacity-10" />
        <span
          className="text-[9px] tracking-[0.4em] font-mono uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          SCROLL
        </span>
        <svg
          width="10"
          height="30"
          viewBox="0 0 10 30"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="opacity-60"
        >
          <path d="M5 0 L5 30 M1 26 L5 30 L9 26" />
        </svg>
      </div>
    </div>
  );
}
