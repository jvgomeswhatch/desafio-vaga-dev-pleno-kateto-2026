package service_test

import (
	"context"
	"testing"
	"time"

	"github.com/jvgomeswhatch/cratebr/internal/model"
	"github.com/jvgomeswhatch/cratebr/internal/repository"
	"github.com/jvgomeswhatch/cratebr/internal/service"
)

type fakeKanbanRepo struct {
	leads      []model.Lead
	updated    *model.Lead
	updateErr  error
	calledWith struct {
		id     int
		status string
	}
	called bool
}

func (f *fakeKanbanRepo) ListAll(_ context.Context) ([]model.Lead, error) {
	return f.leads, nil
}

func (f *fakeKanbanRepo) UpdateStatus(_ context.Context, id int, status string) (*model.Lead, error) {
	f.called = true
	f.calledWith.id = id
	f.calledWith.status = status
	return f.updated, f.updateErr
}

func TestListLeads_ReturnAll(t *testing.T) {
	now := time.Now()
	repo := &fakeKanbanRepo{
		leads: []model.Lead{
			{ID: 1, Name: "Alice", Phone: "11999990001", DesiredSkin: "AK-47", SellerName: "Marcelo", Status: "sem_contato", CreatedAt: now},
			{ID: 2, Name: "Bob", Phone: "11999990002", DesiredSkin: "M4A4", SellerName: "Rafael", Status: "em_contato", CreatedAt: now},
		},
	}
	svc := service.NewKanbanService(repo)

	leads, err := svc.ListLeads(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(leads) != 2 {
		t.Fatalf("expected 2 leads, got %d", len(leads))
	}
	if leads[0].Name != "Alice" || leads[1].Name != "Bob" {
		t.Errorf("unexpected leads: %+v", leads)
	}
}

func TestUpdateLeadStatus_Valid(t *testing.T) {
	want := &model.Lead{ID: 3, Status: "em_contato"}
	repo := &fakeKanbanRepo{updated: want}
	svc := service.NewKanbanService(repo)

	got, err := svc.UpdateLeadStatus(context.Background(), 3, "em_contato")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !repo.called {
		t.Fatal("expected repo.UpdateStatus to be called")
	}
	if repo.calledWith.id != 3 || repo.calledWith.status != "em_contato" {
		t.Errorf("unexpected call args: id=%d status=%q", repo.calledWith.id, repo.calledWith.status)
	}
	if got.ID != want.ID || got.Status != want.Status {
		t.Errorf("unexpected result: %+v", got)
	}
}

func TestUpdateLeadStatus_InvalidStatus(t *testing.T) {
	repo := &fakeKanbanRepo{}
	svc := service.NewKanbanService(repo)

	_, err := svc.UpdateLeadStatus(context.Background(), 1, "inexistente")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if _, ok := err.(service.ValidationError); !ok {
		t.Errorf("expected ValidationError, got %T: %v", err, err)
	}
	if repo.called {
		t.Error("expected repo.UpdateStatus NOT to be called for invalid status")
	}
}

func TestUpdateLeadStatus_NotFound(t *testing.T) {
	repo := &fakeKanbanRepo{updateErr: repository.ErrNotFound}
	svc := service.NewKanbanService(repo)

	_, err := svc.UpdateLeadStatus(context.Background(), 99, "perdido")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if err != service.ErrLeadNotFound {
		t.Errorf("expected ErrLeadNotFound, got %v", err)
	}
}
