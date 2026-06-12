# Phase 3 — Backend Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JWT authentication (`POST /auth/login`) and refactor round robin to read sellers from the database instead of a hardcoded slice, with all seller assignment and lead creation atomic inside a single transaction.

**Architecture:** `LeadService` opens a transaction, calls `SellerRepository` to count sellers and fetch the assigned one by index, then calls `LeadRepository.Insert` — all within the same `*sql.Tx`. `AuthService` handles bcrypt comparison and JWT signing. A new `middleware/auth.go` validates Bearer tokens for future kanban routes.

**Tech Stack:** Go 1.23, `database/sql` + `lib/pq`, `golang-jwt/jwt/v5`, `golang.org/x/crypto/bcrypt`, `go test`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `backend/migrations/000003_create_sellers.up.sql` | `sellers` table + seed |
| Create | `backend/migrations/000004_create_users.up.sql` | `users` table + seed |
| Create | `backend/internal/model/user.go` | `User`, `LoginRequest`, `LoginResponse`, `Claims` |
| Create | `backend/internal/model/seller.go` | `Seller` struct |
| Create | `backend/internal/repository/seller_repository.go` | `Count(ctx, tx)`, `GetByIndex(ctx, tx, i)` |
| Modify | `backend/internal/repository/lead_repository.go` | Replace `GetNextSeller` + old `Insert` with `Insert(ctx, tx, req, seller)` |
| Create | `backend/internal/repository/user_repository.go` | `FindByEmail(ctx, email)` |
| Create | `backend/internal/service/auth_service.go` | `Login(ctx, req)` — bcrypt + JWT |
| Modify | `backend/internal/service/lead_service.go` | Open tx, call `SellerRepository`, call `LeadRepository.Insert` |
| Create | `backend/internal/middleware/auth.go` | `RequireAuth` — parse Bearer JWT, inject userID into context |
| Modify | `backend/main.go` | Validate `JWT_SECRET`, wire new repos/services, register `/auth/login` |
| Create | `backend/internal/service/lead_service_test.go` | Round robin sequence + wrap-around tests |
| Create | `backend/internal/service/auth_service_test.go` | Login success + wrong password + user not found |

---

## Task 1: Migrations — `sellers` and `users`

**Files:**
- Create: `backend/migrations/000003_create_sellers.up.sql`
- Create: `backend/migrations/000004_create_users.up.sql`

- [ ] **Step 1: Create migration 003 — sellers table**

`backend/migrations/000003_create_sellers.up.sql`:
```sql
CREATE TABLE IF NOT EXISTS sellers (
    id         SERIAL      PRIMARY KEY,
    name       TEXT        NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO sellers (name) VALUES
    ('Marcelo'), ('Rafael'), ('Renato'), ('Pedro'), ('Leonardo')
ON CONFLICT DO NOTHING;
```

- [ ] **Step 2: Create migration 004 — users table with seed**

`backend/migrations/000004_create_users.up.sql`:
```sql
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL       PRIMARY KEY,
    email         TEXT         NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    seller_id     INTEGER      REFERENCES sellers(id),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed: 5 sellers as users + 1 admin (seller_id NULL).
-- Passwords below are bcrypt hashes of 'senha123' (cost 10).
INSERT INTO users (email, password_hash, seller_id) VALUES
    ('marcelo@cratebr.com',  '$2a$10$rOzWqL1K8Y9N2P3Q4R5S6uVwXyZaBcDeFgHiJkLmNoPqRsTuVwXy', 1),
    ('rafael@cratebr.com',   '$2a$10$rOzWqL1K8Y9N2P3Q4R5S6uVwXyZaBcDeFgHiJkLmNoPqRsTuVwXy', 2),
    ('renato@cratebr.com',   '$2a$10$rOzWqL1K8Y9N2P3Q4R5S6uVwXyZaBcDeFgHiJkLmNoPqRsTuVwXy', 3),
    ('pedro@cratebr.com',    '$2a$10$rOzWqL1K8Y9N2P3Q4R5S6uVwXyZaBcDeFgHiJkLmNoPqRsTuVwXy', 4),
    ('leonardo@cratebr.com', '$2a$10$rOzWqL1K8Y9N2P3Q4R5S6uVwXyZaBcDeFgHiJkLmNoPqRsTuVwXy', 5),
    ('admin@cratebr.com',    '$2a$10$rOzWqL1K8Y9N2P3Q4R5S6uVwXyZaBcDeFgHiJkLmNoPqRsTuVwXy', NULL)
ON CONFLICT DO NOTHING;
```

> **IMPORTANT:** The hash above is a placeholder. Before running migrations, generate a real bcrypt hash and replace it:
> ```bash
> cd backend && go run ./cmd/genhash/main.go senha123
> ```
> Create `backend/cmd/genhash/main.go`:
> ```go
> package main
>
> import (
>     "fmt"
>     "os"
>     "golang.org/x/crypto/bcrypt"
> )
>
> func main() {
>     hash, err := bcrypt.GenerateFromPassword([]byte(os.Args[1]), 10)
>     if err != nil { panic(err) }
>     fmt.Println(string(hash))
> }
> ```
> Run once, copy the output, replace the placeholder hash in the migration, then delete `cmd/genhash/`.

- [ ] **Step 3: Commit migrations**

```bash
git add backend/migrations/
git commit -m "feat(db): add sellers and users tables with seed (migrations 003, 004)"
```

---

## Task 2: Models — `Seller`, `User`, `Claims`

**Files:**
- Create: `backend/internal/model/seller.go`
- Create: `backend/internal/model/user.go`

- [ ] **Step 1: Create seller model**

`backend/internal/model/seller.go`:
```go
package model

import "time"

type Seller struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}
```

- [ ] **Step 2: Create user model**

`backend/internal/model/user.go`:
```go
package model

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

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

type Claims struct {
	UserID int64 `json:"sub"`
	jwt.RegisteredClaims
}
```

- [ ] **Step 3: Commit models**

```bash
git add backend/internal/model/
git commit -m "feat(model): add Seller, User, LoginRequest, LoginResponse, Claims"
```

---

## Task 3: `SellerRepository`

**Files:**
- Create: `backend/internal/repository/seller_repository.go`

- [ ] **Step 1: Create seller repository**

`backend/internal/repository/seller_repository.go`:
```go
package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/jvgomeswhatch/cratebr/internal/model"
)

type SellerRepository struct {
	db *sql.DB
}

func NewSellerRepository(db *sql.DB) *SellerRepository {
	return &SellerRepository{db: db}
}

func (r *SellerRepository) Count(ctx context.Context, tx *sql.Tx) (int, error) {
	var count int
	err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM sellers`).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("count sellers: %w", err)
	}
	return count, nil
}

func (r *SellerRepository) GetByIndex(ctx context.Context, tx *sql.Tx, index int) (*model.Seller, error) {
	seller := &model.Seller{}
	err := tx.QueryRowContext(ctx,
		`SELECT id, name, created_at FROM sellers ORDER BY id LIMIT 1 OFFSET $1`,
		index,
	).Scan(&seller.ID, &seller.Name, &seller.CreatedAt)
	if err != nil {
		return nil, fmt.Errorf("get seller by index: %w", err)
	}
	return seller, nil
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/internal/repository/seller_repository.go
git commit -m "feat(repository): add SellerRepository — Count and GetByIndex"
```

---

## Task 4: Refactor `LeadRepository`

**Files:**
- Modify: `backend/internal/repository/lead_repository.go`

Remove `GetNextSeller` and the hardcoded `sellers` slice. `Insert` now accepts `*sql.Tx` and `*model.Seller`.

- [ ] **Step 1: Replace lead_repository.go**

`backend/internal/repository/lead_repository.go`:
```go
package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/jvgomeswhatch/cratebr/internal/model"
)

type LeadRepository struct {
	db *sql.DB
}

func NewLeadRepository(db *sql.DB) *LeadRepository {
	return &LeadRepository{db: db}
}

func (r *LeadRepository) Insert(ctx context.Context, tx *sql.Tx, req model.CreateLeadRequest, seller *model.Seller) (*model.Lead, error) {
	lead := &model.Lead{}
	err := tx.QueryRowContext(ctx, `
		INSERT INTO leads (name, phone, desired_skin, seller_name, status)
		VALUES ($1, $2, $3, $4, 'sem_contato')
		RETURNING id, name, phone, desired_skin, seller_name, status, created_at
	`, req.Name, req.Phone, req.DesiredSkin, seller.Name).
		Scan(&lead.ID, &lead.Name, &lead.Phone, &lead.DesiredSkin, &lead.SellerName, &lead.Status, &lead.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("insert lead: %w", err)
	}
	return lead, nil
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/internal/repository/lead_repository.go
git commit -m "refactor(repository): LeadRepository.Insert accepts tx and seller — remove hardcoded round robin"
```

---

## Task 5: `UserRepository`

**Files:**
- Create: `backend/internal/repository/user_repository.go`

- [ ] **Step 1: Create user repository**

`backend/internal/repository/user_repository.go`:
```go
package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jvgomeswhatch/cratebr/internal/model"
)

var ErrNotFound = errors.New("not found")

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*model.User, error) {
	user := &model.User{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, email, password_hash, seller_id, created_at FROM users WHERE email = $1`,
		email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.SellerID, &user.CreatedAt)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("find user by email: %w", err)
	}
	return user, nil
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/internal/repository/user_repository.go
git commit -m "feat(repository): add UserRepository.FindByEmail"
```

---

## Task 6: Refactor `LeadService` — transactional round robin

**Files:**
- Modify: `backend/internal/service/lead_service.go`

The service now opens a transaction, locks `seller_index`, resolves the seller, updates the index, and inserts the lead — all atomically.

- [ ] **Step 1: Write failing test first**

Create `backend/internal/service/lead_service_test.go`:
```go
package service_test

import (
	"context"
	"database/sql"
	"fmt"
	"testing"

	"github.com/jvgomeswhatch/cratebr/internal/model"
	"github.com/jvgomeswhatch/cratebr/internal/service"
)

// fakeSellerRepo simulates the seller table (5 sellers, stable order).
type fakeSellerRepo struct {
	sellers []model.Seller
}

func (f *fakeSellerRepo) Count(_ context.Context, _ *sql.Tx) (int, error) {
	return len(f.sellers), nil
}

func (f *fakeSellerRepo) GetByIndex(_ context.Context, _ *sql.Tx, i int) (*model.Seller, error) {
	if i < 0 || i >= len(f.sellers) {
		return nil, fmt.Errorf("index out of range")
	}
	s := f.sellers[i]
	return &s, nil
}

// fakeLeadRepo captures which seller was assigned.
type fakeLeadRepo struct {
	inserted []string // seller names in insertion order
}

func (f *fakeLeadRepo) Insert(_ context.Context, _ *sql.Tx, _ model.CreateLeadRequest, seller *model.Seller) (*model.Lead, error) {
	f.inserted = append(f.inserted, seller.Name)
	return &model.Lead{SellerName: seller.Name}, nil
}

// fakeIndexRepo simulates seller_index with FOR UPDATE semantics (single-threaded here).
type fakeIndexRepo struct {
	current int
}

func (f *fakeIndexRepo) GetAndIncrement(_ context.Context, _ *sql.Tx, total int) (int, error) {
	current := f.current
	f.current = (f.current + 1) % total
	return current, nil
}

func newFakeLeadService() (*service.LeadService, *fakeLeadRepo) {
	sellers := []model.Seller{
		{ID: 1, Name: "Marcelo"},
		{ID: 2, Name: "Rafael"},
		{ID: 3, Name: "Renato"},
		{ID: 4, Name: "Pedro"},
		{ID: 5, Name: "Leonardo"},
	}
	sellerRepo := &fakeSellerRepo{sellers: sellers}
	leadRepo := &fakeLeadRepo{}
	indexRepo := &fakeIndexRepo{}
	svc := service.NewLeadService(nil, sellerRepo, leadRepo, indexRepo)
	return svc, leadRepo
}

func TestRoundRobinSequence(t *testing.T) {
	svc, leadRepo := newFakeLeadService()
	req := model.CreateLeadRequest{Name: "Test", Phone: "11999999999", DesiredSkin: "AK-47"}

	expected := []string{"Marcelo", "Rafael", "Renato", "Pedro", "Leonardo", "Marcelo"}
	for i, want := range expected {
		_, err := svc.CreateLead(context.Background(), req)
		if err != nil {
			t.Fatalf("lead %d: unexpected error: %v", i+1, err)
		}
		if got := leadRepo.inserted[i]; got != want {
			t.Errorf("lead %d: got seller %q, want %q", i+1, got, want)
		}
	}
}
```

- [ ] **Step 2: Run test — expect compile failure (service doesn't match yet)**

```bash
cd backend && go test ./internal/service/... -v -run TestRoundRobinSequence
```

Expected: compile error — `NewLeadService` signature mismatch.

- [ ] **Step 3: Rewrite lead_service.go**

`backend/internal/service/lead_service.go`:
```go
package service

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"

	"github.com/jvgomeswhatch/cratebr/internal/model"
)

var phoneRegex = regexp.MustCompile(`^\d{10,11}$`)

type sellerCounter interface {
	Count(ctx context.Context, tx *sql.Tx) (int, error)
}

type sellerGetter interface {
	GetByIndex(ctx context.Context, tx *sql.Tx, index int) (*model.Seller, error)
}

type sellerIndexer interface {
	GetAndIncrement(ctx context.Context, tx *sql.Tx, total int) (int, error)
}

type leadInserter interface {
	Insert(ctx context.Context, tx *sql.Tx, req model.CreateLeadRequest, seller *model.Seller) (*model.Lead, error)
}

type LeadService struct {
	db          *sql.DB
	sellerCount sellerCounter
	sellerGet   sellerGetter
	indexRepo   sellerIndexer
	leadRepo    leadInserter
}

func NewLeadService(db *sql.DB, sellerCount sellerCounter, sellerGet sellerGetter, indexRepo sellerIndexer, leadInserter leadInserter) *LeadService {
	return &LeadService{
		db:          db,
		sellerCount: sellerCount,
		sellerGet:   sellerGet,
		indexRepo:   indexRepo,
		leadRepo:    leadInserter,
	}
}

func (s *LeadService) CreateLead(ctx context.Context, req model.CreateLeadRequest) (*model.Lead, error) {
	if err := validateCreateLeadRequest(req); err != nil {
		return nil, err
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback()

	total, err := s.sellerCount.Count(ctx, tx)
	if err != nil {
		return nil, err
	}

	index, err := s.indexRepo.GetAndIncrement(ctx, tx, total)
	if err != nil {
		return nil, err
	}

	seller, err := s.sellerGet.GetByIndex(ctx, tx, index)
	if err != nil {
		return nil, err
	}

	lead, err := s.leadRepo.Insert(ctx, tx, req, seller)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("commit tx: %w", err)
	}

	return lead, nil
}

func validateCreateLeadRequest(req model.CreateLeadRequest) error {
	if req.Name == "" {
		return ValidationError("name is required")
	}
	if req.DesiredSkin == "" {
		return ValidationError("desired_skin is required")
	}
	if !phoneRegex.MatchString(req.Phone) {
		return ValidationError("phone must be 10 or 11 digits")
	}
	return nil
}

type ValidationError string

func (e ValidationError) Error() string { return string(e) }
```

- [ ] **Step 4: Add `SellerIndexRepository` — the `seller_index` table operations**

Create `backend/internal/repository/seller_index_repository.go`:
```go
package repository

import (
	"context"
	"database/sql"
	"fmt"
)

type SellerIndexRepository struct {
	db *sql.DB
}

func NewSellerIndexRepository(db *sql.DB) *SellerIndexRepository {
	return &SellerIndexRepository{db: db}
}

// GetAndIncrement reads current_index with FOR UPDATE, increments it, and returns the old value.
// Must be called inside an existing transaction.
func (r *SellerIndexRepository) GetAndIncrement(ctx context.Context, tx *sql.Tx, total int) (int, error) {
	var current int
	err := tx.QueryRowContext(ctx,
		`SELECT current_index FROM seller_index WHERE id = 1 FOR UPDATE`,
	).Scan(&current)
	if err != nil {
		return 0, fmt.Errorf("select seller index: %w", err)
	}

	next := (current + 1) % total
	_, err = tx.ExecContext(ctx,
		`UPDATE seller_index SET current_index = $1 WHERE id = 1`,
		next,
	)
	if err != nil {
		return 0, fmt.Errorf("update seller index: %w", err)
	}

	return current, nil
}
```

- [ ] **Step 5: Update test fake to match interface**

The `fakeIndexRepo` in the test already has the right signature. Update `newFakeLeadService` to pass four arguments (sellerRepo acts as both counter and getter, indexRepo is separate):

```go
func newFakeLeadService() (*service.LeadService, *fakeLeadRepo) {
	sellers := []model.Seller{
		{ID: 1, Name: "Marcelo"},
		{ID: 2, Name: "Rafael"},
		{ID: 3, Name: "Renato"},
		{ID: 4, Name: "Pedro"},
		{ID: 5, Name: "Leonardo"},
	}
	sellerRepo := &fakeSellerRepo{sellers: sellers}
	leadRepo := &fakeLeadRepo{}
	indexRepo := &fakeIndexRepo{}
	// db is nil — fake repos don't use it
	svc := service.NewLeadService(nil, sellerRepo, sellerRepo, indexRepo, leadRepo)
	return svc, leadRepo
}
```

- [ ] **Step 6: Run test — expect PASS**

```bash
cd backend && go test ./internal/service/... -v -run TestRoundRobinSequence
```

Expected:
```
--- PASS: TestRoundRobinSequence (0.00s)
PASS
```

- [ ] **Step 7: Commit**

```bash
git add backend/internal/service/ backend/internal/repository/seller_index_repository.go
git commit -m "feat(service): transactional round robin — seller assignment and lead insert in same tx"
```

---

## Task 7: `AuthService`

**Files:**
- Create: `backend/internal/service/auth_service.go`
- Create: `backend/internal/service/auth_service_test.go`

- [ ] **Step 1: Write failing tests**

`backend/internal/service/auth_service_test.go`:
```go
package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jvgomeswhatch/cratebr/internal/model"
	"github.com/jvgomeswhatch/cratebr/internal/repository"
	"github.com/jvgomeswhatch/cratebr/internal/service"
	"golang.org/x/crypto/bcrypt"
)

type fakeUserRepo struct {
	user *model.User
	err  error
}

func (f *fakeUserRepo) FindByEmail(_ context.Context, _ string) (*model.User, error) {
	return f.user, f.err
}

func validHash(password string) string {
	h, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	return string(h)
}

func TestLogin_Success(t *testing.T) {
	secret := "supersecretkey_atleast32chars_xx"
	repo := &fakeUserRepo{user: &model.User{
		ID:           1,
		Email:        "marcelo@cratebr.com",
		PasswordHash: validHash("senha123"),
	}}
	svc := service.NewAuthService(repo, secret)

	resp, err := svc.Login(context.Background(), model.LoginRequest{
		Email:    "marcelo@cratebr.com",
		Password: "senha123",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resp.Token == "" {
		t.Fatal("expected non-empty token")
	}

	// Validate the token contains correct claims
	claims := &model.Claims{}
	_, err = jwt.ParseWithClaims(resp.Token, claims, func(t *jwt.Token) (any, error) {
		return []byte(secret), nil
	})
	if err != nil {
		t.Fatalf("token parse failed: %v", err)
	}
	if claims.UserID != 1 {
		t.Errorf("got UserID %d, want 1", claims.UserID)
	}
	if time.Until(claims.ExpiresAt.Time) > time.Hour+time.Second {
		t.Error("expiry too far in the future")
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	repo := &fakeUserRepo{user: &model.User{
		ID:           1,
		Email:        "marcelo@cratebr.com",
		PasswordHash: validHash("senha123"),
	}}
	svc := service.NewAuthService(repo, "supersecretkey_atleast32chars_xx")

	_, err := svc.Login(context.Background(), model.LoginRequest{
		Email:    "marcelo@cratebr.com",
		Password: "wrong",
	})
	if !errors.Is(err, service.ErrInvalidCredentials) {
		t.Errorf("expected ErrInvalidCredentials, got %v", err)
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	repo := &fakeUserRepo{err: repository.ErrNotFound}
	svc := service.NewAuthService(repo, "supersecretkey_atleast32chars_xx")

	_, err := svc.Login(context.Background(), model.LoginRequest{
		Email:    "nobody@cratebr.com",
		Password: "senha123",
	})
	if !errors.Is(err, service.ErrInvalidCredentials) {
		t.Errorf("expected ErrInvalidCredentials, got %v", err)
	}
}
```

- [ ] **Step 2: Run tests — expect compile failure**

```bash
cd backend && go test ./internal/service/... -v -run TestLogin
```

Expected: compile error — `AuthService` not defined.

- [ ] **Step 3: Implement AuthService**

`backend/internal/service/auth_service.go`:
```go
package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jvgomeswhatch/cratebr/internal/model"
	"github.com/jvgomeswhatch/cratebr/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidCredentials = errors.New("invalid credentials")

type userFinder interface {
	FindByEmail(ctx context.Context, email string) (*model.User, error)
}

type AuthService struct {
	userRepo  userFinder
	jwtSecret []byte
}

func NewAuthService(userRepo userFinder, jwtSecret string) *AuthService {
	return &AuthService{userRepo: userRepo, jwtSecret: []byte(jwtSecret)}
}

func (s *AuthService) Login(ctx context.Context, req model.LoginRequest) (*model.LoginResponse, error) {
	user, err := s.userRepo.FindByEmail(ctx, req.Email)
	if errors.Is(err, repository.ErrNotFound) {
		return nil, ErrInvalidCredentials
	}
	if err != nil {
		return nil, fmt.Errorf("find user: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	now := time.Now()
	claims := model.Claims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(time.Hour)),
		},
	}

	token, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("sign token: %w", err)
	}

	return &model.LoginResponse{Token: token}, nil
}
```

- [ ] **Step 4: Add bcrypt dependency**

```bash
cd backend && go get golang.org/x/crypto/bcrypt && go mod tidy
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd backend && go test ./internal/service/... -v -run TestLogin
```

Expected:
```
--- PASS: TestLogin_Success (0.00s)
--- PASS: TestLogin_WrongPassword (0.00s)
--- PASS: TestLogin_UserNotFound (0.00s)
PASS
```

- [ ] **Step 6: Commit**

```bash
git add backend/internal/service/auth_service.go backend/internal/service/auth_service_test.go backend/go.mod backend/go.sum
git commit -m "feat(service): AuthService — bcrypt verify + JWT sign with sub/exp/iat claims"
```

---

## Task 8: `AuthHandler` — `POST /auth/login`

**Files:**
- Create: `backend/internal/handler/auth_handler.go`

- [ ] **Step 1: Create auth handler**

`backend/internal/handler/auth_handler.go`:
```go
package handler

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/jvgomeswhatch/cratebr/internal/model"
	"github.com/jvgomeswhatch/cratebr/internal/service"
)

type authLoginFunc interface {
	Login(ctx context.Context, req model.LoginRequest) (*model.LoginResponse, error)
}

type AuthHandler struct {
	svc authLoginFunc
}

func NewAuthHandler(svc authLoginFunc) *AuthHandler {
	return &AuthHandler{svc: svc}
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	resp, err := h.svc.Login(r.Context(), req)
	if errors.Is(err, service.ErrInvalidCredentials) {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err != nil {
		slog.Error("login", "error", err)
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	writeJSON(w, http.StatusOK, resp)
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/internal/handler/auth_handler.go
git commit -m "feat(handler): AuthHandler.Login — POST /auth/login"
```

---

## Task 9: `middleware/auth.go`

**Files:**
- Create: `backend/internal/middleware/auth.go`

- [ ] **Step 1: Create auth middleware**

`backend/internal/middleware/auth.go`:
```go
package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jvgomeswhatch/cratebr/internal/model"
)

type contextKey string

const UserIDKey contextKey = "user_id"

func RequireAuth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			claims := &model.Claims{}
			_, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(jwtSecret), nil
			})
			if err != nil {
				http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/internal/middleware/auth.go
git commit -m "feat(middleware): RequireAuth — Bearer JWT validation with typed context key"
```

---

## Task 10: Wire everything in `main.go`

**Files:**
- Modify: `backend/main.go`

- [ ] **Step 1: Rewrite main.go**

`backend/main.go`:
```go
package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/jvgomeswhatch/cratebr/internal/database"
	"github.com/jvgomeswhatch/cratebr/internal/handler"
	"github.com/jvgomeswhatch/cratebr/internal/repository"
	"github.com/jvgomeswhatch/cratebr/internal/service"
)

func main() {
	jwtSecret := os.Getenv("JWT_SECRET")
	if len(jwtSecret) < 32 {
		log.Fatal("JWT_SECRET must be at least 32 characters")
	}

	db, err := database.Connect()
	if err != nil {
		slog.Error("connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()

	// Repositories
	sellerRepo := repository.NewSellerRepository(db)
	sellerIndexRepo := repository.NewSellerIndexRepository(db)
	leadRepo := repository.NewLeadRepository(db)
	userRepo := repository.NewUserRepository(db)

	// Services
	leadSvc := service.NewLeadService(db, sellerRepo, sellerRepo, sellerIndexRepo, leadRepo)
	authSvc := service.NewAuthService(userRepo, jwtSecret)

	// Handlers
	leadHandler := handler.NewLeadHandler(leadSvc)
	authHandler := handler.NewAuthHandler(authSvc)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /leads", leadHandler.Create)
	mux.HandleFunc("POST /auth/login", authHandler.Login)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	slog.Info("server starting", "port", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		slog.Error("server error", "error", err)
		os.Exit(1)
	}
}
```

- [ ] **Step 2: Build to verify no compile errors**

```bash
cd backend && go build ./...
```

Expected: no output (success).

- [ ] **Step 3: Run all tests**

```bash
cd backend && go test ./... -v
```

Expected: all tests PASS.

- [ ] **Step 4: Commit**

```bash
git add backend/main.go
git commit -m "feat(main): wire AuthService, AuthHandler, SellerRepository, SellerIndexRepository — validate JWT_SECRET on startup"
```

---

## Task 11: Update `.env.example` and `docker-compose.yml`

**Files:**
- Modify: `.env.example`
- Modify: `docker-compose.yml`

- [ ] **Step 1: Add JWT_SECRET to .env.example**

Add to `.env.example`:
```
JWT_SECRET=change_me_to_a_random_32_char_secret
```

- [ ] **Step 2: Add backend service to docker-compose.yml**

Add to `docker-compose.yml` (after the `migrate` service, before `volumes:`):

```yaml
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    depends_on:
      migrate:
        condition: service_completed_successfully
    environment:
      DATABASE_URL: postgres://${POSTGRES_USER:-cratebr}:${POSTGRES_PASSWORD:-cratebr}@postgres:5432/${POSTGRES_DB:-cratebr}?sslmode=disable
      JWT_SECRET: ${JWT_SECRET}
      PORT: "8080"
    ports:
      - "8080:8080"
```

- [ ] **Step 3: Create backend Dockerfile**

Create `backend/Dockerfile`:
```dockerfile
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o server .

FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/server /server
USER nonroot:nonroot
ENTRYPOINT ["/server"]
```

- [ ] **Step 4: Commit**

```bash
git add .env.example docker-compose.yml backend/Dockerfile
git commit -m "feat(infra): add backend service to docker-compose, Dockerfile, JWT_SECRET to env.example"
```

---

## Task 12: Smoke test

- [ ] **Step 1: Start the stack**

```bash
docker compose up --build -d
```

Wait for `backend` to be healthy (check logs: `docker compose logs backend`).
Expected log line: `server starting port=8080`

- [ ] **Step 2: Test login with valid credentials**

```bash
curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marcelo@cratebr.com","password":"senha123"}' | jq .
```

Expected:
```json
{ "token": "<jwt_string>" }
```

- [ ] **Step 3: Test login with wrong password**

```bash
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marcelo@cratebr.com","password":"wrong"}'
```

Expected: `401`

- [ ] **Step 4: Test POST /leads still works**

```bash
curl -s -X POST http://localhost:8080/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"João","phone":"11999999999","desired_skin":"AK-47 | Redline"}' | jq .
```

Expected: `201` with `seller_name: "Marcelo"` on first call.

- [ ] **Step 5: Commit smoke test results as a note (optional)**

```bash
git commit --allow-empty -m "chore: phase 3 smoke test passed — login + round robin from DB verified"
```
