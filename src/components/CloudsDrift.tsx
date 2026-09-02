import Image from "next/image";
import type { CSSProperties } from "react";

function Cloud({ className = "", flip = false, blur = false }: { className?: string; flip?: boolean; blur?: boolean }) {
  return (
    <div
      className={`absolute ${className} ${blur ? "blur-[1px]" : ""}`}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <Image src="/assets/clouds/cloud1.png" alt="" fill className="object-contain" />
    </div>
  );
}

function CloudGroup() {
  return (
    <div className="relative w-1/2 h-full flex-shrink-0">
      <Cloud className="top-[4%] left-[0%] w-[34vw] h-[14vw] max-w-[460px] max-h-[190px] opacity-75" blur />
      <Cloud className="top-[32%] left-[24%] w-[13vw] h-[5.5vw] max-w-[170px] max-h-[75px] opacity-45" flip blur />
      <Cloud className="top-[0%] left-[42%] w-[40vw] h-[16.5vw] max-w-[560px] max-h-[225px] opacity-85" />
      <Cloud className="top-[36%] left-[68%] w-[15vw] h-[6.5vw] max-w-[200px] max-h-[88px] opacity-55" flip blur />
      <Cloud className="top-[8%] left-[82%] w-[27vw] h-[11vw] max-w-[360px] max-h-[150px] opacity-65" blur />
    </div>
  );
}

export default function CloudsDrift({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute inset-0 flex w-[200%] animate-[pfCloudDrift_100s_linear_infinite]">
        <CloudGroup />
        <CloudGroup />
      </div>
    </div>
  );
}
