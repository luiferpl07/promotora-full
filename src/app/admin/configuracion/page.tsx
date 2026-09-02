"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardTitle, Field, Icon, IconName, LoadingBlock, TextArea, TextInput } from "@/components/admin/AdminUI";

type Config = Record<string, string>;

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
