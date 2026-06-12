"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useKanban } from "@/hooks/useKanban";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import type { Lead, LeadStatus } from "@/types";

const COLUMNS: LeadStatus[] = ["sem_contato", "em_contato", "perdido", "finalizado"];

export function KanbanBoard() {
  const { data, moveLead } = useKanban();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<LeadStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function findLead(id: number): Lead | undefined {
    if (!data) return undefined;
    return [
      ...data.sem_contato,
      ...data.em_contato,
      ...data.perdido,
      ...data.finalizado,
    ].find((l) => l.id === id);
  }

  function findLeadColumn(id: number): LeadStatus | undefined {
    if (!data) return undefined;
    for (const col of COLUMNS) {
      if (data[col].some((l) => l.id === id)) return col;
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragOver(event: { over: { id: unknown } | null }) {
    const overedId = event.over?.id as string | undefined;
    if (overedId && COLUMNS.includes(overedId as LeadStatus)) {
      setOverId(overedId as LeadStatus);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    setOverId(null);

    const { active, over } = event;
    if (!over || !data) return;

    const draggedId = active.id as number;
    const targetColumn = over.id as LeadStatus;

    if (!COLUMNS.includes(targetColumn)) return;

    const sourceColumn = findLeadColumn(draggedId);
    if (!sourceColumn || sourceColumn === targetColumn) return;

    moveLead({ id: draggedId, status: targetColumn });
  }

  function handleStatusChange(id: number, status: LeadStatus) {
    const sourceColumn = findLeadColumn(id);
    if (!sourceColumn || sourceColumn === status) return;
    moveLead({ id, status });
  }

  const activeLead = activeId ? findLead(activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "var(--space-4)",
          alignItems: "start",
        }}
        className="kanban-grid"
      >
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col}
            status={col}
            leads={data?.[col] ?? []}
            isLoading={false}
            isOver={overId === col}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <KanbanCard
            lead={activeLead}
            onStatusChange={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
