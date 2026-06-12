package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/jvgomeswhatch/cratebr/internal/service"
)

type KanbanHandler struct {
	svc *service.KanbanService
}

func NewKanbanHandler(svc *service.KanbanService) *KanbanHandler {
	return &KanbanHandler{svc: svc}
}

func (h *KanbanHandler) List(w http.ResponseWriter, r *http.Request) {
	leads, err := h.svc.ListLeads(r.Context())
	if err != nil {
		slog.Error("list leads", "error", err)
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}
	writeJSON(w, http.StatusOK, leads)
}

func (h *KanbanHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}

	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	lead, err := h.svc.UpdateLeadStatus(r.Context(), id, body.Status)
	if err != nil {
		if _, ok := err.(service.ValidationError); ok {
			writeError(w, http.StatusUnprocessableEntity, err.Error())
			return
		}
		if err == service.ErrLeadNotFound {
			writeError(w, http.StatusNotFound, "lead not found")
			return
		}
		slog.Error("update lead status", "error", err)
		writeError(w, http.StatusInternalServerError, "internal server error")
		return
	}
	writeJSON(w, http.StatusOK, lead)
}
