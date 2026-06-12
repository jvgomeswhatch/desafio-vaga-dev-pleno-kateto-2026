"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusSelector } from "./StatusSelector";
import { STATUS_COLOR, STATUS_BADGE_BG, STATUS_BADGE_BORDER, STATUS_LABEL } from "@/lib/kanban-config";
import type { Lead, LeadStatus } from "@/types";

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

interface Props {
  lead: Lead;
  onStatusChange: (id: number, status: LeadStatus) => void;
}

export function KanbanCard({ lead, onStatusChange }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const statusColor = STATUS_COLOR[lead.status];
  const digits = lead.phone.replace(/\D/g, "");
  const waNumber = digits.startsWith("55") && digits.length > 11 ? digits : `55${digits}`;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-default)",
        borderTop: `3px solid ${statusColor}`,
        borderRadius: "var(--radius-md)",
        padding: "var(--space-5)",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
      }}
      {...attributes}
      {...listeners}
    >
      {/* Nome + badge de status */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-2)" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-base)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
            lineHeight: "var(--leading-snug)",
          }}
        >
          {lead.name}
        </span>
        <span
          style={{
            flexShrink: 0,
            background: STATUS_BADGE_BG[lead.status],
            border: `1px solid ${STATUS_BADGE_BORDER[lead.status]}`,
            color: statusColor,
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-2xs)",
            letterSpacing: "var(--tracking-widest)",
            textTransform: "uppercase",
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            whiteSpace: "nowrap",
          }}
        >
          {STATUS_LABEL[lead.status]}
        </span>
      </div>

      {/* Skin desejada */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-secondary)",
          letterSpacing: "var(--tracking-wide)",
        }}
      >
        {lead.desired_skin}
      </span>

      {/* CTA WhatsApp — bloco clicável */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="kanban-wa-cta"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            background: "rgba(94,152,217,0.08)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-info)",
            letterSpacing: "var(--tracking-wide)",
            textDecoration: "none",
            transition: "background var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out)",
          }}
        >
          💬 Abrir WhatsApp ↗
        </a>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-2xs)",
            color: "var(--color-text-muted)",
            letterSpacing: "var(--tracking-wide)",
            paddingLeft: "var(--space-1)",
          }}
        >
          {formatPhone(lead.phone)}
        </span>
      </div>

      {/* Vendedor responsável */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>👤</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            letterSpacing: "var(--tracking-wide)",
          }}
        >
          {lead.seller_name}
        </span>
      </div>

      {/* Zona de ação — separada visualmente */}
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          borderTop: "1px solid var(--color-border-subtle)",
          paddingTop: "var(--space-3)",
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-2xs)",
            color: "var(--color-text-muted)",
            letterSpacing: "var(--tracking-widest)",
            textTransform: "uppercase",
          }}
        >
          Status
        </span>
        <StatusSelector
          currentStatus={lead.status}
          onSelect={(status) => onStatusChange(lead.id, status)}
        />
      </div>
    </div>
  );
}
