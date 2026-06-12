package service_test

import (
	"context"
	"database/sql"
	"fmt"
	"testing"

	"github.com/jvgomeswhatch/cratebr/internal/model"
	"github.com/jvgomeswhatch/cratebr/internal/repository"
	"github.com/jvgomeswhatch/cratebr/internal/service"
)

// noopTx is a stub transaction for testing.
// It satisfies the repository.Tx interface but does nothing.
type noopTx struct{}

func (t *noopTx) Commit() error   { return nil }
func (t *noopTx) Rollback() error { return nil }
func (t *noopTx) QueryRowContext(_ context.Context, _ string, _ ...any) *sql.Row {
	return nil
}
func (t *noopTx) ExecContext(_ context.Context, _ string, _ ...any) (sql.Result, error) {
	return nil, nil
}

// fakeTxBeginner returns a no-op transaction for testing.
type fakeTxBeginner struct{}

func (f *fakeTxBeginner) BeginTx(_ context.Context, _ *sql.TxOptions) (repository.Tx, error) {
	return &noopTx{}, nil
}

// fakeSellerRepo simulates the seller table (5 sellers, stable order).
type fakeSellerRepo struct {
	sellers []model.Seller
}

func (f *fakeSellerRepo) Count(_ context.Context, _ repository.Tx) (int, error) {
	return len(f.sellers), nil
}

func (f *fakeSellerRepo) GetByIndex(_ context.Context, _ repository.Tx, i int) (*model.Seller, error) {
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

func (f *fakeLeadRepo) Insert(_ context.Context, _ repository.Tx, _ model.CreateLeadRequest, seller *model.Seller) (*model.Lead, error) {
	f.inserted = append(f.inserted, seller.Name)
	return &model.Lead{SellerName: seller.Name}, nil
}

// fakeIndexRepo simulates seller_index with FOR UPDATE semantics (single-threaded here).
type fakeIndexRepo struct {
	current int
}

func (f *fakeIndexRepo) GetAndIncrement(_ context.Context, _ repository.Tx, total int) (int, error) {
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
	svc := service.NewLeadService(&fakeTxBeginner{}, sellerRepo, sellerRepo, indexRepo, leadRepo)
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

// TestRoundRobinResumesAfterRestart simulates a server restart: a new LeadService
// is created with the seller_index already at 2 (Renato), mimicking the persisted
// state in the database. The sequence must continue from where it left off.
func TestRoundRobinResumesAfterRestart(t *testing.T) {
	sellers := []model.Seller{
		{ID: 1, Name: "Marcelo"},
		{ID: 2, Name: "Rafael"},
		{ID: 3, Name: "Renato"},
		{ID: 4, Name: "Pedro"},
		{ID: 5, Name: "Leonardo"},
	}
	sellerRepo := &fakeSellerRepo{sellers: sellers}
	leadRepo := &fakeLeadRepo{}
	indexRepo := &fakeIndexRepo{current: 2} // simulates persisted state: next is Renato
	svc := service.NewLeadService(&fakeTxBeginner{}, sellerRepo, sellerRepo, indexRepo, leadRepo)

	req := model.CreateLeadRequest{Name: "Restart", Phone: "11999999999", DesiredSkin: "M4A4"}

	expected := []string{"Renato", "Pedro", "Leonardo", "Marcelo"}
	for i, want := range expected {
		_, err := svc.CreateLead(context.Background(), req)
		if err != nil {
			t.Fatalf("lead %d: unexpected error: %v", i+1, err)
		}
		if got := leadRepo.inserted[i]; got != want {
			t.Errorf("lead %d after restart: got seller %q, want %q", i+1, got, want)
		}
	}
}
