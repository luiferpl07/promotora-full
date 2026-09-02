"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [config, setConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/site-config")
      .then(r => r.json())
      .then(setConfig)
      .catch(console.error);
  }, []);

  return (
    <footer className="bg-[var(--color-pf-bg)] text-[var(--color-pf-dark)] w-full relative z-10">
      <div className="border-t border-[rgba(22,32,58,.1)] pt-16 pb-12 px-6 md:px-12 w-full max-w-[1400px] mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-start mb-16">
        
        {/* Brand */}
        <div className="flex flex-col gap-6 items-center md:items-start text-center md:text-left">
          <Image
            src="/assets/real/logo.png"
            alt="Grupo Empresarial Promotoras Full"
            width={300}
            height={75}
            className="w-auto h-[55px] opacity-90 drop-shadow-sm brightness-75 contrast-125 mix-blend-multiply"
          />
          <p className="text-[10px] tracking-[0.1em] uppercase opacity-50 max-w-[200px]">
            Construye tu futuro en un entorno natural y exclusivo.
          </p>
        </div>

        {/* Links & Socials */}
        <div className="flex flex-col gap-4 items-center text-center">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[9px] tracking-[0.2em] uppercase font-semibold">
            <Link href="/nosotros" className="hover:text-[var(--color-pf-gold)] transition-colors">Nosotros</Link>
            <Link href="/contacto" className="hover:text-[var(--color-pf-gold)] transition-colors">Contacto</Link>
            <Link href="/cookies" className="hover:text-[var(--color-pf-gold)] transition-colors">Políticas de Cookies</Link>
            <Link href="/privacidad" className="hover:text-[var(--color-pf-gold)] transition-colors">Privacidad</Link>
            <Link href="/legal" className="hover:text-[var(--color-pf-gold)] transition-colors">Aviso Legal</Link>
          </div>
          <div className="flex gap-6 mt-4 text-[10px] tracking-[0.2em] uppercase text-[var(--color-pf-gold)]">
            {config.social_facebook && <a href={config.social_facebook} target="_blank" className="hover:text-[var(--color-pf-navy)] transition-colors">Facebook</a>}
            {config.social_instagram && <a href={config.social_instagram} target="_blank" className="hover:text-[var(--color-pf-navy)] transition-colors">Instagram</a>}
            {config.social_whatsapp && <a href={config.social_whatsapp} target="_blank" className="hover:text-[var(--color-pf-navy)] transition-colors">WhatsApp</a>}
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-3 items-center md:items-end text-center md:text-right text-[9px] tracking-[0.2em] uppercase leading-loose opacity-70">
          {config.contacto_direccion ? (
            config.contacto_direccion.split('—').map((line, i) => <p key={i}>{line.trim()}</p>)
          ) : (
            <><p>TR 34 Cl 36-2, Barrio Boston</p><p>Sincelejo — Sucre</p></>
          )}
          <p>{config.contacto_email || "Promotorafullcartera.arizona@gmail.com"}</p>
          <p>Comercial {config.contacto_telefono || "(+57) 324 6425561"}</p>
        </div>

      </div>

      {/* Disclaimer & Copyright */}
      <div className="flex flex-col gap-8 items-center text-center border-t border-[rgba(22,32,58,.05)] pt-10 mt-10">
        <p className="text-[10px] md:text-[11px] leading-relaxed tracking-wide opacity-60 max-w-5xl">
          {config.footer_disclaimer || "Las imágenes y planos son una representación artística del diseño del proyecto y están sujetas a cambios sin previo aviso. Los materiales, acabados, colores, texturas y detalles representados en las imágenes son solo para ambientación, no comprometen al constructor y están sujetos a cambios sin previo aviso. Las vistas y entorno de los lotes son solo para ambientación y no comprometen a la Promotora. El mobiliario es solo para ambientación y no está incluido. Para una representación correcta, haga referencia al folleto y documentos contractuales."}
        </p>
        <p className="text-[10px] tracking-[0.2em] uppercase opacity-70 font-semibold mt-4">
          © {new Date().getFullYear()} PROMOTORAS FULL. Todos los derechos reservados.
        </p>
      </div>
      </div>
    </footer>
  );
}
