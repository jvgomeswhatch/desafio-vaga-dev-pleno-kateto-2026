# Arquitetura do Backend — Go

## Visão Geral

O backend é uma API REST escrita em Go puro (`net/http`), sem frameworks. Ele é responsável por três coisas: receber leads do formulário público, aplicar o round robin de vendedores e servir o kanban para a área autenticada.

---

## Estrutura de Camadas

```
handler/   → Entrada HTTP: decodifica JSON, valida content-type, chama service, serializa response
service/   → Regras de negócio: round robin, validações, lógica de status
repository/ → SQL puro: queries parametrizadas, sem ORM
model/     → Structs compartilhadas entre as camadas
migrations/ → SQL versionado aplicado pelo migrate antes do backend subir
```

Cada camada só conhece a camada imediatamente abaixo — via interface, não via tipo concreto. Isso permite testar o `LeadService` com repositórios mockados sem tocar o banco.

---

## Rotas

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/leads` | Não | Cria lead + atribui vendedor via round robin |
| `POST` | `/auth/login` | Não | Retorna JWT HS256 |
| `GET` | `/leads` | JWT | Lista todos os leads |
| `PATCH` | `/leads/{id}/status` | JWT | Move card entre colunas |
| `GET` | `/health` | Não | Health check para Docker |

---

## Round Robin — Como Funciona de Verdade

### O Problema

Precisamos distribuir leads entre 5 vendedores na ordem `Marcelo → Rafael → Renato → Pedro → Leonardo → Marcelo → ...` de forma que:

1. O índice persista entre reinícios do servidor
2. Dois requests simultâneos nunca recebam o mesmo vendedor

### Solução: Tabela `seller_index` com `FOR UPDATE`

A migration cria uma tabela com **exatamente uma linha**:

```sql
CREATE TABLE seller_index (
    id            INTEGER PRIMARY KEY DEFAULT 1,
    current_index INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT single_row CHECK (id = 1)  -- garante que nunca haverá mais de 1 linha
);
INSERT INTO seller_index (id, current_index) VALUES (1, 0);
```

O `CONSTRAINT single_row CHECK (id = 1)` impede fisicamente que alguém insira uma segunda linha.

### O Fluxo em `CreateLead`

Toda criação de lead acontece dentro de uma única transação:

```
BeginTx()
  │
  ├─ Count(sellers)           → quantos vendedores existem (5)
  │
  ├─ GetAndIncrement(total=5) → lê current_index, incrementa, retorna índice atual
  │    └─ SELECT current_index FROM seller_index WHERE id = 1 FOR UPDATE
  │       UPDATE seller_index SET current_index = (current + 1) % 5
  │
  ├─ GetByIndex(index)        → busca o vendedor pela posição na tabela sellers
  │
  ├─ Insert(lead, seller)     → persiste o lead com seller_name
  │
Commit()
```

O `FOR UPDATE` trava a linha `seller_index` até o Commit. Se dois requests chegam ao mesmo tempo, o segundo espera o primeiro terminar — nunca há duplicação de índice.

### Por que não usar Redis ou uma coluna de sequência?

- **Redis**: dependência extra sem ganho real para o volume esperado
- **Sequência do PostgreSQL**: não permite wrap-around configurável
- **`FOR UPDATE` em tabela dedicada**: uma linha, uma trava, zero dependências externas, testável com mocks

### Código do `GetAndIncrement`

```go
func (r *SellerIndexRepository) GetAndIncrement(ctx context.Context, tx Tx, total int) (int, error) {
    var current int
    tx.QueryRowContext(ctx,
        `SELECT current_index FROM seller_index WHERE id = 1 FOR UPDATE`,
    ).Scan(&current)

    next := (current + 1) % total
    tx.ExecContext(ctx,
        `UPDATE seller_index SET current_index = $1 WHERE id = 1`, next,
    )
    return current, nil  // retorna o índice ANTES do incremento
}
```

`current` é o índice usado para buscar o vendedor. `next` é o que fica salvo para o próximo request.

---

## Autenticação JWT

- Login via `POST /auth/login` com e-mail e senha
- Senhas hasheadas com `bcrypt` no banco
- Token JWT HS256, expiração de 1 hora
- Middleware aplica `jwt.ParseWithClaims` usando uma struct `Claims` tipada (não `MapClaims`) — sem type-assertion nos handlers

```go
type Claims struct {
    UserID int    `json:"user_id"`
    Email  string `json:"email"`
    jwt.RegisteredClaims
}
```

---

## Validação de Inputs

Feita no `LeadService` antes de qualquer query:

```go
var phoneRegex = regexp.MustCompile(`^\d{10,11}$`)

// name: required
// desired_skin: required
// phone: 10 ou 11 dígitos numéricos (DDD + número)
```

O tipo `ValidationError string` permite que o handler distinga erros de negócio (422) de erros inesperados (500) sem nenhuma importação cruzada.

---

## Schema do Banco

```sql
-- leads: onde vivem os cards do kanban
CREATE TABLE leads (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    phone        TEXT NOT NULL,
    desired_skin TEXT NOT NULL,
    seller_name  TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'sem_contato'
                 CHECK (status IN ('sem_contato','em_contato','perdido','finalizado')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- seller_index: uma linha, guarda o estado do round robin
CREATE TABLE seller_index (
    id            INTEGER PRIMARY KEY DEFAULT 1,
    current_index INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT single_row CHECK (id = 1)
);

-- sellers: os 5 vendedores, em ordem de inserção
-- Marcelo(id=1), Rafael(id=2), Renato(id=3), Pedro(id=4), Leonardo(id=5)
CREATE TABLE sellers (
    id   SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- users: tabela de acesso à área logada
CREATE TABLE users (
    id             SERIAL PRIMARY KEY,
    email          TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL
);
```

O CHECK constraint em `status` impede na camada do banco qualquer valor fora dos 4 permitidos — mesmo que o código Go mande algo errado.

---

## Migrations

Gerenciadas pelo `migrate/migrate` (container separado no Compose). São 4 arquivos numerados aplicados em ordem:

```
000001_create_leads.up.sql
000002_create_seller_index.up.sql
000003_create_sellers.up.sql    ← seed dos 5 vendedores
000004_create_users.up.sql      ← seed do admin e marcelo@cratebr.com
```

O container `migrate` roda com `depends_on: postgres (healthy)` e `restart: on-failure`. O backend só sobe depois que o `migrate` termina com `condition: service_completed_successfully`.
