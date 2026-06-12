import type { LeadStatus } from "@/types";

export const STATUS_LABEL: Record<LeadStatus, string> = {
  sem_contato: "Sem Contato",
  em_contato:  "Em Contato",
  perdido:     "Perdido",
  finalizado:  "Finalizado",
};

export const STATUS_COLOR: Record<LeadStatus, string> = {
  sem_contato: "var(--color-status-pending)",
  em_contato:  "var(--color-status-active)",
  perdido:     "var(--color-status-lost)",
  finalizado:  "var(--color-status-won)",
};

export const STATUS_BADGE_BG: Record<LeadStatus, string> = {
  sem_contato: "rgba(107,114,128,0.12)",
  em_contato:  "rgba(94,152,217,0.12)",
  perdido:     "rgba(235,75,75,0.12)",
  finalizado:  "rgba(91,162,74,0.12)",
};

export const STATUS_BADGE_BORDER: Record<LeadStatus, string> = {
  sem_contato: "rgba(107,114,128,0.35)",
  em_contato:  "rgba(94,152,217,0.35)",
  perdido:     "rgba(235,75,75,0.35)",
  finalizado:  "rgba(91,162,74,0.35)",
};

export const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "sem_contato", label: "Sem Contato" },
  { value: "em_contato",  label: "Em Contato" },
  { value: "perdido",     label: "Perdido" },
  { value: "finalizado",  label: "Finalizado" },
];
