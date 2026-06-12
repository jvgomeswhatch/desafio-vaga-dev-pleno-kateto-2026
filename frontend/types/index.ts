export type LeadStatus = "sem_contato" | "em_contato" | "perdido" | "finalizado";

export type Rarity = "consumer" | "industrial" | "milspec" | "restricted" | "classified" | "covert" | "knife";

export interface Lead {
  id: number;
  name: string;
  phone: string;
  desired_skin: string;
  seller_name: string;
  status: LeadStatus;
  created_at: string;
}

export interface LeadFormState {
  success: boolean;
  errors: {
    name?: string;
    phone?: string;
    desired_skin?: string;
    general?: string;
  };
}

export interface KanbanData {
  sem_contato: Lead[];
  em_contato: Lead[];
  perdido: Lead[];
  finalizado: Lead[];
}
