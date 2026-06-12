"use client";

import { STATUS_OPTIONS } from "@/lib/kanban-config";
import type { LeadStatus } from "@/types";

interface Props {
  currentStatus: LeadStatus;
  onSelect: (status: LeadStatus) => void;
}

export function StatusSelector({ currentStatus, onSelect }: Props) {
  return (
    <select
      value={currentStatus}
      onChange={(e) => onSelect(e.target.value as LeadStatus)}
      aria-label="Alterar status do lead"
      style={{
        width: "100%",
        padding: "var(--space-2) var(--space-3)",
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-default)",
        borderRadius: "var(--radius-sm)",
        color: "var(--color-text-secondary)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--text-xs)",
        letterSpacing: "var(--tracking-wide)",
        cursor: "pointer",
        outline: "none",
      }}
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
