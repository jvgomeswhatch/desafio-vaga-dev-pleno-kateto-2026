package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/jvgomeswhatch/cratebr/internal/model"
)

type LeadRepository struct {
	db *sql.DB
}

func NewLeadRepository(db *sql.DB) *LeadRepository {
	return &LeadRepository{db: db}
}

func (r *LeadRepository) Insert(ctx context.Context, tx Tx, req model.CreateLeadRequest, seller *model.Seller) (*model.Lead, error) {
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

func (r *LeadRepository) ListAll(ctx context.Context) ([]model.Lead, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, name, phone, desired_skin, seller_name, status, created_at
		FROM leads
		ORDER BY created_at ASC
	`)
	if err != nil {
		return nil, fmt.Errorf("list leads: %w", err)
	}
	defer rows.Close()

	var leads []model.Lead
	for rows.Next() {
		var l model.Lead
		if err := rows.Scan(&l.ID, &l.Name, &l.Phone, &l.DesiredSkin, &l.SellerName, &l.Status, &l.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan lead: %w", err)
		}
		leads = append(leads, l)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("list leads rows: %w", err)
	}
	return leads, nil
}

func (r *LeadRepository) UpdateStatus(ctx context.Context, id int, status string) (*model.Lead, error) {
	lead := &model.Lead{}
	err := r.db.QueryRowContext(ctx, `
		UPDATE leads SET status = $1 WHERE id = $2
		RETURNING id, name, phone, desired_skin, seller_name, status, created_at
	`, status, id).
		Scan(&lead.ID, &lead.Name, &lead.Phone, &lead.DesiredSkin, &lead.SellerName, &lead.Status, &lead.CreatedAt)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("update lead status: %w", err)
	}
	return lead, nil
}
