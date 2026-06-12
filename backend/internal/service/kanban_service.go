package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/jvgomeswhatch/cratebr/internal/model"
	"github.com/jvgomeswhatch/cratebr/internal/repository"
)

var ErrLeadNotFound = errors.New("lead not found")

var validStatuses = map[string]struct{}{
	"sem_contato": {},
	"em_contato":  {},
	"perdido":     {},
	"finalizado":  {},
}

type kanbanLeadRepo interface {
	ListAll(ctx context.Context) ([]model.Lead, error)
	UpdateStatus(ctx context.Context, id int, status string) (*model.Lead, error)
}

type KanbanService struct {
	leadRepo kanbanLeadRepo
}

func NewKanbanService(leadRepo kanbanLeadRepo) *KanbanService {
	return &KanbanService{leadRepo: leadRepo}
}

func (s *KanbanService) ListLeads(ctx context.Context) ([]model.Lead, error) {
	return s.leadRepo.ListAll(ctx)
}

func (s *KanbanService) UpdateLeadStatus(ctx context.Context, id int, status string) (*model.Lead, error) {
	if _, ok := validStatuses[status]; !ok {
		return nil, ValidationError(fmt.Sprintf("invalid status %q: must be one of sem_contato, em_contato, perdido, finalizado", status))
	}
	lead, err := s.leadRepo.UpdateStatus(ctx, id, status)
	if err == repository.ErrNotFound {
		return nil, ErrLeadNotFound
	}
	return lead, err
}
