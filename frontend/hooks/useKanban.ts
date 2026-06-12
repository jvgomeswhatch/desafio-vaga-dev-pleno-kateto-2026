"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getLeads, updateLeadStatus } from "@/services/kanban";
import { STATUS_LABEL } from "@/lib/kanban-config";
import type { KanbanData, Lead, LeadStatus } from "@/types";

export function useKanban() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<KanbanData>({
    queryKey: ["leads"],
    queryFn: getLeads,
    refetchOnWindowFocus: true,
  });

  const { mutate: moveLead } = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: LeadStatus;
    }) => updateLeadStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["leads"] });
      const snapshot = queryClient.getQueryData<KanbanData>(["leads"]);

      queryClient.setQueryData<KanbanData>(["leads"], (old) => {
        if (!old) return old;
        const allLeads: Lead[] = [
          ...old.sem_contato,
          ...old.em_contato,
          ...old.perdido,
          ...old.finalizado,
        ];
        const updated = allLeads.map((l) =>
          l.id === id ? { ...l, status } : l
        );
        return {
          sem_contato: updated.filter((l) => l.status === "sem_contato"),
          em_contato: updated.filter((l) => l.status === "em_contato"),
          perdido: updated.filter((l) => l.status === "perdido"),
          finalizado: updated.filter((l) => l.status === "finalizado"),
        };
      });

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(["leads"], context.snapshot);
      }
      toast.error("Não foi possível atualizar o status");
    },

    onSuccess: (_data, _vars) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(`Lead movido para ${STATUS_LABEL[_vars.status]}`);
    },
  });

  return { data, isLoading, moveLead };
}
