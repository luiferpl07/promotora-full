"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, CardTitle, Field, Icon, IconName, LoadingBlock, TextArea, TextInput } from "@/components/admin/AdminUI";

type Config = Record<string, string>;

const HERO_DEFAULTS: Record<string, string> = {
  hero_img_dia: "/assets/real/Lagos-del-palmar.jpeg",
  hero_img_noche: "/assets/real/Escena-4.png",
};

const SECTIONS: { title: string; icon: IconName; keys: { key: string; label: string; textarea?: boolean }[] }[] = [
  {
    title: "La Empresa en Cifras (Sección Nosotros)",
    icon: "building",
    keys: [
      { key: "empresa_proyectos", label: "Número de Proyectos" },
      { key: "empresa_hectareas", label: "Hectáreas en Desarrollo" },
      { key: "empresa_lotes", label: "Lotes Disponibles" },
      { key: "empresa_area_desde", label: "m² Desde" },
      { key: "empresa_descripcion", label: "Descripción de la Empresa", textarea: true },
    ]
  },
  {
    title: "Tres Razones para Elegirnos (Sección Nosotros)",
    icon: "checklist",
    keys: [
      { key: "razon1_titulo", label: "Razón 1 — Título" },
      { key: "razon1_texto", label: "Razón 1 — Texto", textarea: true },
      { key: "razon2_titulo", label: "Razón 2 — Título" },
      { key: "razon2_texto", label: "Razón 2 — Texto", textarea: true },
      { key: "razon3_titulo", label: "Razón 3 — Título" },
      { key: "razon3_texto", label: "Razón 3 — Texto", textarea: true },
    ]
  },
  {
    title: "Información de Contacto",
    icon: "inbox",
    keys: [
      { key: "contacto_telefono", label: "Teléfono" },
      { key: "contacto_email", label: "Email" },
      { key: "contacto_direccion", label: "Dirección" },
      { key: "contacto_horario", label: "Horario de Atención" },
      { key: "contacto_mapa", label: "URL Embed de Google Maps (página de Contacto)", textarea: true },
    ]
  },
  {
    title: "Redes Sociales",
    icon: "external",
    keys: [
      { key: "social_facebook", label: "Facebook URL" },
      { key: "social_instagram", label: "Instagram URL" },
      { key: "social_whatsapp", label: "WhatsApp URL" },
    ]
  },
  {
    title: "Aviso Legal (Footer)",
    icon: "shield",
    keys: [
      { key: "footer_disclaimer", label: "Texto Disclaimer", textarea: true },
    ]
  },
];

async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json();
  return data.url;
}

function HeroMediaSlot({
  title, imgKey, videoKey, config, onChange,
}: {
  title: string;
  imgKey: string;
  videoKey: string;
  config: Config;
  onChange: (key: string, value: string) => void;
}) {
  const [imgUploading, setImgUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const imgUrl = config[imgKey] || HERO_DEFAULTS[imgKey] || "";
  const videoUrl = config[videoKey] || "";

  const handleImgFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgUploading(true);
    try {
      onChange(imgKey, await uploadFile(file, "hero"));
    } finally {
      setImgUploading(false);
      e.target.value = "";
    }
  };

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUploading(true);
    try {
      onChange(videoKey, await uploadFile(file, "hero"));
    } finally {
      setVideoUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 pt-5 first:pt-0 border-t border-[var(--color-pf-navy)]/10 first:border-0">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono font-medium text-[var(--color-pf-navy)]/50 mb-3">{title}</p>
        <div className="w-full aspect-video border-2 border-dashed border-[var(--color-pf-navy)]/15 rounded-xl overflow-hidden bg-[var(--color-pf-beige-light)]">
          {videoUrl ? (
            <video src={videoUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
          ) : imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--color-pf-navy)]/20 text-sm">Sin imagen</div>
          )}
        </div>
        {videoUrl && <p className="text-[11px] text-[var(--color-pf-navy)]/40 mt-2">Mostrando video de fondo (tiene prioridad sobre la imagen).</p>}
      </div>
      <div className="space-y-4">
        <div>
          <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImgFile} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => imgInputRef.current?.click()} disabled={imgUploading}>
            <Icon name="upload" className="w-4 h-4" /> {imgUploading ? "Subiendo..." : "Subir Imagen"}
          </Button>
        </div>
        <Field label="O pega la URL de la imagen">
          <TextInput type="text" value={config[imgKey] || ""} placeholder={HERO_DEFAULTS[imgKey] || ""} onChange={e => onChange(imgKey, e.target.value)} />
        </Field>
        <div className="pt-2 border-t border-[var(--color-pf-navy)]/10">
          <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoFile} className="hidden" />
          <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()} disabled={videoUploading}>
            <Icon name="upload" className="w-4 h-4" /> {videoUploading ? "Subiendo..." : "Subir Video"}
          </Button>
        </div>
        <Field label="O pega la URL del video" hint="Déjalo vacío para usar solo la imagen. Formato MP4 recomendado.">
          <TextInput type="text" value={config[videoKey] || ""} onChange={e => onChange(videoKey, e.target.value)} />
        </Field>
        {videoUrl && (
          <Button variant="ghost" size="sm" onClick={() => onChange(videoKey, "")}>
            <Icon name="trash" className="w-4 h-4" /> Quitar video
          </Button>
        )}
      </div>
    </div>
  );
}

export default function AdminConfiguracion() {
  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/site-config").then(r => r.json()).then(setConfig).finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/site-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-[var(--color-pf-beige-light)] py-4 -mx-4 px-4 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-pf-navy)]/40 mb-2">
            <span className="text-[var(--color-pf-gold)]">Global</span>
          </div>
          <h1 className="font-serif font-light text-3xl md:text-[34px] text-[var(--color-pf-navy)]">Configuración del Sitio</h1>
          <p className="text-[var(--color-pf-navy)]/50 mt-2 text-sm">Textos, cifras y datos globales del sitio web.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} variant={saved ? "outline" : "primary"} size="lg">
          {saved ? <><Icon name="check" className="w-4 h-4" /> Guardado</> : saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <CardTitle hint="(Fondo del Hero en la página de inicio, para el modo Día y Noche)">
          <Icon name="image" className="w-4 h-4 text-[var(--color-pf-gold)]" />
          Portada (Hero)
        </CardTitle>
        <HeroMediaSlot title="Día" imgKey="hero_img_dia" videoKey="hero_video_dia" config={config} onChange={handleChange} />
        <HeroMediaSlot title="Noche" imgKey="hero_img_noche" videoKey="hero_video_noche" config={config} onChange={handleChange} />
      </Card>

      {SECTIONS.map(section => (
        <Card key={section.title} className="p-6 space-y-5">
          <CardTitle>
            <Icon name={section.icon} className="w-4 h-4 text-[var(--color-pf-gold)]" />
            {section.title}
          </CardTitle>
          {section.keys.map(({ key, label, textarea }) => (
            <Field key={key} label={label}>
              {textarea ? (
                <TextArea value={config[key] || ""} onChange={e => handleChange(key, e.target.value)} rows={4} className={key === "contacto_mapa" ? "font-mono text-xs" : ""} />
              ) : (
                <TextInput type="text" value={config[key] || ""} onChange={e => handleChange(key, e.target.value)} />
              )}
            </Field>
          ))}
        </Card>
      ))}
    </div>
  );
}
