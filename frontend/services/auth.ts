import { apiFetch } from "@/lib/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  ok: boolean;
  token?: string;
  error?: string;
}

export async function loginUser(payload: LoginPayload): Promise<LoginResult> {
  let res: Response;
  try {
    res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuthRedirect: true,
    });
  } catch {
    return { ok: false, error: "Não foi possível conectar ao servidor." };
  }

  if (res.ok) {
    const data = await res.json();
    return { ok: true, token: data.token };
  }

  if (res.status === 401) {
    return { ok: false, error: "E-mail ou senha incorretos." };
  }

  return { ok: false, error: "Erro inesperado. Tente novamente." };
}
