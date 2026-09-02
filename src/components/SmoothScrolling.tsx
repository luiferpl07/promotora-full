"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrolling({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Check lenis inside the update loop so it works even after React mounts
    function update(time: number) {
      if (lenisRef.current?.lenis) {
        lenisRef.current.lenis.raf(time * 1000);
      }
    }
    
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Refresh after DOM load to ensure maxScroll is correct for GSAP pins
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      if (lenisRef.current?.lenis) {
        lenisRef.current.lenis.resize();
      }
    }, 1000);

    return () => {
      gsap.ticker.remove(update);
      clearTimeout(timer);
    };
  }, []);

  return (
    <ReactLenis ref={lenisRef} root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }} autoRaf={false}>
      {children}
    </ReactLenis>
  );
}
