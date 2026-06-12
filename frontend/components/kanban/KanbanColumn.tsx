"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { SkeletonCard } from "./SkeletonCard";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/kanban-config";
import type { Lead, LeadStatus } from "@/types";

interface Props {
  status: LeadStatus;
  leads: Lead[];
  isLoading?: boolean;
  isOver?: boolean;
  onStatusChange: (id: number, status: LeadStatus) => void;
}

export function KanbanColumn({ status, leads, isLoading, isOver, onStatusChange }: Props) {
  const { setNodeRef } = useDroppable({ id: status });
  const color = STATUS_COLOR[status];
  const label = STATUS_LABEL[status];
  const borderColor = isOver ? color : "var(--color-border-default)";

  return (
    <div
      role="region"
      aria-label={label}
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        flex: "1 1 0",
        border: `1px solid ${borderColor}`,
        borderRadius: "var(--radius-lg)",
        transition: "border-color var(--duration-fast) var(--ease-out)",
      }}
    >
      {/* Header — border-top colorida + label + contador */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--color-bg-surface)",
          borderTop: `3px solid ${color}`,
          borderBottom: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-semibold)",
            letterSpacing: "var(--tracking-wide)",
            textTransform: "uppercase",
            color: "var(--color-text-primary)",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-pill)",
            padding: "2px 8px",
          }}
        >
          {isLoading ? "…" : leads.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        role="list"
        className="kanban-drop-zone"
        style={{
          background: isOver
            ? `color-mix(in srgb, ${color} 6%, var(--color-bg-surface))`
            : "var(--color-bg-surface)",
          borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
          transition: "background var(--duration-fast) var(--ease-out)",
        }}
      >
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : leads.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-3)",
              padding: "var(--space-8)",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "var(--text-xl)", opacity: 0.65 }}>📭</span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "var(--tracking-wide)",
              }}
            >
              Nenhum lead
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
              }}
            >
              nesta etapa
            </span>
          </div>
        ) : (
          <SortableContext
            items={leads.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {leads.map((lead) => (
              <KanbanCard
                key={lead.id}
                lead={lead}
                onStatusChange={onStatusChange}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
