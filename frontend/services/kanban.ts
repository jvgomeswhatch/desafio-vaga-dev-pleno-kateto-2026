import { apiFetch } from "@/lib/api";
import type { KanbanData, Lead, LeadStatus } from "@/types";

export async function getLeads(): Promise<KanbanData> {
  const res = await apiFetch("/leads");
  if (!res.ok) throw new Error("Falha ao buscar leads");

  const data: Lead[] | { leads: Lead[] } = await res.json();
  const leads = Array.isArray(data) ? data : (data.leads ?? []);

  return {
    sem_contato: leads.filter((l) => l.status === "sem_contato"),
    em_contato: leads.filter((l) => l.status === "em_contato"),
    perdido: leads.filter((l) => l.status === "perdido"),
    finalizado: leads.filter((l) => l.status === "finalizado"),
  };
}

export async function updateLeadStatus(
  id: number,
  status: LeadStatus
): Promise<void> {
  const res = await apiFetch(`/leads/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Falha ao atualizar status");
}
