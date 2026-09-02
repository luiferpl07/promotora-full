"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Preloader() {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let n = 0;
    const timer = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 8));
      setCount(n);
      if (n >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          if (preloaderRef.current) {
            preloaderRef.current.style.transition =
              "transform 1s cubic-bezier(.76,0,.24,1)";
            preloaderRef.current.style.transform = "translateY(-101%)";
            setTimeout(() => setVisible(false), 1050);
          }
        }, 300);
      }
    }, 50);

    return () => clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[200] bg-[var(--color-pf-bg)] flex flex-col justify-between p-[34px] will-change-transform"
    >
      <div className="text-[10px] tracking-[0.36em] uppercase text-[var(--color-pf-dark)] opacity-45">
        Grupo Empresarial
      </div>
      <div className="flex items-end justify-center flex-1">
        <Image
          src="/assets/logo-promotoras-full.png"
          alt="Grupo Empresarial Promotoras Full"
          width={520}
          height={200}
          className="w-[min(46vw,520px)] h-auto block"
          priority
        />
      </div>
      <div className="flex items-end justify-between gap-[20px] pt-[26px] border-t border-[rgba(22,32,58,.14)]">
        <div className="text-[10px] tracking-[0.36em] uppercase text-[var(--color-pf-dark)] opacity-45">
          Lotes campestres · Colombia
        </div>
        <div className="font-mono text-[clamp(26px,4vw,52px)] leading-none text-[var(--color-pf-dark)]">
          {count === 100 ? "100" : String(count).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
