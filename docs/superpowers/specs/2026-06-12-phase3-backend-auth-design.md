# Phase 3 — Backend Auth Design

## Context

CrateBr fullstack challenge. Backend: Go + PostgreSQL. Phase 3 adds authentication (JWT) and
refactors round robin to read sellers from the database instead of a hardcoded slice.

Phase 4 will add the kanban endpoints (`GET /leads`, `PATCH /leads/:id/status`) protected by
the middleware built here.

---

## Schema Changes

### Migration 003 — `sellers`

```sql
CREATE TABLE IF NOT EXISTS sellers (
    id         SERIAL PRIMARY KEY,
    name       TEXT        NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO sellers (name) VALUES
    ('Marcelo'), ('Rafael'), ('Renato'), ('Pedro'), ('Leonardo')
ON CONFLICT DO NOTHING;
```

`name UNIQUE` — duplicate seller names have no meaning in this domain.

### Migration 004 — `users`

```sql
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         TEXT         NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    seller_id     INTEGER      REFERENCES sellers(id),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed: one user per seller + one admin (seller_id NULL).
-- Passwords are bcrypt hashes — never plaintext in migrations.
-- Admin user has seller_id NULL (can view all leads, not in round robin).
-- Users are seeded through SQL migrations. No runtime user creation exists.
```

`email UNIQUE` creates an implicit index in PostgreSQL — no additional index needed.

`seller_index` (migration 002) is unchanged — it still holds the round robin pointer.

---

## Round Robin — Refactored

The seller fetch, index update, and lead insert all occur within the **same transaction**
so that seller assignment and lead creation are atomic. Business rule lives entirely in
`LeadService` — the repository only executes SQL:

```
LeadService.CreateLead(ctx, req):

  BEGIN tx

    SELECT current_index
    FROM seller_index WHERE id = 1
    FOR UPDATE                          -- row-level lock: blocks concurrent assignments

    SELECT COUNT(*) FROM sellers        -- seller count for modulo

    next = (current + 1) % seller_count

    UPDATE seller_index
    SET current_index = next
    WHERE id = 1

    SELECT id, name
    FROM sellers
    ORDER BY id
    LIMIT 1 OFFSET current              -- fetch only the one seller needed

    INSERT INTO leads (...)

  COMMIT
```

Service methods called in order:
1. `SellerRepository.Count(ctx, tx) int`
2. `SellerRepository.GetByIndex(ctx, tx, index) (*model.Seller, error)`
3. `LeadRepository.Insert(ctx, tx, req, seller) (*model.Lead, error)`

Transaction opened and committed by `LeadService`. Repositories receive `*sql.Tx` and
execute SQL only — no business decisions.

---

## New Files

```
internal/
├── model/
│   └── user.go                  — User, LoginRequest, LoginResponse
├── repository/
│   ├── seller_repository.go     — Count(ctx, tx), GetByIndex(ctx, tx, index)
│   └── user_repository.go       — FindByEmail(ctx, email) (*model.User, error)
├── handler/
│   └── auth_handler.go          — POST /auth/login
└── middleware/
    └── auth.go                  — Bearer JWT validation, injects userID into context
```

Existing files changed:
- `repository/lead_repository.go` — `Insert` now accepts `*sql.Tx` and `*model.Seller`
- `service/lead_service.go` — opens tx, calls `SellerRepository` then `LeadRepository`
- `main.go` — registers `POST /auth/login`; validates `JWT_SECRET` length at startup

All repository methods accept `ctx context.Context` as first argument — modern Go convention.

---

## Models

```go
// model/user.go

type User struct {
    ID           int64     `json:"id"`
    Email        string    `json:"email"`
    PasswordHash string    `json:"-"`
    SellerID     *int64    `json:"seller_id,omitempty"`
    CreatedAt    time.Time `json:"created_at"`
}

type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type LoginResponse struct {
    Token string `json:"token"`
}
```

`LoginResponse` carries only `token` — no `expires_in`, `user`, `roles`, or `permissions`.

---

## JWT Claims

Use an explicit struct instead of `MapClaims` to avoid type-assertion errors at validation:

```go
type Claims struct {
    UserID int64 `json:"sub"`
    jwt.RegisteredClaims
}

// On issue:
claims := Claims{
    UserID: user.ID,
    RegisteredClaims: jwt.RegisteredClaims{
        IssuedAt:  jwt.NewNumericDate(time.Now()),
        ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
    },
}
```

---

## Auth Flow

```
POST /auth/login
  body: { "email": "...", "password": "..." }

  → UserRepository.FindByEmail(ctx, email)
      → 401 if not found (same response as wrong password — no info leakage)
  → bcrypt.CompareHashAndPassword(hash, password)
      → 401 if mismatch
  → jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{...})
  → signed with JWT_SECRET from environment
  → 200 { "token": "..." }
```

---

## JWT Middleware

`middleware/auth.go` wraps any `http.Handler`. Logic:

1. Read `Authorization` header — 401 if absent or not `Bearer <token>`
2. Parse token into `Claims` struct with `JWT_SECRET` — 401 if invalid or expired
3. Inject `userID` into context using a typed key:

```go
type contextKey string
const UserIDKey contextKey = "user_id"

ctx = context.WithValue(r.Context(), UserIDKey, claims.UserID)
```

Typed context key prevents collisions with other packages using plain string keys.

4. Call next handler

Kanban routes (Phase 4) will be wrapped with this middleware. No other routes use it.

---

## Environment Variables

| Variable       | Purpose                      | Required       |
| -------------- | ---------------------------- | -------------- |
| `JWT_SECRET`   | HMAC-SHA256 signing key      | yes            |
| `DATABASE_URL` | PostgreSQL connection string | yes (existing) |

Server refuses to start if `JWT_SECRET` is absent or shorter than 32 characters:

```go
if len(jwtSecret) < 32 {
    log.Fatal("JWT_SECRET must be at least 32 characters")
}
```

---

## Architectural Constraints

```
REQUIRE: handler → service → repository
REJECT:  handler → repository  (skips service layer)
REJECT:  handler → database    (skips both)
REJECT:  service → HTTP concerns (status codes, headers)
REJECT:  repository → business rules (validation, round robin logic)
```

Auth logic (bcrypt, JWT signing) lives in `service/auth_service.go`.
Round robin logic lives in `service/lead_service.go`.
SQL lives in repositories. HTTP concerns live in handlers.

---

## Required Tests

**Round robin sequence:**
- ✓ 1st lead → Marcelo
- ✓ 2nd lead → Rafael
- ✓ 3rd lead → Renato
- ✓ 4th lead → Pedro
- ✓ 5th lead → Leonardo
- ✓ 6th lead → Marcelo (wrap-around)

**Concurrency:**
- ✓ Two simultaneous lead creations never receive the same seller

---

## Dependencies Added

| Package                              | Purpose                                    |
| ------------------------------------ | ------------------------------------------ |
| `github.com/golang-jwt/jwt/v5`       | JWT sign/verify                            |
| `golang.org/x/crypto/bcrypt`         | Password hashing (external Go module)      |

---

## Out of Scope (Phase 4)

- `GET /leads` — list all leads for kanban
- `PATCH /leads/:id/status` — move card between columns
- Any frontend work
- Playwright / Go unit tests
