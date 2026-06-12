package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jvgomeswhatch/cratebr/internal/model"
	"github.com/jvgomeswhatch/cratebr/internal/repository"
	"github.com/jvgomeswhatch/cratebr/internal/service"
	"golang.org/x/crypto/bcrypt"
)

type fakeUserRepo struct {
	user *model.User
	err  error
}

func (f *fakeUserRepo) FindByEmail(_ context.Context, _ string) (*model.User, error) {
	return f.user, f.err
}

func validHash(password string) string {
	h, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	return string(h)
}

func TestLogin_Success(t *testing.T) {
	secret := "supersecretkey_atleast32chars_xx"
	repo := &fakeUserRepo{user: &model.User{
		ID:           1,
		Email:        "marcelo@cratebr.com",
		PasswordHash: validHash("senha123"),
	}}
	svc := service.NewAuthService(repo, secret)

	resp, err := svc.Login(context.Background(), model.LoginRequest{
		Email:    "marcelo@cratebr.com",
		Password: "senha123",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resp.Token == "" {
		t.Fatal("expected non-empty token")
	}

	claims := &model.Claims{}
	_, err = jwt.ParseWithClaims(resp.Token, claims, func(t *jwt.Token) (any, error) {
		return []byte(secret), nil
	})
	if err != nil {
		t.Fatalf("token parse failed: %v", err)
	}
	if claims.UserID != "1" {
		t.Errorf("got UserID %q, want %q", claims.UserID, "1")
	}
	if time.Until(claims.ExpiresAt.Time) > time.Hour+time.Second {
		t.Error("expiry too far in the future")
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	repo := &fakeUserRepo{user: &model.User{
		ID:           1,
		Email:        "marcelo@cratebr.com",
		PasswordHash: validHash("senha123"),
	}}
	svc := service.NewAuthService(repo, "supersecretkey_atleast32chars_xx")

	_, err := svc.Login(context.Background(), model.LoginRequest{
		Email:    "marcelo@cratebr.com",
		Password: "wrong",
	})
	if !errors.Is(err, service.ErrInvalidCredentials) {
		t.Errorf("expected ErrInvalidCredentials, got %v", err)
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	repo := &fakeUserRepo{err: repository.ErrNotFound}
	svc := service.NewAuthService(repo, "supersecretkey_atleast32chars_xx")

	_, err := svc.Login(context.Background(), model.LoginRequest{
		Email:    "nobody@cratebr.com",
		Password: "senha123",
	})
	if !errors.Is(err, service.ErrInvalidCredentials) {
		t.Errorf("expected ErrInvalidCredentials, got %v", err)
	}
}
