package repository

import (
	"context"
	"database/sql"
	"errors"
)

var ErrNotFound = errors.New("not found")

// Tx is an interface that represents a database transaction.
// Both *sql.Tx and test fakes can implement this.
type Tx interface {
	Commit() error
	Rollback() error
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
	ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
}
