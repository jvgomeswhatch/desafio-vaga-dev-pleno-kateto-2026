package service

import (
	"context"
	"database/sql"
	"fmt"
	"regexp"

	"github.com/jvgomeswhatch/cratebr/internal/model"
	"github.com/jvgomeswhatch/cratebr/internal/repository"
)

var phoneRegex = regexp.MustCompile(`^\d{10,11}$`)

type sellerCounter interface {
	Count(ctx context.Context, tx repository.Tx) (int, error)
}

type sellerGetter interface {
	GetByIndex(ctx context.Context, tx repository.Tx, index int) (*model.Seller, error)
}

type sellerIndexer interface {
	GetAndIncrement(ctx context.Context, tx repository.Tx, total int) (int, error)
}

type leadInserter interface {
	Insert(ctx context.Context, tx repository.Tx, req model.CreateLeadRequest, seller *model.Seller) (*model.Lead, error)
}

type txBeginner interface {
	BeginTx(ctx context.Context, opts *sql.TxOptions) (repository.Tx, error)
}

// txAdapter wraps *sql.DB to satisfy txBeginner by returning *sql.Tx.
// Since *sql.Tx satisfies repository.Tx, this works automatically.
type txAdapter struct {
	db *sql.DB
}

func (a *txAdapter) BeginTx(ctx context.Context, opts *sql.TxOptions) (repository.Tx, error) {
	return a.db.BeginTx(ctx, opts)
}

// NewTxBeginner wraps a *sql.DB to satisfy txBeginner.
func NewTxBeginner(db *sql.DB) txBeginner {
	return &txAdapter{db: db}
}

type LeadService struct {
	db          txBeginner
	sellerCount sellerCounter
	sellerGet   sellerGetter
	indexRepo   sellerIndexer
	leadRepo    leadInserter
}

func NewLeadService(db txBeginner, sellerCount sellerCounter, sellerGet sellerGetter, indexRepo sellerIndexer, leadInserter leadInserter) *LeadService {
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
