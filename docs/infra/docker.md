# Docker — Decisões e Estrutura

## O que sobe com `docker compose up --build`

São 4 serviços em ordem de dependência:

```
postgres → migrate → backend → frontend
```

Cada serviço só sobe quando o anterior está pronto. Não é só "ordem de start" — são condições de saúde reais.

---

## Os 4 Serviços

### 1. `postgres`

Imagem `postgres:16-alpine`. O `-alpine` reduz o tamanho e a superfície de ataque.

Tem um `healthcheck` com `pg_isready` — o Compose só considera o serviço "healthy" quando o PostgreSQL aceita conexões de verdade, não apenas quando o container está rodando.

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-cratebr}"]
  interval: 5s
  retries: 5
```

Dados persistidos num volume nomeado (`postgres_data`). Parar e reiniciar os containers não apaga o banco.

---

### 2. `migrate`

Usa a imagem oficial `migrate/migrate:v4.18.1`. Não tem código Go — só executa os arquivos `.sql` do diretório `backend/migrations/`.

```yaml
depends_on:
  postgres:
    condition: service_healthy
restart: on-failure
```

`restart: on-failure` porque na primeira vez o PostgreSQL pode demorar alguns segundos além do healthcheck. Se o migrate falhar por timing, o Docker tenta de novo automaticamente.

O backend usa `condition: service_completed_successfully` — só sobe se o migrate terminou com exit code 0. Se a migration falhar, o backend não sobe e o erro fica visível nos logs.

---

### 3. `backend` (Go)

Multi-stage build com imagem final **distroless** (`gcr.io/distroless/static-debian12`):

```dockerfile
# Stage 1: compilar
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download          # cache de dependências separado do código
COPY . .
RUN CGO_ENABLED=0 go build -o backend ./cmd/api

# Stage 2: imagem final
FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/backend /backend
USER nonroot:nonroot
ENTRYPOINT ["/backend"]
```

**Por que distroless?**
- Imagem final: ~15MB
- Sem shell (`sh`, `bash`) — impossível fazer exec no container em produção
- Sem package manager — sem superfície de ataque para escalada de privilégio
- `USER nonroot:nonroot` — processo não roda como root

---

### 4. `frontend` (Next.js)

Multi-stage com **standalone output** do Next.js:

```dockerfile
# Stage 1: instalar dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 2: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 3: imagem final
FROM node:20-alpine AS runner
RUN addgroup -S nodejs && adduser -S -G nodejs nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

**Por que standalone output?**
- `output: 'standalone'` no `next.config.ts` instrui o Next.js a incluir apenas os arquivos necessários para rodar o servidor
- Resultado: imagem de ~270MB em vez de ~1GB com `node_modules` completo
- O `server.js` gerado é um servidor Node mínimo — sem o overhead do Next.js CLI

**A variável `NEXT_PUBLIC_API_URL` como `ARG`**
Variáveis `NEXT_PUBLIC_*` são injetadas em tempo de build (não de runtime) porque o Next.js as embute no bundle do cliente. Por isso ela precisa ser passada como `ARG` no Dockerfile e como `args:` no Compose — não como `environment:`.

---

## Ordem de Boot Garantida

```
postgres healthy?
    └─ migrate completed_successfully?
           └─ backend started?
                  └─ frontend started
```

Não há `sleep` nem scripts de espera. O Compose gerencia isso via `depends_on` com condições.

---

## Variáveis de Ambiente

| Variável | Onde é usada | Observação |
|---|---|---|
| `POSTGRES_USER/PASSWORD/DB` | postgres + migrate | Defaults no compose caso `.env` não exista |
| `DATABASE_URL` | backend | URL completa de conexão |
| `JWT_SECRET` | backend | Mínimo 32 chars — nunca commitar o valor real |
| `NEXT_PUBLIC_API_URL` | frontend (build) | URL que o **browser** usa para chamar a API |
| `API_URL` | frontend (runtime) | URL interna Docker para SSR (`http://backend:8080`) |

`NEXT_PUBLIC_API_URL` e `API_URL` coexistem porque requisições do browser não podem usar `http://backend:8080` (nome interno do Docker) — precisam da URL acessível externamente.

---

## CI/CD

O GitHub Actions (`.github/workflows/ci.yml`) faz:

```
lint (golangci-lint) → go test → npm run build → docker build (backend + frontend) → push ghcr.io
```

Apenas `GITHUB_TOKEN` é necessário — automático no Actions. As imagens são publicadas em `ghcr.io/jvgomeswhatch/cratebr-*` com tags `latest` e o SHA do commit.
