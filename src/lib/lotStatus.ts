export type LotEstado = "disponible" | "reservado" | "vendido";

export const LOT_ESTADOS: { value: LotEstado; label: string; color: string; dot: string }[] = [
  { value: "disponible", label: "Disponible", color: "#22c55e", dot: "bg-emerald-500" },
  { value: "reservado", label: "Reservado", color: "#f59e0b", dot: "bg-amber-500" },
  { value: "vendido", label: "Vendido", color: "#ef4444", dot: "bg-red-500" },
];

export function lotEstadoInfo(estado: string) {
  return LOT_ESTADOS.find(e => e.value === estado) || LOT_ESTADOS[0];
}
