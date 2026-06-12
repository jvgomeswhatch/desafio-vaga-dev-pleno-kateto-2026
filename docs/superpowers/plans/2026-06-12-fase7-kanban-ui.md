# Fase 7: Kanban UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar dashboard Kanban com autenticação JWT, drag-and-drop entre colunas, TanStack Query com optimistic updates, e página de login — mantendo identidade visual consistente com a landing page.

**Architecture:** App Router com Client Components. Auth guard via `useRequireAuth` (hook) encapsulado em `ProtectedRoute` (componente) — sem middleware do Next.js (que não tem acesso ao `localStorage`). TanStack Query gerencia todos os dados do Kanban; `KanbanBoard` só renderiza e coordena DnD.

**Tech Stack:** Next.js 16 (App Router), React 19, TanStack Query v5, @dnd-kit/core + @dnd-kit/sortable, sonner (toasts), TypeScript

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `frontend/package.json` | Modify | Adicionar dependências |
| `frontend/app/layout.tsx` | Modify | Adicionar QueryClientProvider + Toaster |
| `frontend/app/login/page.tsx` | Create | Página de login |
| `frontend/app/dashboard/page.tsx` | Create | Shell do dashboard |
| `frontend/lib/api.ts` | Create | `apiFetch` com Bearer token + interceptação 401 |
| `frontend/services/auth.ts` | Create | `loginUser()` → `POST /auth/login` |
| `frontend/services/kanban.ts` | Create | `getLeads()`, `updateLeadStatus()` |
| `frontend/hooks/useAuth.ts` | Create | `useLogin()` mutation + `logout()` |
| `frontend/hooks/useRequireAuth.ts` | Create | Redireciona para `/login` se sem token; retorna `boolean` |
| `frontend/hooks/useKanban.ts` | Create | Query + mutation com optimistic update |
| `frontend/components/auth/ProtectedRoute.tsx` | Create | Wrapper de rotas protegidas |
| `frontend/components/auth/LoginForm.tsx` | Create | Formulário de login |
| `frontend/components/kanban/KanbanBoard.tsx` | Create | Layout 4 colunas + DnD context |
| `frontend/components/kanban/KanbanColumn.tsx` | Create | Coluna individual com drop zone |
| `frontend/components/kanban/KanbanCard.tsx` | Create | Card draggable com dados do lead |
| `frontend/components/kanban/StatusSelector.tsx` | Create | Select de status (fallback acessível) |
| `frontend/components/kanban/SkeletonCard.tsx` | Create | Skeleton de loading |
| `frontend/components/dashboard/DashboardShell.tsx` | Create | Header sticky + logout + KanbanBoard |
| `frontend/components/LeadForm.tsx` | Modify | Ajustar label/placeholder do campo WhatsApp |
| `frontend/types/index.ts` | Modify | Adicionar tipo `KanbanData` |

---

## Task 1: Instalar dependências e configurar providers

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: Instalar dependências**

No diretório `frontend/`, executar:

```bash
cd frontend
npm install @tanstack/react-query @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities sonner
```

Saída esperada: instalação sem erros, `package.json` atualizado.

- [ ] **Step 2: Criar arquivo de configuração do QueryClient**

Criar `frontend/lib/query-client.ts`:

```ts
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  });
}
```

- [ ] **Step 3: Criar o provider do lado do cliente**

Criar `frontend/components/providers/QueryProvider.tsx`:

```tsx
"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { makeQueryClient } from "@/lib/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

- [ ] **Step 4: Adicionar QueryProvider e Toaster ao layout raiz**

Substituir o conteúdo de `frontend/app/layout.tsx` por:

```tsx
import type { Metadata } from "next";
import { Rajdhani, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRATE//BR — Skins de CS com os melhores preços",
  description: "Marketplace brasileiro de skins de Counter-Strike. Karambit Doppler, AK-47 Redline, AWP Dragon Lore e muito mais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={{
        "--font-display": "var(--font-rajdhani), 'Oswald', sans-serif",
        "--font-body": "var(--font-inter), system-ui, sans-serif",
        "--font-mono": "var(--font-jetbrains), 'Courier New', monospace",
      } as React.CSSProperties}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-default)",
                color: "var(--color-text-primary)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-sm)",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verificar que a landing ainda funciona**

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:3000` — landing deve carregar sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/app/layout.tsx frontend/lib/query-client.ts frontend/components/providers/QueryProvider.tsx
git commit -m "feat(frontend): instalar TanStack Query, dnd-kit, sonner e configurar providers"
```

---

## Task 2: Camada de dados — `lib/api.ts` e serviços

**Files:**
- Create: `frontend/lib/api.ts`
- Create: `frontend/services/auth.ts`
- Create: `frontend/services/kanban.ts`
- Modify: `frontend/types/index.ts`

- [ ] **Step 1: Criar `lib/api.ts`**

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  }

  return res;
}
```

- [ ] **Step 2: Adicionar tipo `KanbanData` em `types/index.ts`**

Adicionar ao final do arquivo existente `frontend/types/index.ts`:

```ts
export interface KanbanData {
  sem_contato: Lead[];
  em_contato: Lead[];
  perdido: Lead[];
  finalizado: Lead[];
}
```

O arquivo completo ficará:

```ts
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
```

- [ ] **Step 3: Criar `services/auth.ts`**

```ts
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
```

- [ ] **Step 4: Criar `services/kanban.ts`**

O backend retorna `{ leads: Lead[] }`. O `getLeads` transforma em `KanbanData` agrupando por status.

```ts
import { apiFetch } from "@/lib/api";
import type { KanbanData, Lead, LeadStatus } from "@/types";

export async function getLeads(): Promise<KanbanData> {
  const res = await apiFetch("/leads");
  if (!res.ok) throw new Error("Falha ao buscar leads");

  const data: { leads: Lead[] } = await res.json();
  const leads = data.leads ?? [];

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
```

- [ ] **Step 5: Verificar que o TypeScript compila sem erros**

```bash
cd frontend && npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/api.ts frontend/services/auth.ts frontend/services/kanban.ts frontend/types/index.ts
git commit -m "feat(frontend): camada de dados — apiFetch, auth service, kanban service"
```

---

## Task 3: Hooks de autenticação

**Files:**
- Create: `frontend/hooks/useRequireAuth.ts`
- Create: `frontend/hooks/useAuth.ts`
- Create: `frontend/components/auth/ProtectedRoute.tsx`

- [ ] **Step 1: Criar `hooks/useRequireAuth.ts`**

```ts
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useRequireAuth(): boolean {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setAuthenticated(true);
  }, [router]);

  return authenticated;
}
```

- [ ] **Step 2: Criar `hooks/useAuth.ts`**

```ts
"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loginUser, type LoginPayload } from "@/services/auth";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (result) => {
      if (result.ok && result.token) {
        localStorage.setItem("auth_token", result.token);
        router.replace("/dashboard");
      }
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return () => {
    localStorage.removeItem("auth_token");
    router.replace("/login");
  };
}
```

- [ ] **Step 3: Criar `components/auth/ProtectedRoute.tsx`**

```tsx
"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useRequireAuth();
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
```

- [ ] **Step 4: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 5: Commit**

```bash
git add frontend/hooks/useRequireAuth.ts frontend/hooks/useAuth.ts frontend/components/auth/ProtectedRoute.tsx
git commit -m "feat(frontend): hooks de autenticação — useRequireAuth, useAuth, ProtectedRoute"
```

---

## Task 4: Página de login

**Files:**
- Create: `frontend/components/auth/LoginForm.tsx`
- Create: `frontend/app/login/page.tsx`

- [ ] **Step 1: Criar `components/auth/LoginForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";

export function LoginForm() {
  const { mutate: login, isPending, data: result } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const error =
    result && !result.ok ? result.error : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ email: email.trim(), password });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      {error && (
        <div
          role="alert"
          style={{
            background: "rgba(235,75,75,0.08)",
            border: "1px solid rgba(235,75,75,0.3)",
            borderLeft: "3px solid var(--color-danger)",
            borderRadius: "var(--radius-sm)",
            padding: "var(--space-3) var(--space-4)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-danger)",
            letterSpacing: "var(--tracking-wide)",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <label
          htmlFor="email"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
            letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
          }}
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@cratebr.com"
          autoComplete="email"
          required
          style={{
            width: "100%",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <label
          htmlFor="password"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
            letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
          }}
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          style={{
            width: "100%",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            outline: "none",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-2)",
          width: "100%",
          padding: "var(--space-4) var(--space-6)",
          background: isPending ? "var(--color-brand-dim)" : "var(--color-brand)",
          color: "var(--color-text-inverse)",
          border: "1px solid transparent",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-base)",
          fontWeight: "var(--weight-semibold)",
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase",
          cursor: isPending ? "not-allowed" : "pointer",
          transition: "all var(--duration-base) var(--ease-out)",
        }}
      >
        {isPending ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                border: "2px solid rgba(10,14,19,0.3)",
                borderTopColor: "var(--color-text-inverse)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Criar `app/login/page.tsx`**

```tsx
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-5)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-7)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, var(--color-brand), var(--color-accent), var(--color-brand))",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "var(--space-7)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--color-brand)",
              color: "var(--color-text-inverse)",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontWeight: "var(--weight-bold)",
              fontSize: "var(--text-lg)",
              letterSpacing: "var(--tracking-wider)",
              clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
            }}
          >
            C
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--weight-bold)",
              letterSpacing: "var(--tracking-wider)",
              fontSize: "var(--text-base)",
            }}
          >
            CRATE<span style={{ color: "var(--color-brand)" }}>//</span>BR
          </span>
        </div>

        <div style={{ marginBottom: "var(--space-6)" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-brand)",
              letterSpacing: "var(--tracking-widest)",
              textTransform: "uppercase",
              marginBottom: "var(--space-2)",
            }}
          >
            Área restrita
          </div>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              letterSpacing: "var(--tracking-tight)",
              textTransform: "uppercase",
            }}
          >
            Acesso de Vendedores
          </h1>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Testar manualmente**

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:3000/login`. Verificar:
- Card centralizado com logo CRATE//BR e barra laranja no topo
- Campos E-mail e Senha renderizados
- Clicar "Entrar" com campos vazios: HTML5 validation aparece
- Tentar login com credenciais erradas: mensagem de erro inline

- [ ] **Step 4: Commit**

```bash
git add frontend/components/auth/LoginForm.tsx frontend/app/login/page.tsx
git commit -m "feat(frontend): página de login com LoginForm"
```

---

## Task 5: Hook `useKanban` com TanStack Query

**Files:**
- Create: `frontend/hooks/useKanban.ts`

- [ ] **Step 1: Criar `hooks/useKanban.ts`**

```ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getLeads, updateLeadStatus } from "@/services/kanban";
import type { KanbanData, Lead, LeadStatus } from "@/types";

const COLUMN_LABELS: Record<LeadStatus, string> = {
  sem_contato: "Sem Contato",
  em_contato: "Em Contato",
  perdido: "Perdido",
  finalizado: "Finalizado",
};

export function useKanban() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<KanbanData>({
    queryKey: ["leads"],
    queryFn: getLeads,
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

    onSuccess: (_data, { status }) => {
      toast.success(`Lead movido para ${COLUMN_LABELS[status]}`);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return { data, isLoading, moveLead };
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/hooks/useKanban.ts
git commit -m "feat(frontend): useKanban com TanStack Query, optimistic updates e toasts"
```

---

## Task 6: Componentes do Kanban

**Files:**
- Create: `frontend/components/kanban/StatusSelector.tsx`
- Create: `frontend/components/kanban/SkeletonCard.tsx`
- Create: `frontend/components/kanban/KanbanCard.tsx`
- Create: `frontend/components/kanban/KanbanColumn.tsx`
- Create: `frontend/components/kanban/KanbanBoard.tsx`

- [ ] **Step 1: Criar `components/kanban/StatusSelector.tsx`**

```tsx
"use client";

import type { LeadStatus } from "@/types";

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "sem_contato", label: "Sem Contato" },
  { value: "em_contato", label: "Em Contato" },
  { value: "perdido", label: "Perdido" },
  { value: "finalizado", label: "Finalizado" },
];

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
```

- [ ] **Step 2: Criar `components/kanban/SkeletonCard.tsx`**

```tsx
export function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {[80, 60, 40].map((width, i) => (
        <div
          key={i}
          style={{
            height: 12,
            width: `${width}%`,
            background: "var(--color-bg-raised)",
            borderRadius: "var(--radius-sm)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      ))}
    </div>
  );
}
```

Adicionar a animação `pulse` em `globals.css` (ao final do bloco `@keyframes`):

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

- [ ] **Step 3: Criar `components/kanban/KanbanCard.tsx`**

```tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusSelector } from "./StatusSelector";
import type { Lead, LeadStatus } from "@/types";

const STATUS_COLOR: Record<LeadStatus, string> = {
  sem_contato: "var(--color-status-pending)",
  em_contato:  "var(--color-status-active)",
  perdido:     "var(--color-status-lost)",
  finalizado:  "var(--color-status-won)",
};

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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border-default)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-3)",
    cursor: "grab",
    touchAction: "none",
    userSelect: "none",
  };

  const badgeColor = STATUS_COLOR[lead.status];
  const waNumber = `55${lead.phone.replace(/\D/g, "")}`;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* Header: nome + badge */}
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
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: badgeColor,
            marginTop: 4,
          }}
          title={lead.status.replace("_", " ")}
        />
      </div>

      {/* Skin */}
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

      {/* Vendedor */}
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

      {/* WhatsApp */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>💬</span>
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-info)",
            letterSpacing: "var(--tracking-wide)",
            textDecoration: "none",
          }}
        >
          {formatPhone(lead.phone)}
        </a>
      </div>

      {/* StatusSelector — fallback acessível */}
      <div onClick={(e) => e.stopPropagation()}>
        <StatusSelector
          currentStatus={lead.status}
          onSelect={(status) => onStatusChange(lead.id, status)}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Criar `components/kanban/KanbanColumn.tsx`**

```tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { SkeletonCard } from "./SkeletonCard";
import type { Lead, LeadStatus } from "@/types";

const STATUS_COLOR: Record<LeadStatus, string> = {
  sem_contato: "var(--color-status-pending)",
  em_contato:  "var(--color-status-active)",
  perdido:     "var(--color-status-lost)",
  finalizado:  "var(--color-status-won)",
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  sem_contato: "Sem Contato",
  em_contato:  "Em Contato",
  perdido:     "Perdido",
  finalizado:  "Finalizado",
};

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        flex: "1 1 0",
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--color-bg-surface)",
          borderRadius: "var(--radius-md) var(--radius-md) 0 0",
          borderTop: `3px solid ${color}`,
          border: `1px solid var(--color-border-default)`,
          borderBottom: "none",
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
            background: "var(--color-bg-raised)",
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
        style={{
          flex: 1,
          minHeight: 200,
          padding: "var(--space-3)",
          background: isOver
            ? `rgba(${color === "var(--color-status-pending)" ? "107,114,128" : color === "var(--color-status-active)" ? "94,152,217" : color === "var(--color-status-lost)" ? "235,75,75" : "91,162,74"}, 0.06)`
            : "var(--color-bg-surface)",
          border: `1px solid ${isOver ? color : "var(--color-border-default)"}`,
          borderTop: "none",
          borderRadius: "0 0 var(--radius-md) var(--radius-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
          transition: "all var(--duration-fast) var(--ease-out)",
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
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              letterSpacing: "var(--tracking-wide)",
              textAlign: "center",
              padding: "var(--space-6)",
            }}
          >
            📭 Nenhum lead aqui ainda
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
```

- [ ] **Step 5: Criar `components/kanban/KanbanBoard.tsx`**

```tsx
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
  const { data, isLoading, moveLead } = useKanban();
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
            isLoading={isLoading}
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
```

Adicionar ao final de `globals.css` o breakpoint mobile do Kanban:

```css
/* ============================================================
   KANBAN — mobile stack
   ============================================================ */
@media (max-width: 767px) {
  .kanban-grid {
    grid-template-columns: 1fr !important;
  }
}
```

- [ ] **Step 6: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit
```

Saída esperada: sem erros.

- [ ] **Step 7: Commit**

```bash
git add frontend/components/kanban/ frontend/app/globals.css
git commit -m "feat(frontend): componentes Kanban — Board, Column, Card, StatusSelector, Skeleton"
```

---

## Task 7: Dashboard page e header

**Files:**
- Create: `frontend/app/dashboard/page.tsx`

- [ ] **Step 1: Criar `app/dashboard/page.tsx`**

```tsx
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell />
    </ProtectedRoute>
  );
}
```

- [ ] **Step 2: Criar `components/dashboard/DashboardShell.tsx`**

```tsx
"use client";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useLogout } from "@/hooks/useAuth";

export function DashboardShell() {
  const logout = useLogout();

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "var(--color-bg-overlay)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border-subtle)",
          zIndex: "var(--z-sticky)" as never,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 var(--space-5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 56,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "var(--color-brand)",
                color: "var(--color-text-inverse)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
                fontWeight: "var(--weight-bold)",
                fontSize: "var(--text-lg)",
                letterSpacing: "var(--tracking-wider)",
                clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
              }}
            >
              C
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "var(--weight-bold)",
                letterSpacing: "var(--tracking-wider)",
                fontSize: "var(--text-base)",
              }}
            >
              CRATE<span style={{ color: "var(--color-brand)" }}>//</span>BR
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                letterSpacing: "var(--tracking-widest)",
                textTransform: "uppercase",
                borderLeft: "1px solid var(--color-border-default)",
                paddingLeft: "var(--space-3)",
                marginLeft: "var(--space-1)",
              }}
            >
              Kanban
            </span>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                letterSpacing: "var(--tracking-wider)",
                textTransform: "uppercase",
              }}
            >
              Admin
            </span>
            <button
              onClick={logout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "var(--space-2) var(--space-3)",
                background: "transparent",
                color: "var(--color-text-muted)",
                border: "1px solid var(--color-border-default)",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                letterSpacing: "var(--tracking-wider)",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-out)",
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1400, width: "100%", margin: "0 auto", padding: "var(--space-6) var(--space-5)" }}>
        <div style={{ marginBottom: "var(--space-6)" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-brand)",
              letterSpacing: "var(--tracking-widest)",
              textTransform: "uppercase",
              marginBottom: "var(--space-2)",
            }}
          >
            Gestão de leads
          </div>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              letterSpacing: "var(--tracking-tight)",
              textTransform: "uppercase",
            }}
          >
            Pipeline de Vendas
          </h1>
        </div>

        <KanbanBoard />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Testar manualmente o fluxo completo**

```bash
cd frontend && npm run dev
```

Verificar:
1. Acessar `http://localhost:3000/dashboard` sem login → redireciona para `/login` (sem flash de conteúdo)
2. Fazer login com credenciais corretas → redireciona para `/dashboard`
3. Dashboard carrega com 4 colunas e leads (ou esqueleto durante loading)
4. Botão "Sair" → volta para `/login`, token removido do `localStorage`
5. Voltar para `/dashboard` após logout → redireciona para `/login`

- [ ] **Step 4: Commit**

```bash
git add frontend/app/dashboard/page.tsx frontend/components/dashboard/DashboardShell.tsx
git commit -m "feat(frontend): dashboard shell com header sticky, logout e KanbanBoard"
```

---

## Task 8: Testar drag-and-drop e verificar o fluxo completo

- [ ] **Step 1: Testar DnD com backend rodando**

Subir o backend:
```bash
docker compose up postgres migrate backend -d
```

Abrir `http://localhost:3000/dashboard` após login.

Verificar:
- Cards carregam nas colunas corretas
- Arrastar um card para outra coluna → card move imediatamente (optimistic)
- Toast `✓ Lead movido para Em Contato` aparece no canto inferior direito
- Recarregar a página → card permanece na nova coluna
- Arrastar para a mesma coluna → nada acontece (sem mutation)
- Testar `StatusSelector` (select) → move o card sem drag

- [ ] **Step 2: Testar erro de rede**

No DevTools → Network → Throttle → Offline. Tentar mover um card.

Verificar:
- Card volta para posição original (rollback)
- Toast `⚠ Não foi possível atualizar o status` aparece

Restaurar conexão.

- [ ] **Step 3: Testar mobile**

No DevTools → toggle device toolbar → viewport 375px.

Verificar:
- 4 colunas empilhadas verticalmente
- Cards legíveis
- `StatusSelector` funciona no mobile

---

## Task 9: Ajuste retroativo no LeadForm (WhatsApp)

**Files:**
- Modify: `frontend/components/LeadForm.tsx`

- [ ] **Step 1: Atualizar label e hint no campo de telefone**

Em `frontend/components/LeadForm.tsx`, localizar o componente `Field` com `id="phone"` e alterar para:

```tsx
<Field
  id="phone"
  label="WhatsApp"
  name="phone"
  type="tel"
  placeholder="11 99999-9999"
  autoComplete="tel"
  hint="Apenas números — DDD + número"
  error={state.errors.phone}
/>
```

O único ajuste é `label="WhatsApp"` (era `"Telefone (WhatsApp)"`). Placeholder e hint já estão corretos.

- [ ] **Step 2: Verificar que a landing ainda funciona**

Abrir `http://localhost:3000` e verificar que o formulário renderiza com "WhatsApp *" como label.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/LeadForm.tsx
git commit -m "fix(landing): atualizar label do campo telefone para WhatsApp"
```

---

## Task 10: Verificação final e commit de fase

- [ ] **Step 1: Build de produção sem erros**

```bash
cd frontend && npm run build
```

Saída esperada: build concluído sem erros de TypeScript ou de compilação.

- [ ] **Step 2: Checklist de validação manual**

Seguindo os critérios do roadmap:

- [ ] Submeter formulário da landing → card aparece em "Sem Contato" no dashboard (após refresh)
- [ ] Mover card por todas as 4 colunas → persiste após reload
- [ ] Acessar `/dashboard` sem login → redireciona para `/login`
- [ ] Vendedor correto exibido no card
- [ ] Link WhatsApp abre `wa.me` corretamente
- [ ] Toasts aparecem em sucesso e erro
- [ ] Mobile: colunas em stack vertical

- [ ] **Step 3: Atualizar ROADMAP.md**

Marcar os itens da Fase 7 como concluídos em `ROADMAP.md`:

```markdown
## ✅ Fase 7 — Kanban UI

- [x] Página `/dashboard` protegida por autenticação
- [x] Página `/login` com formulário
- [x] 4 colunas com `--color-status-*` tokens corretos
- [x] Cards com: nome, skin, telefone, vendedor responsável
- [x] Mover cards entre colunas (drag-and-drop + StatusSelector acessível)
- [x] TanStack Query para fetch e mutations
```

- [ ] **Step 4: Commit final da fase**

```bash
git add ROADMAP.md
git commit -m "feat(frontend): Fase 7 concluída — Kanban UI com auth, DnD e TanStack Query"
```
