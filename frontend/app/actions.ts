"use server";

import { createLead } from "@/services/leads";
import type { LeadFormState } from "@/types";

export async function submitLead(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const phone = (formData.get("phone") as string | null)?.replace(/\D/g, "") ?? "";
  const desired_skin = (formData.get("desired_skin") as string | null)?.trim() ?? "";

  const result = await createLead({ name, phone, desired_skin });

  if (result.ok) {
    return { success: true, errors: {} };
  }

  if (result.fieldErrors) {
    return { success: false, errors: result.fieldErrors };
  }

  return {
    success: false,
    errors: { general: result.error ?? "Erro inesperado." },
  };
}
