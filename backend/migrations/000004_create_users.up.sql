CREATE TABLE IF NOT EXISTS users (
    id            SERIAL       PRIMARY KEY,
    email         TEXT         NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    seller_id     INTEGER      REFERENCES sellers(id),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed: 5 sellers as users + 1 admin (seller_id NULL).
-- Passwords are bcrypt hashes of 'senha123' (cost 10).
INSERT INTO users (email, password_hash, seller_id) VALUES
    ('marcelo@cratebr.com',  '$2a$10$5FFhGmhjkUg.etZbnvpGj.9AVHXINCNw/ZQ2M3ypOgmZV4YpxQxV6', 1),
    ('rafael@cratebr.com',   '$2a$10$5FFhGmhjkUg.etZbnvpGj.9AVHXINCNw/ZQ2M3ypOgmZV4YpxQxV6', 2),
    ('renato@cratebr.com',   '$2a$10$5FFhGmhjkUg.etZbnvpGj.9AVHXINCNw/ZQ2M3ypOgmZV4YpxQxV6', 3),
    ('pedro@cratebr.com',    '$2a$10$5FFhGmhjkUg.etZbnvpGj.9AVHXINCNw/ZQ2M3ypOgmZV4YpxQxV6', 4),
    ('leonardo@cratebr.com', '$2a$10$5FFhGmhjkUg.etZbnvpGj.9AVHXINCNw/ZQ2M3ypOgmZV4YpxQxV6', 5),
    ('admin@cratebr.com',    '$2a$10$5FFhGmhjkUg.etZbnvpGj.9AVHXINCNw/ZQ2M3ypOgmZV4YpxQxV6', NULL)
ON CONFLICT DO NOTHING;
