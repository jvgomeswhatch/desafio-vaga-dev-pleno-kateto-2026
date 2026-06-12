package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jvgomeswhatch/cratebr/internal/model"
)

type SellerRepository struct {
	db *sql.DB
}

func NewSellerRepository(db *sql.DB) *SellerRepository {
	return &SellerRepository{db: db}
}

func (r *SellerRepository) Count(ctx context.Context, tx Tx) (int, error) {
	var count int
	err := tx.QueryRowContext(ctx, `SELECT COUNT(*) FROM sellers`).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("count sellers: %w", err)
	}
	return count, nil
}

func (r *SellerRepository) GetByIndex(ctx context.Context, tx Tx, index int) (*model.Seller, error) {
	seller := &model.Seller{}
	err := tx.QueryRowContext(ctx,
		`SELECT id, name, created_at FROM sellers ORDER BY id LIMIT 1 OFFSET $1`,
		index,
	).Scan(&seller.ID, &seller.Name, &seller.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("no seller at index %d", index)
	}
	if err != nil {
		return nil, fmt.Errorf("get seller by index: %w", err)
	}
	return seller, nil
}
