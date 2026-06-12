# Kanban Visual Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alinhar visualmente o dashboard Kanban com a landing page — mesma linguagem de produto, mesma identidade CRATE//BR.

**Architecture:** Três componentes são modificados (KanbanCard, KanbanColumn, DashboardShell) e um arquivo de CSS global recebe novas classes para o layout híbrido desktop/mobile. Zero lógica nova de negócio, zero dependências novas, zero mudanças no backend.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, inline styles com CSS custom properties, `@dnd-kit/core` + `@dnd-kit/sortable`, TanStack Query v5, `globals.css` para breakpoints responsivos.

---

## File Map

| Arquivo | O que muda |
|--------|-----------|
| `frontend/components/kanban/KanbanCard.tsx` | Refatorar layout inteiro: border-top colorida, padding maior, badge textual, CTA WhatsApp como bloco, ordenação das informações, separador visual antes do StatusSelector |
| `frontend/components/kanban/SkeletonCard.tsx` | Adicionar border-top, ajustar proporção para ~180px, 4 barras |
| `frontend/components/kanban/KanbanColumn.tsx` | Container unificado (border-radius único), header sticky com border-top, classe CSS no drop zone, estado vazio refinado |
| `frontend/components/dashboard/DashboardShell.tsx` | Layout flex com altura gerenciada, sub-header hierárquico, contador dinâmico via useKanban, remover "Admin" |
| `frontend/app/globals.css` | Adicionar `.kanban-drop-zone` com overflow-y: auto no desktop |

---

## Task 1: Refatorar KanbanCard

**Files:**
- Modify: `frontend/components/kanban/KanbanCard.tsx`

Este task substitui completamente o layout interno do card. O card atual tem bolinha colorida, número de telefone bruto, e o select sem separação visual. O novo card tem: border-top colorida identificando o status, badge textual no lugar da bolinha, CTA de WhatsApp como bloco clicável, número secundário abaixo, vendedor abaixo do WhatsApp, e uma zona de ação separada por divisor.

- [ ] **Step 1: Verificar o arquivo atual**

```bash
# Confirmar que o arquivo existe e ver linha count
wc -l frontend/components/kanban/KanbanCard.tsx
```

Esperado: arquivo existe, ~100 linhas.

- [ ] **Step 2: Substituir o conteúdo completo de KanbanCard.tsx**

Substituir `frontend/components/kanban/KanbanCard.tsx` pelo seguinte:

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

const STATUS_BADGE_BG: Record<LeadStatus, string> = {
  sem_contato: "rgba(107,114,128,0.12)",
  em_contato:  "rgba(94,152,217,0.12)",
  perdido:     "rgba(235,75,75,0.12)",
  finalizado:  "rgba(91,162,74,0.12)",
};

const STATUS_BADGE_BORDER: Record<LeadStatus, string> = {
  sem_contato: "rgba(107,114,128,0.35)",
  em_contato:  "rgba(94,152,217,0.35)",
  perdido:     "rgba(235,75,75,0.35)",
  finalizado:  "rgba(91,162,74,0.35)",
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  sem_contato: "Sem Contato",
  em_contato:  "Em Contato",
  perdido:     "Perdido",
  finalizado:  "Finalizado",
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

  const statusColor = STATUS_COLOR[lead.status];
  const waNumber = `55${lead.phone.replace(/\D/g, "")}`;

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
        cursor: "grab",
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
```

- [ ] **Step 3: Adicionar hover do CTA WhatsApp no globals.css**

Abrir `frontend/app/globals.css` e adicionar ao final, logo após o bloco `/* KANBAN — mobile stack */`:

```css
/* ============================================================
   KANBAN — card CTA hover
   ============================================================ */
.kanban-wa-cta:hover {
  background: rgba(94,152,217,0.15) !important;
  transform: translateY(-1px);
}
```

- [ ] **Step 4: Verificar que o TypeScript compila sem erros**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros (ou apenas warnings irrelevantes).

- [ ] **Step 5: Commit**

```bash
git add frontend/components/kanban/KanbanCard.tsx frontend/app/globals.css
git commit -m "feat(kanban): refatorar KanbanCard — border-top, badge textual, CTA WhatsApp"
```

---

## Task 2: Refatorar SkeletonCard

**Files:**
- Modify: `frontend/components/kanban/SkeletonCard.tsx`

O skeleton atual tem 3 barras e não tem border-top. O novo tem border-top cinza (mesma linguagem do card real durante loading) e 4 barras com alturas que imitam as seções do card redesenhado.

- [ ] **Step 1: Substituir o conteúdo de SkeletonCard.tsx**

```tsx
export function SkeletonCard() {
  const bar = (width: string, height = 12) => (
    <div
      style={{
        height,
        width,
        background: "var(--color-bg-raised)",
        borderRadius: "var(--radius-sm)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );

  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-subtle)",
        borderTop: "3px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-5)",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {bar("60%")}
      {bar("40%")}
      {bar("50%", 28)}
      {bar("30%")}
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/kanban/SkeletonCard.tsx
git commit -m "feat(kanban): refatorar SkeletonCard — border-top, 4 barras, min-height 180px"
```

---

## Task 3: Refatorar KanbanColumn

**Files:**
- Modify: `frontend/components/kanban/KanbanColumn.tsx`
- Modify: `frontend/app/globals.css`

A coluna atual tem header e drop zone como dois `<div>` independentes com bordas separadas. A nova coluna é um container unificado com `border-radius` único, header sticky, e drop zone usando classe CSS para o scroll responsivo.

**Atenção:** `position: sticky` dentro de `overflow: hidden` **não funciona** — o CSS do container pai usa `overflow: hidden` para o `border-radius`, o que quebra o sticky do header filho. A solução é **não usar `overflow: hidden` no container** e aplicar `border-radius` individualmente no header (top corners) e na drop zone (bottom corners). Validar manualmente após implementação.

- [ ] **Step 1: Adicionar classe .kanban-drop-zone ao globals.css**

Adicionar ao final de `frontend/app/globals.css`, após o bloco `/* KANBAN — card CTA hover */`:

```css
/* ============================================================
   KANBAN — drop zone scroll híbrido
   ============================================================ */
.kanban-drop-zone {
  flex: 1;
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 200px;
}

@media (min-width: 768px) {
  .kanban-drop-zone {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--color-border-default) transparent;
  }
}
```

- [ ] **Step 2: Substituir o conteúdo de KanbanColumn.tsx**

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
  const borderColor = isOver ? color : "var(--color-border-default)";

  return (
    <div
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
```

> **Nota:** `color-mix` é suportado em todos os browsers modernos (Chrome 111+, Firefox 113+, Safari 16.2+). Se o projeto precisar suportar browsers mais antigos, substituir pela string `rgba` inline como era antes.

- [ ] **Step 3: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 4: Validação visual manual — sticky header**

Iniciar o servidor de desenvolvimento:

```bash
cd frontend && npm run dev
```

Abrir `http://localhost:3000/dashboard`, logar, e testar:
- Coluna com muitos cards: scroll interno aparece no desktop (≥768px)?
- Header da coluna fica fixo enquanto os cards rolam?
- Se o header não ficar sticky (bug de overflow), remover `position: sticky` do header e deixar apenas como `flex-shrink: 0` — o DnD tem prioridade.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/kanban/KanbanColumn.tsx frontend/app/globals.css
git commit -m "feat(kanban): refatorar KanbanColumn — container unificado, scroll híbrido, estado vazio"
```

---

## Task 4: Refatorar DashboardShell

**Files:**
- Modify: `frontend/components/dashboard/DashboardShell.tsx`

O shell atual tem: "Admin" genérico ao lado do botão Sair, "Gestão de leads" em lowercase, h1 em `--text-2xl` sem impacto visual, e `<main>` sem estrutura flex que permita às colunas terem altura controlada. O novo shell tem: layout flex full-height, sub-header hierárquico igual à landing (overline + título grande + contador), "Admin" removido, e o `<main>` passa a ser um flex container que gerencia a altura do board sem `calc()`.

- [ ] **Step 1: Substituir o conteúdo de DashboardShell.tsx**

```tsx
"use client";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useLogout } from "@/hooks/useAuth";
import { useKanban } from "@/hooks/useKanban";

export function DashboardShell() {
  const logout = useLogout();
  const { data } = useKanban();

  const activeLeads = data
    ? Object.values(data).flat().filter((l) => l.status !== "finalizado").length
    : null;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Faixa 1 — header sticky com blur */}
      <header
        style={{
          position: "sticky",
          top: 0,
          flexShrink: 0,
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
          {/* Logo + breadcrumb */}
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
                color: "var(--color-text-primary)",
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

          {/* Botão Sair */}
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
      </header>

      {/* Main — flex column para controlar altura do board */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          maxWidth: 1400,
          width: "100%",
          margin: "0 auto",
          padding: "var(--space-6) var(--space-5)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Faixa 2 — sub-header hierárquico */}
        <div style={{ flexShrink: 0, marginBottom: "var(--space-6)" }}>
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
            Gestão de Leads
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-3xl)",
              fontWeight: "var(--weight-bold)",
              letterSpacing: "var(--tracking-tight)",
              textTransform: "uppercase",
              color: "var(--color-text-primary)",
              margin: 0,
              marginBottom: "var(--space-3)",
            }}
          >
            Pipeline de Vendas
          </h1>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text-muted)",
              letterSpacing: "var(--tracking-widest)",
              textTransform: "uppercase",
            }}
          >
            {activeLeads !== null
              ? `${activeLeads} leads em atendimento`
              : "carregando..."}
          </div>
        </div>

        {/* Board — ocupa o espaço restante */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <KanbanBoard />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

Esperado: sem erros.

- [ ] **Step 3: Validação visual manual do contador**

Abrir `http://localhost:3000/dashboard`. Com leads cadastrados no banco, verificar:
- O texto `X leads em atendimento` aparece com o número correto
- O número **não inclui** leads com status `finalizado`
- Durante loading (primeiro render), exibe `carregando...`
- Após drag-and-drop de um lead para `finalizado`, o número diminui em 1 (otimístico, via TanStack Query)

- [ ] **Step 4: Verificar layout flex no desktop e mobile**

Desktop (≥768px):
- O board ocupa toda a altura restante abaixo do sub-header
- As colunas têm scroll interno (scroll do conteúdo, não da página)
- O header superior fica sticky ao rolar

Mobile (<768px):
- As 4 colunas empilham verticalmente
- A página inteira rola, não as colunas individualmente

- [ ] **Step 5: Commit**

```bash
git add frontend/components/dashboard/DashboardShell.tsx
git commit -m "feat(dashboard): layout flex, sub-header hierárquico, contador dinâmico, remover Admin"
```

---

## Task 5: Validação final e build

**Files:** nenhum modificado — apenas validação.

- [ ] **Step 1: Rodar build de produção**

```bash
cd frontend && npm run build 2>&1 | tail -30
```

Esperado: `✓ Compiled successfully` ou similar. Sem erros de TypeScript ou de módulo. Warnings de `<img>` vs `<Image>` são aceitáveis se já existiam antes.

- [ ] **Step 2: Testar fluxo completo**

Com `npm run dev` rodando e o backend Go rodando (`go run ./...` na pasta `backend`):

1. Acessar `http://localhost:3000` → landing page carrega normalmente (regressão)
2. Clicar em qualquer CTA de lead → formulário funciona (regressão)
3. Acessar `http://localhost:3000/dashboard` sem estar logado → redireciona para `/login`
4. Logar com credenciais válidas → redireciona para `/dashboard`
5. Dashboard exibe sub-header com título grande e contador
6. Cards têm border-top colorida por status
7. Badge textual substitui a bolinha
8. "Abrir WhatsApp ↗" é um bloco clicável (hover muda o fundo)
9. Número do telefone aparece abaixo do bloco WhatsApp
10. Vendedor aparece abaixo do WhatsApp
11. Separador visual + label "Status" + select aparecem no rodapé do card
12. Arrastar card entre colunas → move corretamente, toast de sucesso
13. Estado vazio: coluna sem leads mostra 📭 com texto refinado
14. Mobile (<768px): colunas empilham, página rola
15. Desktop (≥768px): colunas têm scroll interno, página não rola com o board

- [ ] **Step 3: Commit final e atualizar roadmap**

```bash
# Atualizar ROADMAP.md marcando Fase 7 como concluída (alinhamento visual)
# Depois commitar
git add .
git commit -m "chore: Fase 7 concluída — alinhamento visual Kanban"
```
