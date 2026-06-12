# Dívidas Técnicas e Melhorias Futuras

O projeto cobre todos os requisitos do desafio. Esta seção documenta o que ficou de fora por restrição de tempo e o que faria sentido evoluir num contexto de produto real.

---

## Deploy em produção — não realizado por falta de tempo

O deploy seria feito em duas plataformas complementares:

**Frontend → Vercel**
- Next.js com standalone output está pronto para Vercel
- Configuração seria `vercel.json` com rewrite para a API + variável `NEXT_PUBLIC_API_URL` apontando para o backend no Railway
- Preview automático a cada PR via GitHub integration

**Backend + Banco → Railway**
- Um serviço Go buildado a partir do `Dockerfile` existente
- Um serviço PostgreSQL gerenciado pelo Railway (ou Neon como alternativa serverless)
- Variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`) configuradas no painel do Railway
- Migrations aplicadas no deploy via comando de release: `migrate -path /migrations up`

Com essa configuração, o fluxo de deploy seria: push no `main` → GitHub Actions faz lint/test → Railway e Vercel fazem deploy automático em paralelo.

---

## Dívidas Técnicas

### Autenticação

- Tokens JWT não têm revogação. Se um token vazar, fica válido por 1 hora. Em produção: usar refresh tokens com blacklist no Redis ou rotação curta.
- Não há rate limiting no `POST /auth/login` — susceptível a brute force. Adicionar limitação por IP (ex.: `golang.org/x/time/rate`) ou usar Cloudflare em frente.
- Usuários são criados por migration/seed. Um CRUD de usuários seria necessário para onboarding de novos vendedores.

### Round Robin

- A lista de vendedores é fixa (5 nomes seedados). Adicionar ou remover vendedores hoje exige escrever uma migration manual. Um endpoint de gestão de vendedores resolveria isso.
- Não há noção de vendedor "ativo/inativo". Se um vendedor sair da empresa, o round robin continua atribuindo leads a ele até que a seed seja modificada.

### Kanban / Leads

- `GET /leads` retorna todos os leads sem paginação. Com volume alto, isso se torna um problema. Adicionar `?page=` e `?limit=` ou cursor-based pagination.
- Não há filtro por vendedor na API — um vendedor vê os leads de todos os outros. Em produto real, o JWT deveria carregar o ID do vendedor e filtrar automaticamente.
- Não há campo de `notes` no card. Em uso real, o vendedor precisaria registrar o que foi conversado.
- Sem histórico de transições de status (audit log). Seria útil saber quando um lead foi movido e por quem.

### Frontend

- O token JWT é guardado em `localStorage` — vulnerável a XSS. A alternativa mais segura é `httpOnly cookie` gerenciado pelo backend.
- Sem tratamento de token expirado em background: se o usuário ficar na página por mais de 1 hora, a próxima ação vai falhar com 401 sem aviso. Adicionar interceptor no `apiFetch` para redirecionar ao login.
- O formulário da landing page não tem proteção anti-spam (CAPTCHA, honeypot). Em produção seria necessário para evitar leads falsos.

### Infraestrutura

- O `docker-compose.yml` não tem limites de CPU/memória nos serviços. Em produção, definir `deploy.resources.limits` evita que um serviço derrube os outros.
- Não há observabilidade: sem métricas (Prometheus), sem tracing (OpenTelemetry), sem alertas. Para produção: instrumentar ao menos as rotas críticas e o round robin.
- O `JWT_SECRET` está hardcoded no `docker-compose.yml` para CI. Em produção usar secrets gerenciados (Railway Secrets, GitHub Environments com proteção).

### Testes

- Os testes unitários cobrem bem o round robin e o kanban, mas não há testes de integração contra banco real (apenas mocks). Adicionar testes com `testcontainers-go` para validar as queries SQL de verdade.
- O teste E2E do Playwright cobre o happy path. Faltam: formulário com campos inválidos, login com credenciais erradas, comportamento com token expirado.

---

## Funcionalidades que agregariam valor ao produto

- **Notificação WhatsApp real**: integração com a API oficial do WhatsApp Business (Meta) ou Twilio para enviar mensagem automática ao lead após o formulário.
- **Dashboard analytics**: cards de métricas (leads por semana, taxa de conversão por vendedor, tempo médio em cada coluna).
- **Busca e filtros no kanban**: filtrar por vendedor, data, status, ou nome do lead.
- **Drag and drop com ordenação manual**: além de mover entre colunas, reordenar dentro da coluna por prioridade.
