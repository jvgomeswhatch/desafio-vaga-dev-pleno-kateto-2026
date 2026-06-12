package main

import (
	"log"
	"log/slog"
	"net/http"
	"os"

	"github.com/jvgomeswhatch/cratebr/internal/database"
	"github.com/jvgomeswhatch/cratebr/internal/handler"
	"github.com/jvgomeswhatch/cratebr/internal/middleware"
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
	txBeginner := service.NewTxBeginner(db)
	leadSvc := service.NewLeadService(txBeginner, sellerRepo, sellerRepo, sellerIndexRepo, leadRepo)
	authSvc := service.NewAuthService(userRepo, jwtSecret)
	kanbanSvc := service.NewKanbanService(leadRepo)

	// Handlers
	leadHandler := handler.NewLeadHandler(leadSvc)
	authHandler := handler.NewAuthHandler(authSvc)
	kanbanHandler := handler.NewKanbanHandler(kanbanSvc)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	mux.HandleFunc("POST /leads", leadHandler.Create)
	mux.HandleFunc("POST /auth/login", authHandler.Login)
	mux.Handle("GET /leads", middleware.RequireAuth(jwtSecret)(http.HandlerFunc(kanbanHandler.List)))
	mux.Handle("PATCH /leads/{id}/status", middleware.RequireAuth(jwtSecret)(http.HandlerFunc(kanbanHandler.UpdateStatus)))

	handler := middleware.CORS(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	slog.Info("server starting", "port", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		slog.Error("server error", "error", err)
		os.Exit(1)
	}
}
