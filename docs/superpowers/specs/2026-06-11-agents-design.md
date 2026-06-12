# Agents Design — CrateBr Fullstack Challenge

## Context

Monorepo for a CS skin marketplace challenge. Stack: Next.js + TypeScript (frontend), Go (backend API), PostgreSQL, Docker Compose, GitHub Actions + ghcr.io.

Deadline: next day.

**Evaluation weights:**
| Criterion | Weight | What is checked |
|---|---|---|
| Business rule correctness | 30% | Form creates card in "Sem Contato"; round robin distributes correctly across 5 sellers |
| Code quality | 20% | Readability, organization, naming, no unnecessary hacks |
| Agent usage + documentation | 20% | Clarity of .md files, AI method, decisions well explained |
| Landing experience | 15% | Creativity, identity, form and kanban usability |
| Product fundamentals | 10% | Input validation, authenticated area, error handling |
| General care | 5% | Easy to run, commit history, useful README |

---

## Agent Priority

```
P0  marketplace-requirements-auditor   ← never skip
P1  business-logic-enforcer
P2  go-api-reviewer · sql-schema-validator · typescript-frontend-reviewer
P3  container-security-reviewer · github-actions-pipeline-reviewer
P4  integration-test-validator
```

If time runs short, P3 and P4 can be reduced. P0 and P1 never.

---

## Structure

```
.claude/
├── AGENTS.md
├── agents/
│   ├── marketplace-requirements-auditor.md
│   ├── business-logic-enforcer.md
│   ├── go-api-reviewer.md
│   ├── sql-schema-validator.md
│   ├── typescript-frontend-reviewer.md
│   ├── container-security-reviewer.md
│   ├── github-actions-pipeline-reviewer.md
│   └── integration-test-validator.md
└── skills/
    ├── validate-challenge-requirements.md
    ├── validate-delivery-checklist.md
    ├── validate-round-robin-checklist.md
    ├── validate-round-robin-distribution.md
    ├── validate-kanban-state-transitions.md
    ├── review-postgresql-schema.md
    ├── review-sql-migrations.md
    ├── review-go-api-layer.md
    ├── review-go-simplicity.md
    ├── review-typescript-components.md
    ├── review-frontend-simplicity.md
    ├── review-dockerfile-security.md
    ├── review-github-actions-workflow.md
    └── validate-test-coverage.md
```

---

## Agents

### 1. `marketplace-requirements-auditor.md` — P0

**Role:** Validates that the solution covers every explicit requirement from the challenge. The most critical agent — a missed requirement costs more than any technical flaw.

**Skills:**
- `validate-challenge-requirements` — checks each requirement item by item against the spec
- `validate-delivery-checklist` — checks README, repo structure, Docker Compose boot
- `validate-round-robin-checklist` — dedicated checklist for the highest-risk requirement:
  - ✓ Correct order: Marcelo → Rafael → Renato → Pedro → Leonardo → Marcelo
  - ✓ Persistence across restarts
  - ✓ Seller name displayed on card
  - ✓ Card created automatically on form submit
  - ✓ Card starts in "Sem Contato"
  - ✓ Concurrency protected

**Invocation:** Three times — project start (read requirements), mid-project (~50% done), pre-delivery (final checklist).

---

### 2. `business-logic-enforcer.md` — P1

**Role:** Validates core business rules: round robin seller assignment, kanban state transitions, server-side form validation. Validation never happens in the frontend.

**Skills:**
- `validate-round-robin-distribution` — verifies sequence, persistence, concurrency safety
- `validate-kanban-state-transitions` — verifies exactly 4 columns (Sem Contato, Em Contato, Perdido, Finalizado), valid transitions, seller displayed on card

**Invocation:** After implementing round robin; after implementing kanban move; before any PR.

---

### 3. `go-api-reviewer.md` — P2

**Role:** Reviews Go code for simplicity, correctness, and clean architecture. Rejects overengineering. Expected structure: `internal/{handler, service, repository, model, middleware, database}` — nothing beyond that.

**Skills:**
- `review-go-api-layer` — naming, error handling, HTTP status codes, handler/service/repository boundaries
- `review-go-simplicity` — flags unnecessary interfaces, empty service layers, packages with 1 file/1 function, cyclomatic complexity

**Rules:**
- REQUIRE: business rules live in services; HTTP concerns in handlers; database concerns in repositories
- REJECT: domain/, usecase/, application/, command/, query/, mediator/, eventbus/, factory/, strategy/
- REJECT: interface with single implementation that adds no testability value
- REJECT: service method that only proxies repository with no business logic
- PREFER: flat, readable package tree navigable in under 2 minutes

**Invocation:** After each backend feature; before integration tests.

---

### 4. `sql-schema-validator.md` — P2

**Role:** Validates PostgreSQL schema design, migrations, queries, and SQL injection prevention. All queries must use parameterized statements.

**Skills:**
- `review-postgresql-schema` — column types, constraints, foreign keys, naming conventions, indexes on columns used in lead lookup, kanban filtering, and round robin operations
- `review-sql-migrations` — migration files are idempotent, ordered, reversible where possible

**Rules:**
- REJECT: string interpolation in SQL queries
- REQUIRE: parameterized queries (`$1`, `$2`) for all user input
- REQUIRE: indexes on foreign keys and columns used in lead lookup, kanban filtering, and round robin operations

**Invocation:** After writing schema/migrations; after any raw SQL query is added.

---

### 5. `typescript-frontend-reviewer.md` — P2

**Role:** Reviews TypeScript/Next.js code for type safety, component simplicity, clean structure, and design system fidelity. Rejects overengineering. Expected structure: `src/{app, components, services, types, lib, hooks}`.

**Design system (CRATE//BR):**
- Fonts: `Rajdhani` (display/headings), `Inter` (body), `JetBrains Mono` (labels, badges, code)
- Brand: `--color-brand: #cf6a32` (StatTrak Orange), `--color-accent: #e4ae39` (Covert Knife Gold)
- Surfaces: `bg-base #0a0e13` → `bg-elevated #11161d` → `bg-surface #1a2029` → `bg-raised #232b36`
- Kanban status colors: pending `#6b7280`, active `#5e98d9`, lost `#eb4b4b`, won `#5ba24a`
- Rarity colors for skin cards: consumer → industrial → mil-spec → restricted → classified → covert → knife
- Radius: sharp (`--radius-sm: 2px`, `--radius-md: 4px`) — CS aesthetic, no rounded-xl
- All tokens are CSS custom properties. No hardcoded hex values in components.
- Signature elements: `float-meter` (wear bar), `killfeed` (eyebrow/notification), `skin-card` (left rarity border), `scoreboard` (HUD stats), `badge--stattrak`
- Motion: `--duration-fast: 120ms`, `--duration-base: 200ms` with `cubic-bezier(0.16, 1, 0.3, 1)`

**Skills:**
- `review-typescript-components` — prop types, server vs client components, accessibility (labels, focus, contrast), TanStack Query usage, design token compliance
- `review-frontend-simplicity` — flags unnecessary abstractions, hooks used only once, duplicate types for the same entity, wrapper components with no value

**Rules:**
- REJECT: Redux/Zustand/MobX without clear justification
- AVOID: Context API when props or TanStack Query solve the problem more simply
- REJECT: LeadDTO + LeadResponse + LeadViewModel for the same entity — one `Lead` interface
- REJECT: hooks used in a single place without encapsulating meaningful state or behavior
- REJECT: BaseCard, AbstractCard, CardFactory, CardWrapper patterns
- REJECT: hardcoded hex colors — use CSS custom properties from design system
- REJECT: `rounded-xl`, `rounded-2xl` Tailwind classes — design uses sharp radius
- PREFER: Server Components by default, Client Components only when needed
- PREFER: `useLeads()`, `useAuth()` — hooks with real reuse
- PREFER: centralized types in `types/`
- PREFER: minimal code required to satisfy all requirements
- REQUIRE: kanban columns use `--color-status-*` tokens for status indicators
- REQUIRE: `font-display` class for headings (Rajdhani), `font-mono` for labels/badges

**Invocation:** After each frontend feature; before delivery. Invoked last in the overall flow.

---

### 6. `container-security-reviewer.md` — P3

**Role:** Reviews Dockerfiles, compose security, HTTP headers, JWT handling, and secrets exposure. Covers both build hygiene and runtime hardening.

**Skills:**
- `review-dockerfile-security` — multi-stage build, distroless/alpine final image, non-root user, no shell in final stage, read-only filesystem, no secrets in layers, `.dockerignore` complete

**Rules:**
- REQUIRE: multi-stage build separating build and runtime
- REQUIRE: non-root USER in final stage
- REQUIRE: no COPY of `.env` files into image
- REQUIRE: HTTP security headers (X-Content-Type-Options, X-Frame-Options, Content-Security-Policy)
- PREFER: JWT in httpOnly cookie
- ACCEPT: JWT in memory for challenge environments, provided no sensitive data is exposed
- REJECT: `RUN apt-get` or package manager in final stage

**Invocation:** After writing Dockerfiles; after any change to compose or environment variable handling. Also invoked at phase 3 for JWT/headers review.

---

### 7. `github-actions-pipeline-reviewer.md` — P3

**Role:** Reviews GitHub Actions workflows for correctness, security, and coverage. Pipeline: lint → test → build → docker build → ghcr.io push.

**Skills:**
- `review-github-actions-workflow` — workflow triggers, job order, secret handling, ghcr.io authentication, cache strategy, fail-fast behavior

**Rules:**
- REQUIRE: secrets via `${{ secrets.* }}`, never hardcoded
- REQUIRE: `GITHUB_TOKEN` for ghcr.io push
- REQUIRE: tests run before docker build
- REJECT: `continue-on-error: true` on test jobs

**Invocation:** After writing the first workflow file; after any pipeline change.

---

### 8. `integration-test-validator.md` — P4

**Role:** Validates test coverage. `go test` for backend business logic (round robin, state machine). Playwright E2E for critical user flows.

**Skills:**
- `validate-test-coverage` — round robin unit test, kanban transition test, Playwright flow: submit form → card appears in "Sem Contato" → seller assigned → move card

**Rules:**
- REQUIRE: round robin unit test covers all 5 sellers and wrap-around
- REQUIRE: Playwright test covers the full lead creation flow end-to-end
- REJECT: mocking the database in integration tests

**Invocation:** After business logic is implemented; before Docker/CI/CD phase.

---

## Breathing — Invocation Table

| Phase | Step | Agents |
|---|---|---|
| **0 — Start** | Read and internalize requirements | `marketplace-requirements-auditor` |
| **1 — Database** | Write schema + migrations | `sql-schema-validator` |
| **2 — Backend core** | Implement round robin + lead creation | `business-logic-enforcer` → `go-api-reviewer` |
| **3 — Backend auth** | Implement login + JWT middleware | `go-api-reviewer` → `container-security-reviewer` |
| **4 — Backend kanban** | Implement kanban move endpoint | `business-logic-enforcer` → `go-api-reviewer` |
| **5 — Mid-check** | ~50% of features done | `marketplace-requirements-auditor` |
| **6 — Tests** | Write go test + Playwright | `integration-test-validator` |
| **7 — Docker** | Write Dockerfiles + compose | `container-security-reviewer` |
| **8 — CI/CD** | Write GitHub Actions workflow | `github-actions-pipeline-reviewer` |
| **9 — Frontend** | Implement all frontend features | `typescript-frontend-reviewer` |
| **10 — Pre-delivery** | Final check before submitting | `marketplace-requirements-auditor` (full checklist) |

**Breathing rules:**
- `marketplace-requirements-auditor` is invoked 3 times (phase 0, 5, 10). Never skip it.
- Frontend may start once API contracts (request/response shapes) are defined — backend does not need to be fully implemented first.
- `container-security-reviewer` runs at phase 3 (JWT) and phase 7 (Docker). Both.
- `go-api-reviewer` runs after every backend feature, not only at the end.
- If time runs short: skip P3/P4 phases before skipping P0/P1.

---

## Architecture Constraints

### Backend — Go
```
internal/
├── handler/
├── service/
├── repository/
├── model/
├── middleware/
└── database/
```
**Target:** minimal code required to satisfy all requirements. Navigable in under 2 minutes.

### Frontend — Next.js
```
src/
├── app/
├── components/
├── services/
├── types/
├── lib/
└── hooks/
```
**Target:** minimal code required to satisfy all requirements. Evaluator finds form, round robin, kanban, auth in under 2 minutes.

### Key quality signals
- No unnecessary interface (single implementation = no interface)
- No empty service layer (proxies only = collapse into handler or repository)
- One `Lead` type — not LeadDTO + LeadResponse + LeadViewModel
- Hooks only when reused across 2+ components
- All SQL queries parameterized
- All validation server-side only
