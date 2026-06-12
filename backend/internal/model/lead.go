package model

import "time"

type Lead struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Phone       string    `json:"phone"`
	DesiredSkin string    `json:"desired_skin"`
	SellerName  string    `json:"seller_name"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateLeadRequest struct {
	Name        string `json:"name"`
	Phone       string `json:"phone"`
	DesiredSkin string `json:"desired_skin"`
}
