# Spec — Fase 7: Kanban UI

## Status da especificação

A especificação funcional e técnica da Fase 7 foi considerada aprovada e congelada em 12/06/2026.

A partir deste ponto, apenas correções de bugs, ajustes de implementação ou melhorias estritamente necessárias serão aceitas.

Novas funcionalidades fora do escopo original do desafio não serão incorporadas.

---

## Objetivo

Implementar o dashboard `/dashboard` com Kanban visual de leads, página `/login` com autenticação JWT, e ajuste retroativo do campo WhatsApp na landing. O resultado deve parecer um CRM simples, limpo e funcional — com identidade visual consistente com a landing page.

---

## Escopo

### Dentro do escopo

- Página `/login` com `LoginForm`
- Página `/dashboard` protegida por auth
- Kanban com 4 colunas e drag-and-drop
- Fallback acessível via `StatusSelector`
- TanStack Query para fetch e mutations
- Optimistic updates com rollback
- Toasts de sucesso e erro (`sonner`)
- Link `wa.me` no card do lead
- Contador de leads por coluna
- Badge de status colorido no card
- Skeleton loading durante `GET /leads`
- Estado vazio explícito por coluna
- Layout responsivo (desktop: 4 colunas, mobile: stack vertical)
- Botão de logout
- Interceptação de 401 com redirect automático

### Fora do escopo

- Refresh token / blacklist de JWT
- Context API de auth ou Zustand
- Server Components no dashboard
- WebSockets ou polling
- Filtro por vendedor, pesquisa, paginação
- Login individual por vendedor
- Mensagem pré-preenchida no WhatsApp
- Endpoint `/logout` no backend

---

## Arquitetura

App Router com Client Components. Sem middleware do Next.js para auth (middleware roda no Edge, sem acesso ao `localStorage`). Auth guard via hook `useRequireAuth` encapsulado em `ProtectedRoute`.

### Estrutura de arquivos

```
frontend/
  app/
    login/
      page.tsx
    dashboard/
      page.tsx
  components/
    auth/
      ProtectedRoute.tsx
      LoginForm.tsx
    kanban/
      KanbanBoard.tsx
      KanbanColumn.tsx
      KanbanCard.tsx
      StatusSelector.tsx
  hooks/
    useAuth.ts
    useRequireAuth.ts
    useKanban.ts
  services/
    auth.ts
    kanban.ts
  lib/
    api.ts
  types/
    index.ts        ← Lead, LeadStatus já existem; sem novos tipos necessários
```

### Novas dependências

```
@tanstack/react-query
@dnd-kit/core
@dnd-kit/sortable
@dnd-kit/utilities
sonner
```

---

## Fluxo de autenticação

1. `POST /auth/login` → token salvo em `localStorage["auth_token"]`
2. `useRequireAuth` redireciona para `/login` se sem token (roda via `useEffect`)
3. `lib/api.ts` injeta `Authorization: Bearer {token}` em todo request; se vier 401, limpa token e redireciona para `/login`
4. Logout: `localStorage.removeItem("auth_token")` + `router.replace("/login")` — sem endpoint no backend

### `lib/api.ts`

Headers são construídos via `new Headers()` para evitar ambiguidade quando o chamador passa headers customizados. `Authorization` só é setado se o token existir.

```ts
export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const token = localStorage.getItem("auth_token");

  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  }

  return res;
}
```

### `hooks/useRequireAuth.ts`

Retorna `boolean` para que `ProtectedRoute` possa renderizar `null` antes da confirmação, evitando flash de conteúdo.

```ts
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

### `components/auth/ProtectedRoute.tsx`

Renderiza `null` enquanto `authenticated` é `false`, prevenindo flash do conteúdo protegido antes do redirect.

```ts
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useRequireAuth();
  if (!isAuthenticated) return null;
  return children;
}
```

---

## Dashboard header

Mesmo padrão do `Navbar` da landing: `position: sticky`, fundo overlay com `backdrop-filter: blur(12px)`, borda inferior `--color-border-subtle`, altura 56px.

Esquerda: logo CRATE//BR (mesmo componente ou mesmo padrão visual).
Direita: texto "Admin" + botão "Sair" (monospace, uppercase, borda sutil).

---

## Kanban

### Colunas

| Status | Label | Token | Cor |
|---|---|---|---|
| `sem_contato` | Sem Contato | `--color-status-pending` | `#6b7280` (cinza) |
| `em_contato` | Em Contato | `--color-status-active` | `#5e98d9` (azul) |
| `perdido` | Perdido | `--color-status-lost` | `#eb4b4b` (vermelho) |
| `finalizado` | Finalizado | `--color-status-won` | `#5ba24a` (verde) |

Cada coluna exibe o contador no header: `Sem Contato (3)`.

### Layout

- Desktop (≥768px): 4 colunas horizontais com scroll interno por coluna
- Mobile (<768px): stack vertical, uma coluna abaixo da outra

### Estado vazio

Quando uma coluna não tiver leads:

```
📭 Nenhum lead aqui ainda
```

Centralizado verticalmente, cor `--color-text-muted`, fonte monospace.

### Skeleton loading

Durante `isLoading` do `GET /leads`: exibir 3 skeleton cards por coluna (retângulos animados com `--color-bg-raised`).

---

## Card do lead

```
┌──────────────────────────────┐
│ João Silva            🔵     │  ← badge colorido com cor do status
│ AK-47 Redline                │
│                              │
│ 👤 Rafael                    │
│ 💬 (11) 99999-9999           │  ← link wa.me/55{numero}
│                              │
│ [Sem Contato ▼]              │  ← StatusSelector (fallback acessível)
└──────────────────────────────┘
```

- Nome: `--font-display`, semibold
- Skin: `--color-text-secondary`
- Vendedor: `--font-mono`, `--text-xs`
- WhatsApp: `<a href="https://wa.me/55{numero}" target="_blank" rel="noopener noreferrer">` — sem mensagem pré-preenchida
- Badge: bolinha colorida com o token do status atual
- Fundo: `--color-bg-elevated`, borda `--color-border-default`, radius `--radius-md`

### Formatação do número

```ts
function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return phone;
}
```

---

## Drag-and-drop

Bibliotecas: `@dnd-kit/core` + `@dnd-kit/sortable`.

- Card arrastado: `opacity: 0.5` na posição original
- Coluna de destino durante hover: borda iluminada na cor do token do status da coluna
- Drop na mesma coluna de origem: ignorado — nenhuma mutation é disparada
- Drop em coluna diferente: dispara mutation `PATCH /leads/:id/status`
- `StatusSelector` como fallback — `<select>` com os 4 status, visível sempre no card

---

## `hooks/useKanban.ts`

```ts
const { leads, moveLead, isLoading } = useKanban();
```

Responsabilidades:
- `useQuery(["leads"], getLeads)` — busca e cacheia todos os leads
- `useMutation(updateLeadStatus)` com:
  - `onMutate`: captura snapshot completo do cache atual via `queryClient.getQueryData(["leads"])` e aplica o optimistic update localmente
  - `onError`: rollback restaura o snapshot completo capturado em `onMutate`, garantindo consistência em cenários de múltiplas movimentações consecutivas
  - `onSettled`: `invalidateQueries(["leads"])` para sincronizar com o servidor
- Toast de sucesso via `sonner` no `onSuccess`
- Toast de erro via `sonner` no `onError`

`KanbanBoard` não contém lógica de dados — apenas renderização e gerenciamento de DnD.

---

## Toasts (`sonner`)

| Evento | Toast |
|---|---|
| Card movido com sucesso | `✓ Lead movido para Em Contato` |
| Erro na mutation | `⚠ Não foi possível atualizar o status` |

---

## `/login`

Design simples: card centralizado na tela, sem distrações. Fundo `--color-bg-base` com o grid sutil já existente no `body::before`.

- Logo CRATE//BR no topo do card
- Campos: E-mail e Senha
- Botão "Entrar" com mesmo estilo do botão da landing
- Erro de credenciais: mensagem inline (não redireciona, não expõe qual campo está errado)
- Sem opções de cadastro, recuperação de senha ou outros fluxos

---

## Ajuste retroativo — Landing

Ajuste mínimo em `LeadForm.tsx`:

- Label: `"WhatsApp *"`
- Placeholder: `"11 99999-9999"`
- Hint: `"Apenas números — DDD + número"`

---

## Requisitos do desafio atendidos

| Requisito | Status |
|---|---|
| Landing page | ✅ Fase 6 |
| Formulário: Nome, Skin, WhatsApp | ✅ Fase 6 + ajuste retroativo |
| Área autenticada com login | ✅ Fase 7 |
| Kanban com 4 colunas | ✅ Fase 7 |
| Movimentação de cards | ✅ Fase 7 |
| Round robin exibido no card | ✅ Fase 7 |
| Persistência via API | ✅ Fase 7 |
