import type { Lead } from "@/types";

// API_URL is used server-side (Server Actions). Inside Docker the service
// name "backend" resolves correctly; outside Docker localhost works.
const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface CreateLeadPayload {
  name: string;
  phone: string;
  desired_skin: string;
}

export interface CreateLeadResult {
  ok: boolean;
  lead?: Lead;
  fieldErrors?: Record<string, string>;
  error?: string;
}

export async function createLead(payload: CreateLeadPayload): Promise<CreateLeadResult> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "Não foi possível conectar ao servidor. Tente novamente." };
  }

  if (res.ok) {
    const lead: Lead = await res.json();
    return { ok: true, lead };
  }

  if (res.status === 422) {
    const body = await res.json().catch(() => ({}));
    return { ok: false, fieldErrors: parseValidationErrors(body) };
  }

  return { ok: false, error: "Erro inesperado. Tente novamente em alguns instantes." };
}

function parseValidationErrors(body: Record<string, unknown>): Record<string, string> {
  const msg = typeof body.error === "string" ? body.error : "";
  const errors: Record<string, string> = {};

  if (msg.includes("name")) errors.name = "Nome é obrigatório.";
  if (msg.includes("phone")) errors.phone = "Telefone deve ter 10 ou 11 dígitos numéricos.";
  if (msg.includes("desired_skin") || msg.includes("skin")) errors.desired_skin = "Informe a skin desejada.";

  if (Object.keys(errors).length === 0) errors.general = msg || "Dados inválidos.";

  return errors;
}
