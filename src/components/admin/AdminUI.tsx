"use client";

import Link from "next/link";
import { ReactNode } from "react";

/* ---------------------------------------------------------------------- */
/*  Iconos de línea (estilo consistente con el sitio público)             */
/* ---------------------------------------------------------------------- */

export type IconName =
  | "dashboard" | "building" | "newspaper" | "users" | "inbox" | "checklist"
  | "settings" | "external" | "plus" | "trash" | "pencil" | "image" | "user"
  | "shield" | "upload" | "check" | "logo";

const paths: Record<IconName, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
  building: <><path d="M4 21V6a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v15" /><path d="M14 21V10a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v11" /><path d="M9 8h.01M9 12h.01M9 16h.01M18 13h.01M18 17h.01" /></>,
  newspaper: <><path d="M4 4h13a2 2 0 0 1 2 2v13a1 1 0 0 1-1.7.7L16 18H6a2 2 0 0 1-2-2V4Z" /><path d="M8 8h7M8 11.5h7M8 15h4" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 8.5a3 3 0 1 1 3.5 2.96" /><path d="M15.5 14a6.5 6.5 0 0 1 6 6" /></>,
  inbox: <><path d="M3 12h4l2 3h6l2-3h4" /><path d="M5.5 5h13l2.5 7v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-7l2.5-7Z" /></>,
  checklist: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>,
  external: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  trash: <><path d="M4 7h16" /><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /><path d="M19 7l-.9 13.1a2 2 0 0 1-2 1.9H7.9a2 2 0 0 1-2-1.9L5 7" /><path d="M10 11v6M14 11v6" /></>,
  pencil: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 20a8 8 0 0 1 16 0" /></>,
  shield: <><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /></>,
  upload: <><path d="M12 16V4" /><path d="m6 9 6-6 6 6" /><path d="M5 20h14" /></>,
  check: <><polyline points="20 6 9 17 4 12" /></>,
  logo: <><path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" /></>,
};

export function Icon({ name, className = "w-5 h-5", strokeWidth = 1.6 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  );
}

/* ---------------------------------------------------------------------- */
/*  Layout primitives                                                      */
/* ---------------------------------------------------------------------- */

export function PageHeader({ kicker, title, subtitle, action }: { kicker?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 flex-wrap">
      <div>
        {kicker && (
          <div className="flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase font-mono text-[var(--color-pf-navy)]/40 mb-2">
            <span className="text-[var(--color-pf-gold)]">{kicker}</span>
          </div>
        )}
        <h1 className="font-serif font-light text-3xl md:text-[34px] text-[var(--color-pf-navy)] leading-tight">{title}</h1>
        {subtitle && <p className="text-[var(--color-pf-navy)]/50 mt-2 text-sm">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-[var(--color-pf-navy)]/10 shadow-[0_2px_20px_rgba(22,32,58,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <h3 className="font-serif text-lg text-[var(--color-pf-navy)] border-b border-[var(--color-pf-navy)]/10 pb-4 mb-5 flex items-center flex-wrap gap-2">
      {children}
      {hint && <span className="text-xs text-[var(--color-pf-navy)]/40 font-sans font-normal">{hint}</span>}
    </h3>
  );
}

/* ---------------------------------------------------------------------- */
/*  Botones                                                                */
/* ---------------------------------------------------------------------- */

const buttonBase = "inline-flex items-center justify-center gap-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
const buttonSizes: Record<string, string> = { sm: "px-4 py-2", md: "px-6 py-3", lg: "px-9 py-4" };
const buttonVariants: Record<string, string> = {
  primary: "bg-[var(--color-pf-navy)] text-white hover:bg-[var(--color-pf-gold)] hover:text-[var(--color-pf-navy)]",
  outline: "border border-[var(--color-pf-navy)] text-[var(--color-pf-navy)] hover:bg-[var(--color-pf-navy)] hover:text-white",
  danger: "border border-red-200 text-red-500 hover:bg-red-50",
  ghost: "text-[var(--color-pf-navy)]/50 hover:text-[var(--color-pf-navy)]",
};

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export function Button({ children, onClick, variant = "primary", size = "md", disabled, type = "button", className = "" }: ButtonProps) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function LinkButton({ href, children, variant = "primary", size = "md", target, className = "" }: { href: string; children: ReactNode; variant?: keyof typeof buttonVariants; size?: keyof typeof buttonSizes; target?: string; className?: string }) {
  return (
    <Link href={href} target={target} className={`${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------------------- */
/*  Formularios                                                            */
/* ---------------------------------------------------------------------- */

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="block text-[10px] uppercase tracking-[0.2em] font-mono font-medium text-[var(--color-pf-navy)]/50 mb-2">{children}</label>;
}

const fieldClass = "w-full border border-[var(--color-pf-navy)]/15 rounded-lg px-4 py-3 text-sm text-[var(--color-pf-navy)] bg-white focus:outline-none focus:border-[var(--color-pf-gold)] transition-colors placeholder:text-[var(--color-pf-navy)]/30";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${fieldClass} ${className}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${fieldClass} ${className}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select {...rest} className={`${fieldClass} cursor-pointer ${className}`} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
      {hint && <p className="text-[11px] text-[var(--color-pf-navy)]/35 mt-1.5">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${checked ? "bg-[var(--color-pf-gold)]" : "bg-[var(--color-pf-navy)]/15"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

/* ---------------------------------------------------------------------- */
/*  Estados / misceláneo                                                   */
/* ---------------------------------------------------------------------- */

const badgeColors: Record<string, string> = {
  navy: "bg-[var(--color-pf-navy)]/10 text-[var(--color-pf-navy)]",
  gold: "bg-[var(--color-pf-gold)]/15 text-[#8a6a1f]",
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  blue: "bg-blue-100 text-blue-800",
  red: "bg-red-100 text-red-700",
  gray: "bg-gray-100 text-gray-600",
};

export function Badge({ color = "gray", children }: { color?: keyof typeof badgeColors; children: ReactNode }) {
  return <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize whitespace-nowrap ${badgeColors[color]}`}>{children}</span>;
}

export function LoadingBlock({ label = "Cargando..." }: { label?: string }) {
  return <div className="p-16 text-center text-[var(--color-pf-navy)]/30 text-sm uppercase tracking-widest font-mono">{label}</div>;
}

export function EmptyBlock({ label }: { label: string }) {
  return <div className="p-16 text-center text-[var(--color-pf-navy)]/30 text-sm">{label}</div>;
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--color-pf-navy)]/80">{children}</table>
      </div>
    </Card>
  );
}

export function Thead({ cols }: { cols: string[] }) {
  return (
    <thead className="bg-[var(--color-pf-beige-light)] text-[var(--color-pf-navy)]/50 uppercase tracking-wider text-[10px] font-mono font-medium">
      <tr>{cols.map(c => <th key={c} className="px-6 py-4">{c}</th>)}</tr>
    </thead>
  );
}
