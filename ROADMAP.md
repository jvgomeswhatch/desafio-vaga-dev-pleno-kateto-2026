# Roadmap — CrateBr

## ✅ Fase 0 — Setup

- [x] Criar estrutura do monorepo (`/backend`, `/frontend`)
- [x] Inicializar Go module (`go mod init`)
- [x] Inicializar Next.js (`npx create-next-app`)
- [x] Criar `docker-compose.yml` base com PostgreSQL
- [x] Criar `.env.example` com todas as variáveis necessárias
- [x] Criar `.gitignore` cobrindo `.env`, `node_modules`, binários Go
- [x] Verificar estrutura `.claude/Agents/` e `.claude/Skills/` (já criada)
- [x] Commitar estrutura inicial

> **VALIDAÇÃO MANUAL**
> `docker compose up postgres` sobe sem erro. ✅
> Estrutura de pastas navegável em 2 minutos. ✅

---

## ✅ Fase 1 — Banco de dados

- [x] Escrever schema: tabelas `leads`, `seller_index`
- [x] Escrever migrations numeradas (`001_create_leads.sql`, `002_seed_seller_index.sql`)
- [x] Configurar migrate container no docker-compose
- [x] Rodar migrations localmente

> **AGENTE:** `Use the sql-schema-validator to review my PostgreSQL schema and migrations.`

> **VALIDAÇÃO MANUAL**
> `docker compose up` aplica migrations sem erro. ✅
> Inspecionar tabelas no psql: colunas, tipos, constraints e índices corretos. ✅
> `seller_index` tem 1 linha com `current_index = 0`. ✅

---

## ✅ Fase 2 — Round robin + POST /leads

- [x] Implementar `internal/repository` — `InsertLead`, `GetAndIncrementSellerIndex`
- [x] Implementar `internal/service` — `CreateLead` com transação + round robin
- [x] Implementar `internal/handler` — `POST /leads`
- [x] Validar campos server-side: nome (required), telefone (10–11 dígitos), skin (required)

> **AGENTE:** `Use the business-logic-enforcer to validate the round robin implementation.`
> **AGENTE:** `Use the go-api-reviewer to review the lead creation handler and service.`
> **AGENTE:** `Use the codebase-consistency-auditor to audit for duplicate logic after backend core.`

> **VALIDAÇÃO MANUAL**
> Enviar 6 requests para `POST /leads`. ✅
> Verificar na base: Marcelo → Rafael → Renato → Pedro → Leonardo → Marcelo. ✅
> Reiniciar container backend e enviar mais 1 request — continuou de onde parou. ✅
> Submeter com telefone inválido — retornou 422. ✅

---

## ✅ Fase 3 — Autenticação

- [x] Criar usuário fixo via migration ou seed (`admin` / senha hashed)
- [x] Implementar `POST /auth/login` — retorna JWT
- [x] Implementar middleware de autenticação JWT
- [x] Proteger rotas do kanban com middleware

> **AGENTE:** `Use the go-api-reviewer to review the auth handler and JWT middleware.` ✅
> **AGENTE:** `Use the container-security-reviewer to review JWT handling and HTTP security headers.` ✅

> **VALIDAÇÃO MANUAL**
> Login com credenciais corretas → JWT retornado. ✅
> Request para rota protegida sem token → 401. ✅
> Request com token válido → 200. ✅
> Request com token expirado → 401. (JWT 1h, validado pela lib)

---

## ✅ Fase 4 — Kanban API

- [x] Implementar `GET /leads` — lista leads agrupados por status
- [x] Implementar `PATCH /leads/:id/status` — move card entre colunas
- [x] Validar que status só aceita os 4 valores: `sem_contato`, `em_contato`, `perdido`, `finalizado`

> **AGENTE:** `Use the business-logic-enforcer to validate kanban state transitions.` ✅
> **AGENTE:** `Use the go-api-reviewer to review the kanban endpoints.` ✅

> **VALIDAÇÃO MANUAL**
> Mover um lead por todas as 4 colunas via curl/Postman. ✅
> Enviar status inválido → 422. ✅
> Confirmar que `seller_name` aparece em todos os responses. ✅
> Request sem autenticação → 401. ✅

---

## Fase 5 — Auditor de requisitos (meio do projeto)

> **AGENTE:** `Use the marketplace-requirements-auditor to run a mid-project requirements check.`

> **VALIDAÇÃO MANUAL**
> Revisar o checklist gerado.
> Corrigir qualquer requisito faltando antes de avançar para o frontend.

---

## ✅ Fase 6 — Landing page

- [x] Página pública com vitrine de skins usando `skin-card` do design system
- [x] Formulário com exatamente 3 campos: Nome, Skin desejada, Telefone
- [x] Feedback de loading e erro no formulário
- [x] Submit chama `POST /leads` e exibe mensagem de sucesso
- [x] Responsividade mobile

> **AGENTE:** `Use the typescript-frontend-reviewer to review the landing page components.` ✅

> **VALIDAÇÃO MANUAL**
> Abrir no celular — layout não quebra. ✅
> Submeter formulário → card criado no banco. ✅
> Submeter com telefone inválido → erro exibido (retornado do servidor). ✅
> Identidade visual: StatTrak Orange, Rajdhani nos headings, radius sharp. ✅

---

## Fase 7 — Kanban UI ✅

- [x] Página `/dashboard` protegida por autenticação
- [x] Página `/login` com formulário
- [x] 4 colunas com `--color-status-*` tokens corretos
- [x] Cards com: nome, skin, telefone, vendedor responsável
- [x] Mover cards entre colunas (drag-and-drop ou botões)
- [x] TanStack Query para fetch e mutations
- [x] Alinhamento visual com landing page (border-top colorida, badge textual, CTA WhatsApp, sub-header hierárquico, scroll híbrido desktop/mobile)

> **AGENTE:** `Use the typescript-frontend-reviewer to review the kanban UI and auth flow.`
> **AGENTE:** `Use the codebase-consistency-auditor to audit for duplicate types and scattered API calls after frontend.`

> **VALIDAÇÃO MANUAL**
> Submeter formulário da landing → card aparece em "Sem Contato" sem reload manual.
> Mover card por todas as 4 colunas → persiste após reload.
> Acessar `/dashboard` sem login → redireciona para `/login`.
> Vendedor correto exibido no card.

---

## Fase 8 — Testes ✅

- [x] `go test` — round robin: todos os 5 vendedores e wrap-around
- [x] `go test` — round robin: persistência após reinício (índice continua do banco)
- [x] `go test` — kanban: status válidos aceitos, inválido rejeitado
- [x] Playwright E2E: submit formulário → card em "Sem Contato" → mover card

> **AGENTE:** `Use the integration-test-validator to validate test coverage.` ✅

> **VALIDAÇÃO MANUAL**
> `go test ./...` passa sem falha. ✅
> Playwright roda e passa. ✅
> Wrap-around testado: 6º lead → Marcelo. ✅

---

## Fase 9 — Docker ✅

- [x] Dockerfile do backend (multi-stage, non-root, distroless/alpine)
- [x] Dockerfile do frontend (multi-stage, non-root, standalone output)
- [x] `.dockerignore` para ambos (cobre `.env`, `.git`, `node_modules`)
- [x] `docker-compose.yml` completo: postgres + migrate + backend + frontend
- [x] Health checks nos serviços (postgres, backend `/health`, frontend)
- [x] Headers de segurança HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`)

> **AGENTE:** `Use the container-security-reviewer to review Dockerfiles and compose security.` ✅

> **VALIDAÇÃO MANUAL**
> `docker compose up --build` sobe tudo do zero.
> Acessar landing page e kanban via containers.
> Submeter formulário → card no kanban — tudo via Docker.
> Nenhum container roda como root.

---

## Fase 10 — CI/CD ✅

- [x] Workflow: lint → test → build → docker build → ghcr.io push
- [x] Secrets: apenas `GITHUB_TOKEN` (automático) — JWT_SECRET fixo só para CI
- [x] Pipeline passa no primeiro push

> **AGENTE:** `Use the github-actions-pipeline-reviewer to review the GitHub Actions workflow.` ✅

> **VALIDAÇÃO MANUAL**
> Push para main → pipeline verde no GitHub Actions.
> Imagem publicada no ghcr.io com SHA e `latest`.

---

## Fase 11 — README + entrega final ✅

> **AGENTE:** `Use the marketplace-requirements-auditor to run the final delivery checklist.` ✅
> **AGENTE:** `Use the codebase-consistency-auditor to run a final consistency audit before submitting.` ✅

- [x] README: descrição, `docker compose up`, variáveis de ambiente
- [x] Seção Round Robin no README (ordem, persistência, concorrência, FOR UPDATE)
- [x] Decisões arquiteturais documentadas
- [x] Commit history limpo e legível
- [x] Consistência corrigida: `STATUS_LABEL`/`STATUS_COLOR` centralizados em `lib/kanban-config.ts`
- [x] `leads.ts` migrado de `fetch` direto para `apiFetch`
- [x] `kanban_handler.go` desacoplado de `repository` — usa `service.ErrLeadNotFound`

> **VALIDAÇÃO MANUAL FINAL**
> Clonar o repo do zero em outra pasta.
> Seguir apenas o README — projeto sobe sem conhecimento prévio.
> Passar mentalmente por todos os critérios de avaliação antes de enviar. ✅
