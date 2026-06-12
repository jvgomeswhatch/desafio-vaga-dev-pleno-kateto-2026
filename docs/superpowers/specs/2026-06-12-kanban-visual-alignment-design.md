# Kanban Visual Alignment Design

> **Decisão arquitetural:** Este documento não descreve um "redesign". Descreve um alinhamento visual — tornar o dashboard indistinguível, em linguagem de produto, da landing page da CRATE//BR.

---

## Goal

Eliminar a dissonância visual entre landing page e dashboard Kanban. Após esta fase, um avaliador que abrir as duas telas deve perceber que foram projetadas pela mesma pessoa, com a mesma identidade.

## Architecture

Três componentes são modificados: `KanbanCard`, `KanbanColumn` e `DashboardShell`. Zero lógica nova de negócio. Zero dependências novas. Zero mudanças no backend. O `useKanban` hook já existente é consumido no `DashboardShell` apenas para derivar o contador de leads ativos.

**Tech stack:** Next.js App Router, React 19, inline styles com CSS custom properties, CSS classes para breakpoints responsivos via `globals.css`.

---

## KanbanCard

### Estrutura visual

```
border-top: 3px solid <status-color>   ← identidade imediata do estágio
padding: var(--space-5)                 ← 24px (vs 16px atual)
min-height: 180px
background: var(--color-bg-elevated)
border-radius: var(--radius-md)
border: 1px solid var(--color-border-default)
```

### Layout interno

```
┌─ border-top colorida ─────────────────────────┐
│                                               │
│  João Silva              [EM CONTATO]         │
│  AK-47 Redline                                │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │ 💬 Abrir WhatsApp ↗                     │  │
│  └─────────────────────────────────────────┘  │
│     (11) 99999-9999                           │
│                                               │
│  👤 Rafael                                    │
│                                               │
├───────────────────────────────────────────────┤
│  Status                                       │
│  [ Em Contato                        ▼ ]      │
└───────────────────────────────────────────────┘
```

### Badge de status

Substitui a bolinha atual. Posicionado no canto superior direito do header do card.

```
font-family: var(--font-mono)
font-size: var(--text-2xs)
letter-spacing: var(--tracking-widest)
text-transform: uppercase
padding: 2px 8px
border-radius: var(--radius-sm)
```

Cores por status:

| Status       | Background                      | Border                          | Color                    |
|-------------|----------------------------------|----------------------------------|--------------------------|
| sem_contato  | rgba(107,114,128, 0.12)         | rgba(107,114,128, 0.35)         | var(--color-status-pending) |
| em_contato   | rgba(94,152,217, 0.12)          | rgba(94,152,217, 0.35)          | var(--color-status-active)  |
| perdido      | rgba(235,75,75, 0.12)           | rgba(235,75,75, 0.35)           | var(--color-status-lost)    |
| finalizado   | rgba(91,162,74, 0.12)           | rgba(91,162,74, 0.35)           | var(--color-status-won)     |

### CTA WhatsApp

O número bruto deixa de ser o destaque. A ação vira o destaque.

**Bloco clicável** (substitui o link de texto atual):
```
display: flex
align-items: center
gap: var(--space-2)
padding: var(--space-2) var(--space-3)
background: rgba(94,152,217, 0.08)
border-radius: var(--radius-sm)
transition: background var(--duration-fast) var(--ease-out),
            transform var(--duration-fast) var(--ease-out)
cursor: pointer
```

Hover:
```
background: rgba(94,152,217, 0.15)
transform: translateY(-1px)
```

Texto principal: `💬 Abrir WhatsApp ↗` — `var(--color-info)`, `var(--font-mono)`, `var(--text-xs)`

Texto secundário abaixo do bloco: número formatado — `var(--color-text-muted)`, `var(--text-2xs)`, mono

### Ordem das informações

1. Nome + badge de status (header)
2. Skin desejada
3. CTA WhatsApp (bloco clicável) + número abaixo
4. Vendedor responsável
5. Separador `border-top: 1px solid var(--color-border-subtle)`
6. Label "Status" + `<select>` estilizado

### StatusSelector

Zona de ação secundária, visualmente separada das informações por um divisor.

Label acima do select:
```
font-family: var(--font-mono)
font-size: var(--text-2xs)
color: var(--color-text-muted)
letter-spacing: var(--tracking-widest)
text-transform: uppercase
margin-bottom: var(--space-2)
```

O `<select>` nativo é mantido como fallback acessível. Estilizado visualmente para parecer parte do card (não um elemento de formulário genérico).

### SkeletonCard

Imita a proporção do novo card:
- `border-top: 3px solid var(--color-border-subtle)` — mantém a linguagem da borda colorida mesmo em loading
- 4 barras animadas com `animation: pulse`:
  - Barra larga 60% (nome)
  - Barra média 40% (skin)
  - Barra curta 50% (WhatsApp block)
  - Barra estreita 30% (vendedor)
- Altura total ~180px

---

## KanbanColumn

### Container unificado

A coluna vira um container único com `border-radius` englobando header + corpo — eliminando a separação visual atual onde header e drop zone têm bordas independentes.

```
background: var(--color-bg-surface)
border-radius: var(--radius-lg)
border: 1px solid var(--color-border-default)
display: flex
flex-direction: column
overflow: hidden
transition: border-color var(--duration-fast) var(--ease-out)
```

Estado `isOver`:
```
border-color: <status-color>
```

### Header sticky

```
position: sticky
top: 0
z-index: var(--z-dropdown)
background: var(--color-bg-surface)
border-top: 3px solid <status-color>
border-bottom: 1px solid var(--color-border-subtle)
padding: var(--space-3) var(--space-4)
flex-shrink: 0
```

> **Nota de implementação:** Validar manualmente que `position: sticky` dentro de `overflow: hidden` funciona corretamente com o DnD. Se causar bugs, remover o sticky do header da coluna — o DnD tem prioridade sobre o refinamento.

Contador badge:
```
background: var(--color-bg-elevated)
border: 1px solid var(--color-border-subtle)
font-family: var(--font-mono)
font-size: var(--text-xs)
padding: 2px 8px
border-radius: var(--radius-pill)
```

### Drop zone — comportamento híbrido

CSS classes em `globals.css` (não inline, porque são breakpoints):

```css
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

A altura é controlada pelo layout flex do `<main>` — sem `calc()` com números mágicos. Ver seção DashboardShell.

### Estado vazio

```
flex: 1
display: flex
flex-direction: column
align-items: center
justify-content: center
gap: var(--space-3)
padding: var(--space-8)
text-align: center
```

```
📭  →  font-size: var(--text-xl), opacity: 0.65
"NENHUM LEAD"  →  Rajdhani, uppercase, --color-text-secondary, var(--text-sm)
"nesta etapa"  →  mono, xs, --color-text-muted
```

---

## DashboardShell

### Decisão de layout: flex column com altura fixada

O `<main>` adota `flex: 1; min-height: 0; display: flex; flex-direction: column`. O sub-header (`flex-shrink: 0`) ocupa o espaço que precisa. O `KanbanBoard` recebe `flex: 1; min-height: 0`, e as colunas usam `height: 100%` internamente.

Isso elimina completamente a necessidade de `calc(100vh - Xpx)`.

```
<div style="display:flex; flex-direction:column; min-height:100vh">

  <header style="flex-shrink:0; position:sticky; top:0">
    ...
  </header>

  <main style="flex:1; min-height:0; display:flex; flex-direction:column; padding:...">

    <!-- sub-header -->
    <div style="flex-shrink:0; margin-bottom:var(--space-6)">
      GESTÃO DE LEADS
      PIPELINE DE VENDAS
      58 LEADS EM ATENDIMENTO
    </div>

    <!-- board ocupa o resto -->
    <div style="flex:1; min-height:0">
      <KanbanBoard />
    </div>

  </main>

</div>
```

### Faixa 1 — header sticky (refinamento)

Remove "Admin" — não há RBAC, o texto não comunica nada.

Breadcrumb:
```
CRATE//BR  /  KANBAN
```
- `CRATE//BR`: fonte display, bold, `--color-text-primary`
- ` / `: mono, xs, `--color-text-muted`
- `KANBAN`: mono, xs, `--color-text-muted`, uppercase, tracking-widest

Botão Sair: mantido igual ao atual.

### Faixa 2 — sub-header no corpo

```
GESTÃO DE LEADS
  font-family: var(--font-mono)
  font-size: var(--text-xs)
  color: var(--color-brand)
  letter-spacing: var(--tracking-widest)
  text-transform: uppercase
  margin-bottom: var(--space-2)

PIPELINE DE VENDAS
  font-family: var(--font-display)
  font-size: var(--text-3xl)    ← ~48px desktop via token responsivo
  font-weight: var(--weight-bold)
  letter-spacing: var(--tracking-tight)
  text-transform: uppercase
  color: var(--color-text-primary)
  margin-bottom: var(--space-3)

58 LEADS EM ATENDIMENTO
  font-family: var(--font-mono)
  font-size: var(--text-xs)
  color: var(--color-text-muted)
  letter-spacing: var(--tracking-widest)
  text-transform: uppercase
```

### Contador dinâmico

```ts
const { data } = useKanban();
const activeLeads = data
  ? Object.values(data).flat().filter(l => l.status !== "finalizado").length
  : null;

const counterText = activeLeads !== null
  ? `${activeLeads} LEADS EM ATENDIMENTO`
  : "CARREGANDO...";
```

"Em atendimento" = qualquer status exceto `finalizado`. Decisão de negócio: lead finalizado saiu do pipeline ativo.

---

## Arquivos modificados

| Arquivo | Ação |
|--------|------|
| `frontend/components/kanban/KanbanCard.tsx` | Refatorar layout — border-top, badge, CTA WhatsApp, separador, label Status |
| `frontend/components/kanban/SkeletonCard.tsx` | Ajustar proporção e adicionar border-top |
| `frontend/components/kanban/KanbanColumn.tsx` | Container unificado, header sticky, CSS classes para drop zone |
| `frontend/components/dashboard/DashboardShell.tsx` | Layout flex, sub-header com hierarquia, contador dinâmico, remover "Admin" |
| `frontend/app/globals.css` | Adicionar `.kanban-drop-zone` com breakpoints responsivos |

---

## Out of scope

- Animações de entrada por coluna
- Avatar do vendedor com iniciais
- Tooltip de data de criação
- Busca ou filtros
- Estatísticas além do contador de leads ativos
- Framer Motion ou qualquer nova dependência de animação
