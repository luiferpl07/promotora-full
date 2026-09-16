"use client";

import { useEffect, useState } from "react";

type Config = Record<string, string>;

const SECTIONS = [
  {
    title: "🏠 Hero Principal (Página de Inicio)",
    keys: [
      { key: "hero_titulo", label: "Título del Hero" },
      { key: "hero_subtitulo", label: "Subtítulo" },
    ]
  },
  {
    title: "🏢 La Empresa en Cifras (Sección Nosotros)",
    keys: [
      { key: "empresa_proyectos", label: "Número de Proyectos" },
      { key: "empresa_hectareas", label: "Hectáreas en Desarrollo" },
      { key: "empresa_lotes", label: "Lotes Disponibles" },
      { key: "empresa_area_desde", label: "m² Desde" },
      { key: "empresa_descripcion", label: "Descripción de la Empresa", textarea: true },
    ]
  },
  {
    title: "📞 Información de Contacto",
    keys: [
      { key: "contacto_telefono", label: "Teléfono" },
      { key: "contacto_email", label: "Email" },
      { key: "contacto_direccion", label: "Dirección" },
      { key: "contacto_horario", label: "Horario de Atención" },
    ]
  },
  {
    title: "📱 Redes Sociales",
    keys: [
      { key: "social_facebook", label: "Facebook URL" },
      { key: "social_instagram", label: "Instagram URL" },
      { key: "social_whatsapp", label: "WhatsApp URL" },
    ]
  },
  {
    title: "⚖️ Aviso Legal (Footer)",
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

  if (loading) return <div className="p-12 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between sticky top-0 z-10 bg-gray-50 py-4 -mx-4 px-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración del Sitio</h1>
          <p className="text-gray-500 mt-1">Textos, cifras y datos globales del sitio web.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className={`px-8 py-3 rounded-xl text-sm font-medium transition-colors ${saved ? "bg-green-600 text-white" : "bg-[#16203A] text-white hover:bg-[#C8A23C]"} disabled:opacity-50`}>
          {saved ? "✓ Guardado" : saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {SECTIONS.map(section => (
        <div key={section.title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">{section.title}</h3>
          {section.keys.map(({ key, label, textarea }) => (
            <div key={key}>
              <label className="block text-xs uppercase tracking-widest font-medium text-gray-500 mb-2">{label}</label>
              {textarea ? (
                <textarea value={config[key] || ""} onChange={e => handleChange(key, e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C] transition-colors" />
              ) : (
                <input type="text" value={config[key] || ""} onChange={e => handleChange(key, e.target.value)} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#C8A23C] transition-colors" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
