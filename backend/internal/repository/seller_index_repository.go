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
func (r *SellerIndexRepository) GetAndIncrement(ctx context.Context, tx Tx, total int) (int, error) {
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
